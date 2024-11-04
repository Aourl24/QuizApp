'use client'

import React from 'react'
import Link from 'next/link'
import {useSearchParams,useRouter} from 'next/navigation'
import axios from 'axios';
import {endpoint,host} from '../endpoints.js'
import {QuizBoxContext} from "../components.js"

function QuizSetting(){
	const {user , setUser} = React.useContext(QuizBoxContext)

	const modes = [
	{
		name:'Quick Play', icon:'fas fa-user' , info:'play instant games',link:'quickplay'		
	}
]
	const authModes = [
	{
		name:'Quick Play', icon:'fas fa-user' , info:'play instant games',link:'/quickplay'		
	},
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

	return(
			<div class=" container">
				<ModeList items={user ? authModes : modes} />
			</div>
		)
}

function ModeList ({items}){
	return(
			<div class="row">
				{items.map((item)=>(
					<div class="col-md-6 p-md-4 p-2">
						<Link class="rounded p-5 row center shadow-sm color-bg-white color-bg-p-hover color-white-hover no-decoration color-black" href={item.link}>
							<div class="row sz-36">
								<div class="col">
									<i class={item.icon}></i>
								</div>
							</div>
							<div class='row sz-20'>
								<div class="col">
								 	{item.name} 
								</div>
							</div>
						</Link>
					</div>
					))}
			</div>
		)
}

export default QuizSetting