"use client"
import React from "react"
import {QuizList,QuizBoxContext} from '../components.js'
import {endpoint} from "../endpoints.js"
import axios from "axios";
import Link from "next/link"

export default function Main(){
	const {categories} = React.useContext(QuizBoxContext)
	return(
			<div class="container col-md-6">
			<div class="row sz-24 color-p center mb-5">
				<div class="col"> Quick Play </div>
			</div>

				<div class="row mb-3">
					<div class="col color-p"> *select category </div>
				</div>

				<select class="row form-control p-3 sz-14">
					{categories.map((cat)=>(
						<option value={cat.name}> {cat.name} </option>
						))}
				</select>
				<br />

				<div class="row sz-18">
					<div class="col">
						<Link class="rounded-3 no-border color-bg-p no-decoration p-3 color-white w-100" href="quickplay/game"> start game </Link>
					</div>
				</div>
			</div>
		)
}