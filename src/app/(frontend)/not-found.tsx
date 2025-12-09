import Link from 'next/link'

export default async function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          margin: '0',
          width: '100vw',
          height: '100svh',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h1>ERROR 404</h1>
        <span>
          That page doesn&apos;t exist... <Link href="/">go back to the homepage</Link>?
        </span>
      </body>
    </html>
  )
}
