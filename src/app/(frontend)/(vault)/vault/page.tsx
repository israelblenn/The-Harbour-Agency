'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { fetchVaultMedia, safeFetch } from '@/lib/api/payload-cms'
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

export default function Vault() {
  const [vault, setVault] = useState<Media[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)

  useEffect(() => {
    async function fetchData() {
      const data = await safeFetch(fetchVaultMedia)
      if (data) setVault(data)
    }
    fetchData()
  }, [])

  const openModal = (mediaItem: Media) => {
    setSelectedMedia(mediaItem)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedMedia(null)
  }

  return (
    <>
      <div className={styles.vault}>
        {vault.map((media) => (
          <figure key={media.id} onClick={() => openModal(media)} className={styles.imageContainer}>
            <Image
              src={media.url!}
              alt={media.filename || 'Vault image'}
              width={media.width!}
              height={media.height!}
              className={styles.modalImage}
              priority={true}
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 70vw, 50vw"
            />
          </figure>
        ))}
      </div>

      {showModal && <ImageModal media={selectedMedia} onClose={closeModal} />}
    </>
  )
}
