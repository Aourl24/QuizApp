import { endpoint } from './endpoints.js';
//import { useAuth } from './auth.js';
import React, { createContext, useState, useRef, useEffect, useContext } from "react";
import axios from 'axios';
import Link from "next/link";
import {postData} from './endpoints.js';
import Loader from "./loader.js"
import {AuthContext} from "./auth.js"

export const QuizBoxContext = createContext();

export function Quiz({ children }) {
    const [user , setUser] = useState()
    const [game , setGame] = React.useState()
    const [data, setData] = useState([]);
    const [active, setActive] = useState(0);
    const [status,setStatus] = useState(true)
    const [error,setError] = useState(false)
    const [message, setMessage] = useState();
    const [score, setScore] = useState(0);
    const [scorePercent , setScorePercent] = React.useState(10)
    const [correct, setCorrect] = useState([]);
    const [wrong, setWrong] = useState([]);
    const [questions, setQuestions] = useState(true);
    const [buttonMessage, setButtonMessage] = useState("Next Question");
    const [messageBody, setMessageBody] = useState();
    const [categories, setCategories] = useState([]);
    const [batch , setBatch] = React.useState()
    const [nextBatch , setNextBatch] = React.useState()
    const [end , setEnd] = React.useState(false)
    const [alert , setAlert] = React.useState()
    const [loader , setLoader] = React.useState(true)
    const [mark , setMark] = React.useState(0)
    const [confirm,setConfirm] = React.useState(true)
    const [sound , setSound] = React.useState(true)
    const countdown = useRef();
    const clap = useRef();
    const boo = useRef();
    const gameover = useRef();

    const gameOver = () => {
        setMessage("Game Over")
        setQuestions(false);
        setEnd(true)
    };

    const changeActive = () => {
        if (active == data.length -1 ) {
            
            if(batch != 0 ){
                // setBatch(nextBatch)
                console.log("Batch is now " + batch)
                setMessage()
            }
            else{
                
                gameOver()
                
            }
        
        } else {
            setActive(active + 1);
            setMessage();
        }
        resetAudio();
    };

    const restartQuiz = () => {
        setActive(0);
        setWrong([]);
        setCorrect([]);
        setScore(0);
        setBatch()
    };

    useEffect(() => {
        fetch(`${endpoint}category`)
            .then(response => response.json())
            .then(data => setCategories(data));

        countdown.current = new Audio("/calmtickling.mp3");
        boo.current = new Audio("/booing.wav");
        clap.current = new Audio("/clapping.wav");
        gameover.current = new Audio("/gameover.wav");
    }, []);

    const resetAudio = () => {
        [clap, boo, gameover, countdown].forEach(ref => {
            ref.current.currentTime = 0;
            ref.current.pause();
        });
    };


    React.useEffect(()=>{
        try{
     postData('checkuser').then((res)=>{
         setUser(res.user ? res.user : null)
     }).catch(()=>{setUser(null)})
    }
    catch(error){
     console.log(error)
    }
    },[])

    React.useEffect(()=>{
        if(user && end){
            fetch(endpoint + 'completed/' + user.id + '/' + score + '/' +game.id).then(x=>x.json()).then(x=>{
                setMessage(x.message)
                setEnd(true)
            })
        }
    },[end])

    React.useEffect(()=>{
        let timer = setTimeout(()=>setAlert(),5000)
        return ()=>clearTimeout(timer)
    },[alert])

    return (
        <QuizBoxContext.Provider value={{
            active, data, setData, 
            questions, setQuestions, setMessage, message,score,
            setActive, setScore, changeActive, restartQuiz,
            gameOver, buttonMessage, setButtonMessage,
            setWrong, wrong, correct, error ,setError , 
            categories, clap, boo, countdown, resetAudio ,restartQuiz, gameover ,setCorrect,setScore, batch  ,user ,setBatch , end , setEnd, setUser,scorePercent , setScorePercent , game ,setGame,setAlert , alert , loader , setLoader,mark , setNextBatch, setMark , nextBatch , status , setStatus , confirm , setConfirm , sound , setSound
        }}>
        {loader && <Loader />}
        
        {alert &&
                <div class="container-fluid p-2 position-fixed " style={{top:'2%'}}>
                <div class="row alert alert-danger py-5">
                    <div class="col text-danger sz-18">{alert}
                    </div>
                    <div class="col right color-b-"> <i class="fas fa-times rounded color-bg-red color-white p-2" onClick={()=>setAlert()}></i></div>
                </div>
                </div>
                }

        {message && <Message />}
            {children}
        </QuizBoxContext.Provider>
    );
}

