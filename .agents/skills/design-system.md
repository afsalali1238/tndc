# Skill: Design System

> Read this file before building any UI component or page. These tokens are the source of truth.
> Never invent new colors or fonts. Never use Inter, Roboto, or Arial.

---

## Brand Identity

**Name:** NextDoorChef
**Tagline:** "Homemade Flavors Next Door"
**Essence:** Warm, authentic, neighbourhood — evokes home kitchens, spice markets, and the smell of food cooking next door
**NOT:** Delivery app aesthetic. Not sterile. Not corporate. Not Deliveroo or Talabat.

---

## Color Tokens

```css
/* globals.css — root variables */
:root {
  /* Backgrounds */
  --color-cream:       #FBF4E8;   /* page background — warm parchment */
  --color-cream-dark:  #EFE4CC;   /* secondary bg, chip backgrounds */
  --color-amber-bg:    #FEF3DC;   /* card highlights, dish image bg */
  --color-white:       #FFFFFF;   /* card surfaces */

  /* Brand */
  --color-saffron:     #E8960A;   /* primary — buttons, active states, stars */
  --color-terra:       #C4522A;   /* accent — hover states, price tags, CTAs */
  --color-dark:        #1A0F06;   /* text primary — deep warm brown */
  --color-muted:       #8C7860;   /* text secondary — captions, labels */

  /* Borders */
  --color-border:      #E2D5C3;   /* card borders, dividers */

  /* Semantic */
  --color-wa-green:    #25D366;   /* WhatsApp button — never change */
  --color-verified:    #0F6E56;   /* verified badge text */
  --color-verified-bg: #E1F5EE;   /* verified badge background */

  /* Typography */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body:    'DM Sans', system-ui, sans-serif;

  /* Spacing */
  --nav-height:   62px;
  --radius-card:  12px;
  --radius-input: 8px;
  --radius-chip:  50px;    /* pill shape */
  --radius-btn:   8px;
}
```

---

## Tailwind Config

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream:    '#FBF4E8',
        'cream-dark': '#EFE4CC',
        'amber-bg': '#FEF3DC',
        saffron:  '#E8960A',
        terra:    '#C4522A',
        dark:     '#1A0F06',
        muted:    '#8C7860',
        border:   '#E2D5C3',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card:  '12px',
        chip:  '50px',
      },
      height: {
        nav: '62px',
      },
    },
  },
  plugins: [],
}
export default config
```

---

## Typography Scale

| Usage | Class | Size | Weight | Font |
|---|---|---|---|---|
| Hero headline | `font-display text-5xl font-bold` | 48px+ | 700 | Playfair Display |
| Section title | `font-display text-3xl font-bold` | 30px | 700 | Playfair Display |
| Card title | `font-display text-xl font-semibold` | 20px | 600 | Playfair Display |
| Body text | `font-body text-base` | 15px | 400 | DM Sans |
| Caption / meta | `font-body text-sm text-muted` | 13px | 400 | DM Sans |
| Label / badge | `font-body text-xs uppercase tracking-wider` | 11px | 500 | DM Sans |
| Price | `font-body text-base font-semibold text-terra` | 16px | 600 | DM Sans |

---

## Component Patterns

### Chef Card
```tsx
<div className="bg-white rounded-card border border-border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
  <div className="flex items-center gap-3 mb-3">
    <div className="w-12 h-12 rounded-full bg-amber-bg flex items-center justify-center text-2xl">
      👩‍🍳
    </div>
    <div>
      <h3 className="font-body font-medium text-dark">{chef.name}</h3>
      <p className="text-xs text-muted">{chef.cuisine_type} · {chef.area}</p>
    </div>
  </div>
  <p className="text-sm text-dark leading-relaxed mb-3">{chef.specialty}</p>
  <WhatsAppButton chef={chef} />
</div>
```

### Dish Card
```tsx
<div className="bg-white rounded-card border border-border overflow-hidden hover:-translate-y-0.5 transition-transform">
  <div className="h-36 bg-amber-bg flex items-center justify-center text-5xl">
    {dish.emoji || '🍽️'}
  </div>
  <div className="p-4">
    <h3 className="font-body font-medium mb-1">{dish.name}</h3>
    <p className="text-xs text-muted mb-1">by {dish.chefs?.name} · {dish.chefs?.area}</p>
    <p className="text-xs text-muted leading-relaxed mb-3 line-clamp-2">{dish.description}</p>
    <div className="flex items-center justify-between">
      <span className="font-semibold text-terra">AED {dish.price_aed}</span>
      <WhatsAppButton chef={dish.chefs} dish={dish} size="sm" />
    </div>
  </div>
</div>
```

### Section Label (above headings)
```tsx
<p className="text-xs font-medium uppercase tracking-widest text-saffron mb-2">
  Today's picks
</p>
<h2 className="font-display text-3xl font-bold text-dark">
  Featured dishes
</h2>
```

### Filter Chip
```tsx
<button
  className={`px-4 py-2 rounded-chip text-sm whitespace-nowrap transition-all border
    ${active 
      ? 'bg-amber-bg border-saffron font-medium' 
      : 'bg-white border-border hover:border-saffron'
    }`}
>
  {label}
</button>
```

### Verified Badge
```tsx
<span className="text-xs font-medium text-verified bg-verified-bg px-2 py-0.5 rounded ml-1">
  ✓ Verified
</span>
```

### Permit Badge
```tsx
{chef.has_permit && (
  <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
    🏛 Licensed
  </span>
)}
```

---

## Framer Motion Patterns

```tsx
// Entrance animation for cards (staggered)
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
}

// Usage:
<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {chefs.map(chef => (
    <motion.div key={chef.id} variants={cardVariants}>
      <ChefCard chef={chef} />
    </motion.div>
  ))}
</motion.div>

// Hero entrance
<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Find the <em>home chef</em> next door
</motion.h1>
```

---

## Hero Section

```
Background: Deep warm brown gradient
  linear-gradient(160deg, #160c04 0%, #2d1a0a 42%, #4a2c12 100%)

Text: White headline, muted subtitle (rgba(255,255,255,0.6))
Headline font: Playfair Display italic for emphasis word
Accent: Saffron (#E8960A) for the italic/em word and label

Decorative elements: Radial gradient glows (saffron + terra) — see prototype
Search bar: White pill, shadow, saffron search button
```

---

## Do NOT Use

- ❌ `Inter`, `Roboto`, `Arial`, `system-ui` as primary fonts
- ❌ Purple gradients on white backgrounds
- ❌ Blue primary color
- ❌ Generic shadcn default theme (slate/zinc palette)
- ❌ Flat white backgrounds without warmth
- ❌ Any emoji other than 👩‍🍳 👨‍🍳 🍳 for chef contexts (keep consistent)
