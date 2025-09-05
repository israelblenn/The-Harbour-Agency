import { GlobalConfig } from 'payload'
import { revalidate } from '@/hooks/revalidate'

export const About: GlobalConfig = {
  slug: 'about',
  access: { read: () => true },
  hooks: { afterChange: [() => revalidate(['/'])] },
  fields: [
    {
      name: 'gallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
    },
    {
      name: 'headline',
      type: 'richText',
      required: true,
    },
    {
      name: 'profile',
      type: 'richText',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          label: 'Team Column 1',
          name: 'team1',
          type: 'richText',
        },
        {
          label: 'Team Column 2',
          name: 'team2',
          type: 'richText',
        },
      ],
    },
  ],
}
