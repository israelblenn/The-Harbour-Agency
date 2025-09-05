// src/globals/Legal.ts (or wherever your global is defined)

import { GlobalConfig } from 'payload'

export const Legal: GlobalConfig = {
  slug: 'legal',
  access: { read: () => true },
  fields: [
    {
      name: 'PrivacyPolicy',
      type: 'richText',
    },
  ],
  hooks: {
    afterChange: [
      async () => {
        console.log('Legal global changed, attempting to revalidate...')

        const frontendUrl = process.env.NEXT_PUBLIC_SITE_URL
        const revalidationToken = process.env.REVALIDATE_SECRET

        if (!frontendUrl || !revalidationToken) {
          console.error('FRONTEND_URL or REVALIDATION_TOKEN not set. Skipping revalidation.')
          return
        }

        // Construct the revalidation URL
        const revalidationUrl = `${frontendUrl}/api/revalidate?secret=${revalidationToken}`

        try {
          const res = await fetch(revalidationUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            // The path of the page you want to revalidate
            body: JSON.stringify({ path: '/legal' }),
          })

          if (res.ok) {
            console.log('Successfully revalidated legal page')
          } else {
            const errorText = await res.text()
            console.error(`Error revalidating legal page: ${res.status} ${res.statusText}`, errorText)
          }
        } catch (error) {
          console.error('An error occurred during fetch for revalidation:', error)
        }
      },
    ],
  },
}
