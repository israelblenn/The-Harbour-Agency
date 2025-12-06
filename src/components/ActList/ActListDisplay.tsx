'use client'

import React, { useEffect, useRef, useState } from 'react'
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
  eLiveStartIndex: number
  separatorRef?: React.Ref<HTMLLIElement | null>
  onELiveTitleClick?: () => void
  scrollRef?: React.RefObject<HTMLUListElement | null>
}

function ActListDisplay({
  acts,
  selectedActId,
  onItemClick,
  isDragging,
  contentRefs,
  eLiveStartIndex,
  separatorRef,
  onELiveTitleClick,
  scrollRef,
}: ActListDisplayProps) {
  const titleRef = useRef<HTMLLIElement | null>(null)
  const [isStuck, setIsStuck] = useState(false)

  useEffect(() => {
    if (!titleRef.current || !scrollRef?.current || eLiveStartIndex === -1) return

    const title = titleRef.current
    const container = scrollRef.current

    const checkIfStuck = () => {
      const containerRect = container.getBoundingClientRect()
      const titleRect = title.getBoundingClientRect()
      
      // Check if title is stuck at the bottom
      // When stuck, the title's bottom should be at the container's bottom
      const containerBottom = containerRect.bottom
      const titleBottom = titleRect.bottom
      const tolerance = 2 // Small tolerance for rounding
      
      // Title is stuck if its bottom aligns with container's bottom
      const stuck = Math.abs(titleBottom - containerBottom) < tolerance
      setIsStuck(stuck)
    }

    container.addEventListener('scroll', checkIfStuck, { passive: true })
    window.addEventListener('resize', checkIfStuck)
    checkIfStuck() // Initial check

    return () => {
      container.removeEventListener('scroll', checkIfStuck)
      window.removeEventListener('resize', checkIfStuck)
    }
  }, [scrollRef, eLiveStartIndex])
  return (
    <>
      {acts.length === 0 ? (
        <li className={styles.item}>No results</li>
      ) : (
        acts.map((act, index) => {
          const isSelected = act.id === selectedActId
          const showSeparator = eLiveStartIndex !== -1 && index === eLiveStartIndex
          
          return (
            <React.Fragment key={act.id}>
              {showSeparator && (
                <>
                  <li 
                    ref={separatorRef}
                    className={styles.separatorGap} 
                    aria-hidden 
                    data-separator="true" 
                  />
                  <li 
                    ref={titleRef}
                    className={styles.eLiveTitle}
                    data-title="true" 
                    onClick={onELiveTitleClick}
                    style={{ cursor: onELiveTitleClick ? 'pointer' : 'default' }}
                  >
                    <span className={`${styles.skipToPrefix} ${isStuck ? styles.skipToVisible : styles.skipToHidden}`}>
                      Skip to&nbsp;
                    </span>
                    <span className={styles.eLiveText}>
                      E-Live
                      <svg style={{ margin: '0 0 -0.5rem 1rem' }} width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M6.3333 8.86306L6.3333 1.15002L0.149904 1.15002L0.149904 0.150024L7.53172 0.150024L7.53172 8.86306L11.3025 5.10391L12.1499 5.94871L6.93251 11.15L1.71512 5.94871L2.56253 5.10391L6.3333 8.86306Z" fill="#FF4338" stroke="#FF4338" strokeWidth="0.3"/>
                      </svg>
                    </span>
                  </li>
                  <li className={styles.separatorLine} aria-hidden data-separator="true" />
                </>
              )}
              <li
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
            </React.Fragment>
          )
        })
      )}
      <li className={styles.spacer} aria-hidden />
    </>
  )
}

export default ActListDisplay

