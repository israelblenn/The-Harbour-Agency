import '@/app/(frontend)/styles.css'
import { fetchAllActs, fetchBranding } from '@/lib/api/payload-cms'
import ActList from '@/components/ActList'
import ActGrid from '@/components/ActGrid'
import VaultRibbon from '@/components/VaultRibbon'
import Header from '@/components/Header'
import type { Media } from '@/payload-types'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const acts = await fetchAllActs()
  const branding = await fetchBranding()
  let logoUrl: string | null = null
  if (branding?.logo && typeof branding.logo !== 'string') {
    const logoMedia = branding.logo as Media
    logoUrl = logoMedia.url ?? null
  }

  return (
    <html lang="en">
      <body>
        <Header brandingData={{ logoUrl }} />
        <main>
          <VaultRibbon />
          <ActList Acts={acts} />
          <ActGrid
            initialActs={acts.map((act) => ({
              id: act.id,
              name: act.name,
              photo:
                typeof act.photo === 'string'
                  ? { url: act.photo }
                  : act.photo && typeof act.photo === 'object' && 'url' in act.photo
                    ? { url: act.photo.url ?? '' }
                    : { url: '' },
            }))}
          />
          <div className="scrollShadow scrollable" style={{ paddingBottom: '8rem' }}>
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
