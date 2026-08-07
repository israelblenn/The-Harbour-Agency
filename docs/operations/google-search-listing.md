# Refresh Google Search listing

Use this after a domain cutover or major redesign. Do **not** add or submit a `sitemap.xml` for this site (small site; sitelinks are not controlled by sitemaps).

Live metadata (confirm after deploy):

- Title and description come from Payload **Branding** (`title`, `description`).
- Code fallbacks live in `src/app/(frontend)/layout.tsx` if Branding is empty.
- Check live HTML: View Source on https://theharbouragency.com/ for `<title>` and `meta name="description"`.

## Search Console steps

1. Open [Google Search Console](https://search.google.com/search-console) and verify a property for `https://theharbouragency.com` (domain property preferred if you control DNS).
2. Under **Sitemaps**, if an old sitemap URL from the previous website is still listed, remove it. Do not submit a new sitemap.
3. Open **URL Inspection**, paste `https://theharbouragency.com/`, run the inspection.
4. Click **Request indexing** on the homepage.
5. Wait for Google to recrawl. Title, description, and sitelinks usually update over **days to a few weeks**, not instantly.

Temporary URL Removals only hide specific URLs for about six months; they are not a clean way to clear sitelinks.

## Sitelinks (links under the main result)

Those extra links under a brand result are **sitelinks**, chosen automatically by Google.

- There is **no** permanent off switch in Search Console (the old demote tool was removed).
- Skipping a sitemap does not remove sitelinks.
- Old sitelinks from the previous site usually drop or change after Google recrawls the new, simpler structure.
- Google only shows sitelinks when it thinks they help; a small site often ends up with few or none over time, but that is not guaranteed forever.

If a specific secondary page keeps appearing as a sitelink and must not appear in search at all, `noindex` that page (removes it from all results, not only sitelinks). Prefer fixing Branding metadata and requesting a homepage recrawl first.
