// app/vault/page.js
import { fetchVaultMedia } from '@/lib/api/payload-cms'
import VaultClient from './VaultClient'

export default async function VaultPage() {
  const vault = await fetchVaultMedia()

  // No delay here, page structure loads immediately
  return <VaultClient initialVault={vault} />
}
