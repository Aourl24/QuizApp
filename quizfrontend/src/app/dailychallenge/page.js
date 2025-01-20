"use client"
import Link from 'next/link'
import {useSearchParams,useRouter} from 'next/navigation'
import axios from 'axios';
import {endpoint,host} from '../endpoints.js'
import {QuizBoxContext,QuizBox} from "../components.js"
import React from "react"



export default function Main(){

	const {setLoader,user} = React.useContext(QuizBoxContext)
	const [challenge , setChallenge] = React.useState()
	const [played ,setPlayed] = React.useState()
	const [ready ,setReady] = React.useState()

	React.useEffect(()=>{
		if(user){
			fetch(endpoint + 'dailychallenge/' + user.id + '/' + 'games' ).then((x)=>x.json()).then((x)=>{
			setChallenge(x.game)
			setPlayed(x.already_played)
			setLoader(false)}

			)}
		
		return ()=> setLoader(true)
	},[user])

if(!user){
		return(
			<div class="container">
				<div class="row vh-90 align-items-center">
					<div class="col center sz-18">You are not allow to view this page</div>
				</div>
			</div>
			)
	}
	
if(ready){
	return(<><DailyChallenge /> </>)
}

	return(

		<div class="container">
		<div class="row color-p mb-3"> <div class="col sz-24">
		Daily Challenge
		</div>
		</div>
		<div class="row mb-3"><div class="col"> Complete Daily Challenge and get rewards </div></div>

		{challenge && <div class="row rounded-4 align-items-center bg-warning" style={{height:'150px'}} ><div class='col center sz-18'> {challenge.title}</div> </div>
	}

		<div class="row my-3">
			<div class="col right"> 
			{played ? <span class="color-p"> <i class="fas fa-check"></i> challenge already played</span> : <button class="btn btn-primary sz-16 col-md-2" onClick={()=>setReady(true)}> Play </button>}
			</div>
		</div>
		</div>

		)
}


function DailyChallenge(){
	
	const {setBatch,user,setLoader,  setScorePercent} = React.useContext(QuizBoxContext)
	setBatch(null)
	setScorePercent(10)

	React.useEffect(()=>{
		setLoader(false)
		return ()=> setLoader(true)
	},[])

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