"use client"
import React from "react"
import {MissedOut,QuizBox , QuizBoxContext} from "../components.js"

export default function Survival(){
	const {setBatch,batch,setLoader} = React.useContext(QuizBoxContext)
	setBatch(1)

	React.useEffect(()=>{
		setLoader(false)
		return ()=> setLoader(true)
	},[])

	return(
			<div>
			<div class="row my-3">
				<div class="col center"> <MissedOut number={1} /></div>
			</div>

				<QuizBox path={'getgamename/survival/' + batch} />
			</div>
		)
}

