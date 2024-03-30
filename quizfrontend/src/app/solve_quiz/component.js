'use client'
import React from 'react'
import Link from 'next/link'
import clapsound from './sounds/clapping.wav'
import boosound from './sounds/booing.wav'
import gameoversound from './sounds/gameover.wav'
import axios from 'axios'
import {endpoint, wsEndpoint} from '../endpoints.js'
import countdownsound from '../calmtickling.mp3'

const QuizBoxContext = React.createContext()


function Quiz(props){
	const [data,setData] = React.useState(props.items)
	const options = React.useRef([])
	const clap = React.useRef()
	const boo = React.useRef()
	const countdown = React.useRef()
	const gameover = React.useRef()
	const [details ,showDetails] = React.useState(false)
	const [type,setType] = React.useState(props.type === 0 ? true : false)
	const [active , setActive] =  React.useState(0)
	const [message, setMessage] = React.useState()
	const [countDown , setCountDown] = React.useState(props.time)
	const [score,setScore] = React.useState(0)
	const [correct, setCorrect] = React.useState([])
	const [wrong , setWrong] = React.useState([])
	const [optionChoose , setOptionChoose] = React.useState()
	const [showRestart,setShowRestart] = React.useState()
	const [showSelect,setShowSelect] = React.useState()
	const [currentPlayer,setCurrentPlayer] = React.useState({active:true})
	const [gameStatus , setGameStatus] = React.useState(true)
	const [questions ,setQuestions] = React.useState(true)
	const [level,setlevel] = React.useState(props.level ? props.level : 1)
	const [nextLevel,setNextLevel] = React.useState(false)
	const [restart,setRestart] = React.useState(false)
	const [players,setPlayers] = React.useState(props.players)
	const [buttonMessage,setButtonMessage] = React.useState()
	const hasMount = React.useRef(false)
	const [mark,setMark] = React.useState()
	const [missedOut,setMissedOut] = React.useState()
	const [missedCount,setMissedCount] = React.useState([])
	//const [loading , setLoading] = React.useState(false)
	// if(data[active]){
	// 	options.current = data[active].options.map((elem,i)=>options.current[i] ?? React.createRef())
	// }

	const getPlayer = ()=>{
		let player = ''
		props.players.map((x)=>{
			if(x.name == props.currentPlayer){
				player = x
			}
		})
		setCurrentPlayer(player)
	}

	const gameOver = ()=>{
		saveScore()
		setShowRestart(true)
		setGameStatus(false)
		setQuestions(false)		
	}

	const changeActive = ()=> {
		if(active > data.length){
			setQuestions(false)
			gameOver()
		}
		else if(active+1 == data.length){
			setActive(active)
			setQuestions(false)
			gameOver()
		}
		else{
			setActive(active+1)
			setMessage(null)
			setCountDown(props.time)
		}
		clap.current.currentTime = 0
		boo.current.currentTime = 0
		gameover.current.currentTime = 0
		countdown.current.currentTime = 0
		clap.current.pause()
		boo.current.pause()
		gameover.current.pause()
		countdown.current.pause()
	
	}

	const calculateScore = () =>{
	  let scoreCalculate = 30/(+props.time)
	  setScore((scoreCalculate*10)+score)	
	}

	const saveScore = async ()=>{
		const res = await axios.get(endpoint + 'save/' + currentPlayer.id +'/'+ score)
		console.log(res.data)
	}

	const markChoose = (x)=>{
		let optionBlock = options.current[x].current
		let otherOption = options.current.map((element)=>{element.current.classList.remove('select')})//element.current.classList.remove('color-p')
				optionBlock.classList.toggle('select')
		//optionBlock.classList.toggle('color-p')
		setShowSelect(true)
	}

	const gameMissedOut =(x)=>{
		if(type){
		if(missedOut){
			if(wrong.length === missedOut){
				setMessage("Game Over")
				gameOver()
			}
			else if(missedCount.length === 0 ){
				setMessage("Game Over")
				gameOver()
			}


		}}
	}

	const restartQuiz = () =>{
		setActive(0)
		setCountDown(time)
		setWrong([])
		setCorrect([])
		setScore(0)
	}

	const checkAnswer = () =>{
		countdown.current.currentTime = 0
		countdown.current.pause()
		
		if(optionChoose == data[active].answer){
			setMessage('Correct Answer')
			setCorrect((prevArray)=>[...prevArray,data[active]])
			setMark(true)
			clap.current.play()
			calculateScore()
		}
		else{
			setMessage('Wrong Answer')
			setWrong((prevArray)=>[...prevArray,data[active]])
			setMark(false)
			var d = missedCount
			d.pop()
			setMissedCount(d)
			gameover.current.play()
			//let gChance = chance
			//gChance.pop()
			//setChance(gChance)
		}
		setShowSelect(false)
		if(type)gameMissedOut(missedOut)
		//if(props.threeMissedOut){threeMissedOut()}
		
	}

	React.useEffect(()=>{
		//console.log(props.items)
		//setData(props.items)//.filter((x)=>x.level.name === '1'))
		console.log(data)
	},[])

	React.useEffect(()=>{
		options.current = data[active].options.map((elem,i)=>options.current[i] ?? React.createRef())
	},[data])

	React.useEffect(()=>{
		getPlayer()
	},[props.players])

	React.useEffect(()=>{
		if(active != 0 ){
			options.current.map((element)=>{element.current.classList.remove('select');element.current.classList.remove('color-p')})
		}
		countdown.current.play()

	},[active])


	React.useEffect(()=>{
		let doneQuestions = correct.length + wrong.length
		//setScore(correct.length + '/' + doneQuestions)

	},[wrong,correct])

	React.useEffect(()=>{
		if(missedOut>1){
			const val = []
			for(var i=0;i<missedOut;i++){
				val.push(i)
			}
			setMissedCount(val)
		}
	},[missedOut])


	if(currentPlayer.active == false){
		
		return (
			<QuizBoxContext.Provider value = {{checkAnswer}}>
			<div> 
			<PlayerRanking game={props.game} code={props.code} />
			</div>
			</QuizBoxContext.Provider>
			)
	}

	return(
			<QuizBoxContext.Provider value = {{active,data,markChoose,setOptionChoose,checkAnswer,showSelect,options,gameStatus,setGameStatus,questions,setQuestions,setMessage,message,setShowRestart,setData,level,score,setActive,setlevel,setScore,level,changeActive, nextLevel, setNextLevel,restartQuiz,setRestart,restart,showRestart,gameOver,players,setPlayers,checkAnswer,currentPlayer,buttonMessage,setButtonMessage,game:props.game,countDown,setCountDown,gameover,setWrong,hasMount,wrong,correct,mark,missedOut,setMissedOut,missedCount,setMissedCount,countdown,type,setType}} >
			<div>
			
				<div class="col-12">
				<div class='w-100 center' style={{textAlig:'right'}}><div class='rounded-circle sz-18  color-s  p-3 color-bd-p bold border' style={{display:'inline-block'}}>{countDown}</div> </div>				
			</div>
				{props.gameMode === 'level' && <LevelQuiz countDown={countDown} game={props.game} />}
										
				{props.gameMode === 'versus' && <NotAvailable /> }
				<div class="center py-3">
				<span class="sz-14 center rounded border inline-block p-3"> <b>Score</b> {score} </span>
				</div>
				{message && <Message game={props.game} players={props.players} code={props.code} /> }

				<audio src={clapsound} ref={clap} ></audio>
				<audio src={boosound} ref={boo}></audio>
				<audio src={gameoversound} ref={gameover} ></audio>
				<audio src={countdownsound} ref={countdown} ></audio>
			</div>
			</QuizBoxContext.Provider>
		)
}



