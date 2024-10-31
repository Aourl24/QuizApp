import { endpoint } from './endpoints.js';
import { useAuth } from './auth.js';
import React, { createContext, useState, useRef, useEffect, useContext } from "react";
import axios from 'axios';

export const QuizBoxContext = createContext();

export function Quiz({ children }) {
    const [ready, setReady] = useState();
    const [data, setData] = useState([]);
    const [active, setActive] = useState(0);
    const [message, setMessage] = useState();
    const [countDown, setCountDown] = useState(20);
    const [score, setScore] = useState(0);
    const [correct, setCorrect] = useState([]);
    const [wrong, setWrong] = useState([]);
    const [optionChoose, setOptionChoose] = useState();
    const [showRestart, setShowRestart] = useState(false);
    const [gameStatus, setGameStatus] = useState(true);
    const [questions, setQuestions] = useState(true);
    const [nextLevel, setNextLevel] = useState(false);
    const [buttonMessage, setButtonMessage] = useState();
    const [missedOut, setMissedOut] = useState();
    const [missedCount, setMissedCount] = useState([]);
    const [buttonFunc, setButtonFunc] = useState({ active: false, func: () => {} });
    const [messageBody, setMessageBody] = useState();
    const [categories, setCategories] = useState([]);

    const countdown = useRef();
    const clap = useRef();
    const boo = useRef();
    const gameover = useRef();
    const currentPlayer = useRef();

    const gameOver = () => {
        saveScore();
        setShowRestart(true);
        setGameStatus(false);
        setQuestions(false);
    };

    const changeActive = () => {
        if (active >= data.length - 1) {
            gameOver();
        } else {
            setActive(active + 1);
            setMessage();
        }
        resetAudio();
        setCountDown(20)
    };

    const calculateScore = () => {
        const scoreCalculate = 30 / 20;
        setScore((scoreCalculate * 10) + score);
    };

    const saveScore = async () => {
        await axios.get(`${endpoint}save/${currentPlayer.current.id}/${score}`);
    };

    const checkAnswer = () => {
        resetAudio();
        if (optionChoose === data[active].answer) {
            setMessage('Correct Answer');
            setCorrect(prev => [...prev, data[active]]);
            clap.current.play();
            calculateScore();
        } else {
            setMessage('Wrong Answer');
            setWrong(prev => [...prev, data[active]]);
            setMissedCount(missedCount.slice(0, -1));
            gameover.current.play();
        }
    };

    const restartQuiz = () => {
        setActive(0);
        setCountDown(20);
        setWrong([]);
        setCorrect([]);
        setScore(0);
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

    useEffect(() => {
        const timer = setInterval(() => setCountDown(count => count - 1), 1000);
        if (countDown <= 0) {
            resetAudio();
            gameover.current.play();
            setMessage('Time Out');
            setWrong(prev => [...prev, data[active]]);
            setMissedCount(missedCount.slice(0, -1));
            clearInterval(timer);
        }
        else{
        	if(countdown.current)countdown.current.play();
        }
        if (message) {clearInterval(timer);countdown.current.currentTime = 0;
            countdown.current.pause();}
        return () => clearInterval(timer);
    }, [countDown, message]);

    useEffect(() => {
        if (missedOut > 1) {
            setMissedCount(Array.from({ length: missedOut }, (_, i) => i));
        }
    }, [missedOut]);

    const resetAudio = (all) => {
        [clap, boo, gameover, countdown].forEach(ref => {
            ref.current.currentTime = 0;
            ref.current.pause();
        });
    };

    return (
        <QuizBoxContext.Provider value={{
            active, data, setData, setOptionChoose, gameStatus, setGameStatus,
            questions, setQuestions, setMessage, message, showRestart, score,
            setActive, setScore, changeActive, nextLevel, setNextLevel, restartQuiz,
            restart: showRestart, gameOver, currentPlayer, buttonMessage, setButtonMessage,
            setWrong, wrong, correct, missedOut, setMissedOut, missedCount, setMissedCount,
            categories, clap, boo, countdown, checkAnswer, countDown, buttonFunc
        }}>
            {message && <Message />}
            {children}
        </QuizBoxContext.Provider>
    );
}

export function QuizBox() {
    const options = useRef([]);
    const [showSelect, setShowSelect] = useState(false);
    const { active, data, setOptionChoose, checkAnswer, countdown ,countDown,setMessage} = useContext(QuizBoxContext);

    useEffect(() => {
        
        if (active !== 0) {
            options.current.forEach(element => element && element.classList.remove('select'));
        }
    }, [active]);

    const markChoose = (index) => {
        options.current.forEach(element=>{
        	element.classList.remove("select");
        	element.classList.add("color-black")})
        options.current[index].classList.toggle('select');
        
        setShowSelect(true);
    };

    const selectAnswer = () => {
        countdown.current.pause();
        checkAnswer();
        setShowSelect(false);
    };

    return (
        <div class="container">
            <div className="w-100 center">
                <div className="rounded-circle sz-18 color-s p-3 color-bd-p bold border" style={{ display: 'inline-block' }}>{countDown}</div>
            </div>
            {data[active] &&
                <div className="row center justify-content-center">
                    <div className="sz-24 bold rounded p-3 col-12">{data[active].body}</div>
                    <div className="col-12 my-3">
                        <div className="row m-2">
                            {data[active].options.map((option, i) => (
                                <div className="col-md-6 my-1 p-3" key={i}>
                                    <div className="rounded sz-18 p-4 color-p-hover option color-b- border" style={{ cursor: 'pointer' }} onClick={() => { markChoose(i); setOptionChoose(option); }} ref={el => options.current[i] = el}>{option}</div>
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

function Message() {
    const { message, changeActive, score, restartQuiz, showRestart, questions, buttonMessage, buttonFunc } = useContext(QuizBoxContext);

    return (
        <div className="modal d-flex align-items-center color-bg-white" style={{ backgroundColor: "rgba(100,100,100,0.8)" }}>
            <div className="modal-dialog modal-dialog-centered w-100 h-100 p-3">
                <div className="modal-content p-3 center animate__animated animate__slideInUp">
                    {questions ? (
                        <div className="row my-2 color-p">
                            <div className="col sz-36 bold">{message}</div>
                        </div>
                    ) : (
                        <div className="sz-36">Game End</div>
                    )}
                    <div className="sz-30 color-black row">
                        <div className="col center sz-24">
                            <span><span className="color-black sz-18">{showRestart ? 'Total Score' : 'Your Score'}</span> <br /><b className="sz-36">{score}</b></span>
                        </div>
                    </div>
                    {buttonFunc.active ? <button className="no-border rounded color-bg-p color-white w-100 sz-24 color-bg-s-hover p-2" onClick={buttonFunc.func}>{buttonMessage || 'Next Question'}</button>: <button className="no-border rounded color-bg-p color-white w-100 sz-24 color-bg-s-hover p-2" onClick={()=>changeActive()}>Next Question</button> }

                    {showRestart && <button className="btn color-bg-s color-white w-100 sz-20 color-bg-s-hover" onClick={restartQuiz}>Restart</button>}
                </div>
            </div>
        </div>
    );
}
