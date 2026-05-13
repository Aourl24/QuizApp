'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { endpoint } from '../endpoints.js'
import { QuizBoxContext, Quiz } from '../components.js'

/**
 * QUICKPLAY SETUP PAGE — Shows game instructions before playing
 * 
 * Flow:
 * 1. Read game ID from URL: ?game=5
 * 2. Fetch game details from backend: GET /game/<slug>/ or use cached data
 * 3. Show Instructions component with real game data
 * 4. Click Start → navigate to /quickplay/game?game=5
 */

function Main() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameId = searchParams.get('game')

  const [gameData, setGameData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch game details from backend
  useEffect(() => {
    if (!gameId) {
      setError('No game selected')
      setLoading(false)
      return
    }

    const fetchGame = async () => {
      try {
        setLoading(true)
        // Fetch game details — try by ID first, fallback to games list
        const res = await axios.get(`${endpoint}getgamesmode/1/`)
        const games = res.data
        const game = games.find(g => g.id === parseInt(gameId))

        if (!game) {
          setError('Game not found')
          return
        }

        setGameData(game)
      } catch (err) {
        setError('Failed to load game')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchGame()
  }, [gameId])

  // Handle start game
  const handleStart = () => {
    router.push(`/quickplay/game?game=${gameId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-3 border-accent/20 border-t-accent rounded-full animate-spin" />
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
            className="mt-4 text-accent hover:underline"
          >
            ← Back to Games
          </button>
        </div>
      </div>
    )
  }

  if (!gameData) return null

  return (
    <div className="min-h-screen bg-bg px-5 py-12">
      <div className="max-w-lg mx-auto">

        {/* Back button */}
        <button 
          onClick={() => router.push('/home/game')}
          className="text-muted text-sm mb-6 flex items-center gap-1 hover:text-accent transition-colors"
        >
          ← Back to Games
        </button>

        {/* Game info header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-3xl mx-auto mb-4">
            {gameData.mode?.icon ? (
              <i className={gameData.mode.icon}></i>
            ) : (
              <span>🎮</span>
            )}
          </div>
          <h1 className="font-head text-2xl font-extrabold text-txt">
            {gameData.title}
          </h1>
          <p className="text-muted text-sm mt-2">
            {gameData.mode?.name || 'Quiz'}
          </p>
        </div>

        {/* Instructions card */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-head text-lg font-bold text-txt mb-4">How to Play</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-lg shrink-0">
                ⏱
              </div>
              <div>
                <div className="text-sm font-semibold text-txt">Time Limit</div>
                <div className="text-xs text-muted">
                  {gameData.time_per_question || gameData.mode?.time || 20} seconds per question
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-lg shrink-0">
                ⚡
              </div>
              <div>
                <div className="text-sm font-semibold text-txt">Points</div>
                <div className="text-xs text-muted">
                  {gameData.mode?.score || 10} points per correct answer
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-lg shrink-0">
                ❓
              </div>
              <div>
                <div className="text-sm font-semibold text-txt">Questions</div>
                <div className="text-xs text-muted">
                  {gameData.question_count || 'Multiple'} questions
                </div>
              </div>
            </div>

            {gameData.difficulty && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-lg shrink-0">
                  📊
                </div>
                <div>
                  <div className="text-sm font-semibold text-txt">Difficulty</div>
                  <div className="text-xs text-muted capitalize">
                    {gameData.difficulty}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings toggle */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-head text-lg font-bold text-txt mb-4">Settings</h2>

          <div className="flex items-center justify-between">
            <span className="text-sm text-txt">Sound Effects</span>
            <button className="px-4 py-2 rounded-lg bg-accent text-bg text-sm font-semibold">
              On
            </button>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          className="w-full bg-accent text-bg font-bold text-lg rounded-xl py-4 px-6 transition-opacity hover:opacity-80 active:scale-[0.98]"
        >
          Start Game →
        </button>

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
