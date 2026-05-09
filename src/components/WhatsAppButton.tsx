// src/components/WhatsAppButton.tsx
// ADAPTED FROM cr8: same pattern — pure wa.me deep link, no backend
// See .agents/skills/whatsapp-contact.md for full docs

import { dishOrderUrl, chefMenuUrl } from '@/lib/utils'
import type { Chef, Dish } from '@/types'

const WA_ICON = (size = 14) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.559 4.126 1.535 5.857L.057 23.571a.5.5 0 0 0 .614.614l5.714-1.478A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.956 9.956 0 0 1-5.071-1.384l-.361-.215-3.742.968.992-3.625-.236-.376A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
)

interface WhatsAppButtonProps {
  chef: Chef | null | undefined
  dish?: Dish
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const SIZE = {
  sm: { px: 'px-3 py-1.5', text: 'text-xs', icon: 12 },
  md: { px: 'px-4 py-2',   text: 'text-sm', icon: 14 },
  lg: { px: 'px-5 py-2.5', text: 'text-sm', icon: 15 },
}

export default function WhatsAppButton({
  chef,
  dish,
  size = 'md',
  label,
  className = '',
}: WhatsAppButtonProps) {
  if (!chef?.whatsapp) return null

  const url = dish ? dishOrderUrl(chef, dish) : chefMenuUrl(chef)
  const defaultLabel = dish ? 'Order' : 'Chat on WhatsApp'
  const s = SIZE[size]

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()} // prevent card click-through
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg bg-wa-green text-white hover:opacity-90 transition-opacity ${s.px} ${s.text} ${className}`}
    >
      {WA_ICON(s.icon)}
      {label ?? defaultLabel}
    </a>
  )
}
