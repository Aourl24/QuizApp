"use client"
import React from 'react'
import axios from 'axios'
import {postData} from '../../endpoints.js'
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';
import {QuizBoxContext} from "../../components.js"
import Link from "next/link"

export default function SignUp(props){

	
	const router = useRouter()
	const username = React.useRef()
	const passwords = React.useRef([])
	const [message, setMessage] = React.useState()

	const validateInput = ()=>{
		if(username.current.value === ""){
			setMessage("Please enter Username")
		}
		else if(passwords.current[0].value === "" || passwords.current[1].value === ""){
			setMessage("Please Enter Password")
		}
		else if(passwords.current[0].value != passwords.current[1].value){
			setMessage('Passwords does not match')
		}
		else{
			let data = {username:username.current.value,password:passwords.current[0].value}
			postData('signup',data).then((res)=>{
				if(res){
				if(res.error){
					setMessage(res.msg)
				}
				else{
					setMessage(res.message)
				router.push("/account/login")}
			}
			else{
				setMessage("Error Signing you in")
			}}
			)
		}
	}

	const checkDifference = ()=>{
		if(passwords.current[0].value != passwords.current[1].value){
			setMessage("Password does not match")
		}
		else{
			setMessage()
		}
	}

	React.useEffect(()=>{

	},[])

	return(
		<div class="container">
		<div class="row justify-content-center">
			<div class="col-md-6 col-sm">
				<div class="row my-4">
					<div class="col color-p sz-30 bold"> Sign Up </div>
				</div>

				{message &&
				<div class="row py-4">
					<div class="col text-danger sz-18"><div class="alert alert-danger">{message}</div></div>
				</div>
				}

				<div class="row align-items-center py-4">
					<div class="col-12 sz-18 py-2"> Username </div>
					<div class="col"> <input ref={username} class="form-control sz-18" /> </div>
				</div>
				<div class="row align-items-center py-4">
					<div class="col-12 sz-18 py-2"> Password </div>
					<div class="col"> <input type='password' class="form-control sz-18" ref={el=>passwords.current[0] = el} /> </div>
				</div>

				<div class="row align-items-center py-4">
					<div class="col-12 sz-18 py-2"> Confirm Password </div>
					<div class="col"> <input type="password" class="form-control sz-18" onChange={()=>checkDifference()} ref={el=>passwords.current[1] = el} /> </div>
				</div>

				<div class="row py-4">
					<div class="col"> <button onClick={()=>validateInput()} class="color-bg-p no-border rounded-4 w-100 color-white color-bg-s-hover sz-20 p-2 py-3"> Sign-Up </button></div>
				</div>

				<div class="row border-top">
				<div class="col center p-2 py3">
				<Link href="/account/login" class="no-decoration sz-16 "> Log in </Link> 
				</div>
				</div>
			</div>
			</div>
			</div>
		)
}