'use client'

import { useEffect, useState, useRef, useLayoutEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { motion, LayoutGroup, animate } from 'framer-motion'
import { useSelectedAct } from '@/contexts/SelectedActContext'

type Act = { id: string; name: string; photo?: { url: string } }

const PAGE_SIZE = 20
const GAP = 16
const MIN_ITEM_WIDTH = 170

export default function ActImageGrid() {
  const [acts, setActs] = useState<Act[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const { selectedActId, setSelectedActId } = useSelectedAct()

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const selectedActRef = useRef<HTMLDivElement | null>(null)
  const [selectedActPos, setSelectedActPos] = useState({ x: 0, y: 0 })

  // 1) Track mouse position globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // 2) A callback to measure the selectedAct element
  const updateSelectedActPos = useCallback(() => {
    if (selectedActRef.current) {
      const rect = selectedActRef.current.getBoundingClientRect()
      setSelectedActPos({ x: rect.left, y: rect.top })
    }
  }, [])

  // 3) Measure on resize
  useLayoutEffect(() => {
    updateSelectedActPos()
    window.addEventListener('resize', updateSelectedActPos)
    return () => window.removeEventListener('resize', updateSelectedActPos)
  }, [updateSelectedActPos])

  // 4) Measure on container scroll
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener('scroll', updateSelectedActPos)
    return () => container.removeEventListener('scroll', updateSelectedActPos)
  }, [updateSelectedActPos])

  // 5) — **NEW** — measure immediately after the selectedActId (or layout) changes
  useLayoutEffect(() => {
    updateSelectedActPos()
  }, [selectedActId, acts, containerWidth, updateSelectedActPos])

  // --- the rest of your data-fetching + grid logic unchanged ---

  // Fetch acts
  useEffect(() => {
    const controller = new AbortController()
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/acts?limit=${PAGE_SIZE}&page=${pageNum}&sort=name`,
          { signal: controller.signal },
        )
        if (!res.ok) throw new Error(res.statusText)
        const data = await res.json()
        setActs((prev) => [...prev, ...data.docs])
        setHasNextPage(data.hasNextPage)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setError((e as Error).message)
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    fetchData()
    return () => controller.abort()
  }, [pageNum])

  // Track container width
  useLayoutEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const { numColumns, cellSize } = useMemo(() => {
    if (containerWidth === 0) return { numColumns: 0, cellSize: 0 }
    const numCols = Math.max(1, Math.floor((containerWidth + GAP) / (MIN_ITEM_WIDTH + GAP)))
    const size = (containerWidth - GAP * (numCols - 1)) / numCols
    return { numColumns: numCols, cellSize: size }
  }, [containerWidth])

  const positions = useMemo(() => {
    if (numColumns === 0) return []
    const maxSpan = Math.min(3, numColumns)
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
  }, [acts, selectedActId, numColumns])

  const handleScroll = useCallback(() => {
    if (!containerRef.current || loading || !hasNextPage) return
    const { scrollTop, clientHeight, scrollHeight } = containerRef.current
    if (scrollTop + clientHeight >= scrollHeight - 300) {
      setPageNum((prev) => prev + 1)
    }
  }, [loading, hasNextPage])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    if (!selectedActId || !containerRef.current || cellSize === 0) return
    const index = acts.findIndex((a) => a.id === selectedActId)
    if (index === -1 || index >= positions.length) return

    const { y } = positions[index]
    const rowHeight = cellSize + GAP
    const itemTop = y * rowHeight

    animate(containerRef.current.scrollTop, itemTop, {
      type: 'spring',
      stiffness: 100,
      damping: 20,
      onUpdate: (value) => {
        containerRef.current!.scrollTop = value
      },
    })
  }, [selectedActId, acts, positions, cellSize])

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={containerRef}
        className="scrollable"
        style={{
          height: '100vh',
          padding: '24rem 0 8rem 0',
          marginTop: '-24rem',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <LayoutGroup>
          <div
            style={{
              display: 'grid',
              gridAutoRows: cellSize > 0 ? `${cellSize}px` : '0px',
              gap: `${GAP}px`,
            }}
          >
            {acts.map((act, i) => {
              const pos = positions[i]
              if (!pos) return null
              const isSelected = act.id === selectedActId

              return (
                <motion.div
                  key={act.id}
                  ref={isSelected ? selectedActRef : undefined}
                  layout
                  transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                  onClick={() => setSelectedActId(act.id)}
                  style={{
                    cursor: 'pointer',
                    gridColumnStart: pos.x + 1,
                    gridColumnEnd: `span ${pos.w}`,
                    gridRowStart: pos.y + 1,
                    gridRowEnd: `span ${pos.h}`,
                    position: 'relative',
                  }}
                >
                  <Image
                    src={act.photo?.url || '/placeholder.jpg'}
                    alt={act.name}
                    fill
                    sizes={`${Math.round(cellSize * pos.w)}px`}
                    style={{ objectFit: 'cover' }}
                  />
                </motion.div>
              )
            })}
          </div>
        </LayoutGroup>
      </div>

      {/* only render when there is a selected act */}
      {selectedActId && (
        <svg
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          <line
            x1={mousePos.x}
            y1={mousePos.y}
            x2={selectedActPos.x}
            y2={selectedActPos.y}
            stroke="red"
            strokeWidth={2}
          />
        </svg>
      )}

      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
    </div>
  )
}
