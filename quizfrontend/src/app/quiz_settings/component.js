'use client'
import React from 'react'
import Link from 'next/link'
import {useSearchParams,useRouter} from 'next/navigation'
import axios from 'axios';
import {endpoint,host} from '../endpoints.js'
import {QuizBoxContext} from "../components.js"


function QuizSetting(){
	const {user , setUser,setAlert , setLoader} = React.useContext(QuizBoxContext)
	const [modes, setModes] = React.useState()

React.useEffect(()=>{
	fetch(`${endpoint}${user ? 'getmodes/'+user.id : 'getmodes'}`).then((x)=>x.json()).then((x)=>setModes(x))
},[user])

React.useEffect(()=>{
	setLoader(false)
	return ()=>setLoader(true)
},[])

	return(
			<div class="container p-1">


			<div class="row p-2">

				

				{modes?.map((item)=>(
					<div class="col-md-6 p-md-4 p-2 ">
						{!item.locked ?
						<Link class="rounded p-5 row center shadow color-bg-white color-bg-hover color-white-hover no-decoration color-black" href={{pathname:'/quickplay',query:item}}>
						<div class="col">	
							<div class="row sz-36">
								<div class="col color-p">
									<i class={item.icon}></i>
								</div>
							</div>
							<div class='row sz-20'>
								<div class="col">
								 	{item.name} 
								</div>
							</div>
							<div class="row sz-12 mt-5 p-0">
								<div class="col right text-danger p-0">
								<span class="bg-success p-2 rounded-3 color-white"> open <i class="fas fa-bolt"></i> </span>
								</div>
							</div>
						</div>
						</Link> :
						<div class="rounded p-5 row center shadow color-bg-white color-bg-hover color-white-hover no-decoration color-black pointer-cursor" onClick={()=>setAlert("You don't have access to this Mode")}>
							<div class="col">
							<div class="row sz-36">
								<div class="col color-p">
									<i class={item.icon}></i>
								</div>
							</div>
							<div class='row sz-20'>
								<div class="col">
								 	{item.name} 
								</div>
							</div>
							<div class="row sz-12 mt-5 p-0">
								<div class="col right text-danger p-0">

								<span class="bg-danger p-2 rounded-3 color-white"> Locked <i class="fas fa-lock"></i> </span>
								 </div>
							</div>
							</div>
						</div>

						}

					</div>
					))}
			</div>
			</div>
		)
}

export default QuizSetting