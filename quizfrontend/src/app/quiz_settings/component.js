'use client'

import React from 'react'
import Link from 'next/link'

function QuizSetting(){
	const time = React.useRef()
	const [data,setData] = React.useState()

	const getData = () =>{
		setData(time.current.value)
	}

	return(
		<div>
			<div class="row"> <div class="col"> Time </div> <div class="col"><input ref={time} type="number" class="form-control" onChange={getData} /> </div> </div>
			<div class="row"> <div class="col"> Difficulty </div> <div class="col"></div></div>
			<p> <Link href={{pathname:'solve_quiz', query:{data:data}}}> Start </Link></p>
		</div>
		)
}

export default QuizSetting