'use client'
import Link from 'next/link'
import image from './quizImage.jpg'
import Image from 'next/image'
import soundtrack from './soundtrack.mp3'
import React from 'react'

function App (){
  let sound = React.useRef()

  React.useEffect(()=>{
    //sound.current.play();
    //sound.current.addEventListener('ended',()=>{
      //this.currentTime = 0
      //this.play()
    //})
  },[])

  return(
      <div class="container" syle={{}}>
        <div>
        <br />
        <div class="row align-items-center">
        <div class="col-md col-sm">
        <h3 class="center sz-36 sz-md-72 bold my-4"><span class="color-p">Ready</span> to test your <span class="color-s">knowledge</span> and have a <span class="color-p">blast? </span>  </h3>
          <div class="color-bg-p color-white p-2 rounded w-100 center sz-24">
          <Link href={{pathname:"quiz_settings",query:{data:'versus'}}} class='no-decoration color-white'> Start Quiz </Link>
        </div>
        </div>
        
        <div class="col-md col-sm center">
        <div class="display-md-none break-3"></div>
        <Image class="img-fluid rounded-circle object-fit" style={{height:'400px',width:'400px',obejectFit:'cover'}} src={image} />
        </div>
        </div>
        <br />
        <div class="row sz-24 border p-2 hide rounded m-2">
        <div class='col-12 p-3 center hide'>
        <div class="color-bg-s color-white p-2 rounded w-100">
          <Link href={{pathname:"quiz_settings",query:{data:'join'}}} class='no-decoration color-white'> Join Quiz </Link>
        </div>
        </div>
        <div class='col-12 center p-3 hide'>
        <div class="color-bg-p color-white p-2 rounded w-100 color-white">
          <Link href={{pathname:"quiz_settings",query:{data:'solve'}}} class='no-decoration color-white'> Solve Quiz </Link>
        </div>
        </div>
        <div class='col-12 center p-3 order-first'>

        </div>
        </div>
        <div class="container center my-3"> </div>
        </div>
        <audio ref={sound} autoplay>
          <source src={soundtrack} />
        </audio>
      </div>
    )
}

export default App