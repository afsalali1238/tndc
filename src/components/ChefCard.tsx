// src/components/ChefCard.tsx
// ADAPTED FROM cr8 ArtistCard:
//   - cuisine_type instead of category
//   - area instead of location
//   - specialty added (new field, no cr8 equivalent)
//   - has_permit badge added (new, no cr8 equivalent)
//   - instagram REMOVED
//   - accepts_custom badge added

import Link from 'next/link'
import Image from 'next/image'
import WhatsAppButton from './WhatsAppButton'
import type { Chef } from '@/types'

interface ChefCardProps {
  chef: Chef
  selected?: boolean
  onClick?: () => void
}

export default function ChefCard({ chef, selected, onClick }: ChefCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-card border transition-all cursor-pointer
        hover:-translate-y-0.5 hover:shadow-card-hover
        ${selected
          ? 'border-saffron shadow-[0_0_0_3px_#FEF3DC]'
          : 'border-border hover:border-saffron/50'
        }
      `}
    >
      <div className="p-5">
        {/* Top row: avatar + name + badges */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-amber-bg flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl">
            {chef.photo_url ? (
              <Image
                src={chef.photo_url}
                alt={chef.name}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            ) : '👩‍🍳'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-body font-medium text-dark">{chef.name}</h3>
              {chef.has_permit && (
                <span className="text-[10px] font-medium text-verified bg-verified-bg px-1.5 py-0.5 rounded">
                  🏛 Licensed
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-0.5">
              {chef.cuisine_type} · 📍 {chef.area}
            </p>
          </div>
        </div>

        {/* Specialty — new in NextDoorChef */}
        {chef.specialty && (
          <p className="text-sm text-dark leading-relaxed mb-3 line-clamp-2">
            {chef.specialty}
          </p>
        )}

        {/* Custom orders badge */}
        {chef.accepts_custom && (
          <p className="text-xs text-muted mb-3">✏️ Accepts custom orders</p>
        )}

        {/* Footer: WhatsApp + profile link */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/chefs/${chef.id}`}
            onClick={e => e.stopPropagation()}
            className="text-sm text-muted hover:text-dark transition-colors"
          >
            View menu →
          </Link>
          <WhatsAppButton chef={chef} size="sm" />
        </div>
      </div>
    </div>
  )
}
