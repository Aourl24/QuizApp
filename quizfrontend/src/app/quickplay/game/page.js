"use client"
import React from "react"
import {QuizBox,QuizBoxContext,MissedOut , CountDown , useFetch} from '../../components.js'
import {endpoint} from "../../endpoints.js"
import axios from "axios"; 
import {useSearchParams} from "next/navigation"

export default function Main(){
	const {data,setData ,batch,setMessage,setShowRestart,setBatch,setGame,setLoader} = React.useContext(QuizBoxContext)
	//const [page, setPage] = React.useState(1)
	const params = useSearchParams()
	const category = params.get('category')
	setBatch(1)


	React.useEffect(()=>{
			setLoader(false)
	return ()=>setLoader(true)
},[])

	return(
			<div class="container">
			<div class="row">
				<div class="col sz-20"> Quick Play </div>
				<div class="col"><CountDown /> </div>
				<div class="col right"> <MissedOut number={3} /> </div>
			</div>

			{data && <QuizBox path={`getgame/${category}/${batch}`} /> }

			</div>
		)
}