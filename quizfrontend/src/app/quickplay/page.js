"use client"
import React from "react"
import {QuizList,QuizBoxContext,Instructions} from '../components.js'
import {endpoint} from "../endpoints.js"
import axios from "axios";
import Link from "next/link"
import {useSearchParams} from "next/navigation"

export default function Main(){
	const {categories,setLoader} = React.useContext(QuizBoxContext)
	const [games, setGames] = React.useState()
	const params = useSearchParams()
	const title = params.get('name')

	const getGames = ()=>{
		fetch(`${endpoint}getgamescat/${category.current.value}`).then((x)=>x.json()).then((x)=>setGames(x))
	}

	React.useEffect(()=>{
	setLoader(false)
	return ()=>setLoader(true)
},[])
	
	return(
			<div class="">
			<Instructions name={params.get('name')} title={params.get('title')} score={params.get('score')} time={params.get('time')} icon={params.get('icon')} game={params.get('game')} />
				</div>
		)
}






		// <div class="row sz-24 center mb-5">
		// 		<div class="col color-black"> Single Game </div>
		// 	</div>
		// 		{!games &&
		// 		<>
		// 		<div class="row mb-3">
		// 			<div class="col color-p sz-16"> select category </div>
		// 		</div>

		// 		<select class="form-control p-3 sz-14" ref={category}>
		// 			{categories.map((cat)=>(
		// 				<option value={cat.id}> {cat.name} </option>
		// 				))}
		// 		</select>
		// 		<br />



		// 		<div class="row sz-18">
		// 			<div class="col center">
		// 				<div class="rounded-3 no-border color-bg-p no-decoration p-3 color-white btn w-100 sz-16 color-bg-hover" onClick={()=>getGames()} > Get Games </div>
		// 			</div>
		// 		</div>
		// 		</>
		// 		}
		// 		{games && 
		// 		<>
		// 		<Games items={games} /> 
		// 		<br />
		// 		</>
		// 		}
