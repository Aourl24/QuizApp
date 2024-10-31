"use client"
import React from 'react';
import {endpoint,host,postData} from '../endpoints.js'

export default function App(p){

	const [titlePage,setTitlePage] = React.useState()
	const [message, setMessage] = React.useState()

	React.useEffect(()=>{
	},[])

	
	return(
			<div class="container">
			{message && 
			<div class="row">
				<div class="col">
					<div class="alert alert-danger">{message} </div>
				</div>
			</div>
			}
				{!titlePage ? <TitlePage title={titlePage} setTitlePage={setTitlePage} message={message} setMessage={setMessage} /> : <QuestionPage title={titlePage} setMessage={setMessage} />}
			</div>
			)

	

}


const QuestionPage = (props)=>{
	const body = React.useRef()
	const [game,setGame] = React.useState()
	const option = React.useRef([React.useRef(),React.useRef(),React.useRef(),React.useRef()])
	const [answer,setAnswer] = React.useState() 

	const saveQuestion = () =>{
		let opt= option.current.map((x)=> {body:x.current.value})

		let data = {game:game ? game.id : 0 ,question:body.current.value,options:opt,title:props.title}
		let request = postData('createquestion',data).then((response)=>{props.setMessage(response.message);setGame(response.game)}).catch((error)=>props.setMessage('Error Saving Game'))
	}

	return(
			<>
			<div class="row sz-30 color-p"><div class="col"> {props.title} </div> </div>
			<br />

			

			<div class="row">
				<div class="col">
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
						{option.current.map((x)=>{
							return(
							<div class="col-md-6 col-sm my-2">
								<input class="form-control p-3" ref={x} />
								answer <input type='checkbox' />
							</div>
							)
						})}
						
					</div>
				</div>
			</div>

			<br />

			<div class="row">
				<div class="col">
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

	const title = React.useRef()

	const checkTitle = ()=>{
		if(!title.current.value){
			props.setMessage("Please enter a title")
		}
		else{
			props.setMessage("")
			props.setTitlePage(title.current.value)
		}
	}

	return(
		<div class="container">
			<div class="row">
				<div class="col-12 py-2 sz-24">
					Title 
				</div>
				<div class="col">
					<input class="form-control p-3" ref={title} />
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