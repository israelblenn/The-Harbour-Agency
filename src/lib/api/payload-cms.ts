import type { About, Contact, Branding, Act, Media, Legal, Elive } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload-client'
import { cache } from 'react'

export const fetchActById = cache(async (id: string): Promise<Act> => {
  const payload = await getPayloadClient()
  const act = await payload.findByID({
    collection: 'acts',
    id,
  })
  if (!act) throw new Error(`Failed to fetch act with id ${id}`)
  return act
})

export const fetchAllActs = cache(async (): Promise<Act[]> => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'acts',
    limit: 9999,
  })
  // Sort case-insensitively to avoid uppercase names sorting before lowercase
  return result.docs.sort((a: Act, b: Act) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
})

export const fetchAbout = cache(async (): Promise<About> => {
  const payload = await getPayloadClient()
  const about = await payload.findGlobal({ slug: 'about' })
  if (!about) throw new Error('Failed to fetch About global')
  return about as About
})

export const fetchContact = cache(async (): Promise<Contact> => {
  const payload = await getPayloadClient()
  const contact = await payload.findGlobal({ slug: 'contact' })
  if (!contact) throw new Error('Failed to fetch Contact global')
  return contact as Contact
})

// Wrapped with React cache() to deduplicate calls within same request
export const fetchBranding = cache(async (): Promise<Branding> => {
  const payload = await getPayloadClient()
  const branding = await payload.findGlobal({ slug: 'branding' })
  if (!branding) throw new Error('Failed to fetch Branding global')
  return branding as Branding
})

export const fetchLegal = cache(async (): Promise<Legal> => {
  const payload = await getPayloadClient()
  const legal = await payload.findGlobal({ slug: 'legal' })
  if (!legal) throw new Error('Failed to fetch Legal global')
  return legal as Legal
})

export const fetchELive = cache(async (): Promise<Elive> => {
  const payload = await getPayloadClient()
  const elive = await payload.findGlobal({ slug: 'elive' })
  if (!elive) throw new Error('Failed to fetch ELive global')
  return elive as Elive
})

export const fetchVaultMedia = cache(async (): Promise<Media[]> => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'media',
    limit: 9999,
    where: {
      vault: {
        equals: true,
      },
    },
  })
  return result.docs
})

export async function safeFetch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch (err) {
    console.error('safeFetch error:', err)
    return null
  }
}

// Batched fetch for layout data to reduce connection overhead
export const fetchLayoutData = cache(async (): Promise<{ acts: Act[]; branding: Branding }> => {
  const payload = await getPayloadClient()
  const [actsResult, branding] = await Promise.all([
    payload.find({ collection: 'acts', limit: 9999 }),
    payload.findGlobal({ slug: 'branding' }),
  ])
  // Sort case-insensitively to avoid uppercase names sorting before lowercase
  const sortedActs = actsResult.docs.sort((a: Act, b: Act) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  return { acts: sortedActs, branding: branding as Branding }
})
