// components/ActProfile.tsx
'use client'

import { useEffect, useState } from 'react'
import Open from '@/assets/Open'
import { useSelectedAct } from '@/contexts/SelectedActContext'

type ActDetails = {
  name: string
  bio: string
  link?: string
}

export default function ActProfile() {
  const { selectedActId } = useSelectedAct()
  const [actDetails, setActDetails] = useState<ActDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedActId) {
      console.log('ActProfile: No selectedActId, clearing details')
      setActDetails(null)
      return
    }

    const fetchActDetails = async () => {
      console.log('ActProfile: Fetching details for', selectedActId)
      setError(null)
      try {
        const res = await fetch(`/api/acts/${selectedActId}`)
        if (!res.ok) throw new Error('Failed to fetch act details')
        const data = await res.json()
        console.log('ActProfile: Received data for', selectedActId, data)
        setActDetails(data)
      } catch (err) {
        console.error('ActProfile: Error fetching details:', err)
        setError('Failed to load act details')
      } finally {
        console.log('ActProfile: Finished loading for', selectedActId)
      }
    }

    fetchActDetails()
  }, [selectedActId])

  if (!selectedActId) return <div>Select an act to view details</div>
  if (error) return <div>{error}</div>
  if (!actDetails) return <div>No act details found</div>

  const websiteUrl = actDetails.link?.startsWith('http') ? actDetails.link : `https://${actDetails.link}`

  return (
    <div
      style={{
        width: '64rem',
      }}
    >
      <h1>{actDetails.name}</h1>
      <p>{actDetails.bio}</p>
      {actDetails.link && (
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: 'underline',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            width: 'fit-content',
          }}
        >
          {actDetails.link}
          <Open />
        </a>
      )}
    </div>
  )
}
