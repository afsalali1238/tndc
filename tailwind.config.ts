import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream:       '#FBF4E8',
        'cream-dark':'#EFE4CC',
        'amber-bg':  '#FEF3DC',
        saffron:     '#E8960A',
        terra:       '#C4522A',
        dark:        '#1A0F06',
        muted:       '#8C7860',
        border:      '#E2D5C3',
        'wa-green':  '#25D366',
        verified:    '#0F6E56',
        'verified-bg':'#E1F5EE',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        chip: '50px',
      },
      height: {
        nav: '62px',
      },
      spacing: {
        nav: '62px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(26,15,6,.07), 0 6px 20px rgba(26,15,6,.06)',
        'card-hover': '0 4px 12px rgba(26,15,6,.10), 0 12px 32px rgba(26,15,6,.08)',
      },
    },
  },
  plugins: [],
}

export default config
