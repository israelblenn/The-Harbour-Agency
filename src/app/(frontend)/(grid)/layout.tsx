import '@/app/(frontend)/styles.css'
import { fetchAllActs } from '@/lib/api/payload-cms'
import ActList from '@/components/ActList'
import ActGrid from '@/components/ActGrid'
import VaultRibbon from '@/components/VaultRibbon'
import Header from '@/components/Header'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const acts = await fetchAllActs()

  return (
    <html lang="en">
      <body>
        <Header />
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
          <div className="scrollable" style={{ paddingBottom: '8rem' }}>
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
