// 'use client'
// import React from 'react'
// import Link from 'next/link'
// // import clapsound from './sounds/clapping.wav'
// // import boosound from './sounds/booing.wav'
// // import gameoversound from './sounds/gameover.wav'
// import axios from 'axios'
// import {endpoint, wsEndpoint,postData} from '../endpoints.js'
// // import countdownsound from '../calmtickling.mp3'
// import {useAuth} from '../auth.js'

// const QuizBoxContext = React.createContext()



// 	let setCurrentPlayer;
// 	let nextButtonFunc;

// 	const getPlayer = ()=>{
// 		let player = ''
// 		props.players.map((x)=>{
// 			if(x.name === props.currentPlayer){
// 				player = x
// 			}
// 		})

// 		console.log('player is ' + player)
// 		currentPlayer.current = player
// 	}

	


// 	// if(currentPlayer.active == false){
		
// 	// 	return (
// 	// 		<QuizBoxContext.Provider value = {{checkAnswer}}>
// 	// 		<div> 
// 	// 		<PlayerRanking game={props.game} code={props.code} />
// 	// 		</div>
// 	// 		</QuizBoxContext.Provider>
// 	// 		)
// 	// }

// 	if(!currentPlayer){
// 		return(
// 				<div class="sz-24 center my-4">You have no access to this Quiz, Join Game to Play </div>
// 			)
// 	}

// 	return(
// 			<QuizBoxContext.Provider value = {{active,data,markChoose,setOptionChoose,checkAnswer,showSelect,options,gameStatus,setGameStatus,questions,setQuestions,setMessage,message,setShowRestart,setData,level,score,setActive,setlevel,setScore,level,changeActive, nextLevel, setNextLevel,restartQuiz,setRestart,restart,showRestart,gameOver,players,setPlayers,checkAnswer,currentPlayer,buttonMessage,setButtonMessage,game:props.game,countDown,setCountDown,gameover,setWrong,hasMount,wrong,correct,mark,missedOut,setMissedOut,missedCount,setMissedCount,countdown,type,setType,setMark,showNextButton,setShowNextButton,buttonFunc,setButtonFunc,nextButtonFunc,host,saveScore,messageBody,setMessageBody,setBlockMessage,setShowMark,showMark,gameMode:props.gameMode,ready,setReady}} >
// 			<div class="container">
// 				<div class="col-12">
								
// 			</div>
// 			{blockMessage && <BlockMessage text={blockMessage} /> }
// 				{props.gameMode === 'single' && <LevelQuiz countDown={countDown} game={props.game} />}
										
// 				{props.gameMode === 'versus' && <Multiplayer game={props.game} currentPlayer={props.currentPlayer} /> }
// 				<div class="center py-3">
// 				<span class="sz-14 center rounded border inline-block p-3"> <b>Score</b> {score} </span>
// 				</div>
// 				{message && <Message game={props.game} players={props.players} code={props.code} /> }

// 				<audio src={clapsound} ref={clap} ></audio>
// 				<audio src={boosound} ref={boo}></audio>
// 				<audio src={gameoversound} ref={gameover} ></audio>
// 				<audio src={countdownsound} ref={countdown} ></audio>
// 			</div>
// 			</QuizBoxContext.Provider>
// 		)
// }



// function NotAvailable(props){
// 	return(
// 		<div class="sz-24 center">
// 			Your Request is Not Available right now, Coming Soon !!!
// 		</div>)
// }

// function Multiplayer(props){
// 	const [startGame,setStartGame] = React.useState(false)
// 	const [info , setInfo] = React.useState(20)
// 	const [trackPlayer,setTrackPlayer] = React.useState()
// 	const [answerQuestion,setAnswerQuestion] = React.useState()
// 	const {gameStatus,setGameStatus,setMessage,players,checkAnswer,questions,setQuestions,active,currentPlayer,showRestart,setShowRestart,score,setPlayers,game,changeActive,countDown,countdown,setWrong,setCountDown,message,hasMount,showNextButton,setShowNextButton,setButtonMessage,setMark,setButtonFunc,host,setActive,data,setData,setCurrentPlayer,gameOver,gameover,setMissedCount,saveScore,messageBody,setMessageBody,blockMessage,setBlockMessage,showMark,setShowMark} = React.useContext(QuizBoxContext)
// 	const timer = React.useRef()
// 	const mScore = React.useRef()
// 	let {nextButtonFunc} = React.useContext(QuizBoxContext)
// 	const socket = React.useRef()
// 	const mounted = React.useRef(false)
// 	const sendMessage = (e,i='main') =>{
// 		const body = {...e,type:i,player:currentPlayer.current,question_length:data.length}
// 		const msg = JSON.stringify(body)
// 		console.log(msg)
// 	if(socket.current && socket.current.readyState === WebSocket.OPEN) 
// 			{ socket.current.send(msg);console.log('i just send message')
// 	}
// 	}



