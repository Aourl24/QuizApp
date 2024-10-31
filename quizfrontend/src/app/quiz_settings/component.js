'use client'

import React from 'react'
import Link from 'next/link'
import {useSearchParams,useRouter} from 'next/navigation'
import axios from 'axios';
import {endpoint,host} from '../endpoints.js'
import {useAuth} from '../auth.js'

function QuizSetting(){
	const modes = [
	{
		name:'Quick Play', icon:'fas fa-user' , info:'play instant games',link:'quickplay'		
	}
]

	return(
			<div class=" container">
				<ModeList items={modes} />
			</div>
		)
}

function ModeList ({items}){
	return(
			<div class="row">
				{items.map((item)=>(
						<Link class="rounded p-5 col-md-6 center shadow-sm color-bg-white color-bg-p-hover color-white-hover no-decoration color-black" href={item.link}>
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
					))}
			</div>
		)
}

export default QuizSetting