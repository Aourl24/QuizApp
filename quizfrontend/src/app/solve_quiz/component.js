'use client'
import React from 'react'
import Link from 'next/link'
import clapsound from './sounds/clapping.wav'
import boosound from './sounds/booing.wav'
import gameoversound from './sounds/gameover.wav'
import axios from 'axios'
import endpoint from '../endpoints.js'


const QuizBoxContext = React.createContext()


function Quiz(props){
	const [data,setData] = React.useState(props.items)
	const options = React.useRef([])
	const clap = React.useRef()
	const boo = React.useRef()
	const gameover = React.useRef()
	const [details ,showDetails] = React.useState(false)
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
	}

	const changeActive = ()=> {
		if(active > data.length){
			setQuestions(false)
			//gameOver()
		}
		else if(active+1 == data.length){
			setActive(active)
			setQuestions(false)
			//gameOver()
		}
		else{
			setActive(active+1)
			setMessage(null)
			setCountDown(props.time)
		}
		clap.current.currentTime = 0
		boo.current.currentTime = 0
		gameover.current.currentTime = 0
		clap.current.pause()
		boo.current.pause()
		gameover.current.pause()
	
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


	const restartQuiz = () =>{
		setActive(0)
		setCountDown(time)
		setWrong([])
		setCorrect([])
		setScore(0)
	}

	const checkAnswer = () =>{
		
		if(optionChoose == data[active].answer){
			setMessage('Correct Answer')
			setCorrect((prevArray)=>[...prevArray,data[active]])
			clap.current.play()
			calculateScore()
		}
		else{
			setMessage('Wrong Answer')
			setWrong((prevArray)=>[...prevArray,data[active]])
			gameover.current.play()
			//let gChance = chance
			//gChance.pop()
			//setChance(gChance)
		}
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

	},[active])



	React.useEffect(()=>{
		const timer = setInterval(()=>{setCountDown(()=>countDown-1)},1000);
		
		if(currentPlayer.active == false){
			clearInterval(timer)
		}

		if (countDown <= 0){
			gameover.current.play()
			setMessage('Time Out')
			setWrong((prevArray)=>[...prevArray,data[active]])
			//let gChance = chance
			//gChance.pop()
			//setChance(gChance)
			clearInterval(timer)
		}
		if(message){
			//setCountDown(0)
			clearInterval(timer)
		}
		return () => clearInterval(timer)
		}
	,[countDown])

	React.useEffect(()=>{
		let doneQuestions = correct.length + wrong.length
		//setScore(correct.length + '/' + doneQuestions)

	},[wrong,correct])

	if(!data){
		return(<div class="spinner-border sz-24 center">loading</div>)
	}

	// if(currentPlayer.active == false){
		
	// 	return (<div> <PlayerRanking game={props.game} code={props.code} /></div>)
	// }

	return(
			<QuizBoxContext.Provider value = {{active,data,markChoose,setOptionChoose,checkAnswer,showSelect,options,gameStatus,setGameStatus,questions,setQuestions,setMessage,message,setShowRestart,setData,level,score,setActive,setlevel,setScore,level,changeActive, nextLevel, setNextLevel,restartQuiz,setRestart,restart,showRestart,gameOver,players,setPlayers,checkAnswer,currentPlayer,buttonMessage,setButtonMessage}} >
			<div>
			
				<div class="col-12">
				<div class='w-100 center' style={{textAlig:'right'}}><div class='rounded sz-18  color-s  p-2 color-bd-p' style={{display:'inline-block'}}>0 : {countDown}</div> </div>				
			</div>
				{props.gameMode === 'level' && <LevelQuiz countDown={countDown} game={props.game} />}
				{props.gameMode === 'versus' && <Multiplayer currentPlayer={props.currentPlayer} game={props.game} />}						

				<p class="sz-18 center"> <b>Score</b> :{score} </p>
				{message && <Message game={props.game} players={props.players} code={props.code} /> }

				<audio src={clapsound} ref={clap} ></audio>
				<audio src={boosound} ref={boo}></audio>
				<audio src={gameoversound} ref={gameover} ></audio>
			</div>
			</QuizBoxContext.Provider>
		)
}


