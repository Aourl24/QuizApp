import { endpoint } from './endpoints.js';
//import { useAuth } from './auth.js';
import React, { createContext, useState, useRef, useEffect, useContext } from "react";
import axios from 'axios';
import Link from "next/link";
import {postData} from './endpoints.js';

export const QuizBoxContext = createContext();

export function Quiz({ children }) {
    const [user , setUser] = useState()
    const [game , setGame] = React.useState()
    const [data, setData] = useState([]);
    const [active, setActive] = useState(0);
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
    const [end , setEnd] = React.useState(false)
    const countdown = useRef();
    const clap = useRef();
    const boo = useRef();
    const gameover = useRef();

    const gameOver = () => {
        setQuestions(false);
        setEnd(true)
    };

    const changeActive = () => {
        if (active == data.length -1 ) {
            
            if(batch){
                setBatch((prev)=>prev+1)
                setActive(0);
                setMessage()    
            }
            else{
                setMessage("Quiz Ended")
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
        setBatch(1)
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
        setQuestions(true);
        setEnd(false)
    },[data])

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
            fetch(endpoint + 'completed/' + user.id + '/' + score + '/' +game.id).then(x=>x.json()).then(x=>setMessage(x.message))
        }
    },[end])



    return (
        <QuizBoxContext.Provider value={{
            active, data, setData, 
            questions, setQuestions, setMessage, message,score,
            setActive, setScore, changeActive, restartQuiz,
            gameOver, buttonMessage, setButtonMessage,
            setWrong, wrong, correct,
            categories, clap, boo, countdown, resetAudio ,restartQuiz, gameover ,setCorrect,setScore, batch  ,user ,setBatch , end , setEnd, setUser,scorePercent , setScorePercent , game ,setGame
        }}>
        {message && <Message />}
            {children}
        </QuizBoxContext.Provider>
    );
}

