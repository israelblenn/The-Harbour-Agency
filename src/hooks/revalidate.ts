// src/hooks/revalidate.ts

/**
 * A reusable hook to trigger on-demand revalidation in the Next.js frontend.
 * @param paths An array of paths to revalidate (e.g., ['/legal', '/posts/my-post'])
 */
export const revalidate = async (paths: string[]): Promise<void> => {
  const frontendUrl = process.env.NEXT_PUBLIC_SITE_URL
  const revalidationToken = process.env.REVALIDATE_SECRET

  if (!frontendUrl || !revalidationToken) {
    console.error('NEXT_PUBLIC_SITE_URL or REVALIDATE_SECRET is not set. Skipping revalidation.')
    return
  }

  if (paths.length === 0) {
    console.log('No paths provided to revalidate. Skipping.')
    return
  }

  console.log(`Attempting to revalidate paths: ${paths.join(', ')}`)

  const revalidationUrl = `${frontendUrl}/api/revalidate?secret=${revalidationToken}`

  try {
    const res = await fetch(revalidationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Send an array of paths to the revalidation endpoint
      body: JSON.stringify({ paths }),
    })

    if (res.ok) {
      console.log(`Successfully revalidated: ${paths.join(', ')}`)
    } else {
      const errorText = await res.text()
      console.error(`Error revalidating paths: ${res.status} ${res.statusText}`, errorText)
    }
  } catch (error) {
    console.error('An error occurred during fetch for revalidation:', error)
  }
}
