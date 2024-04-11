'use client'

import React from 'react'
import Link from 'next/link'
import {useSearchParams,useRouter} from 'next/navigation'
import axios from 'axios';
import {endpoint} from '../endpoints.js'
import {useAuth} from '../auth.js'

const QuizContext = React.createContext()


function QuizSetting(){
		const guestModes = [
		{
			id: 1, title:'Guest Mode',info:'Play in Guest Mode'},
			{id: 2 ,title:'Sign up',info:'Create Account to save your progress'},
			{id:10,title:"Enter Game Code",info:"Enter a Game Code"}
			]

		const authModes = [
			{id: 3 ,title:'Single Mode',info:'Play single Games'},
			{id: 4 ,title:'Multi-Player',info:'Play with friends'},
			{id : 5,title:'Challenge Mode',info:'Players compete in head-to-head matches'},
			{id:6,title:'Team Mode',info:'Players form teams to collaborate and answer questions collectively'},
			{id:7,title:'Survival Mode',info:'players strive to answer questions correctly to avoid elimination, with each incorrect answers resulting in a loss of life or points'}, 
			{id:8,title:"Tournament Mode",info:'Organize a series of matches or rounds with the winner determined based on overall performance throughout the Tournament'},
			{id:9,title:"Customize Mode",info:'Lets players tailor game parameters such as question,categories,difficulty levels and scoring mechanics to suit their preference'}
			]

	
	const [gameModes , setGameModes] = React.useState([{}])
	const router = useSearchParams()
	const fromLink = router.get('link')
	const [choice,setChoice] = React.useState({id:fromLink ? 10 : 0})
	const {isAuthenticated,user} = useAuth()

	const [time,setTime] = React.useState(20)
	const [ready,setReady] = React.useState(false)
	const [type,setType] = React.useState(0)
	const [level,setLevel] = React.useState(1)
	const [link,setLink] = React.useState('')
	const [game,setGame] = React.useState()
	const [player,setPlayer] = React.useState(isAuthenticated && user.username) //host
	const [gameCode, setGameCode] = React.useState()
	const [category,setCategory] = React.useState([])
	const [message,setMessage] = React.useState()
	const [choosenCategory,setChoosenCategory] = React.useState()
	const [questionNumber,setQuestionNumber] = React.useState(20)
	const [currentPlayer,setCurrentPlayer] = React.useState()
	const [gameMode,setGameMode] = React.useState()
	const [create,setCreate] = React.useState(false)
	const [loading , setLoading] = React.useState(false)

	const clickChoice = (x)=>{
		setChoice(...gameModes.filter((i)=> i.id === x ))
	}

	const getCategory = async () => {
		try{const resp = await axios.get(endpoint + 'category')
			setCategory(resp.data)
	}
		catch(error){
			setMessage('unable to fetch category')
		}
		
		console.log('category fetched')
		

	}

	const createLink = async () => {
		let postData = {time:time,type:type,level:level,name:player,questionNumber:questionNumber,category:choosenCategory}
		if(player == ""){
				setMessage("Enter Player Name")
				setCreate(false)
		}
		else{
		setMessage("Creating Game...")
		setLoading(true)
		
		try{
			var resp =await axios.post(`${endpoint}creategame`,postData,{headers:{
			'Content-Type':'application/json'
		}})}
		catch(error){
			setMessage("Error Creating Game")
		}

		setLink(`${endpoint}solve_quiz?game=${resp.data.id}&allow=true&currentPlayer=${player}&gameMode=versus&type=0link${resp.data.code}`)
		setGame(resp.data.id)
		setGameCode(resp.data.code)
		setPlayer(resp.data.player.id)
		//console.log(resp.data.player)
		setReady(true)
		setMessage('')
		setLoading(false)
	}
	}

	const joinGame =(x) =>{
		if (!gameCode){
			setMessage("Game Code is empty")
		}
		else if (!x){
			setMessage("Player Name is empty")
		}
		else{
			var resp = axios.get(`${endpoint}join/${gameCode}/${x}`).then((resp)=>{
			console.log(resp.data)
			if(resp.data.error){
				setMessage(resp.data.body)
				setGame(resp.data.game.id)
			//setGameCode(resp.data.code)
			//setPlayer(resp.data.game.player.id)
			setReady(true)
			setMessage("Code is Valid")
			setLoading(false)
			}
			else{
			setGame(resp.data.id)
			//setGameCode(resp.data.code)
			setPlayer(resp.data.host.id)
			setReady(true)
			setMessage("Code is Valid")
			setLoading(false)

		}}).catch((error)=>{
			setMessage("Error Loading Game Code")
		})
		
	}
}

	React.useEffect(()=>{
		if(create)createLink()
	},[create])

	React.useEffect(()=>{
		getCategory()
		if(fromLink) {
			//setChoice(...gameModes.filter((i)=> i.id === 10 ))
			setGameCode(fromLink)
		}
	},[])

	const copyToClipboard = (x,b)=>{
		navigator.clipboard.writeText(x)
		setMessage(`${b} is copied to clipboard`)
	}


	React.useEffect(()=>{
		isAuthenticated ? setGameModes(authModes) : setGameModes(guestModes)
		isAuthenticated && setPlayer(user.username)
	},[isAuthenticated])

	if(loading){
		return(<div class="center sz-18"><div class="spinner-grow sz-36"></div><br /> Getting Ready <br/> <span class="text-danger">{message}</span> </div>)
	}
	

	if(ready){
		return(
		<div class="center">
		{gameMode === 'versus' &&
			<div><p class="center sz-18 p-3"> Game Code - 
			
			 <b class="sz-16 color-p"> {gameCode}</b>
			<br/>
			<button class="btn btn-default color-bg-silver" onClick={()=>copyToClipboard(gameCode,'Game Code')}> Copy To clipboard </button>
				<hr/>
				<p class="sz-18 color-black p-3"> Game Link - 
				<Link href={link} class="no-decoration s-16 bold color-p"> {link} </Link>
				<br />
				<button class="btn btn-default color-bg-silver" onClick={()=>copyToClipboard(link,'Game link')}> Copy To clipboard </button>
				</p>
				</p></div>}
			<p class='w-100 color-white center my-3 p-2 rounded sz-16 color-bg-s'> 
			<Link href={{pathname:'solve_quiz', query:{game:game,allow:true,currentPlayer:currentPlayer,gameMode:gameMode,type:type}}} class='color-white no-decoration '>Click to Start Game </Link>
			</p>
				<p>{message}</p>
		</div>
		)
	}


	return(
			<QuizContext.Provider value = {{time,ready,type,level,link,game,player,gameCode,category,message,setTime,setReady,setType,setLevel,setLink,setGame,setGameCode,setCategory,setMessage,setPlayer,createLink,setChoosenCategory,choosenCategory,setCurrentPlayer,questionNumber,setQuestionNumber,gameMode,setGameMode,setCreate,loading,setLoading,joinGame,isAuthenticated}} >
			<div class="container justify-content-center pt-3">
			{choice.id === 1 && <SingleMode />}
			{choice.id === 2 && <SignUp />}
			{choice.id == 3 && <SingleMode auth={true} />}
			{choice.id === 0 && <GameModeList gameModes={isAuthenticated ? gameModes.filter((x)=>x.id !== 2) : gameModes} clickChoice={clickChoice} isAuthenticated={isAuthenticated} />}
			{choice.id === 4 && <MultiplayerMode />}
			{choice.id === 10 && <JoinRoom />}		
			{message && <div class="text-danger sz-16 center"> <i>{message}</i> </div>}
			
			
			{ready && <p class='w-100 color-white center my-3 p-2 rounded sz-15 color-bg-s'> 
			<Link href={{pathname:'solve_quiz', query:{game:game,allow:true,currentPlayer:currentPlayer,gameMode:gameMode}}} class='color-white no-decoration '> Start Game </Link></p>}

			{ready && <p> Share Game Code <b>{gameCode}</b></p>}

			</div>
			</QuizContext.Provider>
		)
}


