'use client'

import { useSelectedAct } from '@/contexts/SelectedActContext'
import type { Act } from '@/payload-types'
import Image from 'next/image'
import { Link } from 'next-view-transitions'
import styles from '@/styles/Artists.module.css'
import Marquee from './Marquee'
import { useIsMobile } from '@/hooks/useIsMobile'

interface SelectedActThumbnailProps {
  acts: Act[]
}

export default function SelectedActThumbnail({ acts }: SelectedActThumbnailProps) {
  const { selectedActId } = useSelectedAct()
  const isMobile = useIsMobile()
  const selectedAct = acts.find((act) => act.id === selectedActId)

  if (!selectedAct || !selectedAct.photo) return null

  const getImageUrl = () => {
    if (typeof selectedAct.photo === 'string') {
      return selectedAct.photo
    } else if (selectedAct.photo && typeof selectedAct.photo === 'object' && selectedAct.photo.url) {
      return selectedAct.photo.url
    }
    return null
  }

  const imageUrl = getImageUrl()

  if (!imageUrl) return null

  const transitionName = `act-image-${selectedAct.id}`

  return (
    <div className={styles.thumbnailContainer}>
      <Marquee repeat={10} speed={20} className={styles.marquee}>
        <span>TAP TO EXPAND - </span>
      </Marquee>
      <div className={styles.expand} />
      <Link href={`/${selectedAct.id}`} className={styles.imageWrapper}>
        <Image
          src={imageUrl}
          alt={`${selectedAct.name} thumbnail`}
          fill
          sizes="64px"
          className={styles.thumbnailImage}
          style={isMobile ? { viewTransitionName: transitionName } : {}}
        />
      </Link>
    </div>
  )
}
