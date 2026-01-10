'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from '@/styles/ActProfile.module.css'
import type { Act, Elive } from '@/payload-types'
import ActList from '@/components/ActList/ActList'
import SelectedActThumbnail from '@/components/SelectedActThumbnail'

type ELiveSectionProps = {
  elive: Elive
  eLiveActs: Act[]
}

export default function ELiveSection({ elive, eLiveActs }: ELiveSectionProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false)

  return (
    <>
      {/* Mobile: Show Artists-style layout */}
      <div className="mobile-only">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100svh - 10rem)', // Account for header (6rem) + body padding (4rem)
            overflow: 'hidden',
          }}
        >
          {/* Dropdown for E-Live info */}
          <button
            onClick={() => setIsInfoOpen(!isInfoOpen)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem 0',
              font: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              flexShrink: 0,
              marginBottom: '2rem',
              fontWeight: '600',
            }}
          >
            <span>
              What is <i>E-Live</i>&#8201;?
            </span>
            <svg
              width="18"
              height="11"
              viewBox="0 0 18 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                transition: 'transform 0.2s ease',
                transform: isInfoOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                marginRight: '0.5rem',
              }}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16 0L17.4142 1.41421L8.70711 10.1213L0 1.41421L1.41421 0L8.70711 7.29289L16 0Z"
                fill="black"
              />
            </svg>
          </button>

          <AnimatePresence>
            {isInfoOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{ flexShrink: 0, overflow: 'hidden', marginBottom: '3rem' }}
              >
                {elive.description && (
                  <p className={styles.bio} style={{ marginTop: '0.5rem' }}>
                    {elive.description}
                  </p>
                )}

                {elive.contacts && elive.contacts.length > 0 && (
                  <table style={{ marginTop: 0, marginBottom: '1rem' }}>
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
              </motion.div>
            )}
          </AnimatePresence>

          <ActList Acts={eLiveActs} hideSearch fillHeight />
          <SelectedActThumbnail acts={eLiveActs} />
        </div>
      </div>

      {/* Desktop: Show E-Live info */}
      <div className="desktop-only">
        <div className={styles.container}>
          <h1>{elive.Title}</h1>

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
      </div>
    </>
  )
}
