import {
  fetchActById,
  fetchAllActs,
  fetchELive,
  isMongoObjectIdString,
  safeFetch,
} from '@/lib/api/payload-cms'
import ActProfileClient from '@/components/ActProfileClient'
import ELiveSection from '@/components/ELiveSection'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const revalidate = 3600

type PageProps = {
  params: {
    id: string
  }
}

// NOTE: We intentionally avoid pre-rendering every act page at build time.
// Dynamic pages are generated on-demand and refreshed by ISR/on-demand revalidation.

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  if (id !== 'e-live' && !isMongoObjectIdString(id)) {
    return { title: 'The Harbour Agency' }
  }

  if (id === 'e-live') {
    const elive = await safeFetch(fetchELive, {
      label: 'fetchELive',
      route: '/e-live',
    })
    return {
      title: `${elive?.Title || 'E-Live'} | The Harbour Agency`,
      description: elive?.description || 'E-Live artists at The Harbour Agency',
    }
  }
  
  const act = await safeFetch(() => fetchActById(id), {
    label: 'fetchActById',
    route: `/${id}`,
  })
  if (!act) return { title: 'The Harbour Agency' }
  return {
    title: `${act.name} | The Harbour Agency`,
    description: act.bio,
  }
}

export default async function ActProfilePage({ params }: PageProps) {
  const { id } = await params

  if (id !== 'e-live' && !isMongoObjectIdString(id)) {
    notFound()
  }

  if (id === 'e-live') {
    const [elive, allActs] = await Promise.all([
      safeFetch(fetchELive, {
        label: 'fetchELive',
        route: '/e-live',
      }),
      safeFetch(fetchAllActs, {
        label: 'fetchAllActs',
        route: '/e-live',
      }),
    ])
    if (!elive) notFound()
    const eLiveActs = (allActs || []).filter((act) => act.eLive === true)
    const internationalActs = (allActs || []).filter((act) => act.internationalGuestTours === true)
    return <ELiveSection elive={elive} eLiveActs={eLiveActs} internationalActs={internationalActs} />
  }
  
  const actDetails = await safeFetch(() => fetchActById(id), {
    label: 'fetchActById',
    route: `/${id}`,
  })

  if (!actDetails) notFound()

  return <ActProfileClient actDetails={actDetails} />
}
