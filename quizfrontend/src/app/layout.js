"use client"
import { Inter } from 'next/font/google';
import './css/fontawesome/css/all.min.css'
import './css/bootstrap-5/css/bootstrap.min.css';
import './css/acss/acss.css'
import './css/animate.min.css'
import './css/main.css'
import './globals.css'
import React from 'react'
import quizzify_logo from './quzzify_logo.png'
import Image from 'next/image'
import Link from 'next/link'
import {Quiz , Header} from "./components.js"
import {Auth} from "./auth.js"

const metadata = {
  title: 'Quzzify',
  description: 'Test your Knowledge',
}

export default function RootLayout({ children }) {
  
  const user = null
  return (
    <html lang="en">
    <Auth>
      <body className="container-fluid colo-bg-t font-montserrat">
       <Quiz>
       <Header />
          {children} 
          </Quiz>
      </body>
      </Auth>
    </html>
  )
}

