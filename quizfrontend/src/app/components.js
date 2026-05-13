"use client";

/**
 * QUIZ COMPONENTS — Fixed for Next.js 15 + new backend flow
 * - QuizBox now accepts questions prop OR fetches via path
 * - All state updates moved to useEffect (no render-time setState)
 * - Guest/Logged-in end screens handled properly
 * - Backend controls score saving, badges, streaks
 */

import { endpoint } from './endpoints.js';
import React, { createContext, useState, useRef, useEffect, useContext } from "react";
import axios from 'axios';
import Link from "next/link";
import { postData } from './endpoints.js';
import { AuthContext } from "./auth.js";

export const QuizBoxContext = createContext();

/* ─── Quiz (provider) ──────────────────────────────────────────────────────── */
export function Quiz({ children }) {
  const [user, setUser] = useState();
  const [game, setGame] = useState();
  const [data, setData] = useState([]);
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState(true);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState();
  const [score, setScore] = useState(0);
  const [scorePercent, setScorePercent] = useState(10);
  const [correct, setCorrect] = useState([]);
  const [wrong, setWrong] = useState([]);
  const [questions, setQuestions] = useState(true);
  const [buttonMessage, setButtonMessage] = useState("Next Question");
  const [categories, setCategories] = useState([]);
  const [batch, setBatch] = useState();
  const [nextBatch, setNextBatch] = useState();
  const [end, setEnd] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [alert, setAlert] = useState();
  const [loader, setLoader] = useState(true);
  const [mark, setMark] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [sound, setSound] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const countdown = useRef();
  const clap = useRef();
  const boo = useRef();
  const gameover = useRef();

  const gameOver = () => {
    setQuestions(false);
    setShowResults(true);
    setMessage("Quiz Complete!");
  };

  const changeActive = () => {
    // If showing results screen, move to true end
    if (showResults) {
      setShowResults(false);
      setEnd(true);
      return;
    }

    // If on last question
    if (active === data.length - 1) {
      if (hasNextPage && nextBatch) {
        // More pages available — parent should fetch
        setMessage("Loading more questions...");
      } else {
        // No more questions — show results
        gameOver();
      }
    } else {
      // Go to next question
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
    setBatch();
    setEnd(false);
    setShowResults(false);
    setMessage();
    setButtonMessage("Next Question");
    setHasNextPage(false);
    setNextBatch();
    setQuizSubmitted(false);
    setData([]);
  };

  useEffect(() => {
    countdown.current = new Audio("/calmtickling.mp3");
    boo.current = new Audio("/booing.wav");
    clap.current = new Audio("/clapping.wav");
    gameover.current = new Audio("/gameover.wav");
  }, []);

  const resetAudio = () => {
    [clap, boo, gameover, countdown].forEach(ref => {
      if (ref.current) {
        ref.current.currentTime = 0;
        ref.current.pause();
      }
    });
  };

  // Check login status
  useEffect(() => {
    try {
      postData('checkuser').then(res => {
        setUser(res.user ? res.user : null);
      }).catch(() => setUser(null));
    } catch (err) {
      console.log(err);
    }
  }, []);

  // Alert timer
  useEffect(() => {
    if (!alert) return;
    let timer = setTimeout(() => setAlert(), 5000);
    return () => clearTimeout(timer);
  }, [alert]);

  // Update button message when approaching end
  useEffect(() => {
    if (data.length > 0 && active === data.length - 1 && !hasNextPage) {
      setButtonMessage("See Results");
    } else {
      setButtonMessage("Next Question");
    }
  }, [active, data.length, hasNextPage]);

  return (
    <QuizBoxContext.Provider value={{
      active, data, setData,
      questions, setQuestions, setMessage, message, score,
      setActive, setScore, changeActive, restartQuiz,
      gameOver, buttonMessage, setButtonMessage,
      setWrong, wrong, correct, error, setError,
      categories, clap, boo, countdown, resetAudio, restartQuiz, gameover, setCorrect, setScore,
      batch, user, setBatch, end, setEnd, setUser, scorePercent, setScorePercent,
      game, setGame, setAlert, alert, loader, setLoader,
      mark, setNextBatch, setMark, nextBatch, status, setStatus,
      confirm, setConfirm, sound, setSound,
      showResults, setShowResults,
      hasNextPage, setHasNextPage,
      quizSubmitted, setQuizSubmitted
    }}>

      {/* Alert banner */}
      {alert && (
        <div className="fixed top-[70px] left-1/2 -translate-x-1/2 z-[200] w-[min(92vw,500px)] bg-[#2a1515] border border-danger rounded-xl px-[18px] py-[14px] flex items-center gap-3 text-danger text-[0.95rem] animate-slide-down">
          <span>⚠ {alert}</span>
          <button
            className="ml-auto cursor-pointer text-[1.1rem] opacity-70 bg-transparent border-none text-danger"
            onClick={() => setAlert()}
          >✕</button>
        </div>
      )}

      {message && <Message />}
      {children}
    </QuizBoxContext.Provider>
  );
}

/* ─── QuizBox ──────────────────────────────────────────────────────────────── */
export function QuizBox({ path, externalQuestions }) {
  const options = useRef([]);
  const selectedOption = useRef();
  const correctWords = ["Nailed it!", "Spot on!", "On Point!", "Legit!", "Boom"];
  const wrongWords = ["Nah, Fam!", "Uh-Oh!", "Swing n Miss!", "Whoops", "So close!"];
  const [showSelect, setShowSelect] = useState(false);

  const {
    active, data, countdown, setMessage, setData, resetAudio, restartQuiz,
    setWrong, gameover, setCorrect, clap, setScore, scorePercent,
    setGame, setMark, error, setError, confirm, sound, setLoader
  } = useContext(QuizBoxContext);

  // If externalQuestions provided, use them instead of fetching
  useEffect(() => {
    if (externalQuestions && externalQuestions.length > 0) {
      setData(externalQuestions);
      setLoader(false);
    } else if (path) {
      // Fallback: fetch using path
      fetchData();
    }

    return () => { setMessage(); resetAudio(); restartQuiz(); };
  }, [path, externalQuestions]);

  const fetchData = () => {
    setLoader(true);
    fetch(endpoint + path + "?format=json")
      .then(res => res.json())
      .then(x => {
        setLoader(false);
        if (x.game != null) { setGame(x.game); }
        else { setMessage("Game does not exist"); }
        if (x.questions) { setData(prev => [...prev, ...x.questions]); }
      })
      .catch(err => {
        setLoader(false);
        setError(true);
        setMessage(err.toString());
        console.error("Error fetching data:", err);
      });
  };

  useEffect(() => {
    options.current.forEach(el => el && el.classList.remove('option-selected'));
    setMessage();
    return () => resetAudio();
  }, [active]);

  const markChoose = (index, option) => {
    options.current.forEach(el => { if (el) el.classList.remove("option-selected"); });
    options.current[index].classList.add('option-selected');
    setShowSelect(true);
    selectedOption.current = option;
  };

  const checkAnswer = () => {
    resetAudio();
    const currentQuestion = data[active];
    const isCorrect = selectedOption.current === currentQuestion.answer;

    if (isCorrect) {
      setScore(prev => prev + scorePercent);
      setMark(2);
      setMessage(correctWords[Math.floor(Math.random() * correctWords.length)]);
      setCorrect(prev => [...prev, currentQuestion]);
      if (sound) clap.current.play();
    } else {
      setMark(1);
      setMessage(wrongWords[Math.floor(Math.random() * wrongWords.length)]);
      setWrong(prev => [...prev, currentQuestion]);
      if (sound) gameover.current.play();
    }
  };

  const selectAnswer = () => {
    countdown.current.pause();
    checkAnswer();
    setShowSelect(false);
  };

  if (!data || data.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-10 h-10 border-3 border-accent/20 border-t-accent rounded-full animate-spin" />
        <p className="text-muted mt-4">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {data[active] && (
        <>
          {/* Question card */}
          <div className="bg-surface border border-border rounded-xl px-6 py-7 font-head text-xl font-semibold leading-relaxed text-txt mb-5">
            {data[active]?.body}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data[active]?.options?.map((option, i) => (
              <div
                key={i}
                ref={el => (options.current[i] = el)}
                onClick={() => { markChoose(i, option); if (!confirm) selectAnswer(); }}
                className="bg-surface border-2 border-border rounded-xl px-4 py-[18px] text-[0.95rem] text-txt cursor-pointer select-none relative transition-all duration-150 hover:border-accent hover:bg-surface2 active:scale-[0.98]"
              >
                {option.body || option}
              </div>
            ))}
          </div>

          {/* Confirm button */}
          {showSelect && confirm && (
            <button
              onClick={selectAnswer}
              className="mt-4 w-full bg-accent text-bg font-bold text-base rounded-xl py-[14px] px-5 cursor-pointer border-none transition-opacity hover:opacity-80 active:scale-[0.97]"
            >
              Confirm Answer
            </button>
          )}
        </>
      )}

      <style>{`
        .option-selected {
          border-color: #b8ff57 !important;
          background: rgba(184,255,87,0.08) !important;
          color: #b8ff57 !important;
          font-weight: 600;
        }
        .option-selected::before {
          content: '✓';
          position: absolute;
          top: 10px; right: 12px;
          font-size: 0.8rem;
          color: #b8ff57;
        }
      `}</style>
    </div>
  );
}

