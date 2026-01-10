import ActList from '@/components/ActList/ActList'
import SelectedActThumbnail from '@/components/SelectedActThumbnail'
import { fetchAllActs } from '@/lib/api/payload-cms'
import type { Act } from '@/payload-types'

export default async function Artists() {
  const acts: Act[] = await fetchAllActs()
  if (!acts || acts.length === 0) {
    console.warn('Artists Page (Server) - fetched acts are empty or null!')
  }

  return (
    <>
      <ActList Acts={acts} hideELiveOnMobile clearSelectionOnMount />
      <SelectedActThumbnail acts={acts} />
    </>
  )
}
