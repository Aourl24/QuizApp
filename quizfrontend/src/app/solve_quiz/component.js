'use client'
import React from 'react'

function QuizBox(){
	const data = [{body:'what is my name',options:['boy','girl','albino','white'],answer:'girl'},{body:'who are you',options:['awwal','yusuf','itachi','kakashi'],answer:'itachi'},{body:'who place is this',options:['ibadan','osogbo','lagos','oyo'],answer:'itachi'}]
	const [active , setActive] =  React.useState(0)
	const [message, setMessage] = React.useState(null)
	const [countDown , setCountDown] = React.useState(20)
	const options = React.useRef([])
	const [score,setScore] = React.useState(0)
	const [correct, setCorrect] = React.useState([])
	const [wrong , setWrong] = React.useState([])
	options.current = data[active].options.map((elem,i)=>options.current[i] ?? React.createRef())

	const changeActive = ()=> {
		if(active+1 >= data.length){
			setActive(active)
			setMessage('No more Questions Available')
		}
		else{
			setActive(active+1)
			setMessage(null)
			setCountDown(20)
		}
	}

	const checkAnswer = (x) =>{
		let optionBlock = options.current[x].current
		let otherOption = options.current.map((element)=>{element.current.classList.remove('color-bg-p');element.current.classList.remove('color-white')})
				optionBlock.classList.toggle('color-bg-p')
		optionBlock.classList.toggle('color-white')
		if(x == data[active].answer){
			setMessage('Correct Answer')
			setCorrect((prevArray)=>[...prevArray,data[active]])
		}
		else{
			setMessage('Wrong Answer')
			setWrong((prevArray)=>[...prevArray,data[active]])
		}
		//let timer = setTimeout(()=>changeActive(),3000)
		//return () => clearTimeout(timer)
	}

	React.useEffect(()=>{
	options.current.map((element)=>{element.current.classList.remove('color-bg-p');element.current.classList.remove('color-white')})
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
			<div>
				<p class='w-100' style={{textAlign:'right'}}><div class='rounded-circle sz-24  color-bg-p color-white p-2' style={{display:'inline-block'}}>{countDown}</div> </p>
				<p class='sz-20 bold'>{data[active].body}</p>
				<div class="row">
				{data[active].options.map((x,i)=><div class='col-md-6 my-2' key={i} ><div id={active+x} ref={options.current[i]}  class='border rounded sz-14 p-3 color-white-hover color-bg-p-hover option' style={{cursor:'pointer'}} onClick={()=>{checkAnswer(i)}}>{x}</div></div>)}
				</div>
				<p class="my-5"><button class="btn color-bg-s color-white w-100 sz-20 color-bg-s-hover" onClick={()=>changeActive()}>Select </button></p>
				<p class="sz-18"> <b>Score</b> :{score} </p>
				{message && <Message body={message} changeActive={changeActive} score={score} /> }
			</div>
		)
}


function Message(props){
	return(
		<div class='sz-24 text-danger modal d-block align-items-center'>
		<div class="color-bg-white shadow modal-dialog modal-dialog-center">
		<div class="modal-content">
			{props.body}

		<p class="sz-20 color-black"> <b>Score</b> :{props.score} </p>
		<p class="my-5"><button class="btn color-bg-s color-white w-100 sz-20 color-bg-s-hover" onClick={()=>props.changeActive()}>Next </button></p>
		</div>
		</div>
		</div>
		)
}

export default QuizBox