'use client'

import styles from '@/styles/Header.module.css'
import { useAnimationFrame, useMotionValue, useSpring } from 'framer-motion'
import { useRef } from 'react'
import TransitionLink from '@/components/TransitionLink'

export default function VaultRibbon() {
  const marqueeRef = useRef<HTMLDivElement>(null)
  const baseSpeed = 30
  const fastSpeed = 100
  const rawVelocity = useMotionValue(-baseSpeed)
  const smoothVelocity = useSpring(rawVelocity, { damping: 50, stiffness: 50 })
  const pos = useRef(0)

  const handleMouseEnter = () => rawVelocity.set(fastSpeed)
  const handleMouseLeave = () => rawVelocity.set(-baseSpeed)

  useAnimationFrame((t, delta) => {
    if (marqueeRef.current) {
      const currentVelocity = smoothVelocity.get()
      pos.current += (currentVelocity * delta) / 1000

      const contentWidth = marqueeRef.current.scrollWidth / 3
      if (pos.current <= -contentWidth) pos.current += contentWidth
      if (pos.current >= 0) pos.current -= contentWidth

      marqueeRef.current.style.translate = `${pos.current}px 0`
    }
  })

  return (
    <>
      <TransitionLink
        href="/vault"
        className={styles.wrapper}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.marqueeTextTrack} ref={marqueeRef}>
          {[...Array(3)].flatMap(() => [
            <span key={Math.random()}>Explore the Vault</span>,
            <span key={Math.random()} aria-hidden="true">
              -&gt;
            </span>,
          ])}
        </div>
      </TransitionLink>
    </>
  )
}
