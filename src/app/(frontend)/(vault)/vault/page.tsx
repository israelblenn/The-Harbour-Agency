import { fetchVaultMedia } from '@/lib/api/payload-cms'
import VaultClient from './VaultClient'

export default async function VaultPage() {
  const vault = await fetchVaultMedia()
  return <VaultClient initialVault={vault} />
}
