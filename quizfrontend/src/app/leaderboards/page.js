"use client"
import {endpoint} from "../endpoints.js"
import React from "react"

export default function LeaderBoard(){
	const boards = ['Global Rank',"Daily Challenge","Blitz","survival"]
	const [general,setGeneral] = React.useState()
	const [daily , setDaily] = React.useState()
	const [blitz , setBlitz] = React.useState()
	const [survival , setSurvival] = React.useState()
	const [show , setShow] = React.useState()

	React.useEffect(()=>{
		fetch(endpoint + 'leaderboard').then((x)=>x.json()).then((x)=>{
			setGeneral(x.global_leaderboards)
			setDaily(x.daily_leaderboards)
			setBlitz(x.blitz_leaderboards)
			setSurvival(x.survival_leaderboards)
			setShow(0)
		})
	},[])

		return(
			<div class="container">
			<div class="row mb-4">
				<div class="col color-p sz-30"> LeaderBoard </div>
			</div>

				<div class="row p-2">
					{boards.map((board,e)=>(
						<div class={`col pointer-cursor border p-3 ${e == show && "color-bg-p no-border color-white"}`} onClick={()=>setShow(e)}>
							{board}
						</div>	
					))
					}
				</div>
				<br />
				{show == 0 && <Rank items={general} /> }
				{show == 1 && <Rank items={daily} /> }
				{show == 2 && <Rank items={blitz} /> }
				{show == 3 && <Rank items={survival} /> }
			</div>

			)
}

function Rank({items}){
			return(
					<div class="">
					<br />
					{
						items.map((item,e)=>(
							<div class="row sz-18  p-3">
								<div class="col-1">
									{e+1}
								</div>
								<div class="col">
									 {item?.user?.username}
								</div>
								<div class="col">
									{item?.total_points}
								</div>
							</div>
						))
					}
					</div>
				)
		}