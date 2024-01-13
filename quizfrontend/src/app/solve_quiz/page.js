'use client'
import QuizBox from './component.js'
import { useRouter ,useSearchParams } from 'next/navigation'
import axios from 'axios'
import React from 'react'
const endpoint = 'http://127.0.0.1:8000/questionapi'

function App(){
	const dummy = [{body:'what is my name',options:['boy','girl','albino','white'],answer:'girl'},{body:'who are you',options:['awwal','yusuf','itachi','kakashi'],answer:'itachi'},{body:'who place is this',options:['ibadan','osogbo','lagos','oyo'],answer:'oyo'}]
	const addition = [{body:'where is cotonou',options:['benue','congo','yobe','river'],answer:'yobe'},{body:'where are we',options:['pes','yese','rona','pata'],answer:'pes'},{body:'hw far',options:['taraba','sokoto','ilesha','jos'],answer:'oyo'}]
	const router = useSearchParams()
	const data = router.get('data')
	const gameType = router.get('gameType')
	const level = router.get('level')
	const [items,setItems] = React.useState([...dummy,...addition])

	const fetchData = async () =>{
		//console.log('now getting data')
		const res = await axios.get(endpoint + '/' + gameType + '/' + level)
		//console.log(res.data)
		setItems(res.data)
	}

React.useEffect(()=>{
fetchData()
},[])
// async function getServerSideProps(context){
// 	const res = await axios.get(endpoint);
// 	const response = res.data
// 	return {
// 		props: {
// 			response ,
// 		}
// 	};

// }
	return(
			<div> 
				<h1 class='sz-36 center'> My Quiz App </h1>
			<div class='center'>
				{items && <QuizBox level={level} gameType={gameType} time={data} items={items} />}
			</div>
			</div>
		)
}


export default App