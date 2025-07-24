'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import styles from '@/styles/Vault.module.css'
import type { Media } from '@/payload-types'

type ImageModalProps = {
  media: Media | null
  onClose: () => void
}

const ImageModal: React.FC<ImageModalProps> = ({ media, onClose }) => {
  useEffect(() => {
    document.body.classList.add('modal-open')
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [])

  if (!media) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <button className={styles.modalCloseButton} onClick={onClose} aria-label="Close modal">
        &times;
      </button>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <Image
          src={media.url!}
          alt={media.filename || 'Vault image'}
          width={media.width!}
          height={media.height!}
          className={styles.modalImage}
          priority={true}
          sizes="(max-width: 768px) 90vw, (max-width: 1200px) 70vw, 50vw"
        />
      </div>
    </div>
  )
}

type VaultClientProps = {
  initialVault: Media[]
}

export default function VaultClient({ initialVault }: VaultClientProps) {
  const [showContent, setShowContent] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)
  const [loadedImages, setLoadedImages] = useState<string[]>([])

  const delayTime = 700

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true)
    }, delayTime)
    return () => clearTimeout(timer)
  }, [])

  const openModal = (mediaItem: Media) => {
    setSelectedMedia(mediaItem)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedMedia(null)
  }

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => [...prev, id])
  }

  if (!showContent) return null

  return (
    <>
      <div className={styles.vault}>
        {initialVault.map((media) => (
          <figure key={media.id} onClick={() => openModal(media)} className={styles.imageContainer}>
            <Image
              src={media.url!}
              alt={media.filename || 'Vault image'}
              width={media.width!}
              height={media.height!}
              className={`${styles.gridImage} ${loadedImages.includes(media.id) ? styles.fadeIn : styles.hidden}`}
              priority={true}
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 70vw, 50vw"
              onLoadingComplete={() => handleImageLoad(media.id)}
            />
          </figure>
        ))}
      </div>

      {showModal && <ImageModal media={selectedMedia} onClose={closeModal} />}
    </>
  )
}
