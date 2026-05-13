'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { QuizBox, QuizBoxContext, CountDown, Quiz } from '../../components.js'
import { endpoint } from '../../endpoints.js'

/**
 * QUICKPLAY GAME PAGE — Actual quiz gameplay
 * 
 * Flow:
 * 1. Read game ID from URL: ?game=5
 * 2. Fetch game details + questions: GET /getgame/<id>/<page>/
 * 3. Track score, correct/wrong locally
 * 4. On complete: POST /completegame/ (if logged in)
 */

export function Main() {
  const { 
    data, setData, setGame, setLoader, setScorePercent, 
    setBatch, setNextBatch, active, score, correct, wrong,
    end, setEnd, user, setMessage
  } = React.useContext(QuizBoxContext)

  const searchParams = useSearchParams()
  const gameId = searchParams.get('game')

  const [gameInfo, setGameInfo] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quizComplete, setQuizComplete] = useState(false)

  // Fetch game questions on mount
  useEffect(() => {
    if (!gameId) {
      setError('No game selected')
      setLoading(false)
      return
    }

    fetchQuestions(1)
  }, [gameId])

  // Fetch questions for a page
  const fetchQuestions = async (page) => {
    try {
      setLoading(true)

      const res = await fetch(`${endpoint}getgame/${gameId}/${page}/`)
      const result = await res.json()

      if (result.error) {
        setError(result.error)
        return
      }

      // Set game info from first page
      if (result.game && !gameInfo) {
        setGameInfo(result.game)
        setGame(result.game)
        setScorePercent(result.game.mode?.score || 10)
      }

      // Append questions to existing data
      if (result.questions && result.questions.length > 0) {
        setData(prev => [...prev, ...result.questions])
        setHasNextPage(result.has_next)
        setNextBatch(result.next_page_number)
        setBatch(result.has_next ? result.next_page_number : 0)
      } else {
        setBatch(0)
      }

    } catch (err) {
      setError('Failed to load questions')
      console.error(err)
    } finally {
      setLoading(false)
      setLoader(false)
    }
  }

  // Handle quiz completion
  useEffect(() => {
    if (end && !quizComplete) {
      setQuizComplete(true)

      // Calculate stats
      const totalQuestions = data.length
      const totalPossible = totalQuestions * (gameInfo?.mode?.score || 10)
      const percentage = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0

      // Save score if logged in
      if (user && user.id) {
        saveScore(score, totalPossible, correct.length, wrong.length)
      }
    }
  }, [end])

  // Save score to backend
  const saveScore = async (score, totalPossible, correctCount, wrongCount) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${endpoint}completegame/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          player: user.id,
          score: score,
          game: gameId,
          total_possible: totalPossible,
          correct_count: correctCount,
          wrong_count: wrongCount
        })
      })

      const result = await res.json()
      if (result.message) {
        setMessage(result.message)
      }
    } catch (err) {
      console.error('Failed to save score:', err)
    }
  }

  // Load more questions when near end
  useEffect(() => {
    if (active >= data.length - 3 && hasNextPage && !loading) {
      fetchQuestions(currentPage + 1)
      setCurrentPage(prev => prev + 1)
    }
  }, [active, data.length, hasNextPage, loading])

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-3 border-accent/20 border-t-accent rounded-full animate-spin" />
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

  if (!gameId) return null

  const timeLimit = gameInfo?.time_per_question || gameInfo?.mode?.time || 20

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-border px-5 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              {gameInfo?.mode?.icon ? (
                <i className={gameInfo.mode.icon}></i>
              ) : (
                <span>🎮</span>
              )}
            </div>
            <div>
              <div className="font-head text-sm font-bold text-txt">
                {gameInfo?.title || 'Quiz'}
              </div>
              <div className="text-xs text-muted">
                Question {active + 1} of {data.length}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <CountDown number={timeLimit} />
            <div className="text-right">
              <div className="font-head text-lg font-bold text-accent">{score}</div>
              <div className="text-[10px] text-muted">pts</div>
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

      {/* Quiz Content */}
      <div className="max-w-2xl mx-auto px-5 py-6">
        <QuizBox path={`getgame/${gameId}/${currentPage}`} />
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
