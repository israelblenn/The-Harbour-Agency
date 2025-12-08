'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { motion, animate } from 'framer-motion'
import { useSelectedAct } from '@/contexts/SelectedActContext'
import Image from 'next/image'
import styles from '@/styles/ActGrid.module.css'
import Polygon from './ActGridPolygon'

const GAP = 16
const MIN_ITEM_WIDTH = 150
const SPAN = 3
const SPRING = {
  type: 'spring' as const,
  stiffness: 150,
  damping: 25,
}

interface ActGridProps {
  initialActs: Array<{ id: string; name: string; photo: { url: string } }>
}

export default function ActGrid({ initialActs }: ActGridProps) {
  const [containerWidth, setContainerWidth] = useState(0)
  const { selectedActId, setSelectedActId } = useSelectedAct()
  const containerRef = useRef<HTMLDivElement>(null)
  const acts = initialActs

  const { numColumns, cellSize } = useMemo(() => {
    if (containerWidth === 0) return { numColumns: 0, cellSize: 0 }
    const numCols = Math.max(1, Math.floor((containerWidth + GAP) / (MIN_ITEM_WIDTH + GAP)))
    const size = (containerWidth - GAP * (numCols - 1)) / numCols
    return { numColumns: numCols, cellSize: size }
  }, [containerWidth])

  const layoutReady = numColumns > 0 && cellSize > 0

  const { positions, containerHeight } = useMemo(() => {
    if (!layoutReady) return { positions: [], containerHeight: 0 }
    const maxSpan = Math.min(SPAN, numColumns)
    const positions: { x: number; y: number; width: number; height: number; gridY: number }[] = []
    const grid: boolean[][] = []

    const isOccupied = (x: number, y: number) => grid[y]?.[x] ?? false
    const occupy = (x: number, y: number) => {
      if (!grid[y]) grid[y] = []
      grid[y][x] = true
    }

    let maxGridRow = 0

    for (let i = 0; i < acts.length; i++) {
      const act = acts[i]
      const isSel = act.id === selectedActId
      const span = isSel ? maxSpan : 1
      let placed = false
      let row = 0

      while (!placed) {
        for (let col = 0; col <= numColumns - span; col++) {
          let free = true
          for (let dx = 0; dx < span; dx++) {
            for (let dy = 0; dy < span; dy++) {
              if (isOccupied(col + dx, row + dy)) {
                free = false
                break
              }
            }
            if (!free) break
          }
          if (!free) continue

          for (let dx = 0; dx < span; dx++) {
            for (let dy = 0; dy < span; dy++) {
              occupy(col + dx, row + dy)
            }
          }

          // Convert grid units to pixel positions
          const pixelX = col * (cellSize + GAP)
          const pixelY = row * (cellSize + GAP)
          const pixelWidth = span * cellSize + (span - 1) * GAP
          const pixelHeight = span * cellSize + (span - 1) * GAP

          positions.push({ x: pixelX, y: pixelY, width: pixelWidth, height: pixelHeight, gridY: row })

          // Track the furthest row extent for container height
          maxGridRow = Math.max(maxGridRow, row + span)
          placed = true
          break
        }
        if (!placed) row++
      }
    }

    // Calculate container height from max grid row
    const containerHeight = maxGridRow * (cellSize + GAP) - GAP

    return { positions, containerHeight }
  }, [acts, selectedActId, numColumns, cellSize, layoutReady])

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width))
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!selectedActId || !containerRef.current) return
    const container = containerRef.current
    const index = acts.findIndex((a) => a.id === selectedActId)
    if (index === -1 || index >= positions.length) return

    // Use the pixel y position directly
    const itemTop = positions[index].y

    const animation = animate(container.scrollTop, itemTop, {
      ...SPRING,
      onUpdate: (value) => {
        if (container) {
          container.scrollTop = value
        }
      },
    })

    const handleUserScroll = () => animation.stop()

    container.addEventListener('wheel', handleUserScroll, { passive: true })
    container.addEventListener('touchstart', handleUserScroll, { passive: true })

    return () => {
      animation.stop()
      container.removeEventListener('wheel', handleUserScroll)
      container.removeEventListener('touchstart', handleUserScroll)
    }
  }, [selectedActId, acts, positions])

  useEffect(() => {
    if (selectedActId === null && containerRef.current) {
      const container = containerRef.current
      const animation = animate(container.scrollTop, 0, {
        ...SPRING,
        onUpdate: (value) => {
          if (container) {
            container.scrollTop = value
          }
        },
      })

      const handleUserScroll = () => animation.stop()

      container.addEventListener('wheel', handleUserScroll, { passive: true })
      container.addEventListener('touchstart', handleUserScroll, { passive: true })

      return () => {
        animation.stop()
        container.removeEventListener('wheel', handleUserScroll)
        container.removeEventListener('touchstart', handleUserScroll)
      }
    }
  }, [selectedActId])

  return (
    <div>
      <Polygon selectedActId={selectedActId} containerRef={containerRef} acts={acts} positions={positions} />

      <div ref={containerRef} className={`scrollable ${styles.container}`}>
        {layoutReady && (
          <div style={{ position: 'relative', height: containerHeight }}>
            {acts.map((act, i) => {
              const pos = positions[i]
              if (!pos) return null

              const isSelected = act.id === selectedActId

              return (
                <motion.div
                  key={act.id}
                  onClick={() => setSelectedActId(act.id)}
                  initial={false}
                  animate={{
                    x: pos.x,
                    y: pos.y,
                    width: pos.width,
                    height: pos.height,
                  }}
                  transition={SPRING}
                  className={styles.cell}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                  data-selected={isSelected}
                >
                  <Image src={act.photo.url} alt={act.name} fill sizes={`${Math.round(pos.width)}px`} loading="lazy" />
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
