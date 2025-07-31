import ClearSelection from '@/components/ClearSelection'
import Image from 'next/image'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { About, Media } from '@/payload-types'
import styles from '@/styles/About.module.css'
import { fetchAbout, safeFetch } from '@/lib/api/payload-cms'

export default async function About() {
  const about = await safeFetch(fetchAbout)
  if (!about) return <div>Failed to load content</div>

  const validGalleryImages = (about.gallery || []).filter(
    (item): item is Media => typeof item !== 'string' && 'url' in item,
  )

  const slideDuration = 10
  const totalDuration = slideDuration * validGalleryImages.length

  return (
    <>
      <ClearSelection />
      <div className={styles.mainWrapper}>
        <RichText className={styles.headline} data={about.headline} />

        <div className={styles.imageWrapper}>
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
        </div>

        <RichText data={about.profile} />
      </div>

      <div className={styles.team}>
        {about.team1 && <RichText data={about.team1} />}
        {about.team2 && <RichText data={about.team2} />}
      </div>

      <span className={styles.footer}>
        <div className={styles.credits}>
          © The Harbour Agency Pty Ltd. All rights reserved.&nbsp;
          <Link href={'/legal'} style={{ display: 'inline-block' }}>
            Privacy Policy
          </Link>
        </div>

        <span>
          Website by{' '}
          <a target="_blank" href="https://israelblennerhassett.com/">
            Israel Blennerhassett
          </a>
        </span>
      </span>
    </>
  )
}
