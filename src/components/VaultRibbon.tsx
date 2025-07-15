'use client'

import Link from 'next/link'
import styles from '@/styles/Header.module.css'
import { useAnimationFrame, useMotionValue, useSpring } from 'framer-motion'
import { useRef } from 'react'
import { useTransitionRouter } from 'next-view-transitions'

const pageAnimation = () => {
  document.documentElement.animate(
    [
      {
        clipPath: 'circle(0% at calc(100% - 55px) 55px)',
      },
      {
        clipPath: 'circle(150% at calc(100% - 55px) 55px)',
      },
    ],
    {
      duration: 1000,
      easing: 'ease-in-out',
      fill: 'forwards',
      pseudoElement: '::view-transition-new(root)',
    },
  )
}

export default function VaultRibbon() {
  const marqueeRef = useRef<HTMLDivElement>(null)
  const baseSpeed = 30
  const fastSpeed = 100
  const rawVelocity = useMotionValue(-baseSpeed)
  const smoothVelocity = useSpring(rawVelocity, { damping: 50, stiffness: 50 })
  const pos = useRef(0)
  const router = useTransitionRouter()

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
      <Link
        href="/vault"
        className={styles.wrapper}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          e.preventDefault()
          router.push('/vault', {
            onTransitionReady: pageAnimation,
          })
        }}
      >
        <div className={styles.marqueeTextTrack} ref={marqueeRef}>
          {[...Array(3)].flatMap(() => [
            <span key={Math.random()}>Explore the Vault</span>,
            <span key={Math.random()} aria-hidden="true">
              -&gt;
            </span>,
          ])}
        </div>
      </Link>
    </>
  )
}
