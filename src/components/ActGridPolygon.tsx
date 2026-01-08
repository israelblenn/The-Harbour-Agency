'use client'

import { motion, useMotionValue } from 'framer-motion'
import { useLayoutEffect } from 'react'
import styles from '@/styles/ActGrid.module.css'

type PolygonProps = {
  selectedActId: string | null
  containerRef: React.RefObject<HTMLDivElement | null>
  acts: Array<{ id: string }>
  positions: Array<{ x: number; y: number; width: number; height: number; gridY: number }>
}

// Fixed anchor position
const X = 320
const T = 228
const B = 252

const lightness = 0

export default function Polygon({ selectedActId, containerRef, acts, positions }: PolygonProps) {
  const polygonLeft = useMotionValue('')
  const polygonTop = useMotionValue('')
  const polygonBottom = useMotionValue('')

  useLayoutEffect(() => {
    // Don't set up polygon for null or e-live (not a real act in the grid)
    if (!selectedActId || selectedActId === 'e-live') {
      polygonLeft.set('')
      polygonTop.set('')
      polygonBottom.set('')
      return
    }

    const updatePosition = () => {
      const selectedCell = containerRef.current?.querySelector('[data-selected="true"]')
      if (!selectedCell) return
      const C = selectedCell.getBoundingClientRect()

      polygonLeft.set(`${X},${T} ${X},${B} ${C.left},${C.bottom} ${C.left},${C.top}`)
      polygonTop.set(`${X},${T} ${C.left},${C.top} ${C.right},${C.top} ${C.right},${C.bottom} ${X},${B}`)
      polygonBottom.set(`${X},${B} ${C.left},${C.bottom} ${C.right},${C.bottom} ${C.right},${C.top} ${X},${T}`)
    }

    updatePosition()

    window.addEventListener('resize', updatePosition)
    const container = containerRef.current
    container?.addEventListener('scroll', updatePosition)

    const observer = new MutationObserver(updatePosition)
    if (container) {
      observer.observe(container, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      })
    }

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updatePosition)
      container?.removeEventListener('scroll', updatePosition)
    }
  }, [selectedActId, acts, positions, polygonLeft, polygonTop, polygonBottom, containerRef])

  // Hide polygon when no act selected or on e-live page (not a real act in the grid)
  if (!selectedActId || selectedActId === 'e-live') return null

  return (
    <svg className={styles.polygon}>
      <motion.polygon points={polygonTop} fill={`hsl(0, 0%, ${lightness}%)`} />
      <motion.polygon points={polygonBottom} fill={`hsl(0, 0%, ${lightness}%)`} />
      <motion.polygon points={polygonLeft} fill="var(--secondary)" />
    </svg>
  )
}
