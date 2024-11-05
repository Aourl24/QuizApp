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
    <div class="">
      <div class="d-flex p-2  rounded align-items-center vh-md-90 container" styl={{hight:'90vh'}}>
      <div class="p-4">
        <div class="row color-bg-white p-4 rounded shadow">
        <div class="col-md col-sm center sz-30">   
            <div class="row">
                <div class="col sz-md-36">
                    <br/><span class=""> Learn and Win.</span> 
                </div>
            </div>
            <div class="row">
              <div class="col sz-md-36">
                  Experience our Quiz App  <br/><span class="center inline-blck color-p w-100 font-great sz-60 hide sz-md-60 animate__animted aimate__bounce animte__infinie aimate__delay-3s" style={{isplay:'inline-block'}}>Quizzify</span>    </div>
            </div>
        
          
        <div class="row mt-md-5 mt-4">
          <div class="col p-2 p-md-3">
            <Link href={{pathname:"quiz_settings"}}  class='no-decoration color-white color-bg-s  color-bg-hover color-white-hover color-bd-p p-3 rounded-4 inline-block w-100 center sz-20 sz-md-24'> Play Quiz </Link>
          </div>
          <div class="w-100"></div>
          <div class="col p-2 p-md-3">
            <Link href={{pathname:"account/signup"}}  class='no-decoration color-p color-bg-white border border-2 color-black-hover color-bg-t-hover color-bd-p p-3 rounded-4 inline-block w-100 center sz-20 sz-md-24'> Sign Up </Link>
          </div>
        </div>
        </div>

        
        <div class="col-md col-sm center order-first order-md-last">
        <Image class="img-fluid rounded" style={{hight:'400px',wdth:'400px',obejectFit:'cover'}} src={image_1} />
        </div>
        </div>
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

        <div class="container-fluid w-100 p-4" style={{}}>
            <div class="row hide sz-md-48 sz-36 color-black bold center p-2">
              <div class="col">
                What we Offer 
              </div>
            </div>

            <div class="row sz-18 p-3 align-items-center">
                <div class="col-12 p-3">

                <div class="row align-items-center">
                    <div class="p-3 col-md-6">
                        <Image src={image} class="img-fluid" style={{wdth:'350px',heigt:'300px',objectFit:'contain'}} />
                    </div>
                    <div class="col center">
                        <div class="sz-30 sz-md-36"> Quiz Challenge </div>
                        <div class="w-100 my-2"></div>
                          Play different Challenges
                    </div>
                </div>
                </div>

                <div class="col-12 p-3 py-4 my-5">

                <div class="row align-items-center">
                    <div class="p-3 col-md-6">
                        <Image src={image_2} class="img-fluid" style={{wdth:'350px',heigt:'300px',objectFit:'contain'}} />
                    </div>
                    <div class="col order-md-first center">
                        <div class="sz-30 sz-md-36"> MutiPlayer</div>
                        <div class="w-100 my-2"></div>
                          Play with Friends
                    </div>
                </div>
                </div>

                <div class="col-12 p-3 py-4 my-5">

                <div class="row align-items-center">
                    <div class="p-3 col-md-6">
                        <Image src={image_4} class="img-fluid" style={{wdth:'350px',heigt:'300px',objectFit:'contain'}} />
                    </div>
                    <div class="col center">
                        <div class="sz-30 sz-md-36"> Create Quiz Questions</div>
                        <div class="w-100 my-2"></div>
                          Create your own quiz cards
                    </div>
                </div>
                </div>


            </div>
        </div>

        <div class="container-fluid py-3 color-bg-p">
          <div class="row sz-24 hide">
            <div class="col-sm center">
                Play as a Guest or Create Account with us
            </div>
          </div>
          <div class='row align-items-center my-3'>
            <div class="col-sm color-black sz-30 sz-md-36 color-s order-last order-md-first py-4 center">
              Do you want to test your ability ? Give it a Shot!!!
               <Link href={{pathname:"quiz_settings"}}  class='btn no-decoration color-white my-3 color-bg-p  color-bg-t-hover color-white-hover color-bd-p rounded inline-block w-100 center sz-24'> Let's Go </Link>
            </div>
            <div class="col py-4 hide">
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