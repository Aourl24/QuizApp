"use client"
import { Inter } from 'next/font/google';
import './css/fontawesome/css/all.min.css'
import './css/animate.min.css'
import './css/bootstrap-5/css/bootstrap.min.css';
import './css/acss/acss.css'
import './globals.css'
import {useAuth} from './auth.js'
import React from 'react'

const metadata = {
  title: 'Quzzify',
  description: 'Test your Knowledge',
}

export default function RootLayout({ children }) {
  const {isAuthenticated , user } = useAuth()

  return (
    <html lang="en">
      <body className="container">
       <div class="row">
        <div class="col sz-20">Qui<span class="text-danger animate__animated animate__bounce animate__infinie animate__delay-3s" style={{display:'inline-block'}}>zz</span>ify </div>{isAuthenticated && <div class="col" style={{textAlign:'right'}}>{user.username} <i class="fas fa-bars"></i> </div>}
        </div>
      <div class="row vh-100">
      <div class="col-12"> {children} </div>

      <div class="col">
      <div class="row center position-absolute bottom-0 container">

        <div class="col"> <span class="sz-14">LouLou</span> <br/> <i class="fas fa-phone"></i> +2349078025667, <i class="fab fa-google"></i> awwalmustapha@gmail.com </div>
      </div>
      </div>
      </div>
      </body>
    </html>
  )
}
