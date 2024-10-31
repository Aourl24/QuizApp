"use client"
import React from 'react'
import axios from 'axios'
import {postData} from '../endpoints.js'
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';
import {useAuth} from '../auth.js'

function App(){
	const [login,setLogin] = React.useState(false)
	const {isAuthenticated} = useAuth()

	if(isAuthenticated){
		setLogin(true)
	}



	return(
		<div class="container">
			<div class="row justify-content-center">
			{!login ? <SignUp setlogin={setLogin} /> : <Login />}
			
			<div class="row center">
				<div class="col"> <a class="color-bg-none bg-none color-s w-100 no-decoration sz-18" style={{backgroundColor:'none',cursor:'pointer'}} onClick={()=>setLogin((prev)=>prev == false ? true:false)} > {login ? 'Sign-Up' :'Log-In'} </a> </div>
			</div>
			</div>
		</div>

		)

}


function SignUp(props){

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
				
				if(res.error){
					setMessage(res.msg)
				}
				else{
					setMessage(res.username + ' have signup successfully')
				props.setlogin(true)}
			})
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
					<div class="col"> <button onClick={()=>validateInput()} class="color-bg-p no-border rounded w-100 color-white color-bg-s-hover sz-20 p-2"> Sign-Up </button></div>
				</div>
			</div>
		)
}


function Login(props){
	const username = React.useRef()
	const password = React.useRef()
	const [login,setLogin] = React.useState(false)
	const [message,setMessage] = React.useState()
	const router = useRouter()

	const validateInput = ()=>{
		setMessage()
		if(username.current.value === "" || password.current.value === ""){
			setMessage("Input can not be Empty")
		}
		else{
			let data = {username:username.current.value,password:password.current.value}
			postData('login',data).then((res)=>{
				setMessage(res.msg);
				Cookies.set('token',res.token)
				setLogin(res.status);
			}
		).catch(()=>{setMessage("Error Login");setLogin(false)})}
	}

	React.useEffect(()=>{
		login && router.push('quiz_settings')
	},[login])

	return(
			<div class="col-md-6 col-sm">
				<div class="row my-4">
					<div class="col color-p sz-30 bold"> Login </div>
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
					<div class="col-12 py-2 sz-18"> Password </div>
					<div class="col"> <input type='password' class="form-control sz-18" ref={password} /> </div>
				</div>
				<div class="row py-4">
					<div class="col"> <button onClick={()=>validateInput()} class="color-bg-p no-border rounded w-100 color-white color-bg-s-hover sz-20 p-2"> Log-In </button></div>
				</div>
			</div>
		)
}


export default App