import { fetchVaultMedia } from '@/lib/api/payload-cms'
import VaultClient from './VaultClient'

export const revalidate = 3600

export default async function VaultPage() {
  const vault = await fetchVaultMedia()
  return <VaultClient initialVault={vault} />
}
