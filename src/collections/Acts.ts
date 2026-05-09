import { CollectionConfig } from 'payload'
import { revalidate } from '@/hooks/revalidate'
import { buildActRevalidationTargets } from '@/lib/revalidation-paths'

export const Acts: CollectionConfig = {
  slug: 'acts',
  access: { read: () => true },
  admin: { useAsTitle: 'name' },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        await revalidate(buildActRevalidationTargets(doc?.id))
      },
    ],
    afterDelete: [
      async ({ id, doc }) => {
        await revalidate(buildActRevalidationTargets(doc?.id ?? id))
      },
    ],
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
      required: false,
    },
    {
      name: 'eLive',
      type: 'checkbox',
      label: 'E-Live',
      required: false,
    },
    {
      name: 'internationalGuestTours',
      type: 'checkbox',
      label: 'International Guest Tours',
      required: false,
    },
  ],
}
