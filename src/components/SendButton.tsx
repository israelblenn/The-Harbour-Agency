'use client'

import styles from '@/styles/Contact.module.css'
import { useState, useRef, useEffect } from 'react'

interface SendButtonProps {
  isSubmitting: boolean
  isSuccess: boolean
}

export default function SendButton({ isSubmitting, isSuccess }: SendButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle')
  const overlayRef = useRef<HTMLSpanElement>(null)
  const [textKey, setTextKey] = useState(0)
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isSubmitting) {
      setStatus('loading')
      setTextKey((prev) => prev + 1)
    } else if (isSuccess && status === 'loading') {
      setStatus('sent')
      setTextKey((prev) => prev + 1)

      resetTimerRef.current = setTimeout(() => {
        if (overlayRef.current) {
          overlayRef.current.classList.remove(styles.sentAnimation)
          void overlayRef.current.offsetWidth
        }
        setStatus('idle')
        setTextKey((prev) => prev + 1)
      }, 6000)
    } else if (!isSubmitting && !isSuccess && status !== 'idle') {
      setStatus('idle')
      setTextKey((prev) => prev + 1)
    }
  }, [isSubmitting, isSuccess, status])

  const renderText = () => {
    if (status === 'loading') {
      return (
        <span className={styles.dotsContainer}>
          <span className={styles.dot}>.</span>
          <span className={styles.dot}>.</span>
          <span className={styles.dot}>.</span>
        </span>
      )
    }
    return status === 'sent' ? 'sent' : 'send'
  }

  return (
    <button
      className={`${styles.send} 
                 ${status === 'loading' ? styles.active : ''}
                 ${status === 'sent' ? styles.sent : ''}
                 ${status !== 'idle' ? styles.disabled : ''}`}
      disabled={status !== 'idle'}
      aria-busy={status === 'loading'}
      type="submit"
    >
      <span key={`primary-${textKey}`} className={styles.textPrimary}>
        <span className={styles.fadeContainer}>{renderText()}</span>
      </span>
      <span
        key={`overlay-${textKey}`}
        ref={overlayRef}
        className={`${styles.textOverlay} ${status === 'sent' ? styles.sentAnimation : ''}`}
      >
        <span className={styles.fadeContainer}>{renderText()}</span>
      </span>
    </button>
  )
}
