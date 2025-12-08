import '@/app/(frontend)/styles.css'
import { fetchLayoutData } from '@/lib/api/payload-cms'
import ActList from '@/components/ActList/ActList'
import ActGrid from '@/components/ActGrid'
import VaultRibbon from '@/components/VaultRibbon'
import Header from '@/components/Header'
import type { Media } from '@/payload-types'
import React from 'react'

// Cache static data for 1 hour
export const revalidate = 3600

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  // Batched fetch to reduce DB connections
  const { acts, branding } = await fetchLayoutData()
  let logoUrl: string | null = null
  if (branding?.logo && typeof branding.logo !== 'string') {
    const logoMedia = branding.logo as Media
    logoUrl = logoMedia.url ?? null
  }

  // Separate acts into regular and E-Live acts for the grid
  const regularActs = acts.filter((act) => !act.eLive)
  const eLiveActs = acts.filter((act) => act.eLive === true)
  const sortedActsForGrid = [...regularActs, ...eLiveActs]

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) return React.cloneElement(child, { acts } as { acts: typeof acts })
    return child
  })

  return (
    <html lang="en">
      <body>
        <Header brandingData={{ logoUrl }} />
        <main>
          <div className="desktop-only">
            <VaultRibbon />
            <ActList Acts={acts} />
          </div>
          <div className="desktop-only">
            <ActGrid
              initialActs={sortedActsForGrid.map((act) => ({
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
          </div>
          <div className="scrollShadow scrollable pageSegment">{childrenWithProps}</div>{' '}
        </main>
      </body>
    </html>
  )
}
