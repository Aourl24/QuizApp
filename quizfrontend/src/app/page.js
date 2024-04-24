'use client'
import Link from 'next/link'
import image from './quizImage.jpg'
import Image from 'next/image'
import soundtrack from './soundtrack.mp3'
import React from 'react'
import quizzify_logo from './quzzify_logo.png'
import image_1 from './image_1.jpeg'
import image_2 from './image_2.jpeg'
import image_3 from './image_3.jpeg'
import image_4 from './images_4.jpeg'
import questionImage from './quizimage.png'

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
    <div>
      <div class="d-flex flex-column color-bg-sm-white color-bg-whit p-2 p-md-4 rounded align-items-center container justify-content-center vh-md-90 font-poppins" styl={{height:'90vh'}}>
        <div class="row align-items-center color-bg-white p-4 rounded">
        <div class="col-md col-sm center sz-36">   
            <div class="row">
                <div class="col sz-md-36">
                    Challenge , Compete ,<br/><span class="color-p"> Learn and Win.</span> 
                </div>
            </div>
            <div class="row">
              <div class="col sz-md-36">
                  Experience our Quiz App  <br/><span class="center inline-block color-p w-100 font-great sz-60 sz-md-60 animate__animated animate__bounce animate__infinie animate__delay-3s" style={{display:'inline-block'}}>Quizzify</span>    </div>
            </div>
        
          
        <div class="row">
          <div class="col p-3">
            <Link href={{pathname:"quiz_settings"}}  class='no-decoration color-white color-bg-s  color-bg-t-hover color-white-hover color-bd-p p-2 rounded inline-block w-100 center sz-24'> Play Quiz </Link>
          </div>
        </div>

        <div class="row">
          <div class="col p-3">
            <Link href={{pathname:"account"}}  class='no-decoration color-p color-bg-white border border-2 color-white-hover color-bg-t-hover color-bd-p p-2 rounded inline-block w-100 center sz-24'> Create Account </Link>
          </div>
        </div>
        </div>
        
        <div class="col-md col-sm center px-4 order-first order-md-last">
        <div class="display-md-none break-3"></div>
        <Image class="img-fluid rounded" style={{hight:'400px',wdth:'400px',obejectFit:'cover'}} src={image_1} />
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

        <div class="container-fluid color-bg-p w-100 p-4 vh-md-100" style={{}}>
            <div class="row sz-md-48 sz-36 color-white bold center p-2">
              <div class="col">
                What we Offer 
              </div>
            </div>

            <div class="row sz-20 p-3 font-lato bold">
                <div class="col-sm p-3 center">
                    <div class="p-3 color-bg-white shadow">
                        <Image src={image} class="img-fluid" style={{width:'350px',height:'350px',objectFit:'contain'}} />
                        <div class="sz-30 color-p"> Quiz Challenge </div>
                        <div class="w-100 my-3"></div>
                          Quizzes from different Categories of Subjects
                    </div>
                </div>

                 <div class="col-sm p-3 center ">
                    <div class="p-3 color-bg-white shadow">
                        <Image src={image_2} class="img-fluid" style={{width:'350px',height:'350px',objectFit:'contain'}} />
                        <div class="sz-30 color-p"> Multiplayer Mode </div>
                        <div class="w-100 my-3"></div>
                        
                          Play and Compete with Friends
                    </div>
                </div>

                <div class="col-sm p-3 center">
                    <div class="p-3 color-bg-white shadow">
                        <Image src={image_4} class="img-fluid" style={{width:'350px',height:'350px',objectFit:'contain'}} />
                        <div class="sz-30 color-p"> Create Quizzes </div>
                        <div class="w-100 my-3"></div>
                         Create Your own Quiz Questions
                    </div>
                </div>


            </div>
        </div>

        <div class="container vh-md-100 py-3">
          <div class="row sz-24 hide">
            <div class="col-sm center">
                Play as a Guest or Create Account with us
            </div>
          </div>
          <div class='row align-items-center my-3'>
            <div class="col-sm color-black sz-36 sz-md-48 color-s order-last order-md-first py-4 center">
              <b>Do you want to test your ability ? Give it a Shot!!! </b>
               <Link href={{pathname:"quiz_settings"}}  class='no-decoration color-white my-3 color-bg-p  color-bg-t-hover color-white-hover color-bd-p p-2 rounded inline-block w-100 center sz-24'> Let's Go </Link>
            </div>
            <div class="col py-4">
              <Image src={questionImage} class="img-fluid" />
            </div>
          </div>
          <div class="row center">
            <div class="col bold"> This Website is Created and Owned by Awwal (LouLou). <a href="http://loulou.vercel.app">Visit Website</a> </div>
          </div>
        </div>
      </div>
    )
}

export default App