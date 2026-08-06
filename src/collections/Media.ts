import type { CollectionConfig } from 'payload'
import { generateBlurDataURL } from '@/hooks/generateBlurDataURL'
import { revalidate } from '@/hooks/revalidate'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [generateBlurDataURL],
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
    {
      name: 'blurDataURL',
      type: 'text',
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
  ],
  upload: true,
}
