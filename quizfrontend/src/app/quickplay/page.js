'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiGet } from '../endpoints.js'
import { useApp } from '../appContext.js'

/**
 * src/app/quickplay/page.js
 * Instructions/settings screen before the game starts.
 * Fetches game info including total_marks from the backend.
 */

export default function QuickplaySetup() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const gameId       = searchParams.get('game')

  const { confirm, setConfirm, sound, setSound, feedbackMode, setFeedbackMode } = useApp()

  const [gameData, setGameData] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    if (!gameId) { setError('No game selected'); setLoading(false); return; }

    // Endpoint is game/<slug>/ but we have the ID from query params.
    // getgame/<id>/1/ returns game info via GameListSerializer on page 1
    // We use that instead of game/<slug>/ since we only have the ID here.
    apiGet(`getgame/${gameId}/1/`)
      .then(res => {
        if (res.game) setGameData(res.game)
        else setError('Game not found')
      })
      .catch(() => setError('Failed to load game'))
      .finally(() => setLoading(false))
  }, [gameId])

  const handleStart = () => router.push(`/quickplay/game?game=${gameId}`)

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
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-muted mt-4">Loading game...</p>
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
          <button onClick={() => router.push('/home/game')} className="mt-4 text-accent hover:underline bg-transparent border-none cursor-pointer">
            ← Back to Games
          </button>
        </div>
      </div>
    )
  }

  const modeScore    = gameData?.mode?.score || 10
  const timeLimit    = gameData?.time_per_question || gameData?.mode?.time || 20
  const questionCount = gameData?.question_count || 0
  const totalMarks   = gameData?.total_marks ?? (questionCount * modeScore)

  const difficultyColor = {
    easy:   'text-accent bg-accent/10 border-accent/20',
    medium: 'text-warn bg-warn/10 border-warn/20',
    hard:   'text-danger bg-danger/10 border-danger/20',
  }[gameData?.difficulty] || 'text-muted bg-surface2 border-border'

  return (
    <div className="min-h-screen bg-bg px-5 py-12">
      <div className="max-w-lg mx-auto">

        {/* Back */}
        <button
          onClick={() => router.push('/home/game')}
          className="text-muted text-sm mb-6 flex items-center gap-1 hover:text-accent transition-colors bg-transparent border-none cursor-pointer"
        >
          ← Back to Games
        </button>

        {/* Game header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-3xl mx-auto mb-4">
            {gameData?.mode?.icon ? <i className={gameData.mode.icon} /> : <span>🎮</span>}
          </div>
          <h1 className="font-head text-2xl font-extrabold text-txt">{gameData?.title || 'Quiz'}</h1>
          <p className="text-muted text-sm mt-1">{gameData?.mode?.name || 'Quick Play'}</p>
          {gameData?.difficulty && (
            <span className={`inline-block mt-2 text-xs font-bold uppercase tracking-widest border rounded-full px-3 py-1 capitalize ${difficultyColor}`}>
              {gameData.difficulty}
            </span>
          )}
        </div>

        {/* Stats row — total marks prominent here */}
        <div className="grid grid-cols-3 gap-3 mb-5">

          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-xl mb-1">❓</div>
            <div className="font-head text-xl font-bold text-txt">{questionCount}</div>
            <div className="text-xs text-muted">Questions</div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-xl mb-1">⏱</div>
            <div className="font-head text-xl font-bold text-txt">{timeLimit}s</div>
            <div className="text-xs text-muted">Per Question</div>
          </div>

          {/* Total marks — the one you asked for */}
          <div className="bg-accent/10 border border-accent/25 rounded-xl p-4 text-center">
            <div className="text-xl mb-1">⚡</div>
            <div className="font-head text-xl font-bold text-accent">{totalMarks}</div>
            <div className="text-xs text-muted">Total Marks</div>
          </div>

        </div>

        {/* Mark breakdown note */}
        <div className="bg-surface border border-border rounded-xl px-5 py-4 mb-4 flex items-start gap-3">
          <span className="text-accent mt-0.5">ℹ</span>
          <p className="text-muted text-sm leading-relaxed">
            Each question carries its own mark value based on difficulty.
            Multi-answer questions use an all-or-nothing grading system.
            The maximum achievable score for this quiz is{' '}
            <span className="text-accent font-bold">{totalMarks} points</span>.
          </p>
        </div>

        {/* Settings */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-head text-lg font-bold text-txt mb-4">⚙ Settings</h2>
          <div className="flex flex-col gap-4">

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

            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-txt">Feedback</div>
                <div className="text-xs text-muted">When to show correct/wrong</div>
              </div>
              <div className="flex gap-1.5">
                <ToggleBtn isActive={feedbackMode === 'immediate'} onClick={() => setFeedbackMode('immediate')} label="Instant" />
                <ToggleBtn isActive={feedbackMode === 'end'}       onClick={() => setFeedbackMode('end')}       label="End"     />
              </div>
            </div>

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

        {/* Start */}
        <button
          onClick={handleStart}
          className="w-full bg-accent text-bg font-bold text-lg rounded-xl py-4 px-6 border-none cursor-pointer transition-opacity hover:opacity-80 active:scale-[0.98]"
        >
          Start Game → {totalMarks} pts available
        </button>

      </div>
    </div>
  )
}
