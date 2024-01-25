'use client'
import QuizBox from './component.js'
import { useRouter ,useSearchParams } from 'next/navigation'
import axios from 'axios'
import React from 'react'
const endpoint = 'http://127.0.0.1:8000/'

function App(){
	//const dummy = [{body:'what is my name',options:['boy','girl','albino','white'],answer:'girl'},{body:'who are you',options:['awwal','yusuf','itachi','kakashi'],answer:'itachi'},{body:'who place is this',options:['ibadan','osogbo','lagos','oyo'],answer:'oyo'}]
	//const addition = [{body:'where is cotonou',options:['benue','congo','yobe','river'],answer:'yobe'},{body:'where are we',options:['pes','yese','rona','pata'],answer:'pes'},{body:'hw far',options:['taraba','sokoto','ilesha','jos'],answer:'oyo'}]
	const router = useSearchParams()
	const game = router.get('game')
	const [players,setPlayers] = React.useState([])
	const [time,setTime] = React.useState()
	//const [] = router.get('gameType')
	const [level,setLevel] = React.useState()
	const [player,setPlayer] = React.useState() 
	const [items,setItems] = React.useState()

	const fetchData = async () =>{
		//console.log('now getting data')
		const res = await axios.get(endpoint + 'creategame/' + game)
		//console.log(res.data)
		setItems(res.data.question)
		setPlayers(res.data.players)
		setTime(res.data.time)
		setLevel(res.data.difficulty)
		setPlayer(res.data.host)
	}


		const getPlayers = async ()=>{
			const res = await axios.get(endpoint + 'game/' + game + '/players')
			setPlayers(res.data)
		}


React.useEffect(()=>{
fetchData()
//getPlayers()
},[])


	return(
			<div> 
				<h1 class='sz-36 center'> My Quiz App </h1>
			<div class='center'>
				{items && <QuizBox level={level} time={time} items={items} player={player} players={players} game={game} />}
			</div>
			</div>
		)
}


export default App