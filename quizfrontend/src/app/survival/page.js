"use client"
import React from "react"
import {MissedOut,QuizBox , QuizBoxContext} from "../components.js"

export default function Survival(){
	const {setBatch,batch} = React.useContext(QuizBoxContext)
	setBatch(1)
	return(
			<div>
			<div class="row my-3">
				<div class="col center"> <MissedOut number={1} /></div>
			</div>

				<QuizBox path={'survival/' + batch} />
			</div>
		)
}

function Message(){
	const { message, changeActive, score, restartQuiz, showRestart, questions, buttonMessage,  user , end ,data } = useContext(QuizBoxContext);


	return(
	<div className="modal d-flex align-items-center color-bg-white" style={{ backgroundColor: "rgba(100,100,100,0.8)" }}>
            <div className="modal-dialog modal-dialog-centered w-100 h-100 p-3">
                <div className="modal-content p-md-4 p-3 center animate__animated animate__slideInUp">

                	<div class="row">
                		<div class="col sz-18"> {message} </div>
                	</div>

                	{data && 
                	<div class="row"> 
                		<div class="col sz-18">
                			Score <br /> <span class="sz-36">{score}</span>
                		</div>
                	</div>
                }

                {
                	end && 

                	<div class="row">
                		<Link className="color-s w-100 sz-20  my-4 no-decoration col" href="/">Play Again </Link>
                	</div>
                }

                {
                	end && !user && 
                	<div class="row">
                		<Link className="w-100 sz-20  my-4 no-decoration border-top col" href="/account/signup"> Login or Create Account </Link> 
                	</div>
                }

             	</div>
            </div>
    </div>

		)
}