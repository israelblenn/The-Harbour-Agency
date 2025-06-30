'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [altText, setAltText] = useState<string>('Logo')

  useEffect(() => {
    async function fetchLogo() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/globals/aboot`)
        const data = await res.json()
        const logo = data.logo
        setLogoUrl(typeof logo === 'object' && logo.url ? logo.url : null)
        setAltText(logo?.alt || 'Logo')
      } catch (err) {
        console.error('Failed to fetch logo:', err)
      }
    }

    fetchLogo()
  }, [])

  return (
    <header style={{ height: '8rem', marginBottom: '8rem' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', height: '100%' }}>
        <Link href="/" style={{ height: '100%' }}>
          {logoUrl && (
            <Image
              priority
              src={logoUrl}
              alt={altText}
              width={0}
              height={0}
              style={{
                width: 'auto',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          )}
        </Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </nav>
    </header>
  )
}
