import {
  dedupeRevalidationTargets,
  type RevalidatePathTarget,
} from '@/lib/revalidation-paths'

const REQUEST_TIMEOUT_MS = 8_000
const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 400

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

const getRevalidationUrl = (): string | null => {
  const frontendUrl = process.env.NEXT_PUBLIC_SITE_URL
  const revalidationToken = process.env.REVALIDATE_SECRET

  if (!frontendUrl || !revalidationToken) {
    console.error(
      '[revalidate] Missing revalidation configuration.',
      JSON.stringify({
        hasFrontendUrl: Boolean(frontendUrl),
        hasRevalidationSecret: Boolean(revalidationToken),
      }),
    )
    return null
  }

  return `${frontendUrl}/api/revalidate?secret=${revalidationToken}`
}

const normalizeTargets = (
  targets: Array<string | RevalidatePathTarget>,
): RevalidatePathTarget[] => {
  return dedupeRevalidationTargets(
    targets.map((target) => (typeof target === 'string' ? { path: target, type: 'page' } : target)),
  )
}

/**
 * Triggers Next on-demand revalidation with retry and structured diagnostics.
 */
export const revalidate = async (
  targets: Array<string | RevalidatePathTarget>,
): Promise<boolean> => {
  const revalidationUrl = getRevalidationUrl()
  const normalizedTargets = normalizeTargets(targets)

  if (!revalidationUrl || normalizedTargets.length === 0) {
    if (normalizedTargets.length === 0) {
      console.warn('[revalidate] No valid revalidation targets provided.')
    }
    return false
  }

  const startedAt = Date.now()
  let lastError: unknown

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const attemptStartedAt = Date.now()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      console.log(
        '[revalidate] Attempting revalidation.',
        JSON.stringify({
          attempt,
          maxAttempts: MAX_ATTEMPTS,
          targetCount: normalizedTargets.length,
          targets: normalizedTargets,
        }),
      )

      const response = await fetch(revalidationUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targets: normalizedTargets }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        const responseBody = await response.text()
        throw new Error(
          `HTTP ${response.status} ${response.statusText} while revalidating: ${responseBody}`,
        )
      }

      const durationMs = Date.now() - startedAt
      console.log(
        '[revalidate] Revalidation succeeded.',
        JSON.stringify({
          attempt,
          durationMs,
          attemptDurationMs: Date.now() - attemptStartedAt,
          targets: normalizedTargets,
        }),
      )
      return true
    } catch (error) {
      clearTimeout(timeout)
      lastError = error
      console.error(
        '[revalidate] Revalidation attempt failed.',
        JSON.stringify({
          attempt,
          maxAttempts: MAX_ATTEMPTS,
          attemptDurationMs: Date.now() - attemptStartedAt,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorName: error instanceof Error ? error.name : 'UnknownError',
          targets: normalizedTargets,
        }),
      )

      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS * attempt)
      }
    }
  }

  console.error(
    '[revalidate] Exhausted all revalidation retries.',
    JSON.stringify({
      maxAttempts: MAX_ATTEMPTS,
      totalDurationMs: Date.now() - startedAt,
      finalError: lastError instanceof Error ? lastError.message : String(lastError),
      targets: normalizedTargets,
    }),
  )

  return false
}
