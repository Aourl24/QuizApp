"use client"
import React from 'react'
import axios from 'axios'
import {postData} from '../../endpoints.js'
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';
import {QuizBoxContext} from "../../components.js"
import Link from "next/link"

export default function Login(props){
	const {user,setUser,setLoader} = React.useContext(QuizBoxContext)
	const username = React.useRef()
	const password = React.useRef()
	const [login,setLogin] = React.useState(false)
	const [message,setMessage] = React.useState()
	const router = useRouter()

	const validateInput = ()=>{
		setMessage()
		setLoader(true)
		if(username.current.value === "" || password.current.value === ""){
			setMessage("Input can not be Empty")
		}
		else{
			let data = {username:username.current.value,password:password.current.value}
			postData('login',data).then((res)=>{
				setMessage(res.msg);
				setLogin(res.status)
				if(res.user){
					Cookies.set('token',res.token)
					setUser(res.user)
				}
			}
		).catch(()=>{
			setMessage("Error Logging In");setLogin(false)
			
		})}
	}

	React.useEffect(()=>{
		login && router.push('/quiz_settings')
	},[login])

	React.useEffect(()=>{
		Cookies.remove('token')
	},[])

	React.useEffect(()=>{
		setLoader(false)
	},[message])

	React.useEffect(()=>{
			setLoader(false)
	return ()=>setLoader(true)
},[])


	return(
		<div class="container">
		<div class="row justify-content-center">

			<div class="col-md-6 col-sm">
				<div class="row my-4">
					<div class="col color-p sz-30 bold"> Login </div>
				</div>
				
				{message &&
				<div class="row py-4">
					<div class="col text-danger sz-18"><div class="alert alert-danger">{message}</div></div>
				</div>
				}

				<div class="row align-items-center py-3">
					<div class="col-12 sz-18 pb-4"> Username </div>
					<div class="col"> <input ref={username} class="form-control sz-18 p-3" /> </div>
				</div>
				<div class="row align-items-center py-3">
					<div class="col-12 pb-4 sz-18"> Password </div>
					<div class="col"> <input type='password' class="form-control sz-18 p-3" ref={password} /> </div>
				</div>
				<div class="row py-4">
					<div class="col"> <button onClick={()=>validateInput()} class="color-bg-p no-border rounded-4 w-100 color-white color-bg-s-hover sz-20 p-2 py-3"> Log-In </button></div>
				</div>
				<div class="row border-top">
				<div class="col center p-2 py3">
				<Link href="/account/signup" class="no-decoration sz-16 "> Sign Up </Link> 
				</div>
				</div>

			</div>
		</div>
		</div>
		)
}