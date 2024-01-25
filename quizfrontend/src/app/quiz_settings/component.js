'use client'

import React from 'react'
import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import axios from 'axios';

function QuizSetting(){
	const router = useSearchParams()
	const choice = router.get('data')

	if (choice == 'solve'){
		return(
				<>
					<SolveQuizSettings />
				</>
			)
	}
	else if (choice == 'versus'){
	return(
		<> <VersusQuizSettings /> </>
		)
}
else{
	return(<div>Hello</div>)
}
}


function SolveQuizSettings(){
	const time = React.useRef()
	const gameT = React.useRef()
	const levelT = React.useRef()
	const [data,setData] = React.useState(10)
	const [type,setType] = React.useState('solve')
	const [level,setLevel] = React.useState('easy')

	const getData = () =>{
		setData(time.current.value)
	}

	return(
	<div class="container col-md-6 col-sm-12">
		<div class="row my-3 align-items-center hide">
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
)}


function VersusQuizSettings(){
	const time = React.useRef()
	const levelT = React.useRef()
	const playerName = React.useRef()
	const [ready,setReady] = React.useState(false)
	const [data,setData] = React.useState(10)
	const [type,setType] = React.useState('versus')
	const [level,setLevel] = React.useState('easy')
	const [link,setLink] = React.useState('')
	const [game,setGame] = React.useState()
	const [currentPlayer,setCurrentPlayer] = React.useState({name:'mmm'})

	const getData = () =>{
		setData(time.current.value)
	}

	const createLink = async () => {
		if(playerName.current.value == ""){

		}
		else{
		let resp = await axios.get(`http://localhost:8000/creategame/${playerName.current.value}`)
		setGame(resp.data.id)
		setCurrentPlayer(resp.data.player.id)
		console.log(resp.data.player)
		setReady(true)
	}
		//setLink(`http://localhost:3000/solve_quiz?data=${data}&gameType=versus&level=${level}`)
	}

	return(
			<div>
				Versus Mode
			<div class='row my-3'>
				<div class="col">
					Player Name
				</div>
				<div class='col'>
					<input ref={playerName} class="form-control" />
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

			<p>
			<button class='btn w-100 color-bg-s color-white center p-2 rounded' onClick={()=>createLink()} >
			Click to create Link
			</button>
			</p>

			{ready && <p><Link href={link}> Versus Link </Link> </p>}

			{ready && <p class='w-100 color-bg-p color-white center p-2 rounded'> 
			<Link href={{pathname:'solve_quiz', query:{data:data,gameType:type,level:level,game:game,currentPlayer:currentPlayer}}} class='color-white no-decoration'> Start </Link></p>}
		</div>
		)
}

export default QuizSetting