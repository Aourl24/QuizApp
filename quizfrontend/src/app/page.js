import Link from 'next/link'
import image from './quizImage.jpg'
import Image from 'next/image'

function App (){
  return(
      <div>
        <h1 class="sz-36 center mt-2"> Qui<span class="text-danger">zz</span>ify </h1>
        <div>
        <br />
        <div class="row sz-24 border p-2 rounded m-2">
        <div class='col-12 p-3 center'>
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
        <div class="color-bg-p color-white p-2 rounded w-100">
          <Link href={{pathname:"quiz_settings",query:{data:'versus'}}} class='no-decoration color-white'> Start Quiz </Link>
        </div>
        </div>
        </div>
        <div class="container center my-3 hide"><Image class="img-fluid rounded" src={image} /> </div>
        </div>
      </div>
    )
}

export default App