// React.useEffect(()=>{
// 	console.log("active is " + active)
// 	if(active > data.length ){
// 		gameOver()
// 		setMessage("Game Over")
// 		}
// 	setButtonFunc((prev)=>({...prev,func:()=>sendMessage({body:"I am ready",question:active,score:mScore.current},'ready')}))
// },[active])

// React.useEffect(()=>{
// 	mScore.current = score
// 	sendMessage({body:'Save the score',score:score},'score')
// },[score])

// React.useEffect(()=>{
// 	setAnswerQuestion(true)
// },[checkAnswer])


// 	React.useEffect(()=>{

// 		socket.current = new WebSocket(wsEndpoint + props.game + '/' + props.currentPlayer)
		
// 		socket.current.onopen = ()=>{
// 			setMessage("Connection is Successful")
// 		}

// 		socket.current.onmessage = (message) =>{
// 			const response = JSON.parse(message.data)
// 			console.log("i just receive a message")
// 			console.log(response.message)
// 			if (response.message.type === 'joined'){
// 				setTrackPlayer(parseInt(response.users))
// 				if (response.message.host === currentPlayer.current.name){
// 					setShowNextButton(true)
// 					setButtonFunc({active:true,func:()=>sendMessage({body:"Game Can Start now"},'start')})
// 					setButtonMessage("Click to Start")
					
// 				}
// 				else{
// 					setShowNextButton(false)
// 				}

// 				if(response.message.player === currentPlayer.current.name){
// 					setMessage("You Joined the Room")

// 				}

// 				else{
// 					setMessage(response.message.body)
// 				}
				
				

// 				setMessageBody(`${response.message.users} user${response.message.users > 1 ? 's are' : ''}  in the room`)
// 				setShowMark(false)
// 			}

// 			else if(response.message.type === 'start'){
// 				setMessage()
// 				setStartGame(true)
// 				setShowNextButton(true)
// 				setShowRestart(true)
// 				setMessageBody()
// 				setButtonFunc({active:true,func:()=>sendMessage({body:"I am ready",question:active,score:mScore.current},'ready')})
// 				setButtonMessage('Proceed to Next Round')
// 				sendMessage({body:'Let the coundown started'},'countdown')
// 				setShowMark(true)
// 				setCountDown(20)
								
// 			}

// 			else if(response.message.type === 'all_ready'){
// 				//checkAnswer()
// 				setMessage()
// 				setShowNextButton(true)
// 				setShowMark(true)
// 				setActive((prev)=>prev + 1)
// 				sendMessage({body:'Let the coundown started'},'countdown')
// 				setCountDown(20)
// 				setAnswerQuestion(false)
// 				//sendMessage({body:'Save the score',score:score},'score')
		
// 			}

// 			else if(response.message.type ==='waiting_for_answer'){
				
// 				//if(response.message.player === currentPlayer.current.name){
// 				setMessage("Waiting for other Players to Answers")
// 				setShowNextButton(false)
// 				setMark(true)
// 				setAnswerQuestion(true)
// 				setShowRestart(true)
// 				//else{
// 					//setBlockMessage(`${response.message.player} is ready`)
// 				//}
// 			}

// 			else if(response.message.type === 'waiting_for_users'){
// 				setMessage("Players should be more than two")
// 			}

// 			else if(response.message.type === 'countdown_end'){
				
// 				if(!answerQuestion) {
// 				countdown.current.currentTime = 0
// 				countdown.current.pause()
// 				gameover.current.play()
// 				setMessage('Time Out')
// 				setMark(false)
// 				setShowNextButton(true)
// 				setWrong((prevArray)=>[...prevArray,data[active]])
// 				sendMessage({body:"Timeout",question:active},"timeout")}
// 			}

// 			else if(response.message.type === 'end'){
// 				gameOver()
// 			}
// 			else if(response.message.type === 'player_disconnect'){
// 				setBlockMessage(response.message.body)
// 			}

// 			else if(response.message.type === 'reconnect'){
// 				setBlockMessage(response.message.body)
// 				setButtonMessage('Next Round')
// 				setButtonFunc({active:true,func:()=>sendMessage({body:"I am ready",question:active,score:score},'ready')})
// 				setMessage()
// 			}
		
// 		}

// 		socket.current.onclose = () => {
// 			setMessage("You are disconnected")
// 			setMark(false)
// 			setShowNextButton(false)
// 			setMessageBody("")
// 			// setButtonMessage("Reconnect")
// 			// setButtonFunc({active:true,func:()=>{socket.current = new WebSocket(wsEndpoint + props.game + '/' + props.currentPlayer)}})
// 		}

