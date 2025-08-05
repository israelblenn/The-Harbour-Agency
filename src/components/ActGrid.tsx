'use client'

import { useEffect, useState, useRef, useLayoutEffect, useMemo } from 'react'
import { motion, LayoutGroup, animate } from 'framer-motion'
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

  const positions = useMemo(() => {
    if (!layoutReady) return []
    const maxSpan = Math.min(SPAN, numColumns)
    const positions: { x: number; y: number; w: number; h: number }[] = []
    const grid: boolean[][] = []

    const isOccupied = (x: number, y: number) => grid[y]?.[x] ?? false
    const occupy = (x: number, y: number) => {
      if (!grid[y]) grid[y] = []
      grid[y][x] = true
    }

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

          positions.push({ x: col, y: row, w: span, h: span })
          placed = true
          break
        }
        if (!placed) row++
      }
    }

    return positions
  }, [acts, selectedActId, numColumns, layoutReady])

  useLayoutEffect(() => {
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

    const { y } = positions[index]
    const rowHeight = cellSize + GAP
    const itemTop = y * rowHeight

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
  }, [selectedActId, acts, positions, cellSize])

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
        <LayoutGroup>
          {layoutReady && (
            <div style={{ display: 'grid', gridAutoRows: cellSize, gap: GAP }}>
              {acts.map((act, i) => {
                const pos = positions[i]
                if (!pos) return null

                const isSelected = act.id === selectedActId

                return (
                  <motion.div
                    key={act.id}
                    onClick={() => setSelectedActId(act.id)}
                    transition={SPRING}
                    layout
                    className={styles.cell}
                    style={{
                      gridColumnStart: pos.x + 1,
                      gridColumnEnd: `span ${pos.w}`,
                      gridRowStart: pos.y + 1,
                      gridRowEnd: `span ${pos.h}`,
                      position: 'relative',
                    }}
                    data-selected={isSelected}
                  >
                    <Image
                      src={act.photo.url}
                      alt={act.name}
                      fill
                      sizes={`${Math.round(cellSize * pos.w)}px`}
                      loading="lazy"
                    />
                  </motion.div>
                )
              })}
            </div>
          )}
        </LayoutGroup>
      </div>
    </div>
  )
}
