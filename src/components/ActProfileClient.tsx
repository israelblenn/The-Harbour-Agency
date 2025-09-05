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
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.28738 7.73291L11.5553 2.46582V5.77778H13V0H7.22129V1.44444H10.5338L5.26584 6.71153L6.28738 7.73291ZM11.5574 11.5556V7.94444H10.1127V11.5556H1.44468V2.88889H5.05637V1.44444H4.47769e-06L0 13H11.5574V12.2778V11.9167C11.5574 11.9167 11.5574 12.3533 11.5574 11.5556Z"
          fill="black"
        />
      </svg>
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
