'use client'

import { useState, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
  // Split text while preserving whitespace (spaces and newlines)
  const tokens = text.split(/(\s+)/)
  const words = tokens.filter((token) => token.trim() !== '')
  const [displayedWordCount, setDisplayedWordCount] = useState(0)
  const [showLink, setShowLink] = useState(false)

  const delayPerWord = wordDelay !== undefined ? wordDelay : words.length > 0 ? animationDuration / words.length : 0

  useEffect(() => {
    if (words.length === 0) return

    const interval = setInterval(() => {
      setDisplayedWordCount((prev) => {
        if (prev >= words.length) {
          clearInterval(interval)
          return words.length
        }
        return prev + 1
      })
    }, delayPerWord * 1000)

    return () => clearInterval(interval)
  }, [words.length, delayPerWord])

  useEffect(() => {
    if (displayedWordCount >= words.length && linkElement) {
      const timeout = setTimeout(() => setShowLink(true), 100)
      return () => clearTimeout(timeout)
    }
  }, [displayedWordCount, words.length, linkElement])

  // Rebuild displayed tokens preserving original whitespace
  let wordIndex = 0
  const displayedTokens = tokens.map((token, i) => {
    if (token.trim() === '') {
      // Whitespace token - only show if the previous word has been displayed
      return wordIndex <= displayedWordCount ? token : null
    }
    wordIndex++
    if (wordIndex <= displayedWordCount) {
      return (
        <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
          {token}
        </motion.span>
      )
    }
    return null
  })

  return (
    <div className={className}>
      <p>{displayedTokens}</p>
      <AnimatePresence>
        {showLink && linkElement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ marginTop: '1em' }}
          >
            {linkElement}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
