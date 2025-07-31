import { fetchActById, fetchAllActs, safeFetch } from '@/lib/api/payload-cms'
import ActProfileClient from '@/components/ActProfileClient'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type PageProps = {
  params: {
    id: string
  }
}

export async function generateStaticParams() {
  const acts = await safeFetch(fetchAllActs)
  if (!acts) return []

  return acts.map((act) => ({
    id: act.id,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const act = await safeFetch(() => fetchActById(id))
  if (!act) return { title: 'The Harbour Agency' }
  return {
    title: `${act.name} | The Harbour Agency`,
    description: act.bio,
  }
}

export default async function ActProfilePage({ params }: PageProps) {
  const { id } = await params
  const actDetails = await safeFetch(() => fetchActById(id))

  if (!actDetails) notFound()

  return <ActProfileClient actDetails={actDetails} />
}