function Multiplayer(props){
	const [startGame,setStartGame] = React.useState(false)
	const [info , setInfo] = React.useState()
	const [trackPlayer,setTrackPlayer] = React.useState()
	const {gameStatus,setGameStatus,setMessage,players,checkAnswer,questions,setQuestions,active,currentPlayer,showRestart,setShowRestart,score,setPlayers} = React.useContext(QuizBoxContext)
	const socket = React.useRef()
	//setMessage('waiting for second User') 

	const sendMessage = (e) =>{
		const msg = JSON.stringify({e})
		//console.log(msg)
	if(socket.current && socket.current.readyState === WebSocket.OPEN) 
			{ socket.current.send(msg);console.log('i just send message')
	}
	}


	if(players.length < 2){
		setMessage('Wating for other Players')
	}

	React.useEffect(()=>{
	setShowRestart(true)
	sendMessage({id:currentPlayer.id,score:score})
	},[checkAnswer])

	React.useEffect(()=>{
		//'ws://127.0.0.1:8000
		socket.current = new WebSocket('ws://192.168.84.92:8000/quizroom/' + props.game + '/' + props.currentPlayer)
		
		socket.current.onopen = ()=>{
			console.log('Websocket has opend')
			setMessage()
			setStartGame(true)
		}

		socket.current.onmessage = (message) =>{
			const data = JSON.parse(message.data)
			console.log(data)
			//setInfo(data.message)

		}

		socket.current.onclose = () => {
			setMessage("You are disconnected")
		}
		
		return () =>{
			socket.current.close()
		}

	},[])

	return(
			<div>

				<p>{info}</p>
				<div class={startGame ? 'd-block' : 'hide'}> <QuizBox /> </div>
			</div>
		)
}

function LevelQuiz(props){

		const {active,gameStatus,setGameStatus,message,setMessage,questions,setQuestions,score,setShowRestart,level,setlevel,data,setData,setActive,setScore,nextLevel,setNextLevel,setRestart,gameOver} = React.useContext(QuizBoxContext)
		

		React.useEffect(()=>{
			if(!questions){
			if(score/parseInt(level) >= 70){
			setNextLevel(true)
			setMessage("Good Job!!!, Proceed to Next Level")
			getNextLevel()
			}

			else{
				setMessage('You did not have enough score to proceed to Next Level')

				gameOver()
			}
		}
		},[questions])

		const getNextLevel = async ()=> {
			let next = parseInt(level) + 1
			const res = await axios.get(endpoint + 'nextlevel/' + props.game + '/' + next)
			let newQuestion = res.data.question.filter((x)=>x.level.name === next.toString())
			console.log(res.data.question)
			console.log(level)
			console.log(newQuestion)
			if(newQuestion.length > 1){
			setActive(0)
			setQuestions(true)
			setData(newQuestion)
			//console.log(data[active])
			setlevel(next)
		}
		else{
			setMessage('You have reach maximum level')
			
			gameOver()
		}

		}

		return(
			<div>
			<div class='w-100 center' style={{textAlig:'right'}}>
			<p> <b class='color-p'>Level</b> : {level} </p>

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
			{data[active].level.name}
			<div class="col-12">
				<div class="row">
				{data[active].options.map((x,i)=><div class='col-md-6 my-1 p-3 p-sm-2 my-sm-1' key={i} ><div id={active+x} ref={options.current[i]}  class='border rounded sz-16 p-3 color-p-hover option' style={{cursor:'pointer'}} onClick={()=>{markChoose(i);setOptionChoose(x)}}>{x}</div></div>)}
				</div>
				{showSelect && <div class="my-4 display-sm-none"><button class="btn color-bg-p color-white w-100 sz-20 color-bg-s-hover p-3" onClick={()=>checkAnswer()}>Select </button></div>}

				{showSelect && <div class="fixed-bottom mb-3 d-flex justify-content-end rounded p-3 display-md-none"><button class="btn color-bg-p color-white sz-20 color-bg-s-hover p-3" onClick={()=>checkAnswer()}>Select </button></div>}

			</div>
			</div> }
		</React.Fragment>

		)
}


// function QuizBo(props){
// 	const data = props.items
// 	const options = React.useRef([])
// 	const clap = React.useRef()
// 	const boo = React.useRef()
// 	const gameover = React.useRef()
// 	const [details ,showDetails] = React.useState(false)
// 	const [active , setActive] =  React.useState(0)
// 	const [message, setMessage] = React.useState(null)
// 	const [countDown , setCountDown] = React.useState(props.time)
// 	const [score,setScore] = React.useState(0)
// 	const [correct, setCorrect] = React.useState([])
// 	const [wrong , setWrong] = React.useState([])
// 	const [optionChoose , setOptionChoose] = React.useState()
// 	const [showRestart,setShowRestart] = React.useState(null)
// 	const [showSelect,setShowSelect] = React.useState(null)
// 	const [chance,setChance] = React.useState([1,2,3])
// 	const [currentPlayer,setCurrentPlayer] = React.useState({active:true})
// 	const [gameStatus , setGameStatus] = React.useState(true)

