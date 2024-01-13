'use client'

import React from 'react'
import Link from 'next/link'

function QuizSetting(){
	const time = React.useRef()
	const gameT = React.useRef()
	const levelT = React.useRef()

	const [data,setData] = React.useState(10)
	const [type,setType] = React.useState('Unlimited')
	const [level,setLevel] = React.useState('easy')

	const getData = () =>{
		setData(time.current.value)
	}

	return(
		<div class="container col-md-6 col-sm-12">
		<div class="row my-3 align-items-center">
			<div class="col-2">Game type</div>
			<div class="col">
			<select ref={gameT} class="form-control" onChange={()=>setType(gameT.current.value)}>
				<option>Level</option>
				<option>5 missed Out</option>
				<option>With Oponents</option>
			</select>
			</div>
		</div>

			<div class="row my-3 align-items-center"> <div class="col-2"> Time </div> <div class="col"> 
				<select class="form-control" ref={time} onChange={()=>getData()}>
				<option>5</option>
				<option>10</option>
				<option>15</option>
				<option>20</option>
				<option>25</option>
				<option>30</option>
			</select>
			</div> </div>
			<div class="row my-3 align-items-center"> <div class="col-2"> Difficulty </div> 
			<div class="col">
			<select class="form-control" ref={levelT} onChange={()=>setLevel(levelT.current.value)}>
				<option>Easy</option>
				<option>Normal</option>
				<option>Hard</option>
			</select>
			</div></div>
			<p class='w-100 color-bg-p color-white center p-2 rounded'> <Link href={{pathname:'solve_quiz', query:{data:data,gameType:type,level:level}}} class='color-white no-decoration'> Start </Link></p>
		</div>
		)
}

export default QuizSetting