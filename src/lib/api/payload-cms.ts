import type { About, Contact, Branding, Act, Media, Legal } from '@/payload-types'

export async function fetchActById(id: string): Promise<Act> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/acts/${id}`)
  if (!res.ok) throw new Error(`Failed to fetch act with id ${id}`)
  return await res.json()
}

export async function fetchAllActs(): Promise<Act[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/acts?limit=9999&sort=name`)
  if (!res.ok) throw new Error('Failed to fetch acts')
  const data = await res.json()
  return data.docs
}

export async function fetchAbout(): Promise<About> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/globals/about`)
  if (!res.ok) throw new Error('Failed to fetch About global')
  return await res.json()
}

export async function fetchContact(): Promise<Contact> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/globals/contact`)
  if (!res.ok) throw new Error('Failed to fetch Contact global')
  return await res.json()
}

export async function fetchBranding(): Promise<Branding> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/globals/branding`)
  if (!res.ok) throw new Error('Failed to fetch Branding global')
  return await res.json()
}

export async function fetchLegal(): Promise<Legal> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/globals/legal`)
  if (!res.ok) throw new Error('Failed to fetch Legal global')
  return await res.json()
}

export async function fetchVaultMedia(): Promise<Media[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/media?limit=9999&where[vault][equals]=true`)
  if (!res.ok) throw new Error('Failed to fetch vault media')
  const data = await res.json()
  return data.docs
}

export async function safeFetch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch (err) {
    console.error('safeFetch error:', err)
    return null
  }
}
