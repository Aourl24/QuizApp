'use client'

import React from 'react'
import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import axios from 'axios';
import endpoint from '../endpoints.js'

const QuizContext = React.createContext()


function QuizSetting(){
		const gameModes = [
		{
			id: 1, title:'Single Mode',info:'Allows one player to answer questions and accumulate points or progress through levels'},
			{id: 2 ,title:'Multiplayer Mode',info:'Enables multiple players to compete against each other simultaneously'},
			//{id : 3,title:'Challenge Mode',info:'Players compete in head-to-head matches'},
			//{id:4,title:'Team Mode',info:'Players form teams to collaborate and answer questions collectively'},
			//{id:5,title:'Survival Mode',info:'players strive to answer questions correctly to avoid elimination, with each incorrect answers resulting in a loss of life or points'}, 
			//{id:6,title:"Tournament Mode",info:'Organize a series of matches or rounds with the winner determined based on overall performance throughout the Tournament'},
			//{id:7,title:"Customize Mode",info:'Lets players tailor game parameters such as question,categories,difficulty levels and scoring mechanics to suit their preference'}
		]

	const [choice,setChoice] = React.useState({id:0})

	const clickChoice = (x)=>{
		setChoice(...gameModes.filter((i)=> i.id === x ))
	}

	const [time,setTime] = React.useState(15)
	const [ready,setReady] = React.useState(false)
	const [type,setType] = React.useState('versus')
	const [level,setLevel] = React.useState(1)
	const [link,setLink] = React.useState('')
	const [game,setGame] = React.useState()
	const [player,setPlayer] = React.useState() //host
	const [gameCode, setGameCode] = React.useState()
	const [category,setCategory] = React.useState([])
	const [message,setMessage] = React.useState()
	const [choosenCategory,setChoosenCategory] = React.useState()
	const [questionNumber,setQuestionNumber] = React.useState(10)
	const [currentPlayer,setCurrentPlayer] = React.useState() //currentplayer
	const [gameMode,setGameMode] = React.useState()

	const getCategory = async () => {
		const resp = await axios.get(endpoint + 'category')
		console.log('category fetched')
		setCategory(resp.data)

	}

	const createLink = async () => {
		let postData = {time:time,type:type,level:level,name:player,questionNumber:questionNumber,category:choosenCategory}
		if(player == ""){
				setMessage("Enter Player Name")
				return
		}
		else{
		setMessage("Creating Game...")
		
		try{var resp =await axios.post(`${endpoint}creategame`,postData,{headers:{
			'Content-Type':'application/json'
		}})}
		catch(error){
			setMessage('Error creating Game')
		}

		setGame(resp.data.id)
		setGameCode(resp.data.code)
		setPlayer(resp.data.player.id)
		console.log(resp.data.player)
		setReady(true)
		setMessage('')
	}
	}

	React.useEffect(()=>{
		getCategory()
	},[])


	return(
			<QuizContext.Provider value = {{time,ready,type,level,link,game,player,gameCode,category,message,setTime,setReady,setType,setLevel,setLink,setGame,setGameCode,setCategory,setMessage,setPlayer,createLink,setChoosenCategory,choosenCategory,setCurrentPlayer,questionNumber,setQuestionNumber,gameMode,setGameMode}} >
			<div>
			{choice.id === 1 && <SingleMode />}
			{choice.id === 2 && <VersusQuizSettings />}
			{choice.id === 0 && <GameModeList gameModes={gameModes} clickChoice={clickChoice} />}
			
			{message && <div class="text-danger sz-16"> <i>{message}</i> </div>}
			
			
			{ready && <p class='w-100 color-white center my-3 p-2 rounded sz-15 color-bg-s'> 
			<Link href={{pathname:'solve_quiz', query:{game:game,allow:true,currentPlayer:currentPlayer,gameMode:gameMode}}} class='color-white no-decoration '> Start Game </Link></p>}

			{ready && <p> Share Game Code <b>{gameCode}</b></p>}

			</div>
			</QuizContext.Provider>
		)
}



function GameModeList(props){
	return(
			<div class="row">
				
				{props.gameModes.map((x)=>{
					return(
					<div class="col-md-6 col-sm-12">
						<div class="rounded p-4 color-bg-white color-bg-p-hover center color-white-hover color-bg-p-focus color-white-focus shadow m-2" style={{cursor:'pointer'}} onClick={()=>props.clickChoice(x.id)}>
							<div class="sz-20  bold">{x.title} </div>
							
							<p class="sz-16">{x.info} </p>
						</div>
					</div> 
				)})}
			</div>
		)
}


function SingleMode(props){

	const name = React.useRef()
	const cat = React.useRef()

	const {setPlayer,category, createLink,setChoosenCategory,setCurrentPlayer,setLevel,gameMode,setGameMode} = React.useContext(QuizContext)

	const createGame = ()=>{
		setCurrentPlayer(name.current.value);
		setPlayer(name.current.value);
		setChoosenCategory(cat.current.value)
		setLevel(1)
		createLink()
		setGameMode('level')
	}

	return(
			<div class="">
				<div class="row sz-16 my-3">
					<div class="col my-2 bold">
						Enter your Name (Your are playing as Guest)
					</div>
					<div class="w-100"></div>
					<div class="col my-2">
						<input ref={name} class="form-control p-2 sz-15" />
					</div>
				</div>

				<div class="row">
			<div class="col my-2 bold">Categories </div> 
			<div class="w-100"></div>
			<div class="col my-2">
				<select ref={cat} class="form-control sz-15" >
					{category.map((x)=><option> {x.name} </option>)} 
				</select>
			 </div>
			</div>

				<div class="row mx-auto my-2"> <button class="color-bg-p no-border rounded sz-18 color-white p-2" onClick={()=>createGame()}> Start </button> </div>
			</div>
		)
}


function Multiplayer(props){

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
	const {time,ready,type,level,link,game,player,gameCode,category,message,setTime,setReady,setType,setLevel,setLink,setGame,setGameCode,setCategory,setMessage,setPlayer,createLink,setChoosenCategory,choosenCategory,setCurrentPlayer,questionNumber,setQuestionNumber,setGameMode} = React.useContext(QuizContext)
	
	const playerName = React.useRef()
	const cat = React.useRef()
	const timeT = React.useRef()
	const levelT = React.useRef()
	const nOfQ = React.useRef()

	const createGame = ()=>{
		setCurrentPlayer(playerName.current.value);
		setPlayer(playerName.current.value);
		setChoosenCategory(cat.current.value)
		setTime(timeT.current.value)
		setQuestionNumber(nOfQ.current.value)
		setGameMode('versus')
		//setLevel(1)
		createLink()
	}

	return(
			
			<div class="">
			
			{!ready && <div>
			<div class='row my-3  align-items-center'>
				<div class="col-md-2 col-sm-12 sz-16 mb-2">
					Host Name
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
				<select class="form-control sz-14" ref={timeT}>
				<option>5</option>
				<option>10</option>
				<option>15</option>
				<option>20</option>
				<option>25</option>
				<option>30</option>
			</select>
			</div> </div>
			<div class="row my-3 align-items-center hide"> <div class="col-md-2 col-sm-12 sz-16 mb-2"> Difficulty </div> 
			<div class="col hide">
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
			 <button class='btn w-100 color-bg-s color-white center p-2 rounded sz-16 color-bg-s-focus color-white-focus' onClick={()=>createGame()} >
			Create Game
			</button></div>}
			
		</div>
		)
}

export default QuizSetting