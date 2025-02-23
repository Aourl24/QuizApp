"use client"
import React from "react"
import {QuizBox,QuizBoxContext,MissedOut , CountDown , useFetch} from '../../components.js'
import {endpoint} from "../../endpoints.js"
import axios from "axios"; 
import {useSearchParams} from "next/navigation"

export default function Main(){
	const {data,setData ,batch,setMessage,setShowRestart,setBatch,setGame,setLoader,setScorePercent,active} = React.useContext(QuizBoxContext)
	const params = useSearchParams()
	const game = params.get('game')
	setScorePercent(parseInt(params.get('score')))
	setBatch(false)


	React.useEffect(()=>{
			setLoader(false)
			// setBatch(1)
	return ()=>setLoader(true)
},[])

	return(
			<div class="container">
			<div class="row my-3 my-md-4 pb-md-3 ">
				<div class="col sz-20 bold d-none d-md-block"> <i class={params.get('icon')}></i> {params.get('name')} </div>
				<div class="col d-none hide">{active + 1} / {data.length} </div>
				<div class="col col-md-1 text-center"><CountDown number={parseInt(params.get('time'))} /> </div>
				{/*<div class="col right "> <MissedOut number={3} /> </div>*/}
			</div>

			 <QuizBox path={game ? `getgame/${parseInt(game)}/${1}` :`getgamename/${params.get('name')}/${1}`} />
			</div>
		)
}