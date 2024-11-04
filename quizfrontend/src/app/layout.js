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
      <body className="container-fluid bg-light p-0 font-montserrat">
       <Quiz>
       <Header />

      <div class="row vh-100">
          <div class="col-12"> 
          
          {children} 
          
          </div>

          <div class="col">
              <div class="row center position-relative bottom-0 container hide">

                <div class="col"> <span class="sz-14">LouLou</span> <br/> <i class="fas fa-phone"></i> +2349078025667, <i class="fab fa-google"></i> awwalmustapha@gmail.com </div>
              </div>
          </div>
          </div>
          </Quiz>
      </body>
    </html>
  )
}

