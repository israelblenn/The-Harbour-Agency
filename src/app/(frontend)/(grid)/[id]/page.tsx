import { fetchActById, fetchAllActs, fetchELive, safeFetch } from '@/lib/api/payload-cms'
import ActProfileClient from '@/components/ActProfileClient'
import ELiveSection from '@/components/ELiveSection'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const revalidate = 3600
export const dynamic = 'force-dynamic'

type PageProps = {
  params: {
    id: string
  }
}

// NOTE: We intentionally do not pre-render every act page at build time.
// Next build can parallelize prerenders which can exhaust a small Mongo pool and fail builds.
// Pages are rendered on-demand with ISR via `revalidate`.

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
    const internationalActs = (allActs || []).filter((act) => act.internationalGuestTours === true)
    return <ELiveSection elive={elive} eLiveActs={eLiveActs} internationalActs={internationalActs} />
  }
  
  const actDetails = await safeFetch(() => fetchActById(id))

  if (!actDetails) notFound()

  return <ActProfileClient actDetails={actDetails} />
}
