"use client"
import React from "react";
import {QuizBoxContext,CountDown} from "../components.js"
import Link from "next/link"

export default function Blitz(){
	const {setLoader, user} = React.useContext(QuizBoxContext)

	const categories = [{name:'15 seconds for 10 points',point:10,time:15 },{name:'10 seconds for 15 points',point:15,time:10},{name:'5 seconds for 20 points',point:20,time:5}]
	
	React.useEffect(()=>{
		setLoader(false)
		return ()=> setLoader(true)
	},[])

	if(!user){
		return(
			<div class="container">
				<div class="row vh-90 align-items-center">
					<div class="col center sz-18">You are not allow to view this page</div>
				</div>
			</div>
			)
	}

	return(
		<div class="container col-md-6">
			<div class="row sz-24 color-p center mb-5">
				<div class="col"> Blitz Mode </div>
			</div>


				
					{categories.map((cat)=>(
						<div class='row my-3 p-2'>
						<Link class="rounded-3 col shadow color-bg-white no-decoration p-4 color-p w-100 color-bg-s-hover color-white-hover" href={{pathname: "/blitz/game",query:{time:cat.time,point:cat.point}}}> {cat.name} </Link>
						</div>
						))}
				
				<br />

				<div class="row sz-18">
					<div class="col">
						
					</div>
				</div>
			</div>
		)
}