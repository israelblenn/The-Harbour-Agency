import ClearSelection from '@/components/ClearSelection'
import Image from 'next/image'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { About, Media } from '@/payload-types'
import styles from '@/styles/About.module.css'

export default async function About() {
  let about: About | null = null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/globals/about`)
    if (!res.ok) throw new Error('Failed to fetch data')
    about = (await res.json()) as About
  } catch (err) {
    console.error('Failed to fetch data', err)
    return <div>Failed to load content</div>
  }

  if (!about) return <div>Loading...</div>

  const validGalleryImages = (about.gallery || []).filter(
    (item): item is Media => typeof item !== 'string' && 'url' in item,
  )

  const slideDuration = 10
  const totalDuration = slideDuration * validGalleryImages.length

  return (
    <>
      <ClearSelection />
      <RichText className={styles.headline} data={about.headline} />

      {validGalleryImages.length > 0 && (
        <div className={styles.imageContainer}>
          <Image
            src={validGalleryImages[0]?.url || ''}
            alt={validGalleryImages[0]?.alt || 'Gallery image'}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {validGalleryImages.map((image, index) => (
            <div
              key={image.id}
              className={styles.crossfadeSlide}
              style={{
                animationDelay: `${index * slideDuration}s`,
                animationDuration: `${totalDuration}s`,
              }}
            >
              <Image
                src={image.url || ''}
                alt={image.alt || 'Gallery image'}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>
      )}

      <RichText data={about.profile} />

      <div className={styles.team}>
        {about.team1 && <RichText data={about.team1} />}
        {about.team2 && <RichText data={about.team2} />}
      </div>

      <span className={styles.footer}>
        © The Harbour Agency Pty Ltd. All rights reserved.
        <div className={styles.spaceBetween}>
          <span>
            Website by{' '}
            <a target="_blank" href="https://israelblennerhassett.com/">
              Israel Blennerhassett
            </a>
          </span>
          <Link href={'/legal'}>Privacy Policy</Link>
        </div>
      </span>
    </>
  )
}
