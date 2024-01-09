'use client'
import QuizBox from './component.js'
import { useRouter ,useSearchParams } from 'next/navigation'
import axios from 'axios'
import React from 'react'
const endpoint = 'http://127.0.0.1:8000/questionapi'

function App(){
	const router = useSearchParams()
	const data = router.get('data')
	const [items,setItems] = React.useState(null)

	const fetchData = async () =>{
		//console.log('now getting data')
		const res = await axios.get(endpoint)
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
				{items && <QuizBox time={data} items={items} />}
			</div>
			</div>
		)
}


export default App