'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

type Act = { id: string; name: string; photo?: { url: string } }

export default function HomePage() {
  const [acts, setActs] = useState<Act[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedActId, setSelectedActId] = useState<string | null>(null)

  useEffect(() => {
    const fetchActs = async () => {
      setError(null)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/acts?limit=9999&sort=name`)
        if (!res.ok) throw new Error(`Failed to fetch acts: ${res.statusText}`)
        const data = await res.json()
        setActs(data.docs)
      } catch (err) {
        setError((err as Error)?.message || 'An unknown error occurred')
      }
    }

    fetchActs()
  }, [])

  if (error) return <div>Error: {error}</div>
  if (acts.length === 0) return <div>Loading...</div>

  return (
    <main
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '1rem',
      }}
    >
      {acts.map((act) => {
        const isSelected = act.id === selectedActId

        return (
          <div
            key={act.id}
            onClick={() => setSelectedActId(isSelected ? null : act.id)}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1 / 1',
              cursor: 'pointer',
              transition: 'transform 0.3s ease, z-index 0.3s',
              transform: isSelected ? 'scale(2)' : 'scale(1)',
              zIndex: isSelected ? 1 : 0,
            }}
          >
            <Image
              src={act.photo?.url || '/placeholder.jpg'}
              alt={act.name}
              fill
              style={{
                objectFit: 'cover',
                borderRadius: '0.5rem',
              }}
            />
          </div>
        )
      })}
    </main>
  )
}
