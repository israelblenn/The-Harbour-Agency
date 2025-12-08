import '@/app/(frontend)/styles.css'
import Header from '@/components/Header'
import styles from '@/styles/Header.module.css'
import { fetchBranding } from '@/lib/api/payload-cms'
import type { Media } from '@/payload-types'

export const revalidate = 3600

export default async function VaultRootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const branding = await fetchBranding()
  let logoUrl: string | null = null
  if (branding?.logo && typeof branding.logo !== 'string') {
    const logoMedia = branding.logo as Media
    logoUrl = logoMedia.url ?? null
  }

  return (
    <html lang="en" className={styles.vault}>
      <body className="scrollable" style={{ scrollbarWidth: 'auto' }}>
        <Header brandingData={{ logoUrl }} />
        {children}
      </body>
    </html>
  )
}
