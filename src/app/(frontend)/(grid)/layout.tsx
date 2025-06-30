import '@/app/(frontend)/styles.css'
import { fetchAllActs } from '@/lib/api/payload-cms'
import ActList from '@/components/ActList'
import ActGrid from '@/components/ActGrid'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const acts = await fetchAllActs()

  return (
    <main>
      <ActList Acts={acts} />
      <ActGrid
        initialActs={acts.map((act) => ({
          ...act,
          photo: act.photo ?? { url: '' },
        }))}
      />
      <div className="scrollable" style={{ paddingBottom: '8rem' }}>
        {children}
      </div>
    </main>
  )
}
