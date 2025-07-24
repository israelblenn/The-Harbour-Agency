'use client'

import React from 'react'
import styles from '@/styles/ActList.module.css'

interface Act {
  id: string
  name: string
}

interface ActListDisplayProps {
  acts: Act[]
  selectedActId: string | null
  onItemClick: (id: string, e: React.MouseEvent<HTMLLIElement, MouseEvent>) => void
  isDragging: boolean
  contentRefs: React.RefObject<Record<string, HTMLSpanElement | null>>
}

export default function ActListDisplay({
  acts,
  selectedActId,
  onItemClick,
  isDragging,
  contentRefs,
}: ActListDisplayProps) {
  return (
    <>
      {acts.length === 0 ? (
        <li className={styles.item}>No results</li>
      ) : (
        acts.map((act) => {
          const isSelected = act.id === selectedActId
          return (
            <li
              key={act.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => onItemClick(act.id, e)}
              className={styles.item}
              style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
            >
              <span
                ref={(el) => {
                  contentRefs.current[act.id] = el
                }}
                className={`${styles.itemContent} ${isSelected ? styles.selected : ''}`}
                data-overflowing="false"
              >
                {act.name}
              </span>
            </li>
          )
        })
      )}
      <li className={styles.spacer} aria-hidden />
    </>
  )
}
