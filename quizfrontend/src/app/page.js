import Link from 'next/link'

function App (){
  return(
      <div>
        <h1 class="sz-36 center">My Quiz App </h1>
        <div>
        <br />
        <div class="row sz-24">
        <div class='col center'>
          <Link href={{pathname:"quiz_settings",query:{data:'create'}}} class='no-decoration'> Join Quiz </Link>
          </div>
        <div class='col center'>
          <Link href={{pathname:"quiz_settings",query:{data:'solve'}}} class='no-decoration'> Solve Quiz </Link>
        </div>
        <div class='col center'>
          <Link href={{pathname:"quiz_settings",query:{data:'versus'}}} class='no-decoration'> Create Quiz </Link>
        </div>
        </div>
        </div>
      </div>
    )
}

export default App