import '@/app/(frontend)/styles.css'

export default async function VaultRootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body className="scrollable" style={{ scrollbarWidth: 'auto' }}>
        <div className="legal" style={{ maxWidth: '800px', margin: 'auto' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
