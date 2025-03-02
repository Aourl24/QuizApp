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
import {QuizBoxContext} from "./components.js"


function App (){
  let sound = React.useRef()

  const {setLoader} = React.useContext(QuizBoxContext)

  React.useEffect(()=>{
    setLoader(false)
    return ()=>setLoader(true)    
  },[])

  return(
    <div class="">
      <div class="d-flex p-0 flex-column rounded  vh-100 vh-md-90 container jstify-content-center " styl={{hight:'90vh'}}>
        <div class="row p-4 rounded shado align-items-center">
          <div class="col-md col-sm cente sz-30 ">   
              <div class="row mt-4">
                  <div class="col sz-md-30 ">
                  <span class="sz-48 color-p inline-block" style={{transform:"scaleY(1.2)",transform:"scaleX(1)"}}>Quizzify!</span>
                      <br/><span class="sz-sm-24"> Challenge your mind and test your skills</span> 
                  </div>
              </div>

              <div class="row my-2">
                <div class="col sz-md-24 d-none">
                    experience our quiz app  <br/><span class="center inline-blck color-p w-100 font-great sz-60 hide sz-md-60 animate__animted aimate__bounce animte__infinie aimate__delay-3s" style={{isplay:'inline-block'}}>Quizzify</span> 
                  </div>
              </div>

            <div class="row mt-md-5 mt-4">
              <div class="col p-2 p-md-3">
                <Link href={{pathname:"home"}}  class='no-decoration color-white color-bg-p  color-bg-hover color-white-hover color-bd-p p-3 rounded-4 inline-block w-100 center sz-20 sz-md-24'> Play Quiz </Link>
              </div>
              <div class="w-100 d-none"></div>
              <div class="col p-2 p-md-3">
                <Link href={{pathname:"account/signup"}}  class='no-decoration color-black color-white color-black-hover color-bg-t-hover color-white-hover color-bd-p p-3 rounded-4 inline-block w-100 center sz-20 sz-md-24 color-bg-s'> Sign Up </Link>
              </div>
            </div>
          </div>
        
          <div class="col col-sm center order-firs orer-md-last">
            <img class="img-fluid rounded" style={{height:'450px',widt:'400px',obejectFit:'cover'}} src="/quiz2.jpg" />
          </div>
        </div>
      </div>

        
    <section id="services" class="services section font-montserrat">

      
      <div class="container section-title" data-aos="fade-up">
        <h2 class="font-montserrat color-p">Features</h2>
        <p>Our Quizzify app contain the following Features</p>
      </div>

      <div class="container">

        <div class="row gy-4">

          <div class="col-xl-3 col-md-6 d-fle " data-aos="fade-up" data-aos-delay="100">
            <div class="service-item position-relative">
              <div class="icon"><i class="bi bi-activity icon"></i></div>
              <h4 class="font-montserrat">Engaging Quizzes</h4>
              <p>Enjoy interactive and challenging quizzes across various topics</p>
            </div>
          </div>

          <div class="col-xl-3 col-md-6 d-fle" data-aos="fade-up" data-aos-delay="200">
            <div class="service-item position-relative">
              <div class="icon"><i class="bi bi-bounding-box-circles icon"></i></div>
              <h4 class="font-montserrat">Real Time Scores</h4>
              <p>Instantly track your performance with real-time feedback</p>
            </div>
          </div>

          <div class="col-xl-3 col-md-6 d-flx" data-aos="fade-up" data-aos-delay="300">
            <div class="service-item position-relative">
              <div class="icon"><i class="bi bi-calendar4-week icon"></i></div>
              <h4 class="font-montserrat">LeaderBoard</h4>
              <p>Compete with friends and climb the leaderboard</p>
            </div>
          </div>

          <div class="col-xl-3 col-md-6 d-fex " data-aos="fade-up" data-aos-delay="400">
            <div class="service-item position-relative">
              <div class="icon"><i class="bi bi-broadcast icon"></i></div>
              <h4 class="font-montserrat">Learning</h4>
              <p>Learn new topics from various quiz</p>
            </div>
          </div>

        </div>

      </div>

    </section>


<section id="more-services" class="more-services section">
      <div class="container section-title" data-aos="fade-up">
        <h2 class="color-p">Sign Up!!</h2>
        <p>Create account to enjoy more features from our quiz app</p>
      </div>

      <div class="container">

        <div class="row gy-4">

          <div class="col-lg-4" data-aos="fade-up" data-aos-delay="100">
            <div class="card">
              <i class="fas fa-trophy sz-36"></i>
              <h3>Play Different Challenges</h3>
              <p>Play Different types of Challenges of all levels.</p>
            </div>
          </div>

          <div class="col-lg-4" data-aos="fade-up" data-aos-delay="200">
            <div class="card">
              <i class="fas fa-users sz-36"></i>
              <h3>Multiplayer Mode </h3>
              <p>Play and compete with friends</p>
            </div>
          </div>

          <div class="col-lg-4" data-aos="fade-up" data-aos-delay="300">
            <div class="card">
              <i class="fas fa-save sz-36"></i>
              <h3>Save your Progress</h3>
              <p> Your Game Progress are save</p>
            </div>
          </div>

        </div>

      </div>

    </section>
         
      </div>
    )
}

export default App