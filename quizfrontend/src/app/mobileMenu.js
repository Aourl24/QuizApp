'use client'
import { useState } from 'react'
import Link from 'next/link'

/**
 * MobileMenu — client component
 * Renders the hamburger button + slide-down nav on mobile.
 * Hidden on md+ screens (desktop nav in layout.js handles that).
 *
 * Place this file at: src/app/MobileMenu.js
 */
export default function MobileMenu({ links }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">

      {/* Hamburger button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-label="Toggle menu"
        className="flex flex-col justify-center items-center w-9 h-9 gap-[5px] bg-transparent border-none cursor-pointer group"
      >
        <span className={`block h-[2px] w-5 bg-txt rounded-full transition-all duration-300 ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
        <span className={`block h-[2px] w-5 bg-txt rounded-full transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
        <span className={`block h-[2px] w-5 bg-txt rounded-full transition-all duration-300 ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute top-[60px] left-0 right-0 bg-bg border-b border-border px-5 py-4 flex flex-col gap-1 z-[99]">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-txt text-base font-medium no-underline py-3 px-3 rounded-lg hover:bg-surface hover:text-accent transition-all"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/account/signup"
            onClick={() => setOpen(false)}
            className="mt-2 text-center no-underline bg-accent text-bg font-bold text-sm py-3 px-4 rounded-lg transition-opacity hover:opacity-85"
          >
            Sign Up
          </Link>
        </div>
      )}

    </div>
  )
}
