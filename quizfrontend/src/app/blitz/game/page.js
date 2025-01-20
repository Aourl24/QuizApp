"use client"
import React from "react";
import {QuizBoxContext,CountDown,QuizBox} from "../../components.js"
import Link from "next/link"
import { useRouter ,useSearchParams } from 'next/navigation'
import {endpoint} from "../../endpoints.js"

export default function Game(){
	const {setScorePercent,data, setData,setGame,setBatch,batch,setLoader,user} = React.useContext(QuizBoxContext)
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
		<div class="container">
			<div class="row mb-4">
				<div class="col sz-20"> Blitz Mode</div>
				<div class="col  right"><CountDown number={+time} /> </div>
			</div>

			{data && <QuizBox path={'getgamename/blitz/' + batch} /> }

			</div>



		)
}
