"use client"
import React from 'react';
import axios from 'axios';
import {endpoint,host,postData} from '../endpoints.js'
import {QuizBoxContext} from '../components.js'

export default function App(p){
	const {setLoader} = React.useContext(QuizBoxContext)
	const [titlePage,setTitlePage] = React.useState()
	const [message, setMessage] = React.useState()
	const [mode ,setMode] = React.useState()
	const [uploadMode,setUploadMode] = React.useState()

	React.useEffect(()=>{
		setLoader(false)
		return ()=>setLoader(true)
	},[])

	
	return(
			<div class="container p-1 justify-content-center col-md-6">
			{message && 
			<div class="row my-2">
				<div class="col">
					<div class="alert alert-danger">{message} </div>
				</div>
			</div>
			}
			<br />
				{!titlePage ? <TitlePage title={titlePage} setTitlePage={setTitlePage} setMode={setMode} message={message} setMessage={setMessage} setUploadMode={setUploadMode} /> : <QuestionPage title={titlePage} setMessage={setMessage} setLoader={setLoader} mode={mode} uploadMode={uploadMode} />}
			
			<br />
			<br />
			<br />
			</div>
			)

	

}



const QuestionPage = (props)=>{
	const body = React.useRef()
	const [game,setGame] = React.useState()
	const option = React.useRef([])
	const answer = React.useRef() 
	const [message,setMessage] = React.useState()
	const jsonFormat = React.useRef()

	const saveQuestion = () =>{

		if(!body.current.value){
			setMessage("Empty body")
			
		}
		else if(option.current.filter((x)=>x.value === "").length){

			setMessage(`Please provide complete options!`)
			
		}
		else if(answer.current.value === ""){
			setMessage("Please Choose an Answer")
			
		}
		else{
			setMessage("saving...")
			let opt= option.current.map((x,e)=>({body:x.value,answer: parseInt(answer.current.value) === e ? true : false }))
			let data = {game:game ? game.id : 0 ,question:body.current.value,options:opt,title:props.title,mode:props.mode}
			save(data)
		}
	}

	const sortJson = ()=>{
		// console.log(jsonFormat.current.value)
		try{
		const process = JSON.parse(jsonFormat.current.value)
		
		for(let i of process){
			console.log(i)
			if(i.question && i.options && i.title){
				data = {game:game ? game.id : 0 ,question:i.question,options:i.option,title:i.title,mode:props.mode}
				props.setMessage("saving questions " + i.body)
				save(data)

			}
			else{
				props.setMessage("Invalid Json format")
			}
		}
		}
		catch(error){
			console.log(error)
			props.setMessage(error.toString())
		}

	}

	const save = (data)=>{
		let request = postData('createquestion',data).then((response)=>{
				setMessage(response?.message)
				setGame(response?.data)
				body.current.value = ''
				option.current.map((x)=>x.value="")
				answer.current.value = ''
				}).catch((error)=>props.setMessage(error.toString()))
	}

	if(props.uploadMode === "Json Mode"){
		return(
				<div>
					<div class="row">
						<div class="col">
							<textarea ref={jsonFormat} class="form-control vh-70"> </textarea>
						</div>
					</div>
					<div class="row">
						<div class="col">
					<button class="p-3 rounded color-bg-p color-white no-border w-100" onClick={()=>sortJson()} > Save </button>
				</div>
					</div>
				</div>
			)
	}

	return(
			<>
			<div class="row sz-30 color-p"><div class="col"> {props.title} </div> </div>
			<br />
			{message && <div class="row">
							<div class="col alert alert-primary"> {message} </div>
						</div>}

			<div class="row">
				<div class="col sz-20 bold">
					Question {game ? game.question.length + 1 : 1}
				</div>
			</div>
			
			<br />

			<div class="row">
				<div class="col-12 py-2">
					Body
				</div>
				<div class="col">
					<input class="form-control p-3" ref={body} />
				</div>
			</div>

			<br />

			<div class="row">
				<div class="col-12 py-2">
					Options
				</div>
				<div class="col">
					<div class="row">
						{Array(4).fill().map((x,e)=>{
							return(
							<div class="col-md-6 col-sm my-2">
								{e}. <input class="form-control p-3" ref={el=>option.current[e]=el} />
							</div>
							)
						})}
						
					</div>
				</div>
			</div>

			<br />
			<div class="row">
				<div class="col-12 py-2">
					Choose Answer
				</div>
				<div class="col">
					<select ref={answer} class="form-control">
						<option value=""> None </option>
						{Array(4).fill().map((x,e)=><option value={e}> {e} </option>)}
					</select>
				</div>
			</div>
			<br />

			<div class="row">
				<div class="col d-none">
					<button class="p-3 rounded color-bg-s color-white no-border w-100"> Save and add another </button>
				</div>
				<div class="col">
					<button class="p-3 rounded color-bg-p color-white no-border w-100" onClick={()=>saveQuestion()} > Save </button>
				</div>
			</div>
			</>
		)
}


const TitlePage = (props)=>{

	const mode = React.useRef()
	const [modes , setModes] =React.useState([])
	const title = React.useRef()
	const uploadMode = React.useRef()

	const checkTitle = ()=>{
		if(!title.current.value){
			props.setMessage("Please enter a title")
		}
		else{
			props.setMessage("")
			props.setTitlePage(title.current.value)
			props.setMode(mode.current.value)
			props.setUploadMode(uploadMode.current.value)
		}
	}

	React.useEffect(()=>{
	fetch(`${endpoint}getmodes`).then((x)=>x.json()).then((x)=>setModes(x))
	},[])

	return(
		<div class="container">
			<div class="row">
				<div class="col-12 py-2 sz-20">
					Mode 
				</div>
				<div class="col">
					<select ref={mode} class="form-control">
						{modes.map((x)=><option value={x.id}> {x.name}</option>)}
					</select>
				</div>
			</div>
			<br />
			<div class="row">
				<div class="col-12 py-2 sz-20">
					Title 
				</div>
				<div class="col">
					<input class="form-control" ref={title} />
				</div>
			</div>

			<br />
			<div class="row">
				<div class="col-12 py-2 sz-20">
					Upload Mode 
				</div>
				<div class="col">
					<select class="form-control" ref={uploadMode}>
						<option value="Input Mode"> Input Mode </option>
						<option value="Json Mode"> Json Mode </option>
					</select>
				</div>
			</div>
			<br />
			<div class="row">
				<div class="col">
					<button class="p-3 rounded color-bg-s color-white no-border w-100" onClick={()=>checkTitle()}> Next </button>
				</div>
			</div>

			<br />
			
		</div>
		)
}