const SignUpIcon = (props)=> props.id === 2 && <i class="fas fa-sign-in-alt"></i>

function GameModeList(props){
	return(
			<div class="row">
				
				{props.gameModes.map((x)=>{
					return(
					<div class="col-md-6 col-sm-12">
						<div class="rounded p-4 color-bg-white color-bg-p-hover center color-white-hover color-bg-p-focus color-white-focus shadow m-2" style={{cursor:'pointer'}} onClick={()=>props.clickChoice(x.id)}>
							<div class="sz-36">
								{x.id === 1 && <i class="fas fa-user"></i>}
								<SignUpIcon id={x.id} />
								{x.id === 3 && <><i class="fas fa-users"></i></>}
							</div>
							<div class="sz-20  bold"> {x.title} </div>
							
							<p class="sz-16">{x.info} </p>
						</div>
					</div> 
				)})}
			</div>
		)
}


function SignUp(props){
	return(

			<div class='row center sz-24'>
				<div class="col"> <Link href="account" class="no-decoration"> Click to create account </Link> </div>
			</div>
		)
}


function SingleMode(props){

	const name = React.useRef()
	const cat = React.useRef()
	const code = React.useRef()

	const {setPlayer,category, setMessage, type, setType, setReady, setGame,createLink,setChoosenCategory,setCurrentPlayer,setLevel,gameMode,setGameMode,player,setCreate,loading,setLoading,isAuthenticated} = React.useContext(QuizContext)

	const createGame = ()=>{
		if(!props.auth){
		setCurrentPlayer(name.current.value);
		setPlayer(name.current.value);}
		else{
			setCurrentPlayer(player)
		}
		setChoosenCategory(cat.current.value)	
		setLevel(1)
		setCreate(true)
		setGameMode('level')
	}

	const confirmCode = async ()=>{
		

		if (code.current.value === ''){
			setMessage("Can't confirm empty code")
			
		}
		else if(name.current.value === ''){
			setMessage("Enter Player Name")

		}
		else{
			//setLoading(true)
		setMessage('confirming code...')
		try{
			const resp = await axios.get(endpoint  + 'join/' + code.current.value + '/' + name.current.value)
			
			if (resp.data.message){
				setMessage(resp.data.message)
			}
			
		setGame(resp.data.id)
		setCurrentPlayer(name.current.value)
		setGameMode('level')
		setReady(true)
		setLoading(false)
	}
		catch(error){
			console.log(error)
			setMessage("Error Loading Quiz Code")
		}
	}
	}

	return(
		<div class="row justify-content-center align-items-center p-2">
			<div class="col-md-6 p-4 rounded">
				{!props.auth && <div class="row sz-16 my-3">
					<div class="col my-2 bold">
						Enter your Name <span class="sz-12"> </span>
					</div>
					<div class="w-100"></div>
					<div class="col my-2">
						<input ref={name} class="form-control p-2 sz-15" />
					</div>
				</div>}

			<div class="row sz-16 my-3 hide">
			<div class="col my-2 bold">Game Code (optional) </div> 
			<div class="w-100"></div>
			<div class="col my-2">
			<div class="row">
				<div class="col">
				<input ref={code} class="form-control p-2 sz-15" />
				</div>
				<div class="col">
					<button class="btn color-bg-p color-white w-100 p-2 sz-15" onClick={()=>confirmCode()} >confirm game code </button>
				</div>
			</div>
			 </div>
			</div>
			<hr class="my-4" />

			{isAuthenticated ?
			<div class="row sz-16 my-3">
			<div class="col my-2 bold">Game Type </div> 
			<div class="w-100"></div>
			<div class="col my-2">
			<div class="row">
				<div class="col">
					<div class={`w-100 p-2 sz-16  rounded center  ${type === 0 ? 'color-bg-s color-white':'border'}`} onClick={()=>setType(0)} style={{cursor:'pointer'}} > 3 Missed Out </div>
				</div>
				<div class="col">
					<div class={`w-100 p-2 sz-16 rounded center ${type === 1 ? 'color-bg-s color-white':'border'}`} style={{cursor:'pointer'}} onClick={()=>setType(1)} > Score Line </div>
				</div>
			</div>
			 </div>
			</div>
			:
			<div class="row sz-16 my-3">
			<div class="col my-2 bold">Game Mode </div> 
			<div class="w-100"></div>
			<div class="col my-2">
			<div class="row">
				<div class="col">
					<div class={`w-100 p-2 sz-16  rounded center  ${gameMode === 'single' ? 'color-bg-s color-white':'border'}`} onClick={()=>setGameMode('single')} style={{cursor:'pointer'}} > Single Mode </div>
				</div>
				<div class="col">
					<div class={`w-100 p-2 sz-16 rounded center ${gameMode === 'versus' ? 'color-bg-s color-white':'border'}`} style={{cursor:'pointer'}} onClick={()=>setGameMode('versus')} > Multiplayer </div>
				</div>
			</div>
			 </div>
			</div>

		}




				<div class="row sz-16 my-3">
			<div class="col my-2 bold">Categories </div> 
			<div class="w-100"></div>
			<div class="col my-2">
				<select ref={cat} class="form-control sz-16 p-2" >
					<option> Any Category </option>
					{category.map((x)=><option class=''> {x.name} </option>)} 
				</select>
			 </div>
			</div>


				<div class="row mx-auto my-5"> <button class="btn btn-success no-border rounded sz-24 color-white p-2" onClick={()=>createGame()}> Start </button> </div>
			</div>
			</div>
		)
}


