import { GlobalConfig } from 'payload'
import type { Payload } from 'payload'

type QueuedPayload = Payload & {
  queue?: (fn: () => void | Promise<void>) => void
}

export const About: GlobalConfig = {
  slug: 'about',
  access: { read: () => true },
  hooks: {
    //!! we need to test that this revalidation hook actually works in production
    afterChange: [
      async ({ req }) => {
        const queuedPayload = req.payload as QueuedPayload

        if (typeof queuedPayload.queue === 'function') {
          queuedPayload.queue(() => {
            fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                tag: 'about',
                secret: process.env.REVALIDATE_SECRET,
              }),
            }).catch((err) => {
              console.error('Revalidation failed:', err)
            })
          })
        } else {
          console.warn('Payload queue function not available')
        }
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'gallery',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
          required: true,
        },
      ],
    },
    {
      name: 'headline',
      type: 'text',
      required: true,
    },
    {
      name: 'profile',
      type: 'textarea',
      required: true,
    },
    {
      name: 'team',
      type: 'textarea',
    },
    {
      name: 'contacts',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              admin: { width: '20%' },
            },
            {
              name: 'content',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'adresses',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              admin: { width: '20%' },
            },
            {
              name: 'content',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
