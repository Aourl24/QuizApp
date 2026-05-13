import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import MobileMenu from './mobileMenu.js'
import {AppProvider} from "./appContext.js"

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-head',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata = {
  title: 'Quizzify',
  description: 'Challenge your mind and test your skills',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="bg-bg text-txt font-body min-h-screen flex flex-col antialiased">
        <AppProvider>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        </AppProvider>
      </body>
    </html>
  )
}

/* ─── Header ───────────────────────────────────────────────────────────────── */
// This is a server component — interactive mobile menu lives in MobileMenu.js
function Header() {
  const navLinks = [
    { href: '/home',         label: 'Play' },
    { href: '/leaderboards', label: 'Leaderboards' },
  ]

  return (
    <header className="sticky top-0 z-[100] border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-5 h-[60px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="font-head text-2xl font-extrabold text-txt no-underline shrink-0">
          <span className="text-accent">Q</span>uizzify
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-5">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted text-sm font-medium no-underline transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/account/signup"
            className="text-sm font-semibold no-underline px-4 py-[7px] rounded-lg border border-border text-muted transition-all hover:border-accent hover:text-accent"
          >
            Sign Up
          </Link>
        </nav>

        {/* Mobile hamburger — client component handles open/close state */}
        <MobileMenu links={navLinks} />

      </div>
    </header>
  )
}

/* ─── Footer ───────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-border px-5 py-10">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">

        <div>
          <Link href="/" className="font-head text-xl font-extrabold text-txt no-underline">
            <span className="text-accent">Q</span>uizzify
          </Link>
          <p className="text-muted text-[0.8rem] mt-1">Challenge your mind. Test your skills.</p>
        </div>

        <nav className="flex items-center gap-6 flex-wrap justify-center">
          <Link href="/home"           className="text-muted text-sm no-underline hover:text-accent transition-colors">Play</Link>
          <Link href="/leaderboards"   className="text-muted text-sm no-underline hover:text-accent transition-colors">Leaderboards</Link>
          <Link href="/account/signup" className="text-muted text-sm no-underline hover:text-accent transition-colors">Sign Up</Link>
        </nav>

        <p className="text-muted text-[0.8rem]">© {new Date().getFullYear()} Quizzify</p>

      </div>
    </footer>
  )
}



