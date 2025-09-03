import type { About, Contact, Branding, Act, Media, Legal } from '@/payload-types'
import { getPayload } from 'payload'
import config from '@payload-config'

// Helper to get a Payload instance
async function getPayloadClient() {
  return await getPayload({ config })
}

export async function fetchActById(id: string): Promise<Act> {
  const payload = await getPayloadClient()
  const act = await payload.findByID({
    collection: 'acts',
    id,
  })
  if (!act) throw new Error(`Failed to fetch act with id ${id}`)
  return act
}

export async function fetchAllActs(): Promise<Act[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'acts',
    limit: 9999,
    sort: 'name',
  })
  return result.docs
}

export async function fetchAbout(): Promise<About> {
  const payload = await getPayloadClient()
  const about = await payload.findGlobal({ slug: 'about' })
  if (!about) throw new Error('Failed to fetch About global')
  return about as About
}

export async function fetchContact(): Promise<Contact> {
  const payload = await getPayloadClient()
  const contact = await payload.findGlobal({ slug: 'contact' })
  if (!contact) throw new Error('Failed to fetch Contact global')
  return contact as Contact
}

export async function fetchBranding(): Promise<Branding> {
  const payload = await getPayloadClient()
  const branding = await payload.findGlobal({ slug: 'branding' })
  if (!branding) throw new Error('Failed to fetch Branding global')
  return branding as Branding
}

export async function fetchLegal(): Promise<Legal> {
  const payload = await getPayloadClient()
  const legal = await payload.findGlobal({ slug: 'legal' })
  if (!legal) throw new Error('Failed to fetch Legal global')
  return legal as Legal
}

export async function fetchVaultMedia(): Promise<Media[]> {
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
}

export async function safeFetch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch (err) {
    console.error('safeFetch error:', err)
    return null
  }
}