export function QuizBox({path}) {
    const options = React.useRef([]);
    const selectedOption = React.useRef()
    const correctWords = ["Nailed it!","Spot on!","On Point!","Legit!","Boom"]
    const wrongWords = ["Nah, Fam!","Uh-Oh!","Swing n Miss!","Legit!","Whoops"]
    const [showSelect, setShowSelect] = useState(false);
    const { active, data,countdown ,countDown,setMessage,setCountDown,setData, resetAudio , restartQuiz,setWrong,message,gameover, setCorrect, clap ,setScore ,questions , setQuestions,scorePercent,batch,setGme,setShowRestart,setGame,setEnd,setMark,setBatch , setNextBatch , nextBatch,error,setError,confirm , sound , setConfirm , setSound } = useContext(QuizBoxContext);
    const fetchData = () => {
    // 
    fetch(endpoint + path + "?format=json")
        .then((res) => res.json())
        .then((x) => {
            if (x.game != null) {
                setGame(x.game);
            } else {
                setMessage("Game does not exist");
            }

            if (x.questions) {
                setData((prev) => [...x.questions])
            } 
        })
        .catch((err) => {
            setError(true)
            setMessage(err.toString())
            console.error("Error fetching data:", err);
        });
};


    useEffect(() => {
        
            options.current.forEach(element => element && element.classList.remove('select'));

        setMessage()
        return ()=>{
            resetAudio()
        }
    }, [active]);

    React.useEffect(()=>{
         fetchData();   
        return ()=>{
            setMessage()
            resetAudio()
            restartQuiz()
            //setCountDown(20)
        }
    },[])

    const markChoose = (index,option) => {
        options.current.forEach(element=>{
        	if(element){
            element.classList.remove("select");
        	element.classList.add("color-black")
        }})
        options.current[index].classList.toggle('select'); 
        setShowSelect(true);
        selectedOption.current = option ;
    };


    const checkAnswer = () => {
        resetAudio();
        if (selectedOption.current === data[active].answer) {
            setScore((prev)=>prev += scorePercent )
            setMark(2)
            setMessage(correctWords[Math.floor(Math.random() * correctWords.length)]);
            setCorrect(prev => [...prev, data[active]]);
            
            if(sound) clap.current.play();
            
        } else {
            setMark(1)
            setMessage(wrongWords[Math.floor(Math.random() * wrongWords.length)])
            setWrong(prev => [...prev, data[active]]);
            if(sound) gameover.current.play();
        }
    };

    const selectAnswer = () => {
        countdown.current.pause();
        checkAnswer();
        setShowSelect(false);
    };

    return (
        <div class="container-fluid p-1">
            {data &&
                <div className="row center justify-content-center">
                    <div className="sz-24 bold rounded p-3 col-12">{data[active]?.body}</div>
                    <div className="col-12 my-3">
                        <div className="row m-2">
                            {data[active]?.options?.map((option, i) => (
                                <div className="col-md-6 my-1 p-3" key={i}>
                                    <div className="rounded sz-18 p-4 color-p-hover option color-b- border" style={{ cursor: 'pointer' }} onClick={() => { markChoose(i,option) ; !confirm && selectAnswer() }} ref={el => options.current[i] = el}>{option}</div>
                                </div>
                            ))}
                        </div>
                        {showSelect && <button className="no-border rounded color-bg-p color-white w-100 sz-24 color-bg-s-hover p-4" onClick={selectAnswer}>Select</button>}
                    </div>
                </div>
            }
        </div>
    );
}

