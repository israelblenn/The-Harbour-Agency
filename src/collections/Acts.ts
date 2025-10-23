import { CollectionConfig } from 'payload'
import { revalidate } from '@/hooks/revalidate'

export const Acts: CollectionConfig = {
  slug: 'acts',
  access: { read: () => true },
  admin: { useAsTitle: 'name' },
  hooks: {
    afterChange: [() => revalidate(['/'])],
    afterDelete: [() => revalidate(['/'])],
  },
  fields: [
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'bio',
      type: 'textarea',
      required: true,
    },
    {
      name: 'link',
      type: 'text',
      required: true,
    },
  ],
}
