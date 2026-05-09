// src/components/CuisineFilter.tsx
// ADAPTED FROM cr8 CategoryFilter — same URL-param pattern, different options
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CUISINES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface CuisineFilterProps {
  selected?: string
  paramKey?: string
}

export default function CuisineFilter({ selected = 'All', paramKey = 'cuisine' }: CuisineFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSelect = (name: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (name === 'All') params.delete(paramKey)
    else params.set(paramKey, name)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
      {CUISINES.map(c => (
        <button
          key={c.slug}
          onClick={() => handleSelect(c.name)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-chip border text-sm whitespace-nowrap transition-all flex-shrink-0',
            (selected === c.name || (selected === 'All' && c.name === 'All'))
              ? 'bg-amber-bg border-saffron font-medium text-dark'
              : 'bg-white border-border text-muted hover:border-saffron hover:text-dark'
          )}
        >
          <span>{c.emoji}</span>
          {c.name}
        </button>
      ))}
    </div>
  )
}
