'use client'

import { useState, useEffect } from 'react'
import { motion, useMotionValue, animate, useSpring } from 'framer-motion'
import { interpolate } from 'flubber'

export default function Ribbon() {
  const [isExpanded, setIsExpanded] = useState(false)
  const progress = useMotionValue(0)
  const d = useMotionValue('')

  const ribbonPath = 'M110 67.57 L42.43 0 L0 0 L110 110 Z'
  const circlePath = 'M55,0 A55,55 0 1,1 54.999,0 Z'

  const scale = useSpring(1, { stiffness: 100, damping: 20 })

  const handleClick = () => {
    if (!isExpanded) {
      const interpolator = interpolate(ribbonPath, circlePath, { maxSegmentLength: 2 })
      animate(progress, 1, {
        duration: 0.6,
        onUpdate: (latest) => {
          d.set(interpolator(latest))
        },
        onComplete: () => {
          d.set(circlePath)
        },
      })

      const vw = window.innerWidth
      const vh = window.innerHeight
      const r = Math.sqrt((vw - 55) ** 2 + (vh - 55) ** 2)
      scale.set(r / 55)
    } else {
      const interpolator = interpolate(circlePath, ribbonPath, { maxSegmentLength: 2 })
      animate(progress, 0, {
        duration: 0.6,
        onUpdate: (latest) => {
          d.set(interpolator(1 - latest))
        },
        onComplete: () => {
          d.set(ribbonPath)
        },
      })
      scale.set(1)
    }

    setIsExpanded(!isExpanded)
  }

  useEffect(() => {
    d.set(ribbonPath)
  }, [])

  return (
    <motion.svg
      viewBox="0 0 110 110"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 110,
        height: 110,
        zIndex: 2,
        cursor: 'pointer',
        transformOrigin: 'center center',
        scale,
      }}
      onClick={handleClick}
    >
      <motion.path fill="var(--tertiary)" d={d} />
    </motion.svg>
  )
}