// 	options.current = data[active].options.map((elem,i)=>options.current[i] ?? React.createRef())


// 	const getPlayer = ()=>{
// 		let player = ''
// 		props.players.map((x)=>{
// 			if(x.name == props.currentPlayer){
// 				player = x
// 			}
// 		})
// 		setCurrentPlayer(player)
// 	}


// 	const changeActive = ()=> {
// 		if(active > data.length){
// 			//setActive(active)
// 			//setMessage('Game Over')
// 			gameOver()
// 		}
// 		else if(active+1 == data.length){
// 			setActive(active)
// 			gameOver()
// 		}
// 		else{
// 			setActive(active+1)
// 			setMessage(null)
// 			setCountDown(props.time)
// 		}
// 		clap.current.currentTime = 0
// 		boo.current.currentTime = 0
// 		gameover.current.currentTime = 0
// 		clap.current.pause()
// 		boo.current.pause()
// 		gameover.current.pause()
	
// 	}

// 	// const threeMissedOut = () =>{
// 	// 	if(chance.length == 0){
// 	// 		gameOver()
// 	// 	}
// 	// }

// 	const calculateScore = () =>{
// 	  let scoreCalculate = 30/(+props.time)
// 	  setScore((scoreCalculate*10)+score)	
// 	}

// 	const saveScore = async ()=>{
// 		const res = await axios.get(endpoint + 'save/' + currentPlayer.id +'/'+ score)
// 		console.log(res.data)
// 	}

// 	const gameOver = () =>{
// 		//setActive(active)
// 		setMessage('Quiz Ended')
// 		gameover.current.play()
// 		saveScore()
// 		setShowRestart(true)
// 	}

// 	const markChoose = (x)=>{
// 		let optionBlock = options.current[x].current
// 		let otherOption = options.current.map((element)=>{element.current.classList.remove('select')})//element.current.classList.remove('color-p')
// 				optionBlock.classList.toggle('select')
// 		//optionBlock.classList.toggle('color-p')
// 		setShowSelect(true)
// 	}

// 	const restartQuiz = () =>{
// 		setActive(0)
// 		setCountDown(time)
// 		setWrong([])
// 		setCorrect([])
// 		setScore(0)
// 	}

// 	const checkAnswer = () =>{
		
// 		if(optionChoose == data[active].answer){
// 			setMessage('Correct Answer')
// 			setCorrect((prevArray)=>[...prevArray,data[active]])
// 			clap.current.play()
// 			calculateScore()
// 		}
// 		else{
// 			setMessage('Wrong Answer')
// 			setWrong((prevArray)=>[...prevArray,data[active]])
// 			boo.current.play()
// 			let gChance = chance
// 			gChance.pop()
// 			setChance(gChance)
// 		}
// 		if(props.threeMissedOut){threeMissedOut()}
		
// 	}

// 	React.useEffect(()=>{
// 		getPlayer()
// 	},[props.players])

// 	React.useEffect(()=>{
// 	options.current.map((element)=>{element.current.classList.remove('select');element.current.classList.remove('color-p')})
// 	setMessage(null)
// 	setShowSelect(null)
// 	},[active])

// //React.useEffect(()=>{
// //	},[wrong])

// 	React.useEffect(()=>{
// 		const timer = setInterval(()=>{setCountDown(()=>countDown-1)},1000);
		
// 		if(currentPlayer.active == false){
// 			clearInterval(timer)
// 		}

// 		if (countDown <= 0){
// 			gameover.current.play()
// 			setMessage('Time Out')
// 			setWrong((prevArray)=>[...prevArray,data[active]])
// 			let gChance = chance
// 			gChance.pop()
// 			setChance(gChance)
// 			clearInterval(timer)
// 		}
// 		if(message){
// 			//setCountDown(0)
// 			clearInterval(timer)
// 		}
// 		return () => clearInterval(timer)
// 		}
// 	,[countDown])

// 	React.useEffect(()=>{
// 		let doneQuestions = correct.length + wrong.length
// 		//setScore(correct.length + '/' + doneQuestions)

// 	},[wrong,correct])

// 	if(currentPlayer.active == false){
		
// 		return (<div> <PlayerRanking game={props.game} code={props.code} /></div>)
// 	}

// 	return(
// 		<QuizBoxContext.Provider>
// 		<div class="py-4">
		
// 		<div class="row mb-1"><div class="col color-p">Question {active+1} </div>
				
