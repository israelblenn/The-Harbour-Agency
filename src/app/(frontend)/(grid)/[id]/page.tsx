import { fetchActById, fetchAllActs, fetchELive, safeFetch } from '@/lib/api/payload-cms'
import ActProfileClient from '@/components/ActProfileClient'
import ELiveSection from '@/components/ELiveSection'
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

  return [
    ...acts.map((act) => ({
      id: act.id,
    })),
    { id: 'e-live' },
  ]
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  
  if (id === 'e-live') {
    const elive = await safeFetch(fetchELive)
    return {
      title: `${elive?.Title || 'E-Live'} | The Harbour Agency`,
      description: elive?.description || 'E-Live artists at The Harbour Agency',
    }
  }
  
  const act = await safeFetch(() => fetchActById(id))
  if (!act) return { title: 'The Harbour Agency' }
  return {
    title: `${act.name} | The Harbour Agency`,
    description: act.bio,
  }
}

export default async function ActProfilePage({ params }: PageProps) {
  const { id } = await params
  
  if (id === 'e-live') {
    const [elive, allActs] = await Promise.all([
      safeFetch(fetchELive),
      safeFetch(fetchAllActs),
    ])
    if (!elive) notFound()
    const eLiveActs = (allActs || []).filter((act) => act.eLive === true)
    return <ELiveSection elive={elive} eLiveActs={eLiveActs} />
  }
  
  const actDetails = await safeFetch(() => fetchActById(id))

  if (!actDetails) notFound()

  return <ActProfileClient actDetails={actDetails} />
}
