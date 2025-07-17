'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import styles from '@/styles/Header.module.css'
import TransitionLink from '@/components/TransitionLink'

interface HeaderProps {
  brandingData: { logoUrl: string | null }
}

export default function Header({ brandingData }: HeaderProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(brandingData?.logoUrl || null)
  const [highlight, setHighlight] = useState({
    left: 0,
    width: 0,
    visible: false,
  })
  const [isPressed, setIsPressed] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [prevPathname, setPrevPathname] = useState<string | null>(null)

  const navRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== prevPathname) setPrevPathname(pathname)
  }, [pathname, prevPathname])

  const navLinks = [
    { href: '/', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]
  const isNavPath = navLinks.some((l) => l.href === pathname)
  useEffect(() => {
    if (!isNavPath) {
      setHighlight({ left: 0, width: 0, visible: false })
      return
    }
    const active = navRef.current?.querySelector(`[data-path='${pathname}']`) as HTMLElement
    if (active) {
      const aRect = active.getBoundingClientRect()
      const navRect = navRef.current!.getBoundingClientRect()
      setHighlight({
        left: aRect.left - navRect.left,
        width: aRect.width,
        visible: true,
      })
    }
  }, [pathname, isNavPath])

  const onEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const nr = navRef.current!.getBoundingClientRect()
    setHighlight({
      left: r.left - nr.left,
      width: r.width,
      visible: true,
    })
  }

  const onLeave = () => {
    if (!isNavPath) {
      setHighlight({ left: 0, width: 0, visible: false })
    } else {
      const active = navRef.current?.querySelector(`[data-path='${pathname}']`) as HTMLElement
      if (active) {
        const aRect = active.getBoundingClientRect()
        const navRect = navRef.current!.getBoundingClientRect()
        setHighlight({
          left: aRect.left - navRect.left,
          width: aRect.width,
          visible: true,
        })
      }
    }
  }

  const onMouseDown = () => {
    setIsPressed(true)
  }

  const onMouseUp = () => {
    setIsPressed(false)
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const TransLink = prevPathname === '/vault' ? TransitionLink : Link

  return (
    <header className={`${scrolled ? 'shrunk' : ''}`}>
      <nav>
        <TransLink href="/" style={{ height: '100%' }}>
          {logoUrl && (
            <Image priority src={logoUrl} alt="The Harbour Agency Logo" width={0} height={0} className={styles.logo} />
          )}
        </TransLink>

        <div className={styles.navLinks} ref={navRef} onMouseLeave={onLeave}>
          <AnimatePresence>
            {highlight.visible && (
              <motion.div
                className={styles.highlight}
                layout
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  scale: isPressed ? 0.9 : 1,
                }}
                exit={{ opacity: 0 }}
                style={{
                  left: highlight.left,
                  width: highlight.width,
                }}
                transition={{
                  layout: { type: 'spring', mass: 1, damping: 40, stiffness: 500 },
                  opacity: { duration: 0.15 },
                  scale: { type: 'spring', stiffness: 500, damping: 20 },
                }}
              />
            )}
          </AnimatePresence>

          {navLinks.map((link) => {
            return (
              <TransLink
                key={link.href}
                href={link.href}
                data-path={link.href}
                onMouseEnter={onEnter}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
              >
                {link.label}
              </TransLink>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
