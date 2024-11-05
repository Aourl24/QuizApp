"use client"
import React from "react"
import {QuizList,QuizBoxContext} from '../components.js'
import {endpoint} from "../endpoints.js"
import axios from "axios";
import Link from "next/link"

export default function Main(){
	const {categories,setLoader} = React.useContext(QuizBoxContext)
	const [games, setGames] = React.useState()
	const category = React.useRef(1)

	const getGames = ()=>{
		fetch(`${endpoint}getgamescat/${category.current.value}`).then((x)=>x.json()).then((x)=>setGames(x))
	}

	React.useEffect(()=>{
	setLoader(false)
	return ()=>setLoader(true)
},[])
	
	return(
			<div class="container col-md-6">
			<div class="row sz-24 center mb-5">
				<div class="col color-black"> Quick Play </div>
			</div>
				{!games &&
				<>
				<div class="row mb-3">
					<div class="col color-p sz-16"> select category </div>
				</div>

				<select class="form-control p-3 sz-14" ref={category}>
					{categories.map((cat)=>(
						<option value={cat.id}> {cat.name} </option>
						))}
				</select>
				<br />
				<div class="row sz-18">
					<div class="col center">
						<div class="rounded-3 no-border color-bg-p no-decoration p-3 color-white btn w-100" onClick={()=>getGames()} > Get Games </div>
					</div>
				</div>
				</>
				}
				{games && 
				<>
				<Games items={games} /> 
				<br />
				</>
				}
			</div>
		)
}


function Games({items}){
	return(
			<div class="row">
				{
					items.map((item)=>(
						<div class="col-sm col-md-4 p-2">
							<Link class="color-bg-s rounded-3 color-white p-4 d-block no-decoration color-bg-hover" href={{pathname:"quickplay/game",query:{category:item.id}}}> {item.title} </Link>
						</div>
					))
				}
			</div>

		)
}