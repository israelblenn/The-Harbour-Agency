import { GlobalConfig } from 'payload'
import { revalidate } from '@/hooks/revalidate'

export const Branding: GlobalConfig = {
  slug: 'branding',
  access: { read: () => true },
  hooks: { 
    afterChange: [() => revalidate(['/'])] 
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
    },
  ],
}
