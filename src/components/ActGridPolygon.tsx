'use client'

import { motion, useMotionValue, useSpring, useMotionTemplate, animate } from 'framer-motion'
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
  const cLeft = useMotionValue(X)
  const cTop = useMotionValue(T)
  const cRight = useMotionValue(X)
  const cBottom = useMotionValue(B)

  const mLeftX = useMotionValue(X)
  const mRightX = useMotionValue(X)
  const mTopY = useMotionValue(T)
  const mBottomY = useMotionValue(B)

  const springConfig = { damping: 22, stiffness: 250, mass: 0.5 }

  const midLeftX = useSpring(mLeftX, springConfig)
  const midRightX = useSpring(mRightX, springConfig)
  const midTopY = useSpring(mTopY, springConfig)
  const midBottomY = useSpring(mBottomY, springConfig)

  const pathLeft = useMotionTemplate`
    M ${X},${T} 
    L ${X},${B} 
    C ${midLeftX},${B} ${midLeftX},${midBottomY} ${cLeft},${cBottom} 
    L ${cLeft},${cTop} 
    C ${midLeftX},${midTopY} ${midLeftX},${T} ${X},${T} 
    Z
  `

  const pathTop = useMotionTemplate`
    M ${X},${T} 
    C ${midLeftX},${T} ${midLeftX},${midTopY} ${cLeft},${cTop} 
    L ${cRight},${cTop} 
    L ${cRight},${cBottom} 
    C ${midRightX},${midBottomY} ${midRightX},${B} ${X},${B} 
    Z
  `

  const pathBottom = useMotionTemplate`
    M ${X},${B} 
    C ${midLeftX},${B} ${midLeftX},${midBottomY} ${cLeft},${cBottom} 
    L ${cRight},${cBottom} 
    L ${cRight},${cTop} 
    C ${midRightX},${midTopY} ${midRightX},${T} ${X},${T} 
    Z
  `

  useLayoutEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7537/ingest/29cc7403-aac1-4fdb-a3b3-c8158a4c3e0f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e72563'},body:JSON.stringify({sessionId:'e72563',hypothesisId:'A,C,D',location:'ActGridPolygon.tsx:67',message:'effect entry',data:{selectedActId,branch:(!selectedActId||selectedActId==='e-live')?'retract':'expand',curCLeft:cLeft.get(),curCTop:cTop.get(),curCRight:cRight.get(),curCBottom:cBottom.get()},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    // Retract polygon when no act selected or on e-live page
    if (!selectedActId || selectedActId === 'e-live') {
      animate(cLeft, X, springConfig)
      animate(cTop, T, springConfig)
      animate(cRight, X, springConfig)
      animate(cBottom, B, springConfig)

      mLeftX.set(X)
      mRightX.set(X)
      mTopY.set(T)
      mBottomY.set(B)
      
      return
    }

    const updatePosition = () => {
      const selectedCell = containerRef.current?.querySelector('[data-selected="true"]')
      if (!selectedCell) {
        // #region agent log
        fetch('http://127.0.0.1:7537/ingest/29cc7403-aac1-4fdb-a3b3-c8158a4c3e0f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e72563'},body:JSON.stringify({sessionId:'e72563',hypothesisId:'A',location:'ActGridPolygon.tsx:84',message:'updatePosition: no selected cell',data:{selectedActId},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        return
      }
      const C = selectedCell.getBoundingClientRect()
      // #region agent log
      fetch('http://127.0.0.1:7537/ingest/29cc7403-aac1-4fdb-a3b3-c8158a4c3e0f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e72563'},body:JSON.stringify({sessionId:'e72563',hypothesisId:'A,B',location:'ActGridPolygon.tsx:86',message:'updatePosition: cell rect',data:{left:Math.round(C.left),top:Math.round(C.top),right:Math.round(C.right),bottom:Math.round(C.bottom),width:Math.round(C.width),height:Math.round(C.height),spanX:Math.round(C.right-X),spanY:Math.round(C.bottom-C.top)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      cLeft.set(C.left)
      cTop.set(C.top)
      cRight.set(C.right)
      cBottom.set(C.bottom)

      mLeftX.set((X + C.left) / 2)
      mRightX.set((X + C.right) / 2)
      mTopY.set((T + C.top) / 2)
      mBottomY.set((B + C.bottom) / 2)
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
  }, [selectedActId, acts, positions, containerRef, cLeft, cTop, cRight, cBottom, mLeftX, mRightX, mTopY, mBottomY, springConfig])

  return (
    <svg className={styles.polygon}>
      <motion.path d={pathTop} fill={`hsl(0, 0%, ${lightness}%)`} />
      <motion.path d={pathBottom} fill={`hsl(0, 0%, ${lightness}%)`} />
      <motion.path d={pathLeft} fill="var(--secondary)" />
    </svg>
  )
}
