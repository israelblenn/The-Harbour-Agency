'use client'

import { useEffect, useRef } from 'react'
import { useSelectedAct } from '@/contexts/SelectedActContext'
import styles from '@/styles/ActProfile.module.css'
import type { Elive } from '@/payload-types'

type ELiveSectionProps = {
  elive: Elive
}

export default function ELiveSection({ elive }: ELiveSectionProps) {
  const { selectedActId, setSelectedActId } = useSelectedAct()
  const hasSetInitialId = useRef(false)

  useEffect(() => {
    // Only set the selected ID if this is the initial mount and nothing is selected yet
    // (e.g., user navigated directly to /e-live)
    // If selectedActId is already 'e-live', the user clicked from the list and we don't need to set it
    if (!hasSetInitialId.current && !selectedActId) {
      setSelectedActId('e-live')
      hasSetInitialId.current = true
    }
  }, [selectedActId, setSelectedActId])

  return (
    <div className={styles.container}>
      <h1 className="desktop-only">{elive.Title}</h1>

      {elive.description && <p className={styles.bio}>{elive.description}</p>}

      {elive.contacts && elive.contacts.length > 0 && (
        <table style={{ alignSelf: 'flex-start', marginTop: 0 }}>
          <tbody>
            {elive.contacts.map(({ id, label, content }) => (
              <tr key={id}>
                <td>{label}</td>
                <td>{content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
