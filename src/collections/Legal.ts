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
}