function NotAvailable(props){
	return(
		<div class="sz-24 center">
			Your Request is Not Available right now, Coming Soon !!!
		</div>)
}

function Multiplayer(props){
	const [startGame,setStartGame] = React.useState(false)
	const [info , setInfo] = React.useState(20)
	const [trackPlayer,setTrackPlayer] = React.useState()
	const {gameStatus,setGameStatus,setMessage,players,checkAnswer,questions,setQuestions,active,currentPlayer,showRestart,setShowRestart,score,setPlayers,game,changeActive,countDown,setCountDown,message,hasMount} = React.useContext(QuizBoxContext)
	const socket = React.useRef()
	const mounted = React.useRef(false)

	//setMessage('waiting for second User') 

	const sendMessage = (e,i='main') =>{
		const body = {...e,type:i}
		const msg = JSON.stringify(body)
		console.log(msg)
	if(socket.current && socket.current.readyState === WebSocket.OPEN) 
			{ socket.current.send(msg);console.log('i just send message')
	}
	}

const checkPlayers = async () =>{
		const res = await axios.get(endpoint + 'game/' + game + '/players')
			setPlayers(res.data)
		//console.log(res.data)
	if(res.data.length < 2){
		setMessage('Wating for other Players')
	}
	else{
		setMessage()
	}
}

React.useEffect(()=>{
	console.log('i send a message')
	sendMessage({body:countDown},'start')
},[active,countDown])

React.useEffect(()=>{
sendMessage({body:players.length},'answer')
},[checkAnswer])

React.useEffect(()=>{
if(hasMount.current){sendMessage({body:players.length},'waiting')}
	else{hasMount.current = true}
},[changeActive])


	React.useEffect(()=>{

		//'ws://127.0.0.1:8000
		socket.current = new WebSocket(wsEndpoint + props.game + '/' + props.currentPlayer)
		
		socket.current.onopen = ()=>{
			console.log('Websocket has opend')
			setMessage()
			setStartGame(true)
		}

		socket.current.onmessage = (message) =>{
			const data = JSON.parse(message.data)
			console.log(data.message)
			if (data.message === 'joined'){
				checkPlayers()
			}
			else if(data.message.type === 'time'){
				console.log('message from time')
				setCountDown(data.message.body)
			}
			else if(data.message.type === 'endTime'){
				setMessage('Time Out')
			}
			else if(data.message.type ==='waiting'){
				if(data.message.body ==='failed'){
					setMessage('waiting for other players to play')
				}
				

			}
			//setInfo(data.message)

		}

		socket.current.onclose = () => {
			setMessage("You are disconnected")
		}

		return () =>{
			socket.current.close()
		}
		
		//sendMessage({data:'success'},'start')

	},[])

	return(
			<div>

				<p>{countDown}</p>
				<div class={startGame ? 'd-block' : 'hide'}> <QuizBox /> </div>
			</div>
		)
}


