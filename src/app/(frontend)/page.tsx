import { fetchAllActs } from '@/lib/api/payload-cms'
import ClientHomePage from '@/components/ClientHomePage'

export default async function HomePage() {
  const acts = await fetchAllActs()

  // Pass the fetched data to the client wrapper component
  return <ClientHomePage initialActs={acts} />
}