/* ─── Message modal ────────────────────────────────────────────────────────── */
function Message() {
  const { end, error, showResults } = useContext(QuizBoxContext);
  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-5">
      <div className="bg-surface border border-border rounded-[18px] px-7 py-9 w-full max-w-[420px] text-center animate-pop-in">
        {error ? <ErrorBoard /> 
          : showResults ? <ResultsBoard /> 
          : end ? <EndBoard /> 
          : <ScoreBoard />}
      </div>
    </div>
  );
}

/* ─── ScoreBoard ───────────────────────────────────────────────────────────── */
function ScoreBoard() {
  const { message, changeActive, score, buttonMessage, mark } = useContext(QuizBoxContext);

  const icon =
    mark === 1 ? <span className="block text-5xl text-danger mb-2">✗</span>
    : mark === 2 ? <span className="block text-5xl text-accent mb-2">✓</span>
    : mark === 3 ? <span className="block text-5xl text-warn mb-2">⏱</span>
    : null;

  return (
    <>
      {icon}
      <div className="font-head text-2xl font-bold text-txt mb-1">{message}</div>
      <div className="inline-block bg-surface2 rounded-xl px-6 py-4 my-5">
        <div className="text-xs uppercase tracking-widest text-muted mb-1">Current Score</div>
        <div className="font-head text-5xl font-extrabold text-accent">{score}</div>
      </div>
      <button
        onClick={changeActive}
        className="w-full bg-accent text-bg font-bold text-base rounded-xl py-[14px] px-5 cursor-pointer border-none transition-opacity hover:opacity-80 active:scale-[0.97]"
      >
        {buttonMessage}
      </button>
    </>
  );
}

/* ─── ResultsBoard ───────────────────────────────────────────────────────── */
function ResultsBoard() {
  const { score, data, correct, wrong, changeActive, user } = useContext(QuizBoxContext);

  const totalPossible = data.length * (data[0]?.score || 10);
  const percentage = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;

  const getGrade = () => {
    if (percentage >= 90) return { label: "Outstanding!", color: "text-accent", emoji: "🏆" };
    if (percentage >= 70) return { label: "Great Job!", color: "text-accent", emoji: "🌟" };
    if (percentage >= 50) return { label: "Good Effort", color: "text-warn", emoji: "👍" };
    return { label: "Keep Practicing", color: "text-danger", emoji: "💪" };
  };

  const grade = getGrade();

  return (
    <>
      <div className="text-5xl mb-3">{grade.emoji}</div>
      <div className={`font-head text-2xl font-bold ${grade.color} mb-1`}>
        {grade.label}
      </div>
      <p className="text-muted text-sm mb-6">Quiz Complete</p>

      {/* Score Circle */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path className="text-border" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
          <path className={percentage >= 50 ? "text-accent" : "text-danger"} strokeDasharray={`${percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-head text-3xl font-extrabold text-txt">{percentage}%</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface2 rounded-xl p-3">
          <div className="text-xs text-muted uppercase tracking-wider">Score</div>
          <div className="font-head text-xl font-bold text-accent">{score}</div>
        </div>
        <div className="bg-surface2 rounded-xl p-3">
          <div className="text-xs text-muted uppercase tracking-wider">Correct</div>
          <div className="font-head text-xl font-bold text-accent">{correct.length}</div>
        </div>
        <div className="bg-surface2 rounded-xl p-3">
          <div className="text-xs text-muted uppercase tracking-wider">Wrong</div>
          <div className="font-head text-xl font-bold text-danger">{wrong.length}</div>
        </div>
      </div>

      <button
        onClick={changeActive}
        className="w-full bg-accent text-bg font-bold text-base rounded-xl py-[14px] px-5 cursor-pointer border-none transition-opacity hover:opacity-80 active:scale-[0.97]"
      >
        Continue →
      </button>
    </>
  );
}

/* ─── EndBoard ─────────────────────────────────────────────────────────────── */
function EndBoard() {
  const { user, score, data, correct, wrong, restartQuiz } = useContext(QuizBoxContext);

  const totalPossible = data.length * (data[0]?.score || 10);
  const percentage = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;

  const handleRetry = () => {
    restartQuiz();
    window.location.reload();
  };

  return (
    <>
      <div className="text-4xl mb-3">🏁</div>
      <div className="font-head text-2xl font-extrabold text-txt mb-2">Game Over</div>

      {/* Final Score Display */}
      <div className="bg-surface2 rounded-xl px-6 py-5 my-5 w-full">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs uppercase tracking-widest text-muted font-bold">Final Score</span>
          <span className="font-head text-3xl font-extrabold text-accent">{score}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase tracking-widest text-muted font-bold">Accuracy</span>
          <span className={`font-head text-xl font-bold ${percentage >= 50 ? 'text-accent' : 'text-danger'}`}>
            {percentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-border rounded-full mt-3 overflow-hidden">
          <div className={`h-full rounded-full ${percentage >= 50 ? 'bg-accent' : 'bg-danger'}`} style={{ width: `${percentage}%` }} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="text-center">
          <div className="text-2xl text-accent">✓ {correct.length}</div>
          <div className="text-xs text-muted">Correct</div>
        </div>
        <div className="text-center">
          <div className="text-2xl text-danger">✗ {wrong.length}</div>
          <div className="text-xs text-muted">Wrong</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-[10px]">
        <button
          onClick={handleRetry}
          className="block w-full px-5 py-[13px] rounded-xl bg-accent text-bg font-bold text-[0.95rem] no-underline text-center transition-opacity hover:opacity-85 border-none cursor-pointer"
        >
          ↻ Play Again
        </button>

        <Link
          href="/"
          className="block px-5 py-[13px] rounded-xl border border-border text-muted font-semibold text-[0.95rem] no-underline text-center transition-all hover:border-accent hover:text-accent"
        >
          ← Return Home
        </Link>

        {!user && (
          <Link
            href="/account/signup"
            className="block px-5 py-[13px] rounded-xl bg-surface2 border border-border text-txt font-semibold text-[0.95rem] no-underline text-center transition-all hover:border-accent hover:text-accent"
          >
            Sign Up to Save Scores
          </Link>
        )}

        {user && (
          <Link
            href="/leaderboards"
            className="block px-5 py-[13px] rounded-xl bg-surface2 border border-border text-txt font-semibold text-[0.95rem] no-underline text-center transition-all hover:border-accent hover:text-accent"
          >
            🏆 View Leaderboards
          </Link>
        )}
      </div>
    </>
  );
}

/* ─── ErrorBoard ───────────────────────────────────────────────────────────── */
function ErrorBoard() {
  const { message } = useContext(QuizBoxContext);
  return (
    <>
      <div className="text-4xl mb-2">⚠</div>
      <div className="font-head text-2xl font-bold text-danger mb-2">Something went wrong</div>
      {message && <p className="text-muted text-sm mt-2">{message}</p>}
      <button
        onClick={() => window.location.reload()}
        className="mt-5 w-full bg-surface2 text-txt border border-border font-semibold text-base rounded-xl py-[13px] px-5 cursor-pointer transition-all hover:border-accent hover:text-accent"
      >
        Reload
      </button>
    </>
  );
}

/* ─── MissedOut ────────────────────────────────────────────────────────────── */
export const MissedOut = ({ number }) => {
  const { wrong, gameOver } = useContext(QuizBoxContext);

  useEffect(() => {
    if (wrong.length >= number) gameOver();
  }, [wrong]);

  return (
    <span className="inline-flex gap-1.5 items-center">
      {Array(number).fill().map((_, i) => (
        <span key={i} className={`text-xl ${i < wrong.length ? 'text-border' : 'text-danger'}`}>♥</span>
      ))}
    </span>
  );
};

/* ─── CountDown ────────────────────────────────────────────────────────────── */
export function CountDown({ number }) {
  const {
    wrong, gameover, setWrong, setMessage, resetAudio,
    message, countdown, active, data, setMark, sound
  } = useContext(QuizBoxContext);

  const [countDown, setCountDown] = useState(number || 20);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const timer = setInterval(() => setCountDown(c => c - 1), 1000);

    if (countDown <= 0) {
      resetAudio();
      if (sound && gameover.current) gameover.current.play();
      setMark(3);
      setMessage('Time Out');
      setWrong(prev => [...prev, data[active]]);
      clearInterval(timer);
    }

    if (message) { 
      clearInterval(timer); 
      if (countdown.current) countdown.current.currentTime = 0; 
    }

    return () => clearInterval(timer);
  }, [countDown, message, data]);

  useEffect(() => { 
    setCountDown(number || 20); 
  }, [active, number]);

  return (
    <span className={`inline-flex items-center justify-center w-11 h-11 rounded-full border-2 border-danger text-danger font-head text-lg font-bold transition-all ${countDown <= 5 ? 'bg-danger/10 animate-pulse-ring' : ''}`}>
      {countDown}
    </span>
  );
}

/* ─── Header ───────────────────────────────────────────────────────────────── */
export const Header = () => {
  const { data } = useContext(AuthContext);
  return (
    <header className="sticky top-0 z-[100] flex items-center justify-between px-6 py-[14px] bg-bg/85 backdrop-blur-md border-b border-border">
      <Link href="/" className="font-head text-2xl font-extrabold text-txt no-underline">
        <span className="text-accent">Q</span>uizzify
      </Link>
      <nav className="flex items-center gap-4">
        {data?.user
          ? <Link href="/profile" className="text-muted text-sm no-underline transition-colors hover:text-accent">{data.user.username}</Link>
          : <Link href="/account/signup" className="text-muted text-sm no-underline transition-colors hover:text-accent">Sign Up</Link>
        }
        {data?.user && (
          <Link href="/leaderboards" className="text-muted text-sm px-[14px] py-[6px] rounded-lg border border-border no-underline transition-all hover:text-accent hover:border-accent">
            Leaderboards
          </Link>
        )}
      </nav>
    </header>
  );
};

/* ─── Instructions ─────────────────────────────────────────────────────────── */
export function Instructions(props) {
  const { confirm, sound, setConfirm, setSound } = useContext(QuizBoxContext);

  const ToggleBtn = ({ isActive, onClick, label }) => (
    <button
      onClick={onClick}
      className={`px-[18px] py-[7px] rounded-lg border text-[0.9rem] font-medium cursor-pointer transition-all ${
        isActive
          ? 'bg-accent text-bg border-accent font-semibold'
          : 'bg-transparent text-muted border-border hover:border-accent hover:text-accent'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-lg mx-auto px-5 py-7">

      <div className="flex items-center justify-center gap-[10px] font-head text-[1.6rem] font-extrabold text-txt text-center mb-7">
        <i className={props.icon}></i>
        {props.name}
      </div>

      <div className="bg-surface border border-border rounded-xl px-5 py-[18px] mb-[14px]">
        <div className="text-[0.75rem] uppercase tracking-widest text-muted font-bold mb-1.5">⏱ Time per question</div>
        <div className="text-txt font-medium">{props.time} seconds</div>
      </div>

      <div className="bg-surface border border-border rounded-xl px-5 py-[18px] mb-[14px]">
        <div className="text-[0.75rem] uppercase tracking-widest text-muted font-bold mb-1.5">★ Points per question</div>
        <div className="text-txt font-medium">{props.score} points</div>
      </div>

      <div className="bg-surface border border-border rounded-xl px-5 py-[18px] mb-[14px]">
        <div className="text-[0.75rem] uppercase tracking-widest text-muted font-bold mb-4">⚙ Settings</div>
        <div className="flex flex-col gap-[14px]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-txt">Confirm answer</span>
            <div className="flex gap-1.5">
              <ToggleBtn isActive={confirm}  onClick={() => setConfirm(true)}  label="Yes" />
              <ToggleBtn isActive={!confirm} onClick={() => setConfirm(false)} label="No"  />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-txt">Sound effects</span>
            <div className="flex gap-1.5">
              <ToggleBtn isActive={sound}  onClick={() => setSound(true)}  label="On"  />
              <ToggleBtn isActive={!sound} onClick={() => setSound(false)} label="Off" />
            </div>
          </div>
        </div>
      </div>

      <Link
        href={{ pathname: "quickplay/game", query: props }}
        className="block text-center no-underline bg-accent text-bg font-bold text-[1.05rem] px-5 py-4 rounded-xl transition-opacity hover:opacity-85 active:scale-[0.98] mt-2"
      >
        Start Game →
      </Link>
    </div>
  );
}
