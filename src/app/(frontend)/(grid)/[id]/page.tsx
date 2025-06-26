'use client'

import { useEffect, useState, useRef } from 'react'
import Open from '@/assets/Open'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelectedAct } from '@/contexts/SelectedActContext'

type ActDetails = {
  name: string
  bio: string
  link?: string
}

export default function ActProfile() {
  const params = useParams()
  const actId = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? null)
  const { selectedActId, setSelectedActId } = useSelectedAct()

  const [actDetails, setActDetails] = useState<ActDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const hasSetInitialActId = useRef(false)

  useEffect(() => {
    if (!hasSetInitialActId.current && actId && !selectedActId) {
      setSelectedActId(actId)
      hasSetInitialActId.current = true
    }
  }, [actId, selectedActId, setSelectedActId])

  useEffect(() => {
    if (!actId) {
      console.log('ActProfile: No actId in URL, clearing details')
      setActDetails(null)
      return
    }

    const fetchActDetails = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/acts/${actId}`)
        if (!res.ok) throw new Error('Failed to fetch act details')
        const data = await res.json()
        setActDetails(data)
      } catch (err) {
        console.error('ActProfile: Error fetching details:', err)
        setError('Failed to load act details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchActDetails()
  }, [actId])

  return (
    <AnimatePresence mode="wait">
      {!actId ? (
        <motion.div />
      ) : error ? (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.div>
      ) : !actDetails || isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Loading... */}
        </motion.div>
      ) : (
        <motion.div
          key={actId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ width: '64rem' }}
        >
          <h1>{actDetails.name}</h1>
          <p>{actDetails.bio}</p>
          {actDetails.link && (
            <a
              href={actDetails.link.startsWith('http') ? actDetails.link : `https://${actDetails.link}`}
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
              {actDetails.link.replace(/^https?:\/\//, '')}
              <Open />
            </a>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
