// src/app/layout.tsx
// Root layout — ADAPTED FROM cr8: same font setup, NextDoorChef brand

import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'NextDoorChef — Homemade Food in Dubai',
    template: '%s | NextDoorChef',
  },
  description:
    'Discover authentic home chefs near you in Dubai. Find real homemade food from talented cooks across the UAE.',
  keywords: ['home chef Dubai', 'homemade food UAE', 'authentic cuisine Dubai', 'home cook near me'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nextdoorchef.com'),
  openGraph: {
    siteName: 'NextDoorChef',
    type: 'website',
    locale: 'en_AE',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-body bg-cream text-dark">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
