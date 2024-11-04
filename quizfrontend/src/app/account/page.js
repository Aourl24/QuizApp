"use client"
import React from 'react'
import axios from 'axios'
import {postData} from '../endpoints.js'
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';

function App(){
	const [login,setLogin] = React.useState(false)
	

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








export default App