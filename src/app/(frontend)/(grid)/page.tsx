import ClearSelection from '@/components/ClearSelection'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import type { Aboot, Media } from '@/payload-types'

export default async function AbootPage() {
  let aboot: Aboot | null = null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/globals/aboot`)
    if (!res.ok) throw new Error('Failed to fetch data')
    aboot = (await res.json()) as Aboot
  } catch (err) {
    console.error('Failed to fetch Aboot data', err)
    return <div>Failed to load content</div>
  }

  if (!aboot) return <div>Loading...</div>

  const validGalleryImages = (aboot.gallery || []).filter(
    (item): item is Media => typeof item !== 'string' && 'url' in item,
  )

  const slideDuration = 4 // seconds
  const totalDuration = slideDuration * validGalleryImages.length

  return (
    <>
      <ClearSelection />
      <RichText className="headline" data={aboot.headline} />

      {validGalleryImages.length > 0 && (
        <div
          className="crossfade-container"
          style={{
            position: 'relative',
            width: '256px',
            height: '320px',
            overflow: 'hidden',
            zIndex: -1,
          }}
        >
          <Image
            src={validGalleryImages[0]?.url || ''}
            alt={validGalleryImages[0]?.alt || 'Gallery image'}
            fill
            style={{ objectFit: 'cover', pointerEvents: 'none' }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {validGalleryImages.map((image, index) => (
            <div
              key={image.id}
              className="crossfade-slide"
              style={{
                animationDelay: `${index * slideDuration}s`,
                animationDuration: `${totalDuration}s`,
              }}
            >
              <Image
                src={image.url || ''}
                alt={image.alt || 'Gallery image'}
                fill
                style={{ objectFit: 'cover', pointerEvents: 'none' }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>
      )}

      <style>{`
        .crossfade-slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          animation-name: crossfade-z;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes crossfade-z {
          0%   { opacity: 0; z-index: 100; }
          10%  { opacity: 1; }
          45%  { opacity: 1; }
          55%  { opacity: 0; z-index: 1; }
          100% { opacity: 0; z-index: 1; }
        }
      `}</style>

      <RichText data={aboot.profile} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: '4rem' }}>
        {aboot.team1 && <RichText data={aboot.team1} />}
        {aboot.team2 && <RichText data={aboot.team2} />}
      </div>
    </>
  )
}
