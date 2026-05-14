"use client";

import React, { createContext, useState, useRef, useEffect, useContext } from "react";
import Link from "next/link";
import { useApp } from "./appContext.js";

export const QuizBoxContext = createContext();

/* ─── Quiz (provider) ──────────────────────────────────────────────────────── */
export function Quiz({ children }) {
  const {
    user, setUser, alert, setAlert, loader, setLoader,
    confirm, setConfirm, sound, setSound,
    feedbackMode, setFeedbackMode,          // 'immediate' | 'end'
  } = useApp()

  // Game-specific state
  const [game, setGame]                   = useState();
  const [data, setData]                   = useState([]);
  const [active, setActive]               = useState(0);
  const [error, setError]                 = useState(false);
  const [message, setMessage]             = useState();
  const [score, setScore]                 = useState(0);
  const [modeScore, setModeScore]         = useState(10);  // fallback from game mode
  const [correct, setCorrect]             = useState([]);
  const [wrong, setWrong]                 = useState([]);
  const [buttonMessage, setButtonMessage] = useState("Next Question");
  const [batch, setBatch]                 = useState();
  const [nextBatch, setNextBatch]         = useState();
  const [end, setEnd]                     = useState(false);
  const [showResults, setShowResults]     = useState(false);
  const [answerMark, setAnswerMark]       = useState(0);  // 1=wrong 2=correct 3=timeout
  const [hasNextPage, setHasNextPage]     = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [status, setStatus]               = useState(true);
  const [totalPossible, setTotalPossible] = useState(0);

  // End-only feedback: store per-question results without showing modal
  const [questionResults, setQuestionResults] = useState([]);

  const countdown = useRef();
  const clap      = useRef();
  const boo       = useRef();
  const gameover  = useRef();

  useEffect(() => {
    countdown.current = new Audio("/calmtickling.mp3");
    boo.current       = new Audio("/booing.wav");
    clap.current      = new Audio("/clapping.wav");
    gameover.current  = new Audio("/gameover.wav");
  }, []);

  const resetAudio = () => {
    [clap, boo, gameover, countdown].forEach(ref => {
      if (ref.current) { ref.current.currentTime = 0; ref.current.pause(); }
    });
  };

  // Get mark value for a question — uses question.mark if set, else modeScore
  const getQuestionMark = (question) => question?.mark ?? modeScore;

  // Track total possible score as questions load
  useEffect(() => {
    if (data.length > 0) {
      const total = data.reduce((sum, q) => sum + getQuestionMark(q), 0);
      setTotalPossible(total);
    }
  }, [data, modeScore]);

  const gameOver = () => {
    setShowResults(true);
    setMessage("Quiz Complete!");
  };

  const changeActive = () => {
    if (showResults) {
      setShowResults(false);
      setEnd(true);
      return;
    }
    if (active === data.length - 1) {
      if (hasNextPage && nextBatch) {
        setMessage();
      } else {
        gameOver();
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
    setBatch();
    setEnd(false);
    setShowResults(false);
    setMessage();
    setButtonMessage("Next Question");
    setHasNextPage(false);
    setNextBatch();
    setQuizSubmitted(false);
    setData([]);
    setTotalPossible(0);
    setQuestionResults([]);
    setAnswerMark(0);
  };

  // Auto-update button label
  useEffect(() => {
    if (data.length > 0 && active === data.length - 1 && !hasNextPage) {
      setButtonMessage("See Results");
    } else {
      setButtonMessage("Next Question");
    }
  }, [active, data.length, hasNextPage]);

  return (
    <QuizBoxContext.Provider value={{
      // From AppContext
      user, setUser,
      alert, setAlert,
      loader, setLoader,
      confirm, setConfirm,
      sound, setSound,
      feedbackMode, setFeedbackMode,

      // Game state
      active, setActive,
      data, setData,
      game, setGame,
      error, setError,
      message, setMessage,
      score, setScore,
      modeScore, setModeScore,
      correct, setCorrect,
      wrong, setWrong,
      buttonMessage, setButtonMessage,
      batch, setBatch,
      nextBatch, setNextBatch,
      end, setEnd,
      showResults, setShowResults,
      answerMark, setAnswerMark,
      hasNextPage, setHasNextPage,
      quizSubmitted, setQuizSubmitted,
      status, setStatus,
      totalPossible, setTotalPossible,
      questionResults, setQuestionResults,

      // Methods
      gameOver,
      changeActive,
      restartQuiz,
      resetAudio,
      getQuestionMark,

      // Audio refs
      countdown, clap, boo, gameover,
    }}>
      {message && <Message />}
      {children}
    </QuizBoxContext.Provider>
  );
}

/* ─── QuizBox ──────────────────────────────────────────────────────────────── */
export function QuizBox() {
  const multiSelected  = useRef(new Set()); // for multi-select: Set of selected option IDs
  const options        = useRef([]);
  const selectedOption = useRef(null);      // single-select: option body string
  const selectedId     = useRef(null);      // single-select: option id

  const correctWords = ["Nailed it!", "Spot on!", "On Point!", "Legit!", "Boom"];
  const wrongWords   = ["Nah, Fam!", "Uh-Oh!", "Swing n Miss!", "Whoops", "So close!"];

  const [showConfirm, setShowConfirm] = useState(false);
  const [multiCount, setMultiCount]   = useState(0); // track selection count for re-render

  // Read directly from AppContext — guaranteed to match what user set in settings
  const { confirm, sound, feedbackMode } = useApp();

  const {
    active, data, countdown, setMessage, resetAudio,
    setWrong, gameover, setCorrect, clap,
    setScore, setAnswerMark, getQuestionMark,
    questionResults, setQuestionResults,
    changeActive,
  } = useContext(QuizBoxContext);

  const currentQ       = data[active];
  const isMultiple     = currentQ?.has_multiple_answers === true;
  const correctCount   = currentQ?.correct_answer_count ?? 1;
  const questionMark   = getQuestionMark(currentQ);

  // Reset on question change
  useEffect(() => {
    options.current.forEach(el => el && el.classList.remove('option-selected', 'option-correct', 'option-wrong'));
    setShowConfirm(false);
    selectedOption.current = null;
    selectedId.current = null;
    multiSelected.current = new Set();
    setMultiCount(0);
    return () => resetAudio();
  }, [active]);

  // Use refs for confirm and feedbackMode — prevents stale closure bugs
  // in event handlers and checkAnswer. Default to safe values so the
  // modal always shows even if AppContext hasn't hydrated yet.
  const confirmRef = useRef(confirm ?? false);
  useEffect(() => { confirmRef.current = confirm ?? false; }, [confirm]);

  const feedbackModeRef = useRef(feedbackMode ?? 'immediate');
  useEffect(() => { feedbackModeRef.current = feedbackMode ?? 'immediate'; }, [feedbackMode]);

  /* ── Single-select handler ── */
  const handleSingleClick = (index, option) => {
    options.current.forEach(el => el && el.classList.remove('option-selected'));
    if (options.current[index]) options.current[index].classList.add('option-selected');
    selectedOption.current = option.body ?? option;
    selectedId.current = option.id ?? null;
    setShowConfirm(true);

    // If confirm is OFF — check immediately without waiting for confirm button
    if (!confirmRef.current) {
      if (countdown.current) countdown.current.pause();
      checkAnswer();
      setShowConfirm(false);
    }
  };

  /* ── Multi-select handler ── */
  const handleMultiClick = (index, option) => {
    const id = option.id;
    if (multiSelected.current.has(id)) {
      multiSelected.current.delete(id);
      if (options.current[index]) options.current[index].classList.remove('option-selected');
    } else {
      multiSelected.current.add(id);
      if (options.current[index]) options.current[index].classList.add('option-selected');
    }
    setMultiCount(multiSelected.current.size); // trigger re-render for button state
    setShowConfirm(multiSelected.current.size > 0);
  };

  /* ── Check answer logic ── */
  const checkAnswer = () => {
    if (!currentQ) return;
    resetAudio();

    let isCorrect = false;
    const earnedMark = questionMark;

    if (isMultiple) {
      const correctIds = new Set(
        currentQ.options.filter(o => o.answer === true).map(o => o.id)
      );
      const selectedIds = multiSelected.current;
      isCorrect = (
        selectedIds.size === correctIds.size &&
        [...selectedIds].every(id => correctIds.has(id))
      );
    } else {
      const matchedOption = currentQ.options.find(
        o => (o.body ?? o) === selectedOption.current
      );
      isCorrect = matchedOption?.answer === true;
    }

    // Update score and tracking
    if (isCorrect) {
      setScore(prev => prev + earnedMark);
      setAnswerMark(2);
      setCorrect(prev => [...prev, currentQ]);
      if (sound && clap.current) clap.current.play();
    } else {
      setAnswerMark(1);
      setWrong(prev => [...prev, currentQ]);
      if (sound && gameover.current) gameover.current.play();
    }

    setQuestionResults(prev => [...prev, {
      question: currentQ.body,
      isCorrect,
      earnedMark: isCorrect ? earnedMark : 0,
      maxMark: earnedMark,
    }]);

    const mode = feedbackModeRef.current;

    if (mode === 'immediate') {
      // Show modal — this is the primary feedback path
      setMessage(isCorrect
        ? correctWords[Math.floor(Math.random() * correctWords.length)]
        : wrongWords[Math.floor(Math.random() * wrongWords.length)]
      );
    } else {
      // End-only: highlight correct/wrong on options, then auto-advance
      currentQ.options.forEach((opt, i) => {
        if (!options.current[i]) return;
        if (opt.answer) {
          options.current[i].classList.add('option-correct');
        } else if (
          isMultiple
            ? multiSelected.current.has(opt.id)
            : (opt.body ?? opt) === selectedOption.current
        ) {
          options.current[i].classList.add('option-wrong');
        }
      });
      // Use ref-captured changeActive to avoid stale closure
      const advance = changeActive;
      setTimeout(() => advance(), 1200);
    }
  };

  // Called by the Confirm button only
  const selectAnswer = () => {
    if (isMultiple && multiSelected.current.size === 0) return;
    if (!isMultiple && !selectedOption.current) return;
    if (countdown.current) countdown.current.pause();
    checkAnswer();
    setShowConfirm(false);
  };

  if (!data || data.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-10 h-10 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
        <p className="text-muted mt-4">Loading questions...</p>
      </div>
    );
  }

  const allSelected = isMultiple
    ? multiCount === correctCount
    : showConfirm;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* Question card */}
      <div className="bg-surface border border-border rounded-xl px-6 py-7 mb-5">

        {/* Top meta row: marks + multi-select hint */}
        <div className="flex items-center justify-between mb-4">
          {/* Mark badge */}
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 border border-accent/20 rounded-full px-3 py-1">
            ⚡ {questionMark} {questionMark === 1 ? 'Point' : 'Points'}
          </span>

          {/* Multi-select instruction */}
          {isMultiple && (
            <span className="text-xs font-semibold text-warn bg-warn/10 border border-warn/20 rounded-full px-3 py-1">
              Select {correctCount} answers ({multiCount}/{correctCount})
            </span>
          )}
        </div>

        {/* Question body */}
        <p className="font-head text-xl font-semibold leading-relaxed text-txt">
          {currentQ?.body}
        </p>

        {/* Hint */}
        {currentQ?.hint && (
          <p className="text-muted text-xs mt-3 italic">💡 {currentQ.hint}</p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQ?.options?.map((option, i) => (
          <div
            key={option.id ?? i}
            ref={el => (options.current[i] = el)}
            onClick={() => isMultiple
              ? handleMultiClick(i, option)
              : handleSingleClick(i, option)
            }
            className="bg-surface border-2 border-border rounded-xl px-4 py-[18px] text-[0.95rem] text-txt cursor-pointer select-none relative transition-all duration-150 hover:border-accent hover:bg-surface2 active:scale-[0.98]"
          >
            {/* Multi-select checkbox indicator */}
            {isMultiple && (
              <span className={`absolute top-3 right-3 w-4 h-4 rounded border-2 flex items-center justify-center text-[10px] font-bold transition-all ${
                multiSelected.current.has(option.id)
                  ? 'bg-accent border-accent text-bg'
                  : 'border-border'
              }`}>
                {multiSelected.current.has(option.id) ? '✓' : ''}
              </span>
            )}
            {option.body ?? option}
          </div>
        ))}
      </div>

      {/* Confirm button */}
      {/* Always shown for multi-select, shown based on confirm setting for single */}
      {(isMultiple || (confirm && showConfirm)) && (
        <button
          onClick={selectAnswer}
          disabled={isMultiple ? multiCount === 0 : !showConfirm}
          className={`mt-4 w-full font-bold text-base rounded-xl py-[14px] px-5 border-none transition-all active:scale-[0.97] ${
            allSelected
              ? 'bg-accent text-bg cursor-pointer hover:opacity-80'
              : 'bg-surface2 text-muted cursor-not-allowed opacity-50'
          }`}
        >
          {isMultiple
            ? `Submit ${multiCount}/${correctCount} Selected`
            : 'Confirm Answer'
          }
        </button>
      )}

      {/* Runtime CSS for option states — can't use Tailwind for classList toggling */}
      <style>{`
        .option-selected {
          border-color: #b8ff57 !important;
          background: rgba(184,255,87,0.08) !important;
          color: #b8ff57 !important;
          font-weight: 600;
        }
        .option-correct {
          border-color: #b8ff57 !important;
          background: rgba(184,255,87,0.12) !important;
          color: #b8ff57 !important;
          font-weight: 600;
        }
        .option-wrong {
          border-color: #ff5757 !important;
          background: rgba(255,87,87,0.10) !important;
          color: #ff5757 !important;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

/* ─── Message modal ────────────────────────────────────────────────────────── */
function Message() {
  const { error, showResults, end } = useContext(QuizBoxContext);
  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-5">
      <div className="bg-surface border border-border rounded-[18px] px-7 py-9 w-full max-w-[420px] text-center animate-pop-in">
        {error       ? <ErrorBoard />   :
         showResults ? <ResultsBoard /> :
         end         ? <EndBoard />     :
                       <ScoreBoard />}
      </div>
    </div>
  );
}

/* ─── ScoreBoard (immediate feedback modal) ────────────────────────────────── */
function ScoreBoard() {
  const { message, changeActive, score, buttonMessage, answerMark } = useContext(QuizBoxContext);

  const icon =
    answerMark === 1 ? <span className="block text-5xl text-danger mb-2">✗</span>
    : answerMark === 2 ? <span className="block text-5xl text-accent mb-2">✓</span>
    : answerMark === 3 ? <span className="block text-5xl text-warn mb-2">⏱</span>
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

/* ─── ResultsBoard ─────────────────────────────────────────────────────────── */
function ResultsBoard() {
  const { score, totalPossible, correct, wrong, changeActive, questionResults } = useContext(QuizBoxContext);
  const percentage = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;

  const getGrade = () => {
    if (percentage >= 90) return { label: "Outstanding!", color: "text-accent", emoji: "🏆" };
    if (percentage >= 70) return { label: "Great Job!",   color: "text-accent", emoji: "🌟" };
    if (percentage >= 50) return { label: "Good Effort",  color: "text-warn",   emoji: "👍" };
    return                       { label: "Keep Practicing", color: "text-danger", emoji: "💪" };
  };
  const grade = getGrade();

  return (
    <>
      <div className="text-5xl mb-3">{grade.emoji}</div>
      <div className={`font-head text-2xl font-bold ${grade.color} mb-1`}>{grade.label}</div>
      <p className="text-muted text-sm mb-5">Quiz Complete</p>

      {/* Score circle */}
      <div className="relative w-28 h-28 mx-auto mb-5">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path className="text-border" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
          <path
            className={percentage >= 50 ? "text-accent" : "text-danger"}
            strokeDasharray={`${percentage}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-head text-2xl font-extrabold text-txt">{percentage}%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-surface2 rounded-xl p-3">
          <div className="text-[10px] text-muted uppercase tracking-wider">Score</div>
          <div className="font-head text-lg font-bold text-accent">{score}</div>
          <div className="text-[10px] text-muted">/ {totalPossible}</div>
        </div>
        <div className="bg-surface2 rounded-xl p-3">
          <div className="text-[10px] text-muted uppercase tracking-wider">Correct</div>
          <div className="font-head text-lg font-bold text-accent">{correct.length}</div>
        </div>
        <div className="bg-surface2 rounded-xl p-3">
          <div className="text-[10px] text-muted uppercase tracking-wider">Wrong</div>
          <div className="font-head text-lg font-bold text-danger">{wrong.length}</div>
        </div>
      </div>

      <button
        onClick={changeActive}
        className="w-full bg-accent text-bg font-bold text-base rounded-xl py-[14px] px-5 cursor-pointer border-none transition-opacity hover:opacity-80 active:scale-[0.97]"
      >
        View Full Results →
      </button>
    </>
  );
}

/* ─── EndBoard ─────────────────────────────────────────────────────────────── */
function EndBoard() {
  const { user, score, totalPossible, correct, wrong, restartQuiz, questionResults } = useContext(QuizBoxContext);
  const percentage = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;
  const handleRetry = () => { restartQuiz(); window.location.reload(); };

  return (
    <>
      <div className="text-4xl mb-3">🏁</div>
      <div className="font-head text-2xl font-extrabold text-txt mb-2">Game Over</div>

      <div className="bg-surface2 rounded-xl px-5 py-4 my-4 w-full">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs uppercase tracking-widest text-muted font-bold">Final Score</span>
          <span className="font-head text-2xl font-extrabold text-accent">{score} / {totalPossible}</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs uppercase tracking-widest text-muted font-bold">Accuracy</span>
          <span className={`font-head text-lg font-bold ${percentage >= 50 ? 'text-accent' : 'text-danger'}`}>{percentage}%</span>
        </div>
        <div className="w-full h-2 bg-border rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${percentage >= 50 ? 'bg-accent' : 'bg-danger'}`} style={{ width: `${percentage}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center bg-surface2 rounded-xl p-3">
          <div className="text-xl text-accent font-bold">{correct.length}</div>
          <div className="text-xs text-muted">Correct</div>
        </div>
        <div className="text-center bg-surface2 rounded-xl p-3">
          <div className="text-xl text-danger font-bold">{wrong.length}</div>
          <div className="text-xs text-muted">Wrong</div>
        </div>
      </div>

      <div className="flex flex-col gap-[10px]">
        <button onClick={handleRetry} className="w-full px-5 py-[13px] rounded-xl bg-accent text-bg font-bold text-[0.95rem] border-none cursor-pointer transition-opacity hover:opacity-85">
          ↻ Play Again
        </button>
        <Link href="/" className="block px-5 py-[13px] rounded-xl border border-border text-muted font-semibold text-[0.95rem] no-underline text-center transition-all hover:border-accent hover:text-accent">
          ← Return Home
        </Link>
        {!user && (
          <Link href="/account/signup" className="block px-5 py-[13px] rounded-xl bg-surface2 border border-border text-txt font-semibold text-[0.95rem] no-underline text-center transition-all hover:border-accent hover:text-accent">
            Sign Up to Save Scores
          </Link>
        )}
        {user && (
          <Link href="/leaderboards" className="block px-5 py-[13px] rounded-xl bg-surface2 border border-border text-txt font-semibold text-[0.95rem] no-underline text-center transition-all hover:border-accent hover:text-accent">
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
      <button onClick={() => window.location.reload()} className="mt-5 w-full bg-surface2 text-txt border border-border font-semibold text-base rounded-xl py-[13px] px-5 cursor-pointer transition-all hover:border-accent hover:text-accent">
        Reload
      </button>
    </>
  );
}

/* ─── MissedOut ────────────────────────────────────────────────────────────── */
export const MissedOut = ({ number }) => {
  const { wrong, gameOver } = useContext(QuizBoxContext);
  useEffect(() => { if (wrong.length >= number) gameOver(); }, [wrong]);
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
    gameover, setWrong, setMessage, resetAudio, message,
    countdown, active, data, setAnswerMark, sound, changeActive,
    feedbackMode,
  } = useContext(QuizBoxContext);

  const [countDown, setCountDown] = useState(number || 20);
  // Guard ref — prevents timeout logic firing more than once per question
  const hasTimedOut = useRef(false);

  // Reset everything when question changes
  useEffect(() => {
    setCountDown(number || 20);
    hasTimedOut.current = false;  // allow timeout on the new question
  }, [active, number]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Stop ticking if message is showing (modal open) or already timed out
    if (message || hasTimedOut.current) return;

    if (countDown <= 0) {
      // Mark as timed out immediately so this block never runs twice
      hasTimedOut.current = true;
      resetAudio();
      if (sound && gameover.current) gameover.current.play();
      setAnswerMark(3);
      setWrong(prev => [...prev, data[active]]);
      if (feedbackMode === 'immediate') {
        setMessage('Time Out');
      } else {
        setTimeout(() => changeActive(), 1200);
      }
      return;
    }

    const timer = setInterval(() => setCountDown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countDown, message, data]);

  return (
    <span className={`inline-flex items-center justify-center w-11 h-11 rounded-full border-2 border-danger text-danger font-head text-lg font-bold transition-all ${countDown <= 5 ? 'bg-danger/10 animate-pulse-ring' : ''}`}>
      {countDown}
    </span>
  );
}

/* ─── Header ───────────────────────────────────────────────────────────────── */
export const Header = () => {
  const { user } = useApp();
  return (
    <header className="sticky top-0 z-[100] flex items-center justify-between px-6 py-[14px] bg-bg/85 backdrop-blur-md border-b border-border">
      <Link href="/" className="font-head text-2xl font-extrabold text-txt no-underline">
        <span className="text-accent">Q</span>uizzify
      </Link>
      <nav className="flex items-center gap-4">
        {user
          ? <Link href="/profile" className="text-muted text-sm no-underline transition-colors hover:text-accent">{user.username}</Link>
          : <Link href="/account/signup" className="text-muted text-sm no-underline transition-colors hover:text-accent">Sign Up</Link>
        }
        {user && (
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
  const { confirm, sound, setConfirm, setSound, feedbackMode, setFeedbackMode } = useApp();

  const ToggleBtn = ({ isActive, onClick, label }) => (
    <button
      onClick={onClick}
      className={`px-[18px] py-[7px] rounded-lg border text-[0.9rem] font-medium cursor-pointer transition-all ${
        isActive ? 'bg-accent text-bg border-accent font-semibold' : 'bg-transparent text-muted border-border hover:border-accent hover:text-accent'
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
        <div className="text-txt font-medium">{props.score} points (may vary by difficulty)</div>
      </div>

      <div className="bg-surface border border-border rounded-xl px-5 py-[18px] mb-[14px]">
        <div className="text-[0.75rem] uppercase tracking-widest text-muted font-bold mb-4">⚙ Settings</div>
        <div className="flex flex-col gap-4">

          {/* Confirm answer */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-txt">Confirm Answer</div>
              <div className="text-xs text-muted">Show submit button before checking</div>
            </div>
            <div className="flex gap-1.5">
              <ToggleBtn isActive={confirm}  onClick={() => setConfirm(true)}  label="Yes" />
              <ToggleBtn isActive={!confirm} onClick={() => setConfirm(false)} label="No"  />
            </div>
          </div>

          {/* Feedback mode */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-txt">Feedback</div>
              <div className="text-xs text-muted">When to show correct/wrong</div>
            </div>
            <div className="flex gap-1.5">
              <ToggleBtn isActive={feedbackMode === 'immediate'} onClick={() => setFeedbackMode('immediate')} label="Instant" />
              <ToggleBtn isActive={feedbackMode === 'end'}       onClick={() => setFeedbackMode('end')}       label="End" />
            </div>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-txt">Sound Effects</div>
              <div className="text-xs text-muted">Play sounds on answers</div>
            </div>
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
