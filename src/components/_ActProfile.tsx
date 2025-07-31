'use client'

import { useEffect, useState } from 'react'
import Open from '@/assets/Open'
import { useSelectedAct } from '@/contexts/SelectedActContext'
import { motion, AnimatePresence } from 'framer-motion'

type ActDetails = {
  name: string
  bio: string
  link?: string
}

export default function ActProfile() {
  const { selectedActId } = useSelectedAct()
  const [actDetails, setActDetails] = useState<ActDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!selectedActId) {
      console.log('ActProfile: No selectedActId, clearing details')
      setActDetails(null)
      return
    }

    const fetchActDetails = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/acts/${selectedActId}`)
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
  }, [selectedActId])

  return (
    <AnimatePresence mode="wait">
      {!selectedActId ? (
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
          {/* Loading... !!*/}
        </motion.div>
      ) : (
        <motion.div
          key={selectedActId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            width: '64rem',
          }}
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
