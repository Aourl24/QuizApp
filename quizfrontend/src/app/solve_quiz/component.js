'use client'
import React from 'react'

function QuizBox(props){
	//const data = [{body:'what is my name',options:['boy','girl','albino','white'],answer:'girl'},{body:'who are you',options:['awwal','yusuf','itachi','kakashi'],answer:'itachi'},{body:'who place is this',options:['ibadan','osogbo','lagos','oyo'],answer:'oyo'}]
	const data = props.items
	
	const time = props.time
	const [active , setActive] =  React.useState(0)
	const [message, setMessage] = React.useState(null)
	const [countDown , setCountDown] = React.useState(time)
	const options = React.useRef([])
	const [score,setScore] = React.useState(0)
	const [correct, setCorrect] = React.useState([])
	const [wrong , setWrong] = React.useState([])
	const [optionChoose , setOptionChoose] = React.useState()
	options.current = data[active].options.map((elem,i)=>options.current[i] ?? React.createRef())

	const changeActive = ()=> {
		if(active+1 >= data.length){
			setActive(active)
			setMessage('No more Questions Available')
		}
		else{
			setActive(active+1)
			setMessage(null)
			setCountDown(time)
		}
	}

	const markChoose = (x)=>{
		let optionBlock = options.current[x].current
		let otherOption = options.current.map((element)=>{element.current.classList.remove('color-bg-t');element.current.classList.remove('color-p')})
				optionBlock.classList.toggle('color-bg-t')
		optionBlock.classList.toggle('color-p')
	}

	const restart = () =>{
		setActive(0)
		setCountDown(time)
	}

	const checkAnswer = () =>{
		
		if(optionChoose == data[active].answer){
			setMessage('Correct Answer')
			setCorrect((prevArray)=>[...prevArray,data[active]])
		}
		else{
			setMessage('Wrong Answer')
			setWrong((prevArray)=>[...prevArray,data[active]])
		}
		
	}

	React.useEffect(()=>{
	options.current.map((element)=>{element.current.classList.remove('color-bg-t');element.current.classList.remove('color-p')})
	setMessage(null)
	},[active])

	React.useEffect(()=>{
		const timer = setInterval(()=>{setCountDown(()=>countDown-1)},1000);
		if (countDown <= 0){
			setMessage('Time Out')
			setWrong((prevArray)=>[...prevArray,data[active]])
			clearInterval(timer)
		}
		if(message == 'No more Questions Available'){
			setCountDown(0)
			clearInterval(timer)
		}
		return () => clearInterval(timer)
		}
	,[countDown])

	React.useEffect(()=>{
		let doneQuestions = correct.length + wrong.length
		setScore(correct.length + '/ ' + doneQuestions)
	},[wrong,correct])

	return(
		<div class="">
		<br />
		<br />
			<div class="row justify-content-center">
			<div class="col-12">
				<p class='w-100 center' style={{textAlig:'right'}}><div class='rounded sz-20  color-bg-p color-white p-2 color-bd-p' style={{display:'inline-block'}}>00 : {countDown}</div> </p>
				<p class='sz-24 bold'>{data[active].body}</p>
			</div>
			<div class="col-12">
				<div class="row">
				{data[active].options.map((x,i)=><div class='col-md-6 my-2 p-3' key={i} ><div id={active+x} ref={options.current[i]}  class='border rounded sz-16 p-3 color-p-hover option' style={{cursor:'pointer'}} onClick={()=>{markChoose(i);setOptionChoose(x)}}>{x}</div></div>)}
				</div>
				<p class="my-5"><button class="btn color-bg-s color-white w-100 sz-20 color-bg-s-hover" onClick={()=>checkAnswer()}>Select </button></p>
				<p class="sz-18"> <b>Score</b> :{score} </p>
				{message && <Message body={message} changeActive={changeActive} score={score} restart={active+1 >= data.length ? restart : null} /> }
			</div>
			</div>
		</div>
		)
}


function Message(props){
	return(
		<div class='sz-24 text-danger modal d-flex align-items-center' style={{transition:"all 0.5 ease",backgroundColor:"rgba(100,100,100,0.5)"}}>
		<div class="color-bg-white shadow modal-dialog modal-dialog-centered w-25 h-25 p-3">
		<div class="modal-content p-2">
			<div class="row my-2">
			<div class="col">
			{props.body}
			</div>
			</div>

		<div class="sz-24 color-black row"> <div class="col center"><b class="sz-20">Score </b> <br />{props.score}</div> </div>
		<p class="my-5"><button class="btn color-bg-s color-white w-100 sz-20 color-bg-s-hover" onClick={()=>props.changeActive()}>Next </button></p>
		{props.restart && <p class="my-5"><button class="btn color-bg-s color-white w-100 sz-20 color-bg-s-hover" onClick={()=>props.restart()}>Restart </button></p>}
		</div>
		</div>
		</div>
		)
}

export default QuizBox