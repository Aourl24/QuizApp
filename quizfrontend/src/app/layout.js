import { Inter } from 'next/font/google';
import './css/bootstrap-5/css/bootstrap.min.css';
import './css/acss/acss.css'
import './css/fontawesome/css/all.min.css'
import './css/animate.min.css'
import './globals.css'


export const metadata = {
  title: 'Quzzify',
  description: 'Test your Knowledge',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="container">
       <h1 class="sz-20 mt-2"> Qui<span class="text-danger animate__animated animate__bounce animate__infinie animate__delay-3s" style={{display:'inline-block'}}>zz</span>ify </h1>
      <div class="row justify-content-evenly vh-100">
      <div class="col-12"> {children} </div>

      <div class="col">
      <div class="row center">

        <div class="col"> <span class="sz-14">LouLou</span> <br/> <i class="fas fa-phone"></i> +2349078025667, <i class="fab fa-google"></i> awwalmustapha@gmail.com </div>
      </div>
      </div>
      </div>
      </body>
    </html>
  )
}
