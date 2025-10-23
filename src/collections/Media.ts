import type { CollectionConfig } from 'payload'
import { revalidate } from '@/hooks/revalidate'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [() => revalidate(['/vault', '/'])],
    afterDelete: [() => revalidate(['/vault', '/'])],
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
