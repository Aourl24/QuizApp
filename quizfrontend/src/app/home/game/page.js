'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { endpoint , getData} from '../../endpoints.js'

/**
 * GAME SELECTION PAGE — Shows games for selected mode
 * 
 * Flow:
 * 1. Read mode from URL query (?mode=1&modeName=quickplay)
 * 2. Fetch games: GET /getgamesmode/<mode_id>/
 * 3. Optionally fetch categories: GET /category/
 * 4. Allow category filtering
 * 5. Click game → navigate to /quickplay?game=5 (instructions first)
 * 6. Handle guest access errors from backend
 */

export default function GameSelection() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const modeId = searchParams.get('mode')
  const modeName = searchParams.get('modeName') || 'Games'

  const [games, setGames] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authError, setAuthError] = useState(null)

  // Fetch games and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setAuthError(null)

        // Fetch games for this mode
        const gamesUrl = modeId 
          ? `${endpoint}getgamesmode/${modeId}/`
          : `${endpoint}getallgames/`

        const [gamesRes, catRes] = await Promise.all([
          axios.get(gamesUrl),
          axios.get(`${endpoint}category/`)
        ])

        setGames(gamesRes.data)
        setCategories(catRes.data)
      } catch (err) {
        if (err.response?.status === 403) {
          setAuthError({
            message: err.response.data?.error || 'Login required',
            requiresAuth: err.response.data?.requires_auth
          })
        } else {
          setError('Failed to load games')
        }
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [modeId])

  // Filter games by category
  const filteredGames = selectedCategory === 'all' 
    ? games 
    : games.filter(g => g.category?.id === parseInt(selectedCategory))

  // Handle game click — go to instructions page first
  const handleGameClick = (game) => {
    router.push(`/quickplay?game=${game.id}`)
  }

  // Auth error state
  if (authError) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="font-head text-xl font-bold text-txt mb-2">
            {authError.message}
          </h2>
          <p className="text-muted text-sm mb-6">
            This mode requires an account. Sign up free to unlock all modes and save your progress.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/account/signup"
              className="bg-accent text-bg font-bold text-sm px-6 py-3 rounded-xl no-underline transition-opacity hover:opacity-80"
            >
              Sign Up Free
            </Link>
            <Link
              href="/account/login"
              className="border border-border text-muted font-semibold text-sm px-6 py-3 rounded-xl no-underline transition-all hover:border-accent hover:text-accent"
            >
              Log In
            </Link>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 text-muted text-sm hover:text-accent transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <GameSelectionSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-danger font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 text-accent hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg px-5 py-12">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.push('/')}
            className="text-muted text-sm mb-4 flex items-center gap-1 hover:text-accent transition-colors"
          >
            ← Back to Modes
          </button>

          <span className="inline-block text-xs font-bold tracking-[0.15em] uppercase text-accent bg-accent/10 border border-accent/25 rounded-full px-[14px] py-[5px] mb-4">
            {modeName}
          </span>
          <h1 className="font-head text-[clamp(2rem,5vw,3rem)] font-extrabold text-txt leading-tight">
            Choose a Game
          </h1>
          <p className="text-muted mt-2 text-base">
            {games.length} {games.length === 1 ? 'game' : 'games'} available
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-accent text-bg'
                  : 'bg-surface border border-border text-muted hover:border-accent hover:text-accent'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id.toString())}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === cat.id.toString()
                    ? 'bg-accent text-bg'
                    : 'bg-surface border border-border text-muted hover:border-accent hover:text-accent'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Games Grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGames.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                onClick={() => handleGameClick(game)}
              />
            ))}
          </div>
        ) : (
          <EmptyState modeName={modeName} />
        )}

      </div>
    </div>
  )
}

/* ─── Game Card ───────────────────────────────────────────────────────────── */
function GameCard({ game, onClick }) {
  const difficultyColor = {
    'easy': 'text-accent',
    'medium': 'text-warn',
    'hard': 'text-danger'
  }

  return (
    <button
      onClick={onClick}
      className="group bg-surface border-2 border-border rounded-xl p-5 text-left transition-all duration-200 hover:border-accent hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 active:scale-[0.98] cursor-pointer"
    >
      {/* Top row: icon + difficulty */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-lg transition-colors group-hover:bg-accent group-hover:text-bg">
          {game.mode?.icon ? (
            <i className={game.mode.icon}></i>
          ) : (
            <span>🎮</span>
          )}
        </div>
        {game.difficulty && (
          <span className={`text-xs font-bold uppercase tracking-wider ${difficultyColor[game.difficulty] || 'text-muted'}`}>
            {game.difficulty}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-head text-base font-bold text-txt group-hover:text-accent transition-colors mb-1 truncate">
        {game.title}
      </h3>

      {/* Description */}
      {game.description && (
        <p className="text-muted text-xs leading-relaxed mb-3 line-clamp-2">
          {game.description}
        </p>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span>⏱</span> {game.time_per_question || game.mode?.time || 20}s
        </span>
        <span className="flex items-center gap-1">
          <span>⚡</span> {game.mode?.score || 10} pts
        </span>
        {game.question_count > 0 && (
          <span className="flex items-center gap-1">
            <span>❓</span> {game.question_count}
          </span>
        )}
      </div>

      {/* Play count */}
      {game.play_count > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <span className="text-[10px] text-muted">
            {game.play_count} {game.play_count === 1 ? 'play' : 'plays'} • Avg {game.avg_score || 0}%
          </span>
        </div>
      )}

      {/* Arrow */}
      <div className="mt-3 flex justify-end">
        <span className="text-border group-hover:text-accent transition-colors text-lg">→</span>
      </div>
    </button>
  )
}

/* ─── Empty State ─────────────────────────────────────────────────────────── */
function EmptyState({ modeName }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">🎮</div>
      <h2 className="font-head text-xl font-bold text-txt mb-2">No games found</h2>
      <p className="text-muted text-sm max-w-xs mb-6">
        There are no games available in {modeName} right now. Check back soon!
      </p>
      <Link
        href="/"
        className="bg-accent text-bg font-bold text-sm px-6 py-3 rounded-xl no-underline transition-opacity hover:opacity-80"
      >
        Browse Other Modes
      </Link>
    </div>
  )
}

/* ─── Loading Skeleton ────────────────────────────────────────────────────── */
function GameSelectionSkeleton() {
  return (
    <div className="min-h-screen bg-bg px-5 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="h-4 bg-surface2 rounded-full w-24 mb-4 animate-pulse" />
          <div className="h-10 bg-surface2 rounded-xl w-64 mb-2 animate-pulse" />
          <div className="h-4 bg-surface2 rounded-full w-48 animate-pulse" />
        </div>

        <div className="flex gap-2 mb-6">
          {Array(4).fill().map((_, i) => (
            <div key={i} className="h-9 w-20 bg-surface2 rounded-full animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill().map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse">
              <div className="flex justify-between mb-3">
                <div className="h-10 w-10 bg-surface2 rounded-lg" />
                <div className="h-4 w-12 bg-surface2 rounded" />
              </div>
              <div className="h-4 bg-surface2 rounded w-3/4 mb-2" />
              <div className="h-3 bg-surface2 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
