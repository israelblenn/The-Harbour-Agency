'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from '@/styles/Header.module.css'

export default function Header() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [altText, setAltText] = useState<string>('Logo')

  useEffect(() => {
    async function fetchLogo() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/globals/about`)
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
    <header>
      <nav>
        <Link href="/">
          {logoUrl && <Image priority src={logoUrl} alt={altText} width={0} height={0} className={styles.logo} />}
        </Link>
        <div className={styles.navLinks}>
          <Link href="/">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </nav>
    </header>
  )
}
