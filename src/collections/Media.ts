import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      // required: true,
    },
    {
      name: 'vault',
      label: 'Feature in the vault?',
      type: 'checkbox',
      index: true,
    },
  ],
  upload: true,
}
