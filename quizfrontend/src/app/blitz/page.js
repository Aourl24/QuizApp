"use client"
import React from "react";
import {QuizBoxContext,CountDown} from "../components.js"
import Link from "next/link"

export default function Blitz(){
	const categories = [{name:'20 seconds for 5 points',point:5,time:20},{name:'15 seconds for 10 points',point:10,time:15 },{name:'10 seconds for 15 points',point:15,time:10},{name:'5 seconds for 20 points',point:20,time:5}]
	return(
		<div class="container col-md-6">
			<div class="row sz-24 color-p center mb-5">
				<div class="col"> Blitz Mode </div>
			</div>

				<div class="row mb-3">
					<div class="col color-black"> *select type </div>
				</div>

				
					{categories.map((cat)=>(
						<div class='row my-3 p-2'>
						<Link class="rounded-3 col colr-bg-white no-decoration p-3 color-p w-100 color-bg-s-hover color-white-hover border" href={{pathname: "/blitz/game",query:{time:cat.time,point:cat.point}}}> {cat.name} </Link>
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