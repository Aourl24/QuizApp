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
import {Loader} from "./loader.js"


const metadata = {
  title: 'Quzzify',
  description: 'Test your Knowledge',
}

export default function RootLayout({ children }) {
  
  const user = null
  return (
    <html lang="en">
    <Auth excludedPath={['/quiz_settings']} redirect="/account/login">
      <body className="font-montserrat">
       <Quiz>
       <Header />
       <div class="container">
          <Loader>{children}</Loader> 
        </div>
          </Quiz>
          <br />
        <br />
        <br />
        <br />
        <br />
          <footer id="footer" class="footer dark-background">
    <div class="container footer-top ">
      <div class="row gy-4 border justify-content-center d-none">
        <div class="col sz-24">
          <a href="index.html" class="logo d-flex align-items-center">
            <span class="siename">Quizzify</span>
          </a>
  
          <div class="social-links d-flex mt-4">
            <a href=""><i class="fab fa-twitter"></i></a>
            <a href=""><i class="fab fa-facebook"></i></a>
            <a href=""><i class="fab fa-instagram"></i></a>
            <a href=""><i class="fab fa-linkedin"></i></a>
          </div>
        </div>

        <div class="col-lg-2 col-6 footer-links d-none">
          <h4>Useful Links</h4>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">About us</a></li>
            <li><a href="#">Services</a></li>
            <li><a href="#">Terms of service</a></li>
            <li><a href="#">Privacy policy</a></li>
          </ul>
        </div>

        <div class="col-lg-2 col-6 footer-links d-none">
          <h4>Our Services</h4>
          <ul>
            <li><a href="#">Web Design</a></li>
            <li><a href="#">Web Development</a></li>
            <li><a href="#">Product Management</a></li>
            <li><a href="#">Marketing</a></li>
            <li><a href="#">Graphic Design</a></li>
          </ul>
        </div>

        <div class="col-lg-3 col-md-12 footer-contact text-center text-md-start d-none">
          <h4>Contact Us</h4>
          <p>A108 Adam Street</p>
          <p>New York, NY 535022</p>
          <p>United States</p>
          <p class="mt-4"><strong>Phone:</strong> <span>+1 5589 55488 55</span></p>
          <p><strong>Email:</strong> <span>info@example.com</span></p>
        </div>

      </div>
    </div>

    <div class="container copyright text-center mt-4">
      <p>© <span>Copyright</span> <strong class="px-1 sitename">Quizzify</strong> <span>All Rights Reserved</span></p>
      <div class="credits">
        Created by Loulou      </div>
    </div>

  </footer>
      </body>
      </Auth>
    </html>
  )
}

