"use client"
import { Inter } from 'next/font/google';
import './css/fontawesome/css/all.min.css'
import './css/animate.min.css'
import './css/bootstrap-5/css/bootstrap.min.css';
import './css/acss/acss.css'
import './globals.css'
import {useAuth} from './auth.js'
import React from 'react'
import quizzify_logo from './quzzify_logo.png'
import Image from 'next/image'
import Link from 'next/link'
import {Quiz} from "./components.js"

const metadata = {
  title: 'Quzzify',
  description: 'Test your Knowledge',
}

export default function RootLayout({ children }) {
  const {isAuthenticated , user } = useAuth()

  return (
    <html lang="en">
      <body className="container-fluid bg-light p-0 font-montserrat">
       <div class="row align-items-center p-3">
        <div class="col-md-9 col sz-24  color-p">
            <Image src={quizzify_logo} class="img-fluid img-logo py-2 hide" style={{height:'50px',width:'50px',objectFit:'contain'}}/> Q<span class="font-great animate__animated animate__bounce animate__infinie animate__delay-3s bold" style={{display:'inline-block'}}>uizzify</span>
        </div>
        <div class="col" style={{textAlign:'right'}}>
          {isAuthenticated ? <Link href="profile" class="color-p no-decoration" style={{}}>{user.username}</Link> : <Link href="account" class="color-p no-decoration">Sign Up </Link> }
        </div>
        <div class="col"> <Menu /> </div>
      </div>

      <div class="row vh-100">
          <div class="col-12"> 
          <Quiz>
          {children} 
          </Quiz>
          </div>

          <div class="col">
              <div class="row center position-relative bottom-0 container hide">

                <div class="col"> <span class="sz-14">LouLou</span> <br/> <i class="fas fa-phone"></i> +2349078025667, <i class="fab fa-google"></i> awwalmustapha@gmail.com </div>
              </div>
          </div>
          </div>
      </body>
    </html>
  )
}

function Menu(props){
  return(
      <div class="row">
      <div class="col">
        About
      </div>
      <div class="col">
        Help
      </div>

      </div>

    )
}
