'use client'

import { useAnimationFrame, useMotionValue, useSpring } from 'framer-motion'
import { useRef, Fragment, useEffect, CSSProperties } from 'react'

interface MarqueeProps {
  children: React.ReactNode
  repeat: number
  speed: number
  className?: string
}

export default function Marquee({ children, repeat, speed, className }: MarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null)
  const rawVelocity = useMotionValue(-speed)
  const smoothVelocity = useSpring(rawVelocity, { damping: 50, stiffness: 50 })
  const pos = useRef(0)

  useEffect(() => {
    rawVelocity.set(-speed)
  }, [speed, rawVelocity])

  useAnimationFrame((t, delta) => {
    if (marqueeRef.current) {
      const currentVelocity = smoothVelocity.get()
      pos.current += (currentVelocity * delta) / 1000

      const contentWidth = marqueeRef.current.scrollWidth / repeat
      if (pos.current <= -contentWidth) pos.current += contentWidth
      if (pos.current >= 0) pos.current -= contentWidth

      marqueeRef.current.style.translate = `${pos.current}px 0`
    }
  })

  const styles: CSSProperties = {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    paddingLeft: '1rem',
    gap: '1rem',
    width: 'max-content',
    willChange: 'transform',
  }

  return (
    <div className={className || ''}>
      <div style={styles} ref={marqueeRef}>
        {[...Array(repeat)].flatMap((_, index) => (
          <Fragment key={index}>{children}</Fragment>
        ))}
      </div>
    </div>
  )
}
