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
	const [showNextButton,setShowNextButton] = React.useState(true)
	const [buttonFunc,setButtonFunc] = React.useState({active:false,func:()=>{}})
	const [host , setHost] = React.useState(props.player)
	const [messageBody,setMessageBody] = React.useState()

	let nextButtonFunc;

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
		if(props.gameMode === 'versus'){

		}
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
		}

		setShowSelect(false)
		if(type)gameMissedOut(missedOut)
		
	}


	React.useEffect(()=>{
		setHost(props.player)
	},[])

	React.useEffect(()=>{
		if(data[active]) options.current = data[active].options.map((elem,i)=>options.current[i] ?? React.createRef())
	},[active])

	React.useEffect(()=>{
		getPlayer()
	},[props.players])

	React.useEffect(()=>{
		if(active != 0 ){
			options.current.map((element)=>{
				if(element.current){element.current.classList.remove('select');element.current.classList.remove('color-p')}
			})
		}

		countdown.current.play()

	},[active])


	React.useEffect(()=>{
		let doneQuestions = correct.length + wrong.length
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
			<QuizBoxContext.Provider value = {{active,data,markChoose,setOptionChoose,checkAnswer,showSelect,options,gameStatus,setGameStatus,questions,setQuestions,setMessage,message,setShowRestart,setData,level,score,setActive,setlevel,setScore,level,changeActive, nextLevel, setNextLevel,restartQuiz,setRestart,restart,showRestart,gameOver,players,setPlayers,checkAnswer,currentPlayer,buttonMessage,setButtonMessage,game:props.game,countDown,setCountDown,gameover,setWrong,hasMount,wrong,correct,mark,missedOut,setMissedOut,missedCount,setMissedCount,countdown,type,setType,setMark,showNextButton,setShowNextButton,buttonFunc,setButtonFunc,nextButtonFunc,host,saveScore,messageBody,setMessageBody}} >
			<div>
			
				<div class="col-12">
				<div class='w-100 center' style={{textAlig:'right'}}><div class='rounded-circle sz-18  color-s  p-3 color-bd-p bold border' style={{display:'inline-block'}}>{countDown}</div> </div>				
			</div>
				{props.gameMode === 'level' && <LevelQuiz countDown={countDown} game={props.game} />}
										
				{props.gameMode === 'versus' && <Multiplayer game={props.game} currentPlayer={props.currentPlayer} /> }
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
	const [answerQuestion,setAnswerQuestion] = React.useState()
	const {gameStatus,setGameStatus,setMessage,players,checkAnswer,questions,setQuestions,active,currentPlayer,showRestart,setShowRestart,score,setPlayers,game,changeActive,countDown,countdown,setWrong,setCountDown,message,hasMount,showNextButton,setShowNextButton,setButtonMessage,setMark,setButtonFunc,host,setActive,data,gameOver,gameover,setMissedCount,saveScore,messageBody,setMessageBody} = React.useContext(QuizBoxContext)
	
	let {nextButtonFunc} = React.useContext(QuizBoxContext)
	const socket = React.useRef()
	const mounted = React.useRef(false)
	const sendMessage = (e,i='main') =>{
		const body = {...e,type:i}
		const msg = JSON.stringify(body)
		console.log(msg)
	if(socket.current && socket.current.readyState === WebSocket.OPEN) 
			{ socket.current.send(msg);console.log('i just send message')
	}
	}



React.useEffect(()=>{
	setButtonFunc((prev)=>({...prev,func:()=>sendMessage({body:"I am ready",question:active},'ready')}))
},[active])

React.useEffect(()=>{
	saveScore()
	setAnswerQuestion(true)
},[checkAnswer])


	React.useEffect(()=>{

		socket.current = new WebSocket(wsEndpoint + props.game + '/' + props.currentPlayer)
		
		socket.current.onopen = ()=>{
			console.log('Websocket has opend')
			setMessage()
			setStartGame(true)
		}

		socket.current.onmessage = (message) =>{
			const data = JSON.parse(message.data)
			console.log("received data is below")
			console.log(data.message)
			if (data.message.type === 'joined'){
				setTrackPlayer(parseInt(data.users))
				if (host.name === currentPlayer.name){
					setMessage(`${data.message.body}`)
					setShowNextButton(true)
					setButtonFunc({active:true,func:()=>sendMessage({body:"Game Can Start now"},'start')})
					setButtonMessage("Click to Start")
				}

				else{
					setMessage(data.message.body)
					if(startGame){
						setShowNextButton(true)
						setButtonMessage("Return to Game")
					}
					else{
						setShowNextButton(false)
					}
				}
				setMessageBody(`${data.message.users} users has joined`)
				setMark(true)
			}

			else if(data.message.type === 'start'){
				setMessage()
				setStartGame(true)
				setShowNextButton(true)
				setMessageBody()
				setButtonFunc({active:true,func:()=>sendMessage({body:"I am ready",question:active},'ready')})
				setButtonMessage('Ready for Next Round')
				sendMessage({body:'Let the coundown started'},'countdown')
								
			}

			else if(data.message.type === 'all_ready'){
				//checkAnswer()
				setMessage()
				setShowNextButton(true)
				console.log(active)
				console.log(data.length)
				if(active >= data.length || active+1 == data.length){
					gameOver()
					setMessage("Game Over")
				}
				else{
				setActive((prev)=>prev + 1)
				sendMessage({body:'Let the coundown started'},'countdown')
				}
				setAnswerQuestion(false)
				saveScore()
				//setButtonFunc((prev)=>({...prev,func:()=>sendMessage({body:"I am ready",question:active},'ready')}))
			}

			else if(data.message.type ==='waiting_for_answer'){
				if (data.message.player === currentPlayer.name){
					setMessage(data.message.body)
					setShowNextButton(false)
				}
				else{
					setMessage(data.message.body)
					setShowNextButton(false)
				}
				setMark(true)
				setAnswerQuestion(true)
				setShowRestart(true)
			}

			else if(data.message.type === 'countdown_end'){
				
				if(!answerQuestion) {
				countdown.current.currentTime = 0
				countdown.current.pause()
				gameover.current.play()
				setMessage('Time Out')
				setMark(false)
				setShowNextButton(true)
				setWrong((prevArray)=>[...prevArray,data[active]])
				sendMessage({body:"Timeout",question:active},"timeout")}
			}
		
		}

		socket.current.onclose = () => {
			setMessage("You are disconnected")
			setButtonMessage("Reconnect")
			setButtonFunc({active:true,func:()=>{socket.current = new WebSocket(wsEndpoint + props.game + '/' + props.currentPlayer);setMessage();sendMessage({body:'start game again'},'start')}})
		}

		mounted.current = true
		countdown.current.end;
		return () =>{
			socket.current.close()
		}
		
		

	},[])

		React.useEffect(()=>{
		const timer = setInterval(()=>{setCountDown(()=>countDown-1)},1000);

		
		// if(currentPlayer.active == false){
		// 	clearInterval(timer)
		// }

		if(message){
			clearInterval(timer)
		}
		return () => clearInterval(timer)
	}
		
	,[countDown])


	React.useEffect(()=>{
		if(trackPlayer > 2){
			sendMessage({body:"Yes we can start"},'start')
		}
	},[trackPlayer])

	return(
			<div>
				 <QuizBox />
			</div>
		)
}


function LevelQuiz(props){

		const {active,gameStatus,setGameStatus,message,setMessage,questions,setQuestions,score,setShowRestart,level,setlevel,data,setData,setActive,setScore,nextLevel,setNextLevel,setRestart,gameOver,countDown,setCountDown,currentPlayer,gameover,setWrong,missedOut,setMissedOut,missedCount,setMissedCount,correct,countdown,type,setMark} = React.useContext(QuizBoxContext)
		
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
				setMessage("Quiz Ended")
				gameover()
			}
		},[])


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
			setMark(false)
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


