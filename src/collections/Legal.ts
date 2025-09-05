import { GlobalConfig } from 'payload'
import { revalidate } from '@/hooks/revalidate'

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
    afterChange: [() => revalidate(['/legal'])],
  },
}
