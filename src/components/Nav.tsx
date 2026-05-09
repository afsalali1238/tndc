// src/components/Nav.tsx
// ADAPTED FROM cr8: same sticky nav pattern, different links
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/',        label: 'Home' },
  { href: '/dishes',  label: 'Browse dishes' },
  { href: '/chefs',   label: 'Find chefs' },
  { href: '/map',     label: 'Map' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-[2000] h-nav bg-white border-b border-border flex items-center px-8 gap-0">
      {/* Logo */}
      <Link href="/" className="font-display text-xl font-bold mr-8 tracking-tight">
        NextDoor<span className="text-saffron">Chef</span>
      </Link>

      {/* Links */}
      <div className="flex gap-1">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'px-4 py-2 text-sm rounded-lg transition-all',
              pathname === href
                ? 'bg-cream-dark text-dark font-medium'
                : 'text-muted hover:text-dark hover:bg-cream-dark'
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm text-muted hidden sm:block">📍 Dubai, UAE</span>
        <Link
          href="/join"
          className="bg-terra text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          List your kitchen
        </Link>
      </div>
    </nav>
  )
}