function MultiplayerMode(props){
	const [ready,setReady] = React.useState()
	const [game,setGame] = React.useState()
	const [message, setMessage] = React.useState('')
	const code = React.useRef()
	const player = React.useRef()
	const {setGameMode} = React.useContext(QuizContext)
	const [choice,setChoice] = React.useState(0)

	const getGame = async ()=>{
		if (player.current.value === ""){
			setMessage("Please enter your Name")
			return
		}

		try{
			const resp = await axios.get(endpoint  + 'join/' + code.current.value + '/' + player.current.value)
			
			if (resp.data.message){
				setMessage(resp.data.message)
				return 
			}
			if (resp.status === 500){
				setMessage("Error Loading Quiz Code")
				return
			}
			
		setGame(resp.data.id)
		setGameMode('versus')
		setReady(true)}
		catch(error){
			setMessage("Error Loading Quiz Code")
		}
	}

	return(
			<div class="container-fluid">
			{choice === 1 && <CreateRoom /> }
			{choice === 2 && <JoinRoom /> }
			{choice === 0 && <div class="row justify-content-center center">
					<div class="col"> <div class="btn p-4 sz-24" onClick={()=>setChoice(1)}> Create Room </div></div>
					<div class="col"> <div class="btn p-4 sz-24" onClick={()=>setChoice(2)}> Join Room </div> </div>
				</div> }
			</div>
		)
}

