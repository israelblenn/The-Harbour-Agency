// src/lib/api/payload-cms.ts
'use server'

interface ActBase {
  id: string
  name: string
}

interface ActWithPhoto extends ActBase {
  photo: { url: string }
}

export async function fetchAllActs(): Promise<ActWithPhoto[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/acts?limit=9999&sort=name`)
  if (!res.ok) throw new Error('Failed to fetch acts')
  const data = await res.json()
  return data.docs
}
