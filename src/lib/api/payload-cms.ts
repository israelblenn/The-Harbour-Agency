import type { About, Contact, Branding, Act, Media, Legal, Elive } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload-client'
import { cache } from 'react'

/** Default MongoDB ObjectId string; avoids noisy 404s for garbage paths like `/kj`. */
export const isMongoObjectIdString = (value: string): boolean => /^[a-f\d]{24}$/i.test(value)

const getErrorHttpStatus = (err: unknown): number | undefined => {
  if (typeof err !== 'object' || err === null || !('status' in err)) return undefined
  const status = (err as { status?: unknown }).status
  return typeof status === 'number' ? status : undefined
}

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

export async function safeFetch<T>(
  fn: () => Promise<T>,
  context: { label?: string; route?: string } = {},
): Promise<T | null> {
  const startedAt = Date.now()
  try {
    return await fn()
  } catch (err) {
    const status = getErrorHttpStatus(err)
    const payload = {
      label: context.label ?? 'unknown',
      route: context.route ?? 'unknown',
      durationMs: Date.now() - startedAt,
      errorMessage: err instanceof Error ? err.message : String(err),
      errorName: err instanceof Error ? err.name : 'UnknownError',
      status,
    }
    if (status === 404) {
      console.warn('[safeFetch] NotFound', JSON.stringify(payload))
    } else {
      console.error('[safeFetch] Error', JSON.stringify(payload))
    }
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
