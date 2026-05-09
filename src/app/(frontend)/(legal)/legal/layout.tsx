import '@/app/(frontend)/styles.css'
import { inter } from '@/app/(frontend)/fonts'

export default async function VaultRootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className={inter.variable}>
      <body className="scrollable" style={{ scrollbarWidth: 'auto' }}>
        <div className="legal" style={{ maxWidth: '800px', margin: 'auto' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