function Message(){
    const { message, changeActive, score, restartQuiz, showRestart, questions, buttonMessage,  user , end ,data , mark , status ,error  } = useContext(QuizBoxContext);

    return(
    <div className="modal d-flex align-items-center color-bg-white " style={{ backgroundColor: "rgba(100,100,100,0.8)" }}>
            <div className="modal-dialog modal-dialog-centered w-100 h-100 p-3 ">
               {!end && <ScoreBoard />}
               {end && <EndBoard /> }
               {error && <ErrorBoard /> }        
            </div>
    </div>

        )
}

function ScoreBoard(){
        const { message, changeActive, score, restartQuiz, showRestart, questions, buttonMessage,  user , end ,data , mark , status ,error  } = useContext(QuizBoxContext);

    return(
        <div className={`modal-content p-md-4 p-3 center animate__animated animate__slideInUp color-black`}>

                    <div class="row mt-3">
                        <div class="col sz-36">
                        {mark === 1 && <i class="fas fa-times-circle text-danger"></i> } 
                        {mark === 2 && <i class="fas fa-check-circle rounded-circle bg-success color-white p-3 "></i> }
                        {mark === 3 && <i class="fas fa-clock color-bg-white rounded-circle text-danger p-2 "></i> } 
 


                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col sz-36"> {message} </div>
                    </div>

                    <>
                    <div class="row align-items-center justify-content-center"> 
                        <div class="col sz-18 color-grey">
                            Score </div>
                            <div class="w-100"></div>
                            <div class="col"> <span class="sz-36 bold">{score}</span>
                        </div>
                    </div>
                    
                    </>
 
                    <div class="row my-3">
                        <div class="col"><button class="no-decoration bg-warning color-black rounded-4 w-100 sz-18 p-3 no-border" onClick={()=>changeActive()}>{buttonMessage} </button>
                        </div>
                    </div>

                </div>)
}


function EndBoard(){
    const {user,score,scorePercent} = React.useContext(QuizBoxContext)

    return(
        <div class="modal-content container center">
                    {!user && <>
                    <div class="row">
                        <Link className="w-100 sz-20  my-4 no-decoration col" href="/quiz_settings"> Restart </Link>
                    </div>
                     <div class="row my-3">
                        <Link className="w-100 sz-20  no-decoration p-2 rounded col py-4 text-warning" href="/account/signup"> Login or Create Account </Link> 
                    </div>
                    </>
                    }

                    <div class="color-bg-white shadow-md d-none">
                        <div class="color-p">Congratulation!!</div>
                        <div class="row"><div class="col"><Link href="">Proceed to Next Level </Link></div></div>
                    </div>

                    </div>
                    )
}

function ErrorBoard(){
    return(
            <div>
                Error has occur
            </div>
        )
}

export const MissedOut = ({number})=>{
    const {wrong , correct, gameOver} = React.useContext(QuizBoxContext)

    React.useEffect(()=>{
        if(wrong.length >= number){
            gameOver()
        }
    },[wrong])

    return(<span> {Array(number).fill().map((_,i)=><i class={`fas fa-heart p-1 ${i < wrong.length ? "color-silver" : "color-p"}`}></i>)} </span>)
}

export function CountDown({number}){
    const {wrong , correct, gameover , setWrong , setMessage , resetAudio , message ,countdown , active , data , setMark} = React.useContext(QuizBoxContext)
    const [countDown, setCountDown] = useState(number ? number : 20);
    const {confirm , sound , setConfirm , setSound} = useSetting()

    useEffect(() => {
        if(data.length){
        const timer = setInterval(() => setCountDown(count => count - 1), 1000);
        if (countDown <= 0) {
            resetAudio();
            if(sound)gameover.current.play();
            setMark(3)
            setMessage('Time Out');
            setWrong(prev => [...prev, data[active]]);
            clearInterval(timer);
        }
        else{
            //if(countdown.current)countdown.current.play();
        }
        if (message) {clearInterval(timer);countdown.current.currentTime = 0;
            //countdown.current.pause();
    }
        return () => clearInterval(timer);
        }
    }, [countDown, message , data]);

    useEffect(()=>{
        setCountDown(number ? number : 20)
    },[active])

    return(
                <span className="rounde-circle sz-18 color-s p-3 color-bd-p bold text-danger" style={{ dispay: 'inline-block' }}>{countDown}</span>
        )
}