export function QuizBox({path}) {
    const options = React.useRef([]);
    const selectedOption = React.useRef()

    const [showSelect, setShowSelect] = useState(false);
    const { active, data,countdown ,countDown,setMessage,setCountDown,setData, resetAudio , restartQuiz,setWrong,message,gameover, setCorrect, clap ,setScore ,questions , setQuestions,scorePercent,batch,setGme,setShowRestart,setGame,setEnd} = useContext(QuizBoxContext);

    const fetchData = ()=>{
        fetch(endpoint + path).then(x=>x.json()).then(x=>{
            if(x.game) setGame(x.game)
            if(x.questions){
                setData(x.questions)
                
            }
            else if(x.message){
                setMessage(x.message)
                if(x.score){
                    setScore(x.score)
                }
            }
            else{
                setMessage("No more Questions")
                setEnd(true)
            }
             })
    }


        React.useEffect(()=>{
        if(batch) fetchData() 
    },[batch])


    useEffect(() => {
        
            options.current.forEach(element => element && element.classList.remove('select'));

        setMessage()
        return ()=>{
            resetAudio()
        }
    }, [active]);

    React.useEffect(()=>{
        
        return ()=>{
            setMessage()
            resetAudio()
            restartQuiz()
            //setCountDown(20)
        }
    },[])

    const markChoose = (index) => {
        options.current.forEach(element=>{
        	element.classList.remove("select");
        	element.classList.add("color-black")})
        options.current[index].classList.toggle('select'); 
        setShowSelect(true);
    };

    const checkAnswer = () => {
        resetAudio();
        if (selectedOption.current === data[active].answer) {
            setScore((prev)=>prev += scorePercent )
            setMessage('Correct Answer');
            setCorrect(prev => [...prev, data[active]]);
            
            clap.current.play();
            
        } else {
            setMessage('Wrong Answer');
            setWrong(prev => [...prev, data[active]]);
            gameover.current.play();
        }
    };

    const selectAnswer = () => {
        countdown.current.pause();
        checkAnswer();
        setShowSelect(false);
    };

    return (
        <div class="container">

            {data[active] &&
                <div className="row center justify-content-center">
                    <div className="sz-24 bold rounded p-3 col-12">{data[active].body}</div>
                    <div className="col-12 my-3">
                        <div className="row m-2">
                            {data[active].options.map((option, i) => (
                                <div className="col-md-6 my-1 p-3" key={i}>
                                    <div className="rounded sz-18 p-4 color-p-hover option color-b- border" style={{ cursor: 'pointer' }} onClick={() => { markChoose(i); selectedOption.current = option ; }} ref={el => options.current[i] = el}>{option}</div>
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
    const { message, changeActive, score, restartQuiz, showRestart, questions, buttonMessage,  user , end ,data } = useContext(QuizBoxContext);


    return(
    <div className="modal d-flex align-items-center color-bg-white" style={{ backgroundColor: "rgba(100,100,100,0.8)" }}>
            <div className="modal-dialog modal-dialog-centered w-100 h-100 p-3">
                <div className="modal-content p-md-4 p-3 center animate__animated animate__slideInUp">

                    <div class="row my-3">
                        <div class="col sz-30"> {message} </div>
                    </div>

                    {data && 
                    <>
                    <div class="row"> 
                        <div class="col sz-18">
                            Score <br /> <span class="sz-36 bold">{score}</span>
                        </div>
                    </div>
                    
                    </>
                }

                {
                    !end && 
                    <div class="row my-3">
                        <div class="col"><button class="no-decoration color-bg-p color-white rounded-4 w-100 sz-18 p-2 py-3 no-border" onClick={()=>changeActive()}>{buttonMessage} </button>
                        </div>
                    </div>
                }


                {
                    end && 

                    <div class="row">
                        <Link className="color-s w-100 sz-20  my-4 no-decoration col" href="">Play Again </Link>
                    </div>
                }

                {
                    end && !user && 
                    <div class="row">
                        <Link className="w-100 sz-20  no-decoration p-2 border-top rounded col" href="/account/signup"> Login or Create Account </Link> 
                    </div>
                }

                </div>
            </div>
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

    return(<div> {Array(number).fill().map((_,i)=><i class={`fas fa-heart p-1 ${i < wrong.length ? "color-silver" : "color-p"}`}></i>)} </div>)
}

export function CountDown({number}){
    const {wrong , correct, gameover , setWrong , setMessage , resetAudio , message ,countdown , active , data} = React.useContext(QuizBoxContext)
    const [countDown, setCountDown] = useState(number ? number : 20);

    useEffect(() => {
        const timer = setInterval(() => setCountDown(count => count - 1), 1000);
        if (countDown <= 0) {
            resetAudio();
            gameover.current.play();
            setMessage('Time Out');
            setWrong(prev => [...prev, data[active]]);
            clearInterval(timer);
        }
        else{
            if(countdown.current)countdown.current.play();
        }
        if (message) {clearInterval(timer);countdown.current.currentTime = 0;
            countdown.current.pause();}
        return () => clearInterval(timer);
    }, [countDown, message]);

    useEffect(()=>{
        setCountDown(number ? number : 20)
    },[active])

    return(
            <div className="w-100 center">
                <div className="rounded-circle sz-18 color-s p-3 color-bd-p bold border" style={{ display: 'inline-block' }}>{countDown}</div>
            </div>
        )
}


export const Header = ()=>{
    const { user } = React.useContext(QuizBoxContext)
    
    return(
        <div class="row align-items-center p-3">
        <div class="col-md-9 col sz-24  color-p">
             Q<span class="font-great animate__animated animate__bounce animate__infinie animate__delay-3s bold" style={{display:'inline-block'}}>uizzify</span>
        </div>
        <div class="col" style={{textAlign:'right'}}>
          {user ? <Link href="profile" class="color-p no-decoration" style={{}}>{user.username}</Link> : <Link href="/account/signup" class="color-p no-decoration">Sign Up </Link> }
        </div>
        <div class="col"> <Menu /> </div>
      </div>
        )
}


function Menu(props){
  return(
      <div class="row">
      <div class="col">
        Abou
      </div>
      <div class="col">
        Help
      </div>

      </div>

    )
}
    