'use client'
import QuizBox from './component.js'
import { useRouter ,useSearchParams } from 'next/navigation'

function App(){
	const router = useSearchParams()
	const data = router.get('data')

	return(
			<div> 
				<h1 class='sz-36 center'> My Quiz App </h1>
			<div class='center'>
				<QuizBox time={data} />
			</div>
			</div>
		)
}

export default App