'use client'

import { useEffect, useRef } from 'react'
// import Open from '@/assets/Open'
import { useSelectedAct } from '@/contexts/SelectedActContext'
import styles from '@/styles/ActProfile.module.css'
import type { Act } from '@/payload-types'
import Image from 'next/image'
import { Link } from 'next-view-transitions'
import { useIsMobile } from '@/hooks/useIsMobile'
import TypewriterText from './TypewriterText'

type ActProfileClientProps = {
  actDetails: Act
}

export default function ActProfileClient({ actDetails }: ActProfileClientProps) {
  const { selectedActId, setSelectedActId } = useSelectedAct()
  const hasSetInitialActId = useRef(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!hasSetInitialActId.current && actDetails.id && !selectedActId) {
      setSelectedActId(actDetails.id)
      hasSetInitialActId.current = true
    }
  }, [actDetails.id, selectedActId, setSelectedActId])

  const transitionName = `act-image-${actDetails.id}`

  const actLinkElement = actDetails.link ? (
    <a
      href={actDetails.link.startsWith('http') ? actDetails.link : `https://${actDetails.link}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.link}
    >
      {actDetails.link.replace(/^https?:\/\//, '')}
      {/* <Open /> */}
    </a>
  ) : null

  return (
    <div key={actDetails.id} className={styles.container}>
      <h1 className="desktop-only">{actDetails.name}</h1>

      <div className="mobile-only">
        <Link href={'/artists'} className={styles.back}>
          &lt;- All artists
        </Link>
        <div className={styles.bar} />
        <span>{actDetails.name}</span>
      </div>

      <TypewriterText text={actDetails.bio} className={styles.bio} linkElement={actLinkElement} />

      {actDetails.photo && typeof actDetails.photo === 'object' && actDetails.photo.url && (
        <div
          className={`${styles.imageWrapper} mobile-only`}
          style={isMobile ? { viewTransitionName: transitionName } : {}}
        >
          <Image
            src={actDetails.photo.url}
            alt={actDetails.photo.alt || actDetails.name}
            fill
            sizes="(max-width: 768px) 100vw, 64rem"
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
    </div>
  )
}
