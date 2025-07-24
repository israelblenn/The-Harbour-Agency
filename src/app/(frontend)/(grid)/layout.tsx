// app/(frontend)/layout.tsx
import '@/app/(frontend)/styles.css'
import { fetchAllActs, fetchBranding } from '@/lib/api/payload-cms'
import ActList from '@/components/ActList' // Assuming this ActList is for desktop display
import ActGrid from '@/components/ActGrid'
import VaultRibbon from '@/components/VaultRibbon'
import Header from '@/components/Header'
import type { Media } from '@/payload-types'
import React from 'react' // <--- Make sure React is imported!

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const acts = await fetchAllActs()
  const branding = await fetchBranding()
  let logoUrl: string | null = null
  if (branding?.logo && typeof branding.logo !== 'string') {
    const logoMedia = branding.logo as Media
    logoUrl = logoMedia.url ?? null
  }

  // Ensure acts is passed as a prop to children
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // IMPORTANT: Type assertion here to ensure 'acts' prop is expected by the child
      return React.cloneElement(child, { acts } as { acts: typeof acts })
    }
    return child
  })

  return (
    <html lang="en">
      <body>
        <Header brandingData={{ logoUrl }} />
        <main>
          <div className="desktop-only">
            <VaultRibbon />
            <ActList Acts={acts} /> {/* This ActList gets acts directly */}
          </div>
          <div className="desktop-only">
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
          </div>
          <div className="scrollShadow scrollable pageSegment">{childrenWithProps}</div>{' '}
          {/* Render children with props */}
        </main>
      </body>
    </html>
  )
}
