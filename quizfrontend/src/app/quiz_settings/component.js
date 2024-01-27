'use client'

import React from 'react'
import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import axios from 'axios';
const endpoint = 'http://127.0.0.1:8000/'

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
	return(<><JoinQuizSettings /> </>)
}
}

function JoinQuizSettings(props){
	const [ready,setReady] = React.useState()
	const [game,setGame] = React.useState()
	const code = React.useRef()
	const player = React.useRef()

	const getGame = async ()=>{
		const resp = await axios.get(endpoint  + 'join/' + code.current.value + '/' + player.current.value)
		setGame(resp.data.id)
		setReady(true)
	}

	return(
		<div>
			<div class="row my-2">
			<div class="col"> 
			<input ref={player} class="form-control" placeholder='Enter your name' />
			</div>
			</div>
			<div class="row my-2">
			<div class="col">
			<input ref={code} class="form-control" placeholder='Enter Game Code' />
			</div>
			</div>

			<p> <button class="btn w-100 color-bg-p color-white sz-16" onClick={()=>getGame()}> Proceed </button> </p>
			{ready && <p class='w-100 color-bg-p color-white center p-2 rounded'> 
			<Link href={{pathname:'solve_quiz', query:{game:game,allow:true}}} class='color-white no-decoration'> Start </Link></p>}
		</div>
		)
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
	const nOfQ = React.useRef()
	const cat = React.useRef()
	const [ready,setReady] = React.useState(false)
	const [data,setData] = React.useState(10)
	const [type,setType] = React.useState('versus')
	const [level,setLevel] = React.useState('easy')
	const [link,setLink] = React.useState('')
	const [game,setGame] = React.useState()
	const [currentPlayer,setCurrentPlayer] = React.useState({name:'mmm'})
	const [gameCode, setGameCode] = React.useState()
	const [category,setCategory] = React.useState([])

	const getData = () =>{
		setData(time.current.value)
	}

	const getCategory = async () => {
		const resp = await axios.get(endpoint + 'category')
		setCategory(resp.data)

	}
	

	const createLink = async () => {
		let postData = {time:time.current.value,type:type,level:level,name:playerName.current.value,questionNumber:nOfQ.current.value,category:cat.current.value}
		if(playerName.current.value == ""){

		}
		else{
		//let resp = await axios.get(`http://localhost:8000/creategame/${playerName.current.value}`)
		let resp =await axios.post(`http://localhost:8000/creategame`,postData,{headers:{
			'Content-Type':'application/json'
		}})
		setGame(resp.data.id)
		setGameCode(resp.data.code)
		setCurrentPlayer(resp.data.player.id)
		console.log(resp.data.player)
		setReady(true)
	}
		//setLink(`http://localhost:3000/solve_quiz?data=${data}&gameType=versus&level=${level}`)
	}

	React.useEffect(()=>{getCategory()},[])

	return(
			<div>
				Versus Mode
			<div class='row my-3'>
				<div class="col-2">
					Host Name
				</div>
				<div class='col'>
					<input ref={playerName} class="form-control" />
				</div>
			</div>

			<div class="row">
			<div class="col-2">category </div> 
			<div class="col">
				<select ref={cat} class="form-control" >
					{category.map((x)=><option> {x.name} </option>)} 
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

			<div class="row">
			<div class="col-2"> Number of Question </div>
			<div class="col"> <input ref={nOfQ} type="number" class="form-control" /> </div>
			</div>

			<p>
			<button class='btn w-100 color-bg-s color-white center p-2 rounded' onClick={()=>createLink()} >
			Click to create Link
			</button>
			</p>

			{ready && <p>{gameCode} </p>}

			{ready && <p class='w-100 color-bg-p color-white center p-2 rounded'> 
			<Link href={{pathname:'solve_quiz', query:{game:game,allow:true}}} class='color-white no-decoration'> Start </Link></p>}
		</div>
		)
}

export default QuizSetting