'use client'
import React from 'react'
import Link from 'next/link'
import {useSearchParams,useRouter} from 'next/navigation'
import axios from 'axios';
import {endpoint,host} from '../../endpoints.js'
import {QuizBoxContext} from "../../components.js"
import Loader from "../../loader.js"


export default function Home(){
	const [games , setGames] = React.useState([])
	const {setLoader} = React.useContext(QuizBoxContext)

	React.useEffect(()=>{
		setLoader(false)
		axios.get(`getgamesmode/${1}`).then((x)=>setGames(x.data))
	},[])

	return(
			<div class="container-fluid"> 
			<div class="row my-2">
				<div class="col sz-20">
					
				</div>
			</div>
				<div class="">
					<Games items={games} />
				</div>
			</div>
		)
}


function Games({items}){
	
	return(
			<div class="row">
				{
					items.map((item)=>(
						<div class="col-sm col-md-6 p-2">
							<Link class="colo-bg-t rounded-3 bg-light color-black border p-4 d-block no-decoration color-bg-hover color-p-hover pb-5" href={{pathname:"/quickplay",query:{score:10,time:20,name:item.title,icon:'fas fa-bolt',title:'quick play',game:item.id}}}> <i class="fas fa-gamepad sz-12"> </i>  {item.title} </Link>
						</div>
					))
				}
			</div>

		)
}