'use client'

import Link from 'next/link'
import { useTransitionRouter } from 'next-view-transitions'
import { AnchorHTMLAttributes, ReactNode } from 'react'

const pageAnimation = (x = window.innerWidth / 2, y = window.innerHeight / 2) => {
  document.documentElement.animate(
    [
      {
        clipPath: `circle(0% at ${x}px ${y}px)`,
      },
      {
        clipPath: `circle(150% at ${x}px ${y}px)`,
      },
    ],
    {
      duration: 1000,
      easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
      fill: 'forwards',
      pseudoElement: '::view-transition-new(root)',
    },
  )
}

interface TransitionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: ReactNode
}

export default function TransitionLink({ href, children, onClick, ...props }: TransitionLinkProps) {
  const router = useTransitionRouter()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const x = e.clientX
    const y = e.clientY
    router.push(href, {
      onTransitionReady: () => pageAnimation(x, y),
    })
    if (onClick) onClick(e)
  }

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
