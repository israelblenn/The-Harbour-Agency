import { CollectionConfig } from 'payload'

export const Acts: CollectionConfig = {
  slug: 'acts',
  access: { read: () => true },
  admin: { useAsTitle: 'name' },
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
