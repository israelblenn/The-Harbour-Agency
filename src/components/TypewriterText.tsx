'use client'

import { useState, useEffect, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface TypewriterTextProps {
  text: string
  className?: string
  animationDuration?: number
  wordDelay?: number
  linkElement?: ReactNode
}

export default function TypewriterText({
  text,
  className,
  animationDuration = 0.2,
  wordDelay,
  linkElement,
}: TypewriterTextProps) {
  const words = text.split(' ')
  const totalItems = words.length + (linkElement ? 1 : 0)
  const [displayedItemCount, setDisplayedItemCount] = useState(0)
  const delayPerItem = wordDelay !== undefined ? wordDelay : totalItems > 0 ? animationDuration / totalItems : 0

  useEffect(() => {
    if (totalItems === 0) return
    let currentItemIndex = 0

    const interval = setInterval(() => {
      setDisplayedItemCount((prevCount) => {
        currentItemIndex = prevCount + 1
        if (currentItemIndex >= totalItems) {
          clearInterval(interval)
          return totalItems
        }
        return currentItemIndex
      })
    }, delayPerItem * 1000)

    return () => clearInterval(interval)
  }, [totalItems, delayPerItem])

  return (
    <div className={className}>
      {words.slice(0, displayedItemCount).map((word, index) => (
        <motion.span
          key={`word-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      ))}

      {linkElement && displayedItemCount > words.length && (
        <motion.div
          key="link-element"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'block', marginTop: '1em' }}
        >
          {linkElement}
        </motion.div>
      )}
    </div>
  )
}
