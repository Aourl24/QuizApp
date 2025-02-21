'use client'
import React from 'react'
import Link from 'next/link'
import {useSearchParams,useRouter} from 'next/navigation'
import axios from 'axios';
import {endpoint,host} from '../endpoints.js'
import {QuizBoxContext} from "../components.js"
import Loader from "../loader.js"


export default function Home(){
	const {setLoader} = React.useContext(QuizBoxContext)
	const route = useRouter()
	React.useEffect(()=>{
		setLoader(false)
	},[])
	return(
		<div class="container">
		<br />
			<div class="row mb-3 d-none">
				<div class="col sz-20 ">
					Hello! Let have fun
				</div>
			</div>

			<div class="row ">
				<div class='col-md col-sm my-2 '>
					<div class="container">
					<div class="rounded borde p-5 row center shadow color-bg-white color-bg-t color-bg-hover color-white-hover no-decoration color-black pointer-cursor" onClick={()=>route.push('home/game')}>
							<div class="col">
							<div class="row sz-36">
								<div class="col color-p">
									<img src="quiz3.jpg" class="img-fluid contain" style={{width:'220px',height:'220px'}} />
								</div>
							</div>
							<div class='row sz-20'>
								<div class="col bold">
								 	Play as Guest
								</div>
							</div>
							<div class="row sz-12 mt-5 p-0">
								<div class="col text-danger p-0">

								<span class="bg-dangr p-2 rounded-3 olor-white"> Available for everyone <i class="fas fa-bolt"></i> </span>
								 </div>
							</div>
							</div>
					</div>
					</div>
				</div>

				<div class="col-md col-sm my-2">
				<div class="container">
					<div class="rounded shadow p-5 row center shado color-bg-white color-bg-hover color-white-hover no-decoration color-black pointer-cursor" onClick={()=>setAlert("You don't have access to this Mode")}>
							<div class="col">
							<div class="row sz-36">
								<div class="col color-p">
									<img src="quiz2.jpg" class="img-fluid contain" style={{width:'220px',height:'220px'}} />
								</div>
							</div>
							<div class='row sz-20'>
								<div class="col bold">
								 	Play in Game Mode
								</div>
							</div>
							<div class="row sz-12 mt-5 p-0">
								<div class="col text-danger p-0">

								<span class="bg-dange p-2 rounded-3 colr-white"> Only for Registered Users <i class="fas fa-lock"></i> </span>
								 </div>
							</div>
							</div>
						</div>
				</div>
				</div>
				</div>
		</div>
		)
}