//options.current[i]
	
function QuizBox(props){

	const {active, data, markChoose, setOptionChoose, checkAnswer, showSelect,countDown,options} = React.useContext(QuizBoxContext)	
	
	return(
		<React.Fragment >
		{data[active] &&
			<div class="row center justify-content-center">
			<div class='sz-24 bold rounded p-3 col-12'>{data[active].body}</div>
			
			<div class="col-12 my-3">
				<div class="row m-2">
				{data[active].options.map((x,i)=><div class='col-md-6 my-1 p-3 p-sm-2 my-sm-1' key={i} ><div id={active+x} ref={options.current[i]}  class=' rounded sz-18 p-4 color-p-hover option color-bg-t' style={{cursor:'pointer'}} onClick={()=>{markChoose(i);setOptionChoose(x)}}>{x}</div></div>)}
				</div>
				{showSelect && <div class="my-4 display-sm-non"><button class="no-border rounded color-bg-p color-white w-100 sz-24 color-bg-s-hover p-4" onClick={()=>checkAnswer()}>Select </button></div>}

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
	
	const {message, changeActive,score,restartQuiz,showRestart,nextLevel,setNextLevel,restart, questions,setShowRestart,buttonMessage,players,wrong,correct,mark,showNextButton,nextButtonFunc,buttonFunc,messageBody} = React.useContext(QuizBoxContext)



	return(
		<div class='sz-24 text-danger modal d-flex align-items-center color-bg-white' style={{transition:"all 0.5 ease",backgroundColor:"rgba(100,100,100,0.8)"}}>
		<div class="modal-dialog modal-dialog-centered w-100 h-100 p-3" styl={{transition:"all 0.5 ease",backgroundColor:"rgba(200,200,200,0.5)"}}>
		<div class="modal-content p-3 center animate__animated animate__slideInUp">
			{nextLevel && <div> </div>}

			{questions && 
			<div class="row my-2 color-p">
			{mark ? <><i class="fas fa-smile sz-60 hide"></i><i class="fas fa-check color-green sz-36"></i></> : <><i class="fas fa-sad-tear hide sz-60"></i> <i class="fas fa-times color-red sz-36"></i></>} 
			{!showRestart  && <p class='sz-30 animate__animated animate__bounce hide'>{props.body == 'Correct Answer' ? <i class="fas fa-check color-green"></i> : <i class="fas fa-times color-red"></i>} </p> }
			<div class="col sz-36 bold">
			{message}
			</div>
			</div>

		}
		{!questions && <div class="sz-36"> Game End </div> }

		{messageBody ? <div class="color-black"> {messageBody}</div> : <div class="sz-30 color-black row"> <div class="col center sz-24"><span class=""><span class="color-black sz-18 black ">{restartQuiz ? 'Total Score':'Your Score' } </span> <br /><b  class="sz-36">{score}</b></span></div> </div>}
		{showNextButton && questions && <p class="my-5"> <button class="no-border rounded color-bg-p color-white w-100 sz-24 color-bg-s-hover p-2" onClick={()=> buttonFunc.active ? buttonFunc.func() : changeActive()}> {buttonMessage ? buttonMessage :'Next Question'} </button></p>}

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