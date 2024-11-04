"use client"
import React from "react";
import {QuizBoxContext,CountDown,QuizBox} from "../../components.js"
import Link from "next/link"
import { useRouter ,useSearchParams } from 'next/navigation'
import {endpoint} from "../../endpoints.js"

export default function Game(){
	const {setScorePercent,data, setData,setGame,setBatch,batch} = React.useContext(QuizBoxContext)
	const router = useSearchParams()
	const point  = router.get('point')
	const time = router.get('time')
	setScorePercent(+point)
	setBatch(1)

	React.useEffect(()=>{
		fetch(endpoint + 'blitz').then((x)=>x.json()).then((x)=>{
			setData(x.questions)
			setGame(x.game)
		})

	},[])

	return(
		<div class="container">
			<div class="row">
				<div class="col sz-20"> Blitz Mode</div>
				<div class="col"><CountDown number={+time} /> </div>
			</div>

			{data && <QuizBox path={'blitz/' + batch} /> }

			</div>



		)
}
