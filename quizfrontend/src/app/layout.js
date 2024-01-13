import { Inter } from 'next/font/google';
import './css/bootstrap-5/css/bootstrap.min.css';
import './css/acss/acss.css'
import './css/fontawesome/css/all.min.css'
import './globals.css'
import './css/animate.min.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="container">{children}</body>
    </html>
  )
}
