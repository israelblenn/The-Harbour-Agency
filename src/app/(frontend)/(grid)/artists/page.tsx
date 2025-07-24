import ClearSelection from '@/components/ClearSelection'
import ActList from '@/components/ActList'
import { fetchAllActs } from '@/lib/api/payload-cms'
import type { Act } from '@/payload-types'

export default async function Artists() {
  const acts: Act[] = await fetchAllActs()
  if (!acts || acts.length === 0) {
    console.warn('Artists Page (Server) - fetched acts are empty or null!')
  }

  return (
    <>
      <ClearSelection />
      <ActList Acts={acts} />
    </>
  )
}
