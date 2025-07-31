'use client'

import styles from '@/styles/Header.module.css'
import { useState } from 'react'
import TransitionLink from '@/components/TransitionLink'
import Marquee from './Marquee'

export default function VaultRibbon() {
  const [speed, setSpeed] = useState(30)

  const handleMouseEnter = () => setSpeed(-100)
  const handleMouseLeave = () => setSpeed(30)

  return (
    <>
      <TransitionLink href="/vault" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Marquee repeat={4} speed={speed} className={styles.wrapper}>
          <span>Explore the Vault -&gt;</span>
        </Marquee>
      </TransitionLink>
    </>
  )
}
