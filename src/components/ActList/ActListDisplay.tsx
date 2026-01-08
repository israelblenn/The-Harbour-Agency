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
  eLiveTitleIndex: number
  separatorRef?: React.Ref<HTMLLIElement | null>
  scrollRef?: React.RefObject<HTMLUListElement | null>
  pendingActId?: string | null
}

function ActListDisplay({
  acts,
  selectedActId,
  onItemClick,
  isDragging,
  contentRefs,
  eLiveTitleIndex,
  separatorRef,
  scrollRef,
  pendingActId = null,
}: ActListDisplayProps) {
  const titleRef = useRef<HTMLLIElement | null>(null)
  const [isStuck, setIsStuck] = useState(false)

  useEffect(() => {
    if (!titleRef.current || !scrollRef?.current || eLiveTitleIndex === -1) return

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
  }, [scrollRef, eLiveTitleIndex])
  return (
    <>
      {acts.length === 0 ? (
        <li className={styles.item}>No results</li>
      ) : (
        acts.map((act, index) => {
          const isSelected = act.id === selectedActId
          const isELiveTitle = act.id === 'e-live'

          // Render E-Live title as a special selectable item
          if (isELiveTitle) {
            return (
              <React.Fragment key={act.id}>
                <li ref={separatorRef} className={styles.separatorGap} aria-hidden data-separator="true" />
                <li
                  ref={titleRef}
                  className={`${styles.eLiveTitle} ${isSelected ? styles.eLiveTitleSelected : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => onItemClick(act.id, e)}
                  style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
                >
                  <span
                    ref={(el) => {
                      contentRefs.current[act.id] = el
                    }}
                    className={`${styles.skipToPrefix} ${isStuck ? styles.skipToVisible : styles.skipToHidden}`}
                  >
                    Skip to&nbsp;
                  </span>
                  <span className={`${styles.eLiveText} ${isSelected ? styles.selected : ''}`}>
                    E-Live
                    <svg
                      className={isStuck ? styles.eLiveArrowVisible : styles.eLiveArrowHidden}
                      style={{ margin: '0 0 -0.5rem 1rem' }}
                      width="13"
                      height="12"
                      viewBox="0 0 13 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M6.3333 8.86306L6.3333 1.15002L0.149904 1.15002L0.149904 0.150024L7.53172 0.150024L7.53172 8.86306L11.3025 5.10391L12.1499 5.94871L6.93251 11.15L1.71512 5.94871L2.56253 5.10391L6.3333 8.86306Z"
                        fill="#FF4338"
                        stroke="#FF4338"
                        strokeWidth="0.3"
                      />
                    </svg>
                  </span>
                  <svg
                    style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}
                    width="16"
                    height="16"
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`${styles.eLiveInfoIcon} ${isStuck ? styles.eLiveArrowHidden : styles.eLiveArrowVisible}`}
                  >
                    <circle cx="512" cy="512" r="448" stroke="#000000" strokeWidth="64" fill="none" />
                    <path
                      fill="#000000"
                      d="M579.2 339.072c33.28 0 60.288-23.104 60.288-57.344s-27.072-57.344-60.288-57.344c-33.28 0-60.16 23.104-60.16 57.344s26.88 57.344 60.16 57.344zM590.912 699.2c0-6.848 2.368-24.64 1.024-34.752l-52.608 60.544c-10.88 11.456-24.512 19.392-30.912 17.28a12.992 12.992 0 0 1-8.256-14.72l87.68-276.992c7.168-35.136-12.544-67.2-54.336-71.296-44.096 0-108.992 44.736-148.48 101.504 0 6.784-1.28 23.68.064 33.792l52.544-60.608c10.88-11.328 23.552-19.328 29.952-17.152a12.8 12.8 0 0 1 7.808 16.128L388.48 728.576c-10.048 32.256 8.96 63.872 55.04 71.04 67.84 0 107.904-43.648 147.456-100.416z"
                    />
                  </svg>
                </li>
                <li className={styles.separatorLine} aria-hidden data-separator="true" />
              </React.Fragment>
            )
          }

          return (
            <React.Fragment key={act.id}>
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
