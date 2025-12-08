'use client'

import React, { useEffect, useRef } from 'react'
import styles from '@/styles/ActList.module.css'

interface ActListScrollProps {
  scrollRef: React.RefObject<HTMLUListElement | null>
  isClickAllowedRef: React.RefObject<boolean>
  isProgrammaticScrollRef: React.RefObject<boolean>
  isUserInteractingWithSelection: React.RefObject<boolean>
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>
  onScroll: (event: React.UIEvent<HTMLUListElement>) => void
  children: React.ReactNode
  isArrowKeyScrollRef: React.RefObject<boolean>
}

export default function ActListScroll({
  scrollRef,
  isClickAllowedRef,
  isProgrammaticScrollRef,
  isUserInteractingWithSelection,
  setIsDragging,
  onScroll,
  children,
  isArrowKeyScrollRef,
}: ActListScrollProps) {
  const isDraggingRef = useRef(false)
  const startYRef = useRef(0)
  const scrollTopRef = useRef(0)

  useEffect(() => {
    const CLICK_MOVE_THRESHOLD = 5

    const handleMouseDown = (e: MouseEvent) => {
      const current = scrollRef.current
      if (!current) return
      isDraggingRef.current = true
      startYRef.current = e.clientY
      scrollTopRef.current = current.scrollTop
      isClickAllowedRef.current = true
      current.style.scrollSnapType = 'none'
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      const current = scrollRef.current
      if (!current) return
      const deltaY = e.clientY - startYRef.current

      if (isClickAllowedRef.current && Math.abs(deltaY) > CLICK_MOVE_THRESHOLD) {
        isClickAllowedRef.current = false
        setIsDragging(true)
      }

      if (!isClickAllowedRef.current) {
        current.scrollTop = scrollTopRef.current - deltaY
      }
    }

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return
      const current = scrollRef.current
      if (!current) return

      isDraggingRef.current = false
      setIsDragging(false)
      current.style.scrollSnapType = 'y mandatory'
    }

    const ul = scrollRef.current
    if (ul) {
      ul.addEventListener('mousedown', handleMouseDown)
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      if (ul) ul.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [scrollRef, isClickAllowedRef, setIsDragging])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const current = scrollRef.current
      if (!current) return

      const keyDelta: {
        [key in 'ArrowUp' | 'ArrowLeft' | 'ArrowDown' | 'ArrowRight']?: number
      } = {
        ArrowUp: -32,
        ArrowLeft: -32,
        ArrowDown: 32,
        ArrowRight: 32,
      }
      const delta = keyDelta[e.key as keyof typeof keyDelta]
      if (delta !== undefined) {
        e.preventDefault()
        isProgrammaticScrollRef.current = true
        isUserInteractingWithSelection.current = true
        isArrowKeyScrollRef.current = true // Mark that this scroll is from arrow keys
        current.scrollBy({ top: delta, behavior: 'smooth' })
        requestAnimationFrame(() => {
          isProgrammaticScrollRef.current = false
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [scrollRef, isProgrammaticScrollRef, isUserInteractingWithSelection, isArrowKeyScrollRef])

  // Dynamic scroll-snap management: disable during wheel events, re-enable immediately when scrolling stops
  useEffect(() => {
    const current = scrollRef.current
    if (!current) return

    let scrollTimeout: number | null = null
    let isScrollSnapDisabled = false

    const handleWheel = (_e: WheelEvent) => {
      if (!isProgrammaticScrollRef.current) {
        // Disable scroll-snap on first wheel event to allow smooth scrolling
        if (!isScrollSnapDisabled) {
          current.style.scrollSnapType = 'none'
          isScrollSnapDisabled = true
        }

        // Clear any existing timeout
        if (scrollTimeout) {
          clearTimeout(scrollTimeout)
        }

        // Re-enable scroll-snap quickly after wheel events stop
        scrollTimeout = window.setTimeout(() => {
          current.style.scrollSnapType = 'y mandatory'
          isScrollSnapDisabled = false
          scrollTimeout = null
        }, 50)
      }
    }

    const handleScroll = () => {
      // Additional check: if scroll stopped (no more scroll events), ensure snap is re-enabled
      if (isScrollSnapDisabled) {
        if (scrollTimeout) {
          clearTimeout(scrollTimeout)
        }

        scrollTimeout = window.setTimeout(() => {
          current.style.scrollSnapType = 'y mandatory'
          isScrollSnapDisabled = false
          scrollTimeout = null
        }, 50)
      }
    }

    current.addEventListener('wheel', handleWheel, { passive: true })
    current.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      current.removeEventListener('wheel', handleWheel)
      current.removeEventListener('scroll', handleScroll)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    }
  }, [scrollRef, isProgrammaticScrollRef])

  return (
    <ul ref={scrollRef} className={`scrollable ${styles.list}`} onScroll={onScroll}>
      {children}
    </ul>
  )
}
