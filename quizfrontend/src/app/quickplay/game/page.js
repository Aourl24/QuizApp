"use client"
import React from "react"
import {QuizBox,QuizBoxContext} from '../../components.js'
import {endpoint} from "../../endpoints.js"
import axios from "axios"; 

export default function Main(){
	const {data,setData} = React.useContext(QuizBoxContext)

	const fetchData = ()=>{
		fetch(endpoint + 'quickplay/' + 'General Study').then(x=>x.json()).then(x=>{
			setData(x);console.log(x)})
	}

	React.useEffect(()=>{
		fetchData()
	},[])

	return(
			<>
			{data && <QuizBox data={data} /> }
			</>
		)
}