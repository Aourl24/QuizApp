import Link from 'next/link'

function App (){
  return(
      <div>
        <h1 class="sz-36 center">My Quiz App </h1>
        <div>
        <br />
        <div class="row sz-24">
        <div class='col-12 p-3 center'>
          <Link href={{pathname:"quiz_settings",query:{data:'create'}}} class='no-decoration'> Join Quiz </Link>
          </div>
        <div class='col-12 center p-3 hide'>
          <Link href={{pathname:"quiz_settings",query:{data:'solve'}}} class='no-decoration'> Solve Quiz </Link>
        </div>
        <div class='col-12 center p-3 order-first'>
          <Link href={{pathname:"quiz_settings",query:{data:'versus'}}} class='no-decoration'> Start Quiz </Link>
        </div>
        </div>
        </div>
      </div>
    )
}

export default App