// 		mounted.current = true
// 		countdown.current.end;
// 		//setButtonFunc((prev)=>({active:true,func:()=>sendMessage({body:"I am ready",question:active,score:score},'ready')}))

// 		return () =>{
// 			socket.current.close()
// 		}
		
		

// 	},[])



// 		React.useEffect(()=>{
// 		timer.current = setInterval(()=>{setCountDown(()=>countDown-1)},1000);

// 		if(message){
// 			clearInterval(timer.current)
// 		}
// 		return () => clearInterval(timer.current)
// 	}
		
// 	,[countDown])


// 	React.useEffect(()=>{
// 		if(trackPlayer > 2){
// 			sendMessage({body:"Yes we can start"},'start')
// 		}
// 	},[trackPlayer])

// 	return(
// 			<div>
// 				 <QuizBox />
// 			</div>
// 		)
// }


// function LevelQuiz(props){

// 		const {active,gameStatus,setGameStatus,message,setMessage,questions,setQuestions,score,setShowRestart,level,setlevel,data,setData,setActive,setScore,nextLevel,setNextLevel,setRestart,gameOver,countDown,setCountDown,currentPlayer,gameover,setWrong,missedOut,setMissedOut,missedCount,setMissedCount,correct,countdown,type,setMark} = React.useContext(QuizBoxContext)
		
// 		const [holder ,setHolder] = React.useState([])

// 		if(type) setMissedOut(3)

// 		React.useEffect(()=>{
// 			for (var i=0;i<missedOut;i++){
// 				setHolder((prev)=>[...prev,i])
// 			}
			
// 		},[missedOut])

// 		React.useEffect(()=>{
// 			if(questions){

// 			}
// 			else{
// 				setMessage("Quiz Ended")
// 				gameover()
// 			}
// 		},[])






// 		return(
// 			<div>
// 			<div class='w-100 center' style={{textAlig:'right'}}>
// 			<p class="my-2"> <b class='color-p'>Question </b>  {active+1} </p>
// 			{missedCount && <p>{holder.map((x,e)=>{
// 				if(e < missedCount.length)
// 					{return(<i class="fas fa-heart color-p p-1"></i>)}
// 				else{
// 					return(<i class="fas fa-heart p-1 passive color-silver"></i>)}
// 				})} </p>}
// 			<QuizBox />
// 			</div>

// 			</div>
// 			)
// }


// //options.current[i]
	




// function MissedOut(props){
// 	return(
// 			<div class="col" style={{textAlign:'right'}}>

// 				{props.chance.map(()=> <i class="fas fa-heart p-1 text-danger" ></i> )}
// 			</div>

// 		)
// }



// function BlockMessage(props){
// 	const body = React.useRef()

// 	React.useEffect(()=>{
// 		const timer = setTimeout(()=>body.current.classList.add('hide'),5000)
// 		return()=> clearTimeout(timer)
// 	},[])

// 	return(
// 			<div ref={body} class="color-bg-t container rounded p-2 my-2">
// 				<div class="row">
// 					<div class="col">
// 						{props.text}
// 					</div>
// 				</div>
// 			</div>
// 		)
// }

// function PlayerRanking(props){
// 	const {checkAnswer,gameMode} = React.useContext(QuizBoxContext)
// 	const [players,setPlayers] = React.useState([])
// 	const {isAuthenticated} = useAuth()


// 	// const getPlayersScore = async ()=>{
// 	// 	let res =await axios.get(endpoint + 'game/' + props.game + '/players')
// 	// 	console.log(res.data)
// 	// 	setPlayers(res.data)
// 	// }
// 	React.useEffect(()=>{
// 		//getPlayersScore()
// 	},[])
	
// 	if(gameMode === 'single'){
// 		return(
// 			<div>
// 			{!isAuthenticated && <div class="row sz-18 p-2"><div class="col center"> Create Account to Save your Progress <Link href={{pathname:"account"}}  class='no-decoration color-p color-t-hover'><br /> Create </Link> </div></div>}
			
// 			{
// 				isAuthenticated && <div class="row sz-18 p-2"> <Link href={{pathname:"account"}}  class='no-decoration color-p color-t-hover'><br /> Play Again </Link> </div>
// 			}
// 			</div>
// 			)
// 	}

// 	return(
// 		<div class="center">
// 		<p class="color-blac sz-18 bold color-s"> Players Score </p>

// 		{players.map((x)=>{
// 			return(
// 			<div class="row sz-18">
// 				<div class="col color-p">
// 					{x.name}
// 				</div>
// 				<div class="col color-black sz-16">
// 					{x.score}
// 				</div>
// 			</div>
// 			)			
// 		})}
// 		<hr />
		
// 		<div class="row">
// 			<div class="col sz- 14"><Link class="no-decoration sz-14" href="/" >Go back Home </Link> </div>
// 		</div>
// 		</div>
// 		)
// }

// export default Quiz