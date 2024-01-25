'use client'
import React from 'react'
import clapsound from './sounds/clapping.wav'
import boosound from './sounds/booing.wav'
import gameoversound from './sounds/gameover.wav'
import axios from 'axios'

const endpoint = 'http://127.0.0.1:8000/'

function QuizBox(props){
	
	const data = props.items
	const time = props.time
	const options = React.useRef([])
	const clap = React.useRef()
	const boo = React.useRef()
	const gameover = React.useRef()

	const [active , setActive] =  React.useState(0)
	const [message, setMessage] = React.useState(null)
	const [countDown , setCountDown] = React.useState(time)
	const [score,setScore] = React.useState(0)
	const [correct, setCorrect] = React.useState([])
	const [wrong , setWrong] = React.useState([])
	const [optionChoose , setOptionChoose] = React.useState()
	const [showRestart,setShowRestart] = React.useState(null)
	const [showSelect,setShowSelect] = React.useState(null)
	const [chance,setChance] = React.useState([1,2,3])
	options.current = data[active].options.map((elem,i)=>options.current[i] ?? React.createRef())

	const getPlayer = ()=>{
		let player = ''
		props.players.map((x)=>{
			if(x.id == props.player){
				player = x
			}
		})
		return player.name
	}

	const changeActive = ()=> {
		if(active > data.length){
			//setActive(active)
			//setMessage('Game Over')
			gameOver()
		}
		else if(active+1 == data.length){
			setActive(active)
			gameOver()
		}
		else{
			setActive(active+1)
			setMessage(null)
			setCountDown(time)
		}
		clap.current.currentTime = 0
		boo.current.currentTime = 0
		gameover.current.currentTime = 0
		clap.current.pause()
		boo.current.pause()
		gameover.current.pause()
	
	}

	const threeMissedOut = () =>{
		if(chance.length == 0){
			gameOver()
		}
	}

	const calculateScore = () =>{
	  let scoreCalculate = 30/(+props.time)
	  setScore((scoreCalculate*10)+score)	
	}

	const saveScore = async ()=>{
		const res = await axios.get(endpoint + 'save/' + props.player +'/'+ score)
		console.log(res.data)
	}

	const gameOver = () =>{
		//setActive(active)
		setMessage('Quiz Ended')
		gameover.current.play()
		saveScore()
		setShowRestart(true)
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
			boo.current.play()
			let gChance = chance
			gChance.pop()
			setChance(gChance)
		}
		threeMissedOut()
		
	}


	React.useEffect(()=>{
	options.current.map((element)=>{element.current.classList.remove('select');element.current.classList.remove('color-p')})
	setMessage(null)
	setShowSelect(null)
	},[active])

//React.useEffect(()=>{
//	},[wrong])

	React.useEffect(()=>{
		const timer = setInterval(()=>{setCountDown(()=>countDown-1)},1000);
		if (countDown <= 0){
			gameover.current.play()
			setMessage('Time Out')
			setWrong((prevArray)=>[...prevArray,data[active]])
			let gChance = chance
			gChance.pop()
			setChance(gChance)
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

	return(
		<div class="">
		<p> Player: {props.player && getPlayer()}</p>
		<p> Players : {props.players && props.players.length}</p>
		<div class="" style={{textAlign:'right'}}>

			{chance.map(()=> <i class="fas fa-heart p-1 text-danger" ></i> )}</div>
		
		<div class="row mb-1"><div class="col color-p">Question {active+1} </div></div>
			<div class="row justify-content-center">
			<div class='sz-24 bold rounded p-3 col-12'>{data[active].body}</div>
			<div class="col-12">
				<div class='w-100 center' style={{textAlig:'right'}}><div class='rounded sz-18  color-s  p-2 color-bd-p' style={{display:'inline-block'}}>0 : {countDown}</div> </div>
				
			</div>
			<div class="col-12">
				<div class="row">
				{data[active].options.map((x,i)=><div class='col-md-6 my-1 p-3 p-sm-2 my-sm-1' key={i} ><div id={active+x} ref={options.current[i]}  class='border rounded sz-16 p-3 color-p-hover option' style={{cursor:'pointer'}} onClick={()=>{markChoose(i);setOptionChoose(x)}}>{x}</div></div>)}
				</div>
				{showSelect && <div class="my-4"><button class="btn color-bg-p color-white w-100 sz-20 color-bg-s-hover p-3" onClick={()=>checkAnswer()}>Select </button></div>}

				<p class="sz-18"> <b>Score</b> :{score} </p>
				{message && <Message body={message} changeActive={changeActive} score={score} restartQuiz={restartQuiz} restart={showRestart} game={props.game} players={props.players}/> }
			</div>
			</div>
			<audio src={clapsound} ref={clap} ></audio>
			<audio src={boosound} ref={boo}></audio>
			<audio src={gameoversound} ref={gameover} ></audio>
		</div>
		)
}


function Message(props){


	return(
		<div class='sz-24 text-danger modal d-flex align-items-center color-bg-white' style={{transition:"all 0.5 ease",backgroundColor:"rgba(100,100,100,0.8)"}}>
		<div class="modal-dialog modal-dialog-centered w-100 h-100 p-3" styl={{transition:"all 0.5 ease",backgroundColor:"rgba(200,200,200,0.5)"}}>
		<div class="modal-content p-2">
			<div class="row my-2">
			{!props.restart  && <p class='sz-30 animate__animated animate__bounce'>{props.body == 'Correct Answer' ? <i class="fas fa-check color-green"></i> : <i class="fas fa-times color-red"></i>} </p> }
			<div class="col">
			{props.body}
			</div>
			</div>

		<div class="sz-30 color-black row"> <div class="col center sz-24"><span class="color-p sz-18">{props.restart ? 'Final Score':'Your Score' } </span> <br /><b>{props.score}</b></div> </div>
		{!props.restart && <p class="my-5"> <button class="btn color-bg-s color-white w-100 sz-20 color-bg-s-hover" onClick={()=>props.changeActive()}>Next </button></p>}

		{props.restart && <p class="my-5 hide"><button class="btn color-bg-s color-white w-100 sz-20 color-bg-s-hover" onClick={()=>props.restartQuiz()}>Restart </button></p>}
		{props.restart && <PlayerRanking game={props.game} /> }
		</div>
		</div>
		
		</div>
		)
}

function PlayerRanking(props){
	const [players,setPlayers] = React.useState([])

	const getPlayersScore = async ()=>{
		let res =await axios.get(endpoint + 'game/' + props.game + '/players')
		setPlayers(res.data)
	}
	getPlayersScore()

	return(
		<>
		<p> Players Score </p>

		{players.map((x)=>{
			return(
			<div class="row">
				<div class="col">
					{x.name}
				</div>
				<div class="col">
					{x.score}
				</div>
			</div>
			)			
		})}
		</>
		)
}

export default QuizBox