// 		</div>

	
// 			<div class="row center justify-content-center">
// 			<div class='sz-24 bold rounded p-3 col-12'>{data[active].body}</div>
// 			<div class="col-12">
// 				<div class='w-100 center' style={{textAlig:'right'}}><div class='rounded sz-18  color-s  p-2 color-bd-p' style={{display:'inline-block'}}>0 : {countDown}</div> </div>
				
// 			</div>
// 			<div class="col-12">
// 				<div class="row">
// 				{data[active].options.map((x,i)=><div class='col-md-6 my-1 p-3 p-sm-2 my-sm-1' key={i} ><div id={active+x} ref={options.current[i]}  class='border rounded sz-16 p-3 color-p-hover option' style={{cursor:'pointer'}} onClick={()=>{markChoose(i);setOptionChoose(x)}}>{x}</div></div>)}
// 				</div>
// 				{showSelect && <div class="my-4 display-sm-none"><button class="btn color-bg-p color-white w-100 sz-20 color-bg-s-hover p-3" onClick={()=>checkAnswer()}>Select </button></div>}

// 				{showSelect && <div class="fixed-bottom mb-3 d-flex justify-content-end rounded p-3 display-md-none"><button class="btn color-bg-p color-white sz-20 color-bg-s-hover p-3" onClick={()=>checkAnswer()}>Select </button></div>}

// 				<p class="sz-18"> <b>Scdcore</b> :{score} </p>
// 				{message && <Message body={message} changeActive={changeActive} score={score} restartQuiz={restartQuiz} restart={showRestart} game={props.game} players={props.players} code={props.code} /> }
// 			</div>
// 			</div>
// 			<p> <button class='btn normal no-background' onClick={()=>showDetails(details == true ? false:true)}>Show Game details </button> </p>
// 			{details && <div class="row sz-12">
// 		<div class="col-6"> Host: {props.player && props.player.name}</div>
// 		<div class="col-6"> Player: {currentPlayer && currentPlayer.name}</div>
// 		<div class="col-6"> Number of Players : {props.players && props.players.length}</div>
// 		<div class="col-6"> Game Code : {props.code} </div>
// 		</div>}
// 			<audio src={clapsound} ref={clap} ></audio>
// 			<audio src={boosound} ref={boo}></audio>
// 			<audio src={gameoversound} ref={gameover} ></audio>
// 		</div>
// 		</QuizBoxContext.Provider>
// 		)
// }


function MissedOut(props){
	return(
			<div class="col" style={{textAlign:'right'}}>

				{props.chance.map(()=> <i class="fas fa-heart p-1 text-danger" ></i> )}
			</div>

		)
}

function Message(props){

	const {message, changeActive,score,restartQuiz,showRestart,nextLevel,setNextLevel,restart, questions,setShowRestart,buttonMessage,players} = React.useContext(QuizBoxContext)


React.useEffect(()=>{

},[nextLevel])

	return(
		<div class='sz-24 text-danger modal d-flex align-items-center color-bg-white' style={{transition:"all 0.5 ease",backgroundColor:"rgba(100,100,100,0.8)"}}>
		<div class="modal-dialog modal-dialog-centered w-100 h-100 p-3" styl={{transition:"all 0.5 ease",backgroundColor:"rgba(200,200,200,0.5)"}}>
		<div class="modal-content p-2 center animate__animated animate__slideInUp">
			{nextLevel && <div> </div>}
			<div class="row my-2 color-p">
			{!showRestart  && <p class='sz-30 animate__animated animate__bounce hide'>{props.body == 'Correct Answer' ? <i class="fas fa-check color-green"></i> : <i class="fas fa-times color-red"></i>} </p> }
			<div class="col">
			{message}
			</div>
			</div>

		<div class="sz-30 color-black row"> <div class="col center sz-24"><span class="color-black sz-18 black">{restartQuiz ? 'Total Score':'Your Score' } </span> <br /><b>{score}</b></div> </div>
		{questions && <p class="my-5"> <button class="btn color-bg-s color-white w-100 sz-20 color-bg-s-hover" onClick={()=>changeActive()}> {buttonMessage ? buttonMessage :'Next'} </button></p>}

		{restart && <p class="my-5 hide"><button class="btn color-bg-s color-white w-100 sz-20 color-bg-s-hover" onClick={()=>restartQuiz()}>Restart </button></p>}
		<hr />
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
		<>
		<p class="color-black"> Players Score </p>

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

		<p class="sz-16 color-black">Share this code with your Friend, to also play the game </p>
		<div clas="bold">{props.code}</div>
		
		<div class="row">
			<div class="col sz- 14"><Link class="no-decoration sz-14" href="/" >Go back Home </Link> </div>
		</div>
		</>
		)
}

export default Quiz