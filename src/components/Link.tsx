import type { MouseEvent, ReactNode } from 'react'
import { navigate } from '../router'

interface Props {
  to: string
  children: ReactNode
  className?: string
  title?: string
}

export function Link({ to, children, className, title }: Props) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return
    }
    e.preventDefault()
    navigate(to)
  }
  return (
    <a href={to} onClick={handleClick} className={className} title={title}>
      {children}
    </a>
  )
}
