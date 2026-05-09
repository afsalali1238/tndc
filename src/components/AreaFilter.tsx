// src/components/AreaFilter.tsx
// NEW — no cr8 equivalent (cr8 had state/city text input, not a chip filter)
// Dubai neighbourhood chip filter
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { DUBAI_AREAS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface AreaFilterProps {
  selected?: string
}

export default function AreaFilter({ selected = 'All' }: AreaFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSelect = (name: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (name === 'All') params.delete('area')
    else params.set('area', name)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
      <button
        onClick={() => handleSelect('All')}
        className={cn(
          'px-3 py-1.5 rounded-chip border text-sm whitespace-nowrap transition-all flex-shrink-0',
          selected === 'All'
            ? 'bg-amber-bg border-saffron font-medium text-dark'
            : 'bg-white border-border text-muted hover:border-saffron hover:text-dark'
        )}
      >
        All areas
      </button>
      {DUBAI_AREAS.map(area => (
        <button
          key={area.name}
          onClick={() => handleSelect(area.name)}
          className={cn(
            'px-3 py-1.5 rounded-chip border text-sm whitespace-nowrap transition-all flex-shrink-0',
            selected === area.name
              ? 'bg-amber-bg border-saffron font-medium text-dark'
              : 'bg-white border-border text-muted hover:border-saffron hover:text-dark'
          )}
        >
          📍 {area.name}
        </button>
      ))}
    </div>
  )
}
