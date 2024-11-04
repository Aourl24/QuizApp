"use client"
import Link from 'next/link'
import {useSearchParams,useRouter} from 'next/navigation'
import axios from 'axios';
import {endpoint,host} from '../endpoints.js'
import {QuizBoxContext,QuizBox} from "../components.js"
import React from "react"

export default function DailyChallenge(){
	
	const {setBatch,user} = React.useContext(QuizBoxContext)
	setBatch(null)

	return(
			<div class="container">
			<div class="row">
				<div class="col sz-20"> Daily Challenge </div>
				<div class="col right"> </div>
			</div>

			{user && <QuizBox path={'dailychallenge/' + user.id} /> }

			</div>
		)
}