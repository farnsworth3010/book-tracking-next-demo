import type { ComponentProps } from 'react'
import { mockRouter } from './next-navigation'

type LinkProps = Omit<ComponentProps<'a'>, 'href'> & { href: string }

// next/link needs the Next.js app router at runtime; in tests it is an anchor that routes through the mock
export default function Link({ href, onClick, ...props }: LinkProps) {
  return (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event)
        event.preventDefault()
        mockRouter.push(href)
      }}
    />
  )
}
