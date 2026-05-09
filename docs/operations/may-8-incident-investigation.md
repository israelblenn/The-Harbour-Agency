# May 8 Incident Investigation and Mitigation

## Incident summary

- Reported symptom: backend appeared extremely slow and content changes (especially E-Live artist moves) did not appear on the site.
- Impact window visible in provided Railway logs: `2026-05-07` through `2026-05-09`, with the heaviest saturation concentrated on `2026-05-08T00`-`2026-05-08T01` (UTC).
- Database connection spikes were not observed in MongoDB monitoring, which points to non-Mongo bottlenecks.

## Timeline from Railway logs (provided export)

- Total log entries parsed: `232`
- Day split:
  - `2026-05-07`: `34`
  - `2026-05-08`: `192`
  - `2026-05-09`: `6`
- Severity split:
  - `info`: `52`
  - `error`: `180`
- Single deployment and replica for all entries in this export:
  - deployment: `8cb013a4-af38-4eae-a528-1243b79b3339`
  - replica: `de4e2db9-dd54-42e6-9ffa-eb31ca62b06e`

### Critical signals

1. AWS SDK socket saturation warnings increase over time:
   - starts around queue `201` on `2026-05-07T06:36:26Z`
   - exceeds queue `1000+` around `2026-05-08T00:22:32Z`
   - reaches queue `1737` by `2026-05-09T00:27:36Z`

2. Revalidation logs repeatedly show only root-path invalidation:
   - `Attempting to revalidate paths: /`
   - `Successfully revalidated: /`

3. Intermittent `safeFetch error: kj: Not Found` appears during the critical May 8 hour.

## Primary hypothesis

The site experienced a request backlog in an AWS SDK client path (socket pool at capacity with a growing queued request count), which degraded backend responsiveness. During that same period, invalidation coverage was too narrow (`/` only), so route-level stale content (including E-Live views) could persist even when CMS writes succeeded.

## Implemented mitigation changes

1. Revalidation reliability hardening
   - Added structured revalidation targets (`path` + `type`).
   - Added retries, timeout, and structured diagnostics in the revalidation hook.
   - Added stronger request parsing and typed `revalidatePath` handling in the revalidation API route.

2. Invalidating all affected artist surfaces
   - Act updates now invalidate:
     - root/layout
     - `/artists`
     - `/e-live`
     - the changed act detail route (`/<id>`) when available
   - E-Live global updates now invalidate root + `/artists` + `/e-live`.

3. Cache strategy cleanup
   - Removed conflicting `dynamic = 'force-dynamic'` flags from key frontend routes/layouts.
   - Kept ISR (`revalidate = 3600`) so pages can remain cache-efficient while being refreshed by on-demand invalidation.

4. Data fetch observability
   - `safeFetch` now emits structured success/failure logs with label, route, and duration.

## Post-deploy verification runbook

1. Update one act in Payload:
   - toggle `eLive` on/off and save.
2. Validate logs:
   - confirm revalidation attempt and success logs include:
     - `/` with `layout`
     - `/artists`
     - `/e-live`
     - `/<act-id>` for the changed act
3. Validate UI propagation:
   - `/`
   - `/artists`
   - `/e-live`
   - changed act detail URL
4. Record propagation latency from save timestamp to visible update.

## 72-hour monitoring checklist

- Revalidation success rate (`successful attempts / total attempts`)
- Revalidation latency (`p50/p95`)
- Revalidation retry volume (to detect flaky network/service behavior)
- AWS SDK socket-capacity warning frequency and queue depth trend
- `safeFetch` error counts by label and route
- User-reported stale-content incidents

## Rollout plan

- Phase 1:
  - Deploy revalidation hardening and logging.
  - Observe for 24 hours.
- Phase 2:
  - Keep standardized cache strategy.
  - Continue monitoring for 48 more hours.

If socket-capacity warnings continue to climb after these changes, next escalation is tuning the AWS SDK HTTP handler socket configuration for the specific client generating the warnings.
