'use client'

import React from 'react'
import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import axios from 'axios';
import endpoint from '../endpoints.js'

// function QuizSetting(){
// 	const router = useSearchParams()
// 	const choice = router.get('data')
// 	const gameMode = ['Survival Mode', 'Head-to-Head','Team Mode', 'Tournament','Customize Mode']

// 	if (choice == 'solve'){
// 		return(
// 				<>
// 					<SolveQuizSettings />
// 				</>
// 			)
// 	}
// 	else if (choice == 'versus'){
// 	return(
// 		<> <VersusQuizSettings /> </>
// 		)
// }
// else{
// 	return(<><JoinQuizSettings /> </>)
// }
// }


function QuizSetting(){
	const gameMode = [
		{
			id: 1, title:'Single Mode',info:'Allows one player to answer questions and accumulate points or progress through levels'},
			{id: 2 ,title:'Multiplayer Mode',info:'Enables multiple players to compete against each other simultaneously'},
			{id : 3,title:'Challenge Mode',info:'Players compete in head-to-head matches'},
			{id:4,title:'Team Mode',info:'Players form teams to collaborate and answer questions collectively'},
			{id:5,title:'Survival Mode',info:'players strive to answer questions correctly to avoid elimination, with each incorrect answers resulting in a loss of life or points'}, 
			{id:6,title:"Tournament Mode",info:'Organize a series of matches or rounds with the winner determined based on overall performance throughout the Tournament'},
			{id:7,title:"Customize Mode",info:'Lets players tailor game parameters such as question,categories,difficulty levels and scoring mechanics to suit their preference'
		}
		]

	const [choice,setChoice] = React.useState({id:0})

	const clickChoice = (x)=>{
		setChoice(...gameMode.filter((i)=> i.id === x ))
	}
	if (choice.id === 7 ){
		return (<><VersusQuizSettings /> </>)
	}

	return(
			<div>
			<div class="row">
				
				{gameMode.map((x)=>{
					return(
					<div class="col-md-6 col-sm-12">
						<div class="rounded p-4 color-bg-white color-bg-p-hover center color-white-hover color-bg-p-focus color-white-focus shadow m-2" style={{cursor:'pointer'}} onClick={()=>clickChoice(x.id)}>
							<div class="sz-20  bold">{x.title} </div>
							
							<p class="sz-16">{x.info} </p>
						</div>
					</div> 
				)})}
			</div>
			 </div>

		)
}


function JoinQuizSettings(props){
	const [ready,setReady] = React.useState()
	const [game,setGame] = React.useState()
	const [message, setMessage] = React.useState('')
	const code = React.useRef()
	const player = React.useRef()

	const getGame = async ()=>{
		if (player.current.value === ""){
			setMessage("Please enter your Name")
			return
		}

		try{
			const resp = await axios.get(endpoint  + 'join/' + code.current.value + '/' + player.current.value)
			
			if (resp.data.message){
				setMessage(resp.data.message)
				return 
			}
			if (resp.status === 500){
				setMessage("Error Loading Quiz Code")
				return
			}
			
		setGame(resp.data.id)
		setReady(true)}
		catch(error){
			setMessage("Error Loading Quiz Code")
		}
	}

	return(
		<div>
		{!ready && <div>

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
				<p class="text-danger">{message}</p>
			<p> <button class="btn w-100 color-bg-p color-white sz-16" onClick={()=>getGame()}> Proceed </button> </p>
			</div>}
			{ready && <div class="mb-2"> Already joined Game, Click to start Game <p class='w-100 color-bg-p color-white center p-2 rounded'> 
			<Link href={{pathname:'solve_quiz', query:{game:game,allow:true,currentPlayer:player.current.value}}} class='color-white no-decoration'> Start </Link></p></div>}
			
		</div>
		)
}





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
	const [message,setMessage] = React.useState()
	const getData = () =>{
		setData(time.current.value)
	}

	const getCategory = async () => {
		const resp = await axios.get(endpoint + 'category')
		console.log('category fetched')
		setCategory(resp.data)

	}
	

	const createLink = async () => {
		let postData = {time:time.current.value,type:type,level:level,name:playerName.current.value,questionNumber:nOfQ.current.value,category:cat.current.value}
		if(playerName.current.value == ""){
				setMessage("Enter Player Name")
		}
		else{
		setMessage("Creating Game...")
		let resp =await axios.post(`${endpoint}creategame`,postData,{headers:{
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
			
			<div class="">
			
			{!ready && <div>
			<div class='row my-3  align-items-center'>
				<div class="col-md-2 col-sm-12 sz-16 mb-2">
					Player Name
				</div>
				<div class='col'>
					<input ref={playerName} class="form-control sz-14" />
				</div>
			</div> 

			<div class="row my-3 align-items-center">
			<div class="col-md-2 col-sm-12 sz-16 align-items-center mb-2">Category </div> 
			<div class="col">
				<select ref={cat} class="form-control sz-14" >
					{category.map((x)=><option> {x.name} </option>)} 
				</select>
			 </div>
			</div> 

			<div class="row my-3 align-items-center"> <div class="col-md-2 col-sm-12 sz-16 mb-2"> Time </div> <div class="col"> 
				<select class="form-control sz-14" ref={time} onChange={()=>getData()}>
				<option>5</option>
				<option>10</option>
				<option>15</option>
				<option>20</option>
				<option>25</option>
				<option>30</option>
			</select>
			</div> </div>
			<div class="row my-3 align-items-center"> <div class="col-md-2 col-sm-12 sz-16 mb-2"> Difficulty </div> 
			<div class="col">
			<select class="form-control sz-14" ref={levelT} onChange={()=>setLevel(levelT.current.value)}>
				<option>Easy</option>
				<option>Normal</option>
				<option>Hard</option>
			</select>
			</div></div>

			<div class="row my-2 align-items-center">
			<div class="col-md-2 col-sm-12 sz-16 mb-2"> Number of Question </div>
			<div class="col"> 
			<select ref={nOfQ} type="number" class="form-control sz-14">
				<option>5</option>
				<option>10</option>
				<option>15</option>
				<option>20</option>
				<option>25</option>
				<option>30</option>
			</select>
			 </div>
			</div>
				{message && <p class="text-danger sz-16"><i>{message}</i></p>}
			<br />
			 <button class='btn w-100 color-bg-s color-white center p-2 rounded sz-16 color-bg-s-focus color-white-focus' onClick={()=>createLink()} >
			Create Game
			</button></div>}
			

			{ready && <p class="rounded center border p-2"> your friends can join with this code <br /> <span class="bold sz-16">{gameCode} </span></p>}

			{ready && <p class='w-100 color-bg-p color-white center p-2 rounded'> 
			<Link href={{pathname:'solve_quiz', query:{game:game,allow:true,currentPlayer:playerName.current.value}}} class='color-white no-decoration'> Start Game </Link></p>}
		</div>
		)
}

export default QuizSetting