# Skill: WhatsApp Contact

> Read this file for any task involving the order button, contact button, or chef communication.
> This is the ONLY contact/order mechanism in Phase 1. There is no in-app messaging.

---

## The Pattern

All buyer-to-chef communication happens via WhatsApp deep links (`wa.me`).
No backend. No database writes. No message tracking. Pure URL.

```
https://wa.me/{phone}?text={pre-filled message}
```

- `{phone}` = UAE number in format `971XXXXXXXXX` (no `+`, no spaces)
- `{pre-filled message}` = URL-encoded string using `encodeURIComponent()`

---

## URL Builders

```typescript
// src/lib/utils.ts

// Buyer wants to order a specific dish
export function dishOrderUrl(chef: Chef, dish: Dish): string {
  const message = `Hello ${chef.name}! I found you on NextDoorChef and I'd like to order: *${dish.name}*. Is it available today?`
  return `https://wa.me/${chef.whatsapp}?text=${encodeURIComponent(message)}`
}

// Buyer wants to see today's menu (from chef card)
export function chefMenuUrl(chef: Chef): string {
  const message = `Hello ${chef.name}! I found you on NextDoorChef. Can you share today's menu and availability?`
  return `https://wa.me/${chef.whatsapp}?text=${encodeURIComponent(message)}`
}

// Buyer has a custom order request
export function customOrderUrl(chef: Chef): string {
  const message = `Hello ${chef.name}! I found you on NextDoorChef. I have a custom order request — are you able to help?`
  return `https://wa.me/${chef.whatsapp}?text=${encodeURIComponent(message)}`
}
```

---

## WhatsAppButton Component

```tsx
// src/components/WhatsAppButton.tsx
import { dishOrderUrl, chefMenuUrl } from '@/lib/utils'
import type { Chef, Dish } from '@/types'

const WA_ICON = (
  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.559 4.126 1.535 5.857L.057 23.571a.5.5 0 0 0 .614.614l5.714-1.478A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.956 9.956 0 0 1-5.071-1.384l-.361-.215-3.742.968.992-3.625-.236-.376A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
)

interface WhatsAppButtonProps {
  chef: Chef | null | undefined
  dish?: Dish
  size?: 'sm' | 'md'
  label?: string
}

export default function WhatsAppButton({
  chef,
  dish,
  size = 'md',
  label,
}: WhatsAppButtonProps) {
  if (!chef?.whatsapp) return null

  const url = dish ? dishOrderUrl(chef, dish) : chefMenuUrl(chef)
  const defaultLabel = dish ? 'Order' : 'Chat'

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1',
    md: 'px-4 py-2 text-sm gap-1.5',
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}  // prevent card click
      className={`
        inline-flex items-center font-medium rounded-lg
        bg-[#25D366] text-white hover:bg-[#1da852] transition-colors
        ${sizeClasses[size]}
      `}
    >
      {WA_ICON}
      {label ?? defaultLabel}
    </a>
  )
}
```

---

## Phone Number Validation

```typescript
// UAE phone number rules for /join form
export function validateUAEPhone(input: string): string | null {
  // Strip everything except digits
  const digits = input.replace(/\D/g, '')
  
  // Accept: 971XXXXXXXXX (12 digits) or 05XXXXXXXX (10 digits with leading 0)
  if (digits.startsWith('971') && digits.length === 12) {
    return digits  // already in correct format
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return `971${digits.slice(1)}`  // convert 0501234567 → 971501234567
  }
  if (digits.length === 9) {
    return `971${digits}`  // convert 501234567 → 971501234567
  }

  return null  // invalid — show error
}
```

---

## Onboarding Form Field

```tsx
// In ChefOnboardingForm.tsx — WhatsApp field with hint
<div>
  <label className="text-sm font-medium text-dark">WhatsApp Number *</label>
  <input
    type="tel"
    placeholder="e.g. 0501234567 or 971501234567"
    className="input-field mt-1"
    onChange={e => {
      const validated = validateUAEPhone(e.target.value)
      setWhatsapp(validated ?? '')
    }}
  />
  <p className="text-xs text-muted mt-1">
    Buyers will contact you directly on WhatsApp. UAE numbers only.
  </p>
</div>
```

---

## Notes for Future Phases

- **Phase 2:** Track order intent by logging WhatsApp button clicks to analytics (PostHog event)
- **Phase 2:** Generate short-link URLs with UTM params to attribute orders to NextDoorChef
- **Phase 3:** Replace with in-app ordering + Telr payment processing

**Do not build any of the above in Phase 1.**
