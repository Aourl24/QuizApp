'use client'
import React from 'react'
import Link from 'next/link'
import {useSearchParams,useRouter} from 'next/navigation'
import axios from 'axios';
import {endpoint,host} from '../endpoints.js'
import {QuizBoxContext} from "../components.js"
import Loader from "../loader.js"

function QuizSetting(){
	const {user , setUser,setAlert , setLoader} = React.useContext(QuizBoxContext)

// 	const modes = [
// 	{
// 		name:'Quick Play', icon:'fas fa-user' , info:'play instant games',link:'quickplay'		
// 	}
// ]
	const modes = [
	{
		name:"Daily Challenge",icon:"fas fa-calendar-check", link:'/dailychallenge'
	},
		{
		name:"Blitz Mode",icon:"fas fa-bolt", link:'/blitz'
	},
	{
		name:"Survival Mode",icon:"fas fa-heartbeat", link:'/survival'
	},
	{
		name:"Leader Board",icon:"fas fa-chart-line", link:'/leaderboards'
	}
]

React.useEffect(()=>{
	setLoader(false)
	return ()=>setLoader(true)
},[])

	return(
			<div class="container">


			<div class="row p-2">

				<div class="col-md-6 p-md-4 p-2">
				<Link class="rounded p-5 row center shadow-sm color-bg-white color-bg-hover color-white-hover no-decoration color-black" href={"/quickplay"}>
							<div class="row sz-36">
								<div class="col color-p">
									<i class="fas fa-user"></i>
								</div>
							</div>
							<div class='row sz-20'>
								<div class="col">
								 	Quick Play
								</div>
							</div>
						</Link>
					</div>

				{modes.map((item)=>(
					<div class="col-md-6 p-md-4 p-2">
						{user ?
						<Link class="rounded p-5 row center shadow-sm color-bg-white color-bg-hover color-white-hover no-decoration color-black" href={item.link}>
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
						</Link> :
						<div class="rounded p-5 row center shadow-sm color-bg-white color-bg-hover color-white-hover no-decoration color-black pointer-cursor" onClick={()=>setAlert("This Mode is restricted to Unauthenticated User")}>
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
						</div>

						}

					</div>
					))}
			</div>
			</div>
		)
}

export default QuizSetting