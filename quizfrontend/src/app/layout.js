"use client"
import { Inter } from 'next/font/google';
import './css/fontawesome/css/all.min.css'
import './css/animate.min.css'
import './css/bootstrap-5/css/bootstrap.min.css';
import './css/acss/acss.css'
import './globals.css'
import React from 'react'
import quizzify_logo from './quzzify_logo.png'
import Image from 'next/image'
import Link from 'next/link'
import {Quiz , Header} from "./components.js"

const metadata = {
  title: 'Quzzify',
  description: 'Test your Knowledge',
}

export default function RootLayout({ children }) {
  
  const user = null
  return (
    <html lang="en">
      <body className="container-fluid color-bg-t p-0 font-montserrat">
       <Quiz>
       <Header />
          {children} 
          </Quiz>
      </body>
    </html>
  )
}

