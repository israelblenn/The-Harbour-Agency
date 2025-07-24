// components/SelectedActThumbnail.tsx
'use client'

import { useSelectedAct } from '@/contexts/SelectedActContext'
import type { Act } from '@/payload-types'
import Image from 'next/image'
import styles from '@/styles/Artists.module.css'

interface SelectedActThumbnailProps {
  acts: Act[]
}

export default function SelectedActThumbnail({ acts }: SelectedActThumbnailProps) {
  const { selectedActId } = useSelectedAct()
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

  return (
    <div className={styles.thumbnailContainer}>
      <div className={styles.expand}></div>
      <div className={styles.imageWrapper}>
        <Image
          src={imageUrl}
          alt={`${selectedAct.name} thumbnail`}
          fill
          sizes="64px"
          className={styles.thumbnailImage}
        />
      </div>
    </div>
  )
}