export const Header = ()=>{
    const { data } = React.useContext(AuthContext)
    
    return(
        <div class="row align-items-center p-3 ">
        <div class="col-md-9 col sz-24 ">
             <span class="font-great" style={{display:'inline-block'}}>Quizzify</span>
        </div>
        <div class="col" style={{textAlign:'right'}}>
          {data?.user ? <Link href="profile" class="color-p no-decoration" style={{}}>{data.user.username}</Link> : <Link href="/account/signup" class="color-white p-md-3 p-2 rounded-5 sz-14 no-decoration color-bg-black">Sign Up </Link> }
        </div>
        {data?.user && <div class="col"> <Menu /> </div>}
      </div>
        )
}


function Menu(props){
  return(
      <div class="row">
      <div class="col">
        <Link href="/leaderboards" class="no-decoration color-s">LeaderBoards</Link>
      </div>

      </div>

    )
}
 
// function useSetting(props){

//     return {confirm,sound , setSound , setConfirm}
// }    



export function Instructions (props){
    const {confirm , sound , setConfirm , setSound} = useContext(QuizBoxContext);

    return(
        <div class="container-fluid">
            <div class="box sz-24 center bold mb-4"> <i class={props.icon}></i>  {props.title} </div> 
            <div class="box mb-5"> 
                <div class="color-p bold sz-16 my-2 "> <i class="fas fa-clock text-warning"> </i> Time </div> {props.time} seconds per question 
            </div>
            
            <div class="box mb-5">
                <div class="color-p bold sz-16 my-2 "> <i class="fas fa-trophy text-primary"> </i> Score </div> {props.score} points per question
            </div>

            <div class="box my-5">
            <div class="sz-16 bold mb-4 color-p"> <i class="fas fa-exclamation-circle text-danger"> </i> Important Tips </div>
                <ul>
                    <li> Read each question carefully before answering </li>
                    <li> Balace speed with accuracy - rushing leads to mistakes </li>
                    <li> You can't return to previous questions </li>
                </ul>
            </div>

            <div class="box my-5">
                <div class="sz-16 bold mb-4 color-p"> <i class="fas fa-cog color-s"> </i> Settings </div>
                <div class="row my-3">
                    <div class="col"> Confirm answer </div> 
                    <div class="col">
                    <div class="row">
                    <div class={`rounded-6   pointer-cursor col   ${confirm ? "color-bg-p color-white" : "border color-black"}`} style={{heigh:"15px",with:'15px'}}   onClick={()=>setConfirm(true)} > Yes </div>
                        <div class={`rounded-6  inline-blok pointer-cursor col ${!confirm ? "color-bg-p color-white" : "border color-black"}`} style={{heght:"15px",widt:'15px'}}   onClick={()=>setConfirm(false)} > No </div>
                    </div>
                    </div>
                </div>
                 <div class="row my-3">
                    <div class="col"> Sound </div> 
                    <div class="col">
                    <div class="row">
                    <div class={`rounded-6   pointer-cursor col   ${sound ? "color-bg-p color-white" : "border color-black"}`} style={{heigh:"15px",with:'15px'}}   onClick={()=>setSound(true)} > Yes </div>
                        <div class={`rounded-6   inline-blok pointer-cursor col ${!sound ? "color-bg-p color-white" : "border color-black"}`} style={{heght:"15px",widt:'15px'}}   onClick={()=>setSound(false)} > No </div>
                    </div>
                    </div>
                </div>
            </div>

            <div class="box">
            <Link class="rounded-3 no-border color-bg-p no-decoration p-3 color-white btn w-100 sz-16 color-bg-hover" href={{pathname:"quickplay/game",query:props}} > Start Game </Link>
            </div> 
        </div>
        )
}