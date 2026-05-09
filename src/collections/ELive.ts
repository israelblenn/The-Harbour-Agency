import { GlobalConfig } from 'payload'
import { revalidate } from '@/hooks/revalidate'
import { REVALIDATION_PATHS } from '@/lib/revalidation-paths'

export const ELive: GlobalConfig = {
  slug: 'elive',
  access: { read: () => true },
  hooks: {
    afterChange: [
      async () => {
        await revalidate(REVALIDATION_PATHS.frontendBase)
      },
    ],
  },
  fields: [
    {
      name: 'Title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      // required: true,
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
  ],
}
