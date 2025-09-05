import { GlobalConfig } from 'payload'
import { revalidate } from '@/hooks/revalidate'

export const Contact: GlobalConfig = {
  slug: 'contact',
  access: { read: () => true },
  hooks: { afterChange: [() => revalidate(['/'])] },
  fields: [
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
      name: 'addresses',
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
