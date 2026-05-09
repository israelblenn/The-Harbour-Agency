import { fetchLegal } from '@/lib/api/payload-cms'
import type { Legal } from '@/payload-types'
import RichText from '@/components/RichText'

// Cache Legal page for 1 hour
export const revalidate = 3600

export default async function LegalPage() {
  const legalData: Legal = await fetchLegal()
  if (!legalData) return <div>Error: Could not load legal data.</div>

  return <RichText content={legalData.PrivacyPolicy} />
}
