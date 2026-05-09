// src/components/Footer.tsx
// ADAPTED FROM cr8: same structure, NextDoorChef brand

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-dark text-white/40 text-sm">
      <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <p className="font-display text-white font-bold text-lg mb-2">
            NextDoor<span className="text-saffron">Chef</span>
          </p>
          <p className="leading-relaxed text-white/50">
            Bringing homemade flavors to your doorstep. Find the home chef next door.
          </p>
        </div>

        {/* Links */}
        <div>
          <p className="text-white/70 font-medium mb-3">Explore</p>
          <div className="flex flex-col gap-2">
            <Link href="/dishes" className="hover:text-white transition-colors">Browse dishes</Link>
            <Link href="/chefs"  className="hover:text-white transition-colors">Find chefs</Link>
            <Link href="/map"    className="hover:text-white transition-colors">Map view</Link>
            <Link href="/join"   className="hover:text-white transition-colors">List your kitchen</Link>
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-white/70 font-medium mb-3">About</p>
          <div className="flex flex-col gap-2">
            <span>Dubai, UAE 🇦🇪</span>
            <span>Serving all of Dubai</span>
            <span className="text-white/30 text-xs mt-2">
              © {new Date().getFullYear()} NextDoorChef. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