function CreateRoom(props){
	const {category,createLink,setChoosenCategory,setGameMode,player,setCurrentPlayer} = React.useContext(QuizContext)
	const cat = React.useRef()

	return(
			<div class="container-fluid">
				<div class="row">
					<div class="col">

					</div>
				</div>

				<div class="row sz-16 my-3">
					<div class="col my-2 bold">Categories </div> 
					<div class="w-100"></div>
					<div class="col my-2">
						<select ref={cat} class="form-control sz-16 p-2" >
							<option> Any Category </option>
							{category.map((x)=><option class=''> {x.name} </option>)} 
						</select>
	 				</div>
				</div>

				<div class="row sz-16 my-3">
					<div class="col my-2 bold"> Number of Players </div>
					<div class="w-100"></div>
					<div class="col"> <input class="form-control p-3" type="number"/> </div>
				</div>

				<div class="row my-3 py-3">
					<div class="col"><button class="btn sz-20 w-100 color-bg-p color-white p-2" onClick={()=>{setCurrentPlayer(player);setChoosenCategory(cat.current.value);setGameMode('versus');createLink()}}> Create </button> </div>
				</div>
			</div>

		)
}


function JoinRoom(props){
	const code = React.useRef()
	const guestPlayer = React.useRef()

	const {category,createLink,setPlayer,setChoosenCategory,choosenCategory,setGameMode,player,setCurrentPlayer,joinGame,setGameCode,gameCode,isAuthenticated} = React.useContext(QuizContext)
		
		const joinGameFunc =()=>{
			code.current.removeAttribute('readonly')
			setGameCode(code.current.value);
			setCurrentPlayer(player ? player : guestPlayer.current.value);
			setPlayer(guestPlayer.current.value)
			setGameMode('versus');
			joinGame(guestPlayer.current.value)
		}


		return(
				<div class="container-fluid">
					<div class="row my-3">
						<div class="col color-p sz-24"> Join Room </div>
					</div>
					
					{!isAuthenticated && <div class="row sz-16 my-3">
						<div class="col my-2 bold"> Name </div>
						<div class="w-100"></div>
						<div class="col"> <input ref={guestPlayer} class="form-control p-3"/> </div>
					</div>}
					<div class="row sz-16 my-3">
						<div class="col my-2 bold"> Game Code </div>
						<div class="w-100"></div>
						<div class="col"> <input ref={code} class="form-control p-3" value={gameCode ? gameCode : ''}/> </div>
					</div>
					<div class="row my-3 py-3">
					<div class="col"><button class="btn sz-20 w-100 color-bg-p color-white p-2" onClick={()=>joinGameFunc()}> Join Room </button> </div>
				</div>
				</div>
			)

}

export default QuizSetting