function LevelQuiz(props){

		const {active,gameStatus,setGameStatus,message,setMessage,questions,setQuestions,score,setShowRestart,level,setlevel,data,setData,setActive,setScore,nextLevel,setNextLevel,setRestart,gameOver,countDown,setCountDown,currentPlayer,gameover,setWrong,missedOut,setMissedOut,missedCount,setMissedCount,correct,countdown,type} = React.useContext(QuizBoxContext)
		
		const [holder ,setHolder] = React.useState([])

		if(type) setMissedOut(3)

		React.useEffect(()=>{
			for (var i=0;i<missedOut;i++){
				setHolder((prev)=>[...prev,i])
			}
			
		},[missedOut])

		React.useEffect(()=>{
			if(questions){

			}
			else{
				gameover()
			}
		},[])

		// React.useEffect(()=>{
		// 	if(!questions){
		// 	//if(score/parseInt(level) >= 70){
		// 	if(correct.length > 9){
		// 	//setNextLevel(true)
		// 	setMessage("You are doing Great")
		// 	//getNextLevel()
		// 	}

		// 	else{
		// 		setMessage('You did not have enough score to proceed to Next Level')

		// 		gameOver()
		// 	}
		// }
		// },[questions])

		// const getNextLevel = async ()=> {
		// 	let next = parseInt(level) + 1
		// 	const res = await axios.get(endpoint + 'nextlevel/' + props.game + '/' + next)
		// 	let newQuestion = res.data.question.filter((x)=>x.level.name === next.toString())
		// 	console.log(res.data.question)
		// 	console.log(level)
		// 	console.log(newQuestion)
		// 	if(newQuestion.length > 1){
		// 	setActive(0)
		// 	setQuestions(true)
		// 	setData(newQuestion)
		// 	//console.log(data[active])
		// 	setlevel(next)
		// }
		// else{
		// 	setMessage('You have reach maximum level')
			
			//gameOver()
		//}

		//}


	React.useEffect(()=>{
		const timer = setInterval(()=>{setCountDown(()=>countDown-1)},1000);

		
		if(currentPlayer.active == false){
			clearInterval(timer)
		}

		if (countDown <= 0){
			countdown.current.currentTime = 0
			countdown.current.pause()
			gameover.current.play()
			setMessage('Time Out')
			setWrong((prevArray)=>[...prevArray,data[active]])
			var d = missedCount
			d.pop()
			setMissedCount(d)
			clearInterval(timer)
		}
		if(message){
			//setCountDown(0)
			clearInterval(timer)
		}
		return () => clearInterval(timer)
	}
		
	,[countDown])



		return(
			<div>
			<div class='w-100 center' style={{textAlig:'right'}}>
			<p class="my-2"> <b class='color-p'>Question </b>  {active+1} </p>
			{missedCount && <p>{holder.map((x,e)=>{
				if(e < missedCount.length)
					{return(<i class="fas fa-heart color-p p-1"></i>)}
				else{
					return(<i class="fas fa-heart p-1 passive color-silver"></i>)}
				})} </p>}
			<QuizBox />
			</div>

			</div>
			)
}



	
function QuizBox(props){

	const {active, data, markChoose, setOptionChoose, checkAnswer, showSelect,countDown,options} = React.useContext(QuizBoxContext)	
	
	return(
		<React.Fragment >
		{data[active] &&
			<div class="row center justify-content-center">
			<div class='sz-24 bold rounded p-3 col-12'>{data[active].body}</div>
			
			<div class="col-12 my-3">
				<div class="row">
				{data[active].options.map((x,i)=><div class='col-md-6 my-1 p-3 p-sm-2 my-sm-1' key={i} ><div id={active+x} ref={options.current[i]}  class='border rounded sz-18 p-3 color-p-hover option' style={{cursor:'pointer'}} onClick={()=>{markChoose(i);setOptionChoose(x)}}>{x}</div></div>)}
				</div>
				{showSelect && <div class="my-4 display-sm-non"><button class="no-border rounded color-bg-p color-white w-100 sz-24 color-bg-s-hover p-2" onClick={()=>checkAnswer()}>Select </button></div>}

				{showSelect && <div class="fixed-bottom mb-3 hide d-fle justify-content-end rounded p-2 displa-md-none"><button class="no-border rounded color-bg-p color-white sz-24 color-bg-s-hover p-2 w-100" onClick={()=>checkAnswer()}>Select </button></div>}

			</div>
			</div> }
		</React.Fragment>

		)
}



function MissedOut(props){
	return(
			<div class="col" style={{textAlign:'right'}}>

				{props.chance.map(()=> <i class="fas fa-heart p-1 text-danger" ></i> )}
			</div>

		)
}

function Message(props){
	
	const {message, changeActive,score,restartQuiz,showRestart,nextLevel,setNextLevel,restart, questions,setShowRestart,buttonMessage,players,wrong,correct,mark} = React.useContext(QuizBoxContext)



	return(
		<div class='sz-24 text-danger modal d-flex align-items-center color-bg-white' style={{transition:"all 0.5 ease",backgroundColor:"rgba(100,100,100,0.8)"}}>
		<div class="modal-dialog modal-dialog-centered w-100 h-100 p-3" styl={{transition:"all 0.5 ease",backgroundColor:"rgba(200,200,200,0.5)"}}>
		<div class="modal-content p-3 center animate__animated animate__slideInUp">
			{nextLevel && <div> </div>}
			<div class="row my-2 color-p">
			{mark ? <i class="fas fa-check color-green sz-36"></i> : <i class="fas fa-times color-red sz-36"></i>} 
			{!showRestart  && <p class='sz-30 animate__animated animate__bounce hide'>{props.body == 'Correct Answer' ? <i class="fas fa-check color-green"></i> : <i class="fas fa-times color-red"></i>} </p> }
			<div class="col">
			{message}
			</div>
			</div>

		<div class="sz-30 color-black row"> <div class="col center sz-24"><span class="color-black sz-18 black">{restartQuiz ? 'Total Score':'Your Score' } </span> <br /><b  class="sz-36">{score}</b></div> </div>
		{questions && <p class="my-5"> <button class="no-border rounded color-bg-s color-white w-100 sz-24 color-bg-s-hover" onClick={()=>changeActive()}> {buttonMessage ? buttonMessage :'Next Question'} </button></p>}

		{restart && <p class="my-5 hide"><button class="btn color-bg-s color-white w-100 sz-20 color-bg-s-hover" onClick={()=>restartQuiz()}>Restart </button></p>}
		


		 {showRestart && <PlayerRanking players={players} game={props.game} code={props.code} /> }
		</div>
		</div>
		
		</div>
		)
}

function PlayerRanking(props){
	const {checkAnswer} = React.useContext(QuizBoxContext)
	const [players,setPlayers] = React.useState([])


	const getPlayersScore = async ()=>{
		let res =await axios.get(endpoint + 'game/' + props.game + '/players')
		console.log(res.data)
		setPlayers(res.data)
	}
	React.useEffect(()=>{
		getPlayersScore()
	},[])
	

	return(
		<div class="center">
		<p class="color-blac sz-18 bold color-s"> Players Score </p>

		{players.map((x)=>{
			return(
			<div class="row sz-18">
				<div class="col color-p">
					{x.name}
				</div>
				<div class="col color-black sz-16">
					{x.active ? 'waiting' : x.score}
				</div>
			</div>
			)			
		})}
		<hr />

		<p class=" color-black sz-14">Share this code with your Friend, to also play the game </p>
		<div class="bold sz-16">{props.code}</div>
		
		<div class="row">
			<div class="col sz- 14"><Link class="no-decoration sz-14" href="/" >Go back Home </Link> </div>
		</div>
		</div>
		)
}

export default Quiz