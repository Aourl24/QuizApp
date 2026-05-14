'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { QuizBox, QuizBoxContext, CountDown, Quiz } from '../../components.js'
import { apiGet, apiPost } from '../../endpoints.js'

/**
 * src/app/quickplay/game/page.js
 *
 * - No batchanswers/ call needed — answer field is already in OptionPlayerSerializer
 * - Per-question marks: totalPossible calculated from question.mark values
 * - modeScore set as fallback for questions with null mark
 */

function Main() {
  const {
    data, setData, setGame, setLoader,
    setModeScore,                          // replaces setScorePercent
    setBatch, setNextBatch, setHasNextPage,
    active, score, correct, wrong,
    end, user, setMessage,
    getQuestionMark,
  } = React.useContext(QuizBoxContext)

  const searchParams = useSearchParams()
  const gameId       = searchParams.get('game')

  const [gameInfo, setGameInfo]         = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [quizComplete, setQuizComplete] = useState(false)
  const [totalMarks, setTotalMarks]     = useState(null)

  const currentPageRef = useRef(1)
  const isFetchingRef  = useRef(false)

  useEffect(() => {
    if (!gameId) { setError('No game selected'); setLoading(false); return; }
    fetchQuestions(1, true)
  }, [gameId])

  const fetchQuestions = async (page, isFirst = false) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    try {
      setLoading(true)
      const result = await apiGet(`getgame/${gameId}/${page}/`)
      if (result.error) { setError(result.error); return; }

      if (result.game && !gameInfo) {
        setGameInfo(result.game)
        setGame(result.game)
        setModeScore(result.game.mode?.score || 10)
        // total_marks from backend — always accurate
        if (result.game.total_marks != null) {
          setTotalMarks(result.game.total_marks)
        }
      }

      if (result.questions?.length > 0) {
        setData(prev => isFirst ? result.questions : [...prev, ...result.questions])
        setHasNextPage(result.has_next || false)
        setNextBatch(result.next_page_number || null)
        setBatch(result.has_next ? result.next_page_number : 0)
        currentPageRef.current = page
      } else {
        setBatch(0)
        setHasNextPage(false)
      }
    } catch (err) {
      setError('Failed to load questions')
      console.error(err)
    } finally {
      setLoading(false)
      setLoader(false)
      isFetchingRef.current = false
    }
  }

  // Prefetch next page 3 questions before the end
  useEffect(() => {
    if (data.length > 0 && active >= data.length - 3 && !isFetchingRef.current) {
      fetchQuestions(currentPageRef.current + 1, false)
    }
  }, [active, data.length])

  // Save score when quiz ends
  useEffect(() => {
    if (!end || quizComplete) return
    setQuizComplete(true)

    if (user?.id) {
      // totalPossible: sum of each question's actual mark
      const totalPossible = data.reduce((sum, q) => sum + getQuestionMark(q), 0)
      saveScore(score, totalPossible, correct.length, wrong.length)
    }
  }, [end])

  const saveScore = async (finalScore, totalPossible, correctCount, wrongCount) => {
    try {
      const result = await apiPost('completegame/', {
        player:         user.id,
        score:          finalScore,
        game:           gameId,
        total_possible: totalPossible,
        correct_count:  correctCount,
        wrong_count:    wrongCount,
      })
      if (result?.message) setMessage(result.message)
    } catch (err) {
      console.error('Failed to save score:', err)
    }
  }

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-muted mt-4">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-danger font-semibold">{error}</p>
        </div>
      </div>
    )
  }

  const timeLimit = gameInfo?.time_per_question || gameInfo?.mode?.time || 20

  return (
    <div className="min-h-screen bg-bg">

      {/* Game header */}
      <div className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-border px-5 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">🎮</div>
            <div>
              <div className="font-head text-sm font-bold text-txt">{gameInfo?.title || 'Quiz'}</div>
              <div className="text-xs text-muted">Question {active + 1} of {data.length}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <CountDown number={timeLimit} />
            <div className="text-right">
              <div className="font-head text-lg font-bold text-accent">{score}</div>
              <div className="text-[10px] text-muted">
                {totalMarks != null ? `/ ${totalMarks} pts` : 'pts'}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-2xl mx-auto mt-3">
          <div className="w-full h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${data.length > 0 ? ((active + 1) / data.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6">
        <QuizBox />
      </div>

    </div>
  )
}

export default function App() {
  return (
    <Quiz>
      <Main />
    </Quiz>
  )
}
