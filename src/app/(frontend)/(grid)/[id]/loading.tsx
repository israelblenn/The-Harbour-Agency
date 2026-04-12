'use client'

import { usePathname } from 'next/navigation'
import styles from '@/styles/ActProfile.module.css'

export default function Loading() {
  const pathname = usePathname()
  
  if (pathname?.endsWith('/e-live')) {
    return (
      <div className="desktop-only">
        <div className={styles.container}>
          <h1>E-Live</h1>
        </div>
      </div>
    )
  }

  // Generic loading skeleton for other acts to clear the previous act content
  return (
    <div className={styles.container}>
      {/* Desktop empty header */}
      <h1 className="desktop-only" style={{ color: 'transparent', userSelect: 'none' }}>Loading</h1>
      
      {/* Mobile empty structure to prevent layout collapse */}
      <div className="mobile-only" style={{ height: '2rem' }}></div>
    </div>
  )
}

