'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiGet } from '../endpoints.js'
import { useApp } from '../appContext.js'

/**
 * src/app/quickplay/page.js — Game instructions/setup screen
 *
 * FIX: No longer wraps with <Quiz> — Instructions reads confirm/sound
 * directly from useApp() (AppContext), so no QuizBoxContext needed here.
 * Settings set here persist into the game page automatically via AppContext.
 */

export default function QuickplaySetup() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const gameId       = searchParams.get('game')

  // Settings read directly from AppContext
  const { confirm, setConfirm, sound, setSound } = useApp()

  const [gameData, setGameData] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    if (!gameId) { setError('No game selected'); setLoading(false); return; }

    apiGet(`game/${gameId}/`)
      .then(data => { setGameData(data); })
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
          <button
            onClick={() => router.push('/home/game')}
            className="mt-4 text-accent hover:underline bg-transparent border-none cursor-pointer"
          >
            ← Back to Games
          </button>
        </div>
      </div>
    )
  }

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
          <h1 className="font-head text-2xl font-extrabold text-txt">
            {gameData?.title || 'Quiz'}
          </h1>
          <p className="text-muted text-sm mt-2">{gameData?.mode?.name || 'Quick Play'}</p>
        </div>

        {/* How to play */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-4">
          <h2 className="font-head text-lg font-bold text-txt mb-4">How to Play</h2>
          <div className="flex flex-col gap-4">

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-lg shrink-0">⏱</div>
              <div>
                <div className="text-sm font-semibold text-txt">Time Limit</div>
                <div className="text-xs text-muted">
                  {gameData?.time_per_question || gameData?.mode?.time || 20} seconds per question
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-lg shrink-0">⚡</div>
              <div>
                <div className="text-sm font-semibold text-txt">Points</div>
                <div className="text-xs text-muted">
                  {gameData?.mode?.score || 10} points per correct answer
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-lg shrink-0">❓</div>
              <div>
                <div className="text-sm font-semibold text-txt">Questions</div>
                <div className="text-xs text-muted">
                  {gameData?.question_count || 'Multiple'} questions
                </div>
              </div>
            </div>

            {gameData?.difficulty && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-lg shrink-0">📊</div>
                <div>
                  <div className="text-sm font-semibold text-txt">Difficulty</div>
                  <div className="text-xs text-muted capitalize">{gameData.difficulty}</div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Settings — wired to AppContext, persists into game page */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-head text-lg font-bold text-txt mb-4">⚙ Settings</h2>
          <div className="flex flex-col gap-4">

            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-txt">Confirm Answer</div>
                <div className="text-xs text-muted">Show a submit button before checking</div>
              </div>
              <div className="flex gap-1.5">
                <ToggleBtn isActive={confirm}  onClick={() => setConfirm(true)}  label="Yes" />
                <ToggleBtn isActive={!confirm} onClick={() => setConfirm(false)} label="No"  />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-txt">Sound Effects</div>
                <div className="text-xs text-muted">Play sounds on correct/wrong answers</div>
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
          Start Game →
        </button>

      </div>
    </div>
  )
}
