import Link from 'next/link'
import Image from 'next/image'

export default async function Header() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/globals/about`, { next: { tags: ['about'] } })
  const data = await res.json()
  const logo = data.logo
  const logoUrl = typeof logo === 'object' && logo.url ? logo.url : null

  return (
    <header style={{ height: '8rem', marginBottom: '8rem' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', height: '100%' }}>
        <Link href="/" style={{ height: '100%' }}>
          <Image
            priority
            src={logoUrl}
            alt={logo?.alt || 'Logo'}
            width={0}
            height={0}
            style={{
              width: 'auto',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </nav>
    </header>
  )
}
