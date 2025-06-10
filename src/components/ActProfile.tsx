// components/ActProfile.tsx
'use client'

import { useEffect, useState } from 'react'
import SVG from '@/assets/open'

export default function ActProfile({ actId }: { actId: string }) {
  const [actDetails, setActDetails] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debug effect - logs when actId changes
  useEffect(() => {
    console.log('ActProfile: actId changed to', actId)
  }, [actId])

  useEffect(() => {
    if (!actId) {
      console.log('ActProfile: No actId, clearing details')
      setActDetails(null)
      return
    }

    const fetchActDetails = async () => {
      console.log('ActProfile: Fetching details for', actId)
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/acts/${actId}`)
        if (!res.ok) throw new Error('Failed to fetch act details')
        const data = await res.json()
        console.log('ActProfile: Received data for', actId, data)
        setActDetails(data)
      } catch (err) {
        console.error('ActProfile: Error fetching details:', err)
        setError('Failed to load act details')
      } finally {
        console.log('ActProfile: Finished loading for', actId)
        setLoading(false)
      }
    }

    fetchActDetails()
  }, [actId])

  // Render debug
  console.log('ActProfile: Rendering with', { actId, loading, error, actDetails })

  if (!actId) return <div>Select an act to view details</div>
  if (error) return <div>{error}</div>
  if (!actDetails) return <div>No act details found</div>

  // Format website URL
  const websiteUrl = actDetails.link?.startsWith('http') ? actDetails.link : `https://${actDetails.link}`

  return (
    <div
      style={{
        position: 'absolute',
        top: '0',
        right: '0',
        width: '64rem',
      }}
    >
      {/* Name */}
      <h1>{actDetails.name}</h1>

      {/* Bio */}
      <p>{actDetails.bio}</p>

      {/* Website Link */}
      {actDetails.link && (
        <a href={websiteUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
          {actDetails.link}
          <SVG />
        </a>
      )}
    </div>
  )
}
