'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { endpoint, postData } from '../endpoints.js'
import Cookies from 'js-cookie'
/**
 * HOME PAGE — Auto-detects login status, shows appropriate modes
 * 
 * Backend now controls guest access via is_guest_allowed field.
 * Frontend simply displays what backend returns — no override.
 * 
 * Flow:
 * 1. On mount: check login status via /checkuser/
 * 2. Fetch game modes from /getmodes/ (backend filters for guests)
 * 3. Fetch leaderboard preview from /leaderboard/
 * 4. If logged in: fetch daily challenge status
 * 5. Render modes with lock/unlock status from backend
 */

export default function Home() {
  const router = useRouter()

  // Auth state
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Data state
  const [modes, setModes] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [dailyChallenge, setDailyChallenge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check login status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await postData('checkuser')
        if (res.status && res.user) {
          setUser(res.user)
        }
      } catch (err) {
        console.log('Not logged in')
      } finally {
        setAuthChecked(true)
      }
    }
    checkAuth()
  }, [])

  // Fetch data once auth is checked
  useEffect(() => {
    if (!authChecked) return

    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch modes (backend handles guest filtering)
        const token = Cookies.get('token')
const modeRes =await axios.get(`${endpoint}getmodes`, {
  headers: token ? { Authorization: `JWT ${token}` } : {}
})
        // const modesRes = await axios.get(`${endpoint}getmodes/`)
          setModes(modeRes.data)

        // Fetch leaderboard preview (top 3)
        const lbRes = await axios.get(`${endpoint}leaderboard/`)
        const globalLb = lbRes.data.global_leaderboards || []
        setLeaderboard(globalLb.slice(0, 3))

        // If logged in, fetch daily challenge status
        if (user?.id) {
          try {
            const token = localStorage.getItem('token')
            const dcRes = await axios.get(
              `${endpoint}dailychallenge/${user.id}/?info=true`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
            setDailyChallenge(dcRes.data)
          } catch (err) {
            console.log('Daily challenge not available')
          }
        }
      } catch (err) {
        setError('Failed to load content')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [authChecked, user])

  // Handle mode click — use backend lock status directly
  const handleModeClick = (mode) => {
    if (mode.locked) {
      // Mode is locked — show login prompt or unlock message
      if (!user) {
        router.push('/account/login?redirect=home')
      }
      return
    }

    // Mode is unlocked — navigate to game selection
    router.push(`/home/game?mode=${mode.id}&modeName=${encodeURIComponent(mode.name)}`)
  }

  // Handle daily challenge click
  const handleDailyChallenge = () => {
    if (!user) {
      router.push('/account/login?redirect=daily')
      return
    }
    if (dailyChallenge?.already_played) {
      return
    }
    router.push(`/dailychallenge/${user.id}`)
  }

  if (loading) {
    return <HomeSkeleton />
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

        {/* Header Section */}
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold tracking-[0.15em] uppercase text-accent bg-accent/10 border border-accent/25 rounded-full px-[14px] py-[5px] mb-4">
            {user ? `Welcome back, ${user.username}` : 'Choose your mode'}
          </span>
          <h1 className="font-head text-[clamp(2rem,5vw,3rem)] font-extrabold text-txt leading-tight">
            {user ? 'Ready to Play?' : "Let's Play!"}
          </h1>
          <p className="text-muted mt-2 text-base">
            {user 
              ? 'Pick a mode and climb the leaderboard.' 
              : 'Pick a mode and test your knowledge.'}
          </p>
        </div>

        {/* Daily Challenge Card (logged in only) */}
        {user && dailyChallenge && (
          <div className="mb-8">
            <button
              onClick={handleDailyChallenge}
              className={`w-full group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all duration-200 ${
                dailyChallenge.already_played 
                  ? 'border-border bg-surface opacity-60 cursor-not-allowed' 
                  : 'border-accent bg-accent/5 hover:border-accent hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 cursor-pointer'
              }`}
              disabled={dailyChallenge.already_played}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📅</span>
                    <span className="font-head text-lg font-bold text-txt">Daily Challenge</span>
                    {dailyChallenge.already_played && (
                      <span className="text-xs bg-surface2 text-muted px-2 py-1 rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-muted text-sm">
                    {dailyChallenge.already_played 
                      ? `Score: ${dailyChallenge.score || 'N/A'} — Come back tomorrow!`
                      : 'New questions every day. Test your skills!'}
                  </p>
                </div>
                {!dailyChallenge.already_played && (
                  <span className="text-accent text-2xl group-hover:translate-x-1 transition-transform">→</span>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Mode Selection Grid */}
        <div className="mb-10">
          <h2 className="font-head text-lg font-bold text-txt mb-4 flex items-center gap-2">
            <span>🎮</span> Game Modes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modes.map((mode) => (
              <ModeCard 
                key={mode.id} 
                mode={mode} 
                onClick={() => handleModeClick(mode)}
                isGuest={!user}
              />
            ))}
          </div>
        </div>

        {/* Leaderboard Preview */}
        {leaderboard.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-head text-lg font-bold text-txt flex items-center gap-2">
                <span>🏆</span> Top Players
              </h2>
              <Link 
                href="/leaderboards" 
                className="text-accent text-sm font-semibold hover:underline"
              >
                View All →
              </Link>
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              {leaderboard.map((player, index) => (
                <div 
                  key={player.id || index}
                  className={`flex items-center gap-4 px-5 py-4 ${
                    index !== leaderboard.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-head font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                    index === 1 ? 'bg-gray-400/20 text-gray-400' :
                    index === 2 ? 'bg-orange-600/20 text-orange-600' :
                    'bg-surface2 text-muted'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-txt text-sm truncate">
                      {player.username || 'Anonymous'}
                    </div>
                  </div>
                  <div className="font-head font-bold text-accent">
                    {player.total_points || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guest CTA */}
        {!user && (
          <div className="bg-surface border-2 border-dashed border-border rounded-2xl p-8 text-center">
            <div className="text-3xl mb-3">🔐</div>
            <h3 className="font-head text-lg font-bold text-txt mb-2">
              Want to save your progress?
            </h3>
            <p className="text-muted text-sm mb-5 max-w-sm mx-auto">
              Create an account to track your scores, earn badges, and compete on the leaderboard.
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
          </div>
        )}

        {/* Logged-in quick stats */}
        {user && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface border border-border rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">🎮</div>
              <div className="font-head text-xl font-bold text-accent">
                {user.total_games_played || 0}
              </div>
              <div className="text-muted text-xs">Games Played</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">⭐</div>
              <div className="font-head text-xl font-bold text-accent">
                {user.total_points || 0}
              </div>
              <div className="text-muted text-xs">Total Points</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">🔥</div>
              <div className="font-head text-xl font-bold text-accent">
                {user.current_streak || 0}
              </div>
              <div className="text-muted text-xs">Day Streak</div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

/* ─── Mode Card Component ─────────────────────────────────────────────────── */
function ModeCard({ mode, onClick, isGuest }) {
  const isLocked = mode.locked

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`group relative bg-surface border-2 rounded-xl p-5 text-left transition-all duration-200 ${
        isLocked 
          ? 'border-border opacity-60 cursor-not-allowed' 
          : 'border-border hover:border-accent hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 cursor-pointer active:scale-[0.98]'
      }`}
    >
      {/* Lock overlay for locked modes */}
      {isLocked && (
        <div className="absolute inset-0 bg-bg/60 rounded-xl flex items-center justify-center z-10">
          <div className="text-center">
            <span className="text-2xl">🔒</span>
            <p className="text-muted text-xs mt-1 font-semibold">
              {isGuest ? 'Login to unlock' : 'Complete previous mode'}
            </p>
          </div>
        </div>
      )}

      {/* Guest badge */}
      {mode.is_guest_allowed && !isLocked && (
        <div className="absolute top-3 right-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 rounded-full px-2 py-1">
            Free
          </span>
        </div>
      )}

      {/* Icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-3 ${
        isLocked 
          ? 'bg-surface2 text-muted' 
          : 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-bg transition-colors'
      }`}>
        {mode.icon ? (
          <i className={mode.icon}></i>
        ) : (
          <span>🎮</span>
        )}
      </div>

      {/* Title */}
      <div className={`font-head text-base font-bold mb-1 ${
        isLocked ? 'text-muted' : 'text-txt group-hover:text-accent transition-colors'
      }`}>
        {mode.name}
      </div>

      {/* Description */}
      <p className="text-muted text-xs leading-relaxed mb-3">
        {mode.instructions || `${mode.score} pts • ${mode.time}s per question`}
      </p>

      {/* Score/Time badge */}
      <div className="flex gap-2">
        <span className="text-[10px] font-semibold text-accent bg-accent/10 border border-accent/20 rounded-full px-2 py-1">
          ⚡ {mode.score} pts
        </span>
        <span className="text-[10px] font-semibold text-warn bg-warn/10 border border-warn/20 rounded-full px-2 py-1">
          ⏱ {mode.time}s
        </span>
      </div>
    </button>
  )
}

/* ─── Loading Skeleton ────────────────────────────────────────────────────── */
function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-bg px-5 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="h-4 bg-surface2 rounded-full w-32 mx-auto mb-4 animate-pulse" />
          <div className="h-10 bg-surface2 rounded-xl w-64 mx-auto mb-2 animate-pulse" />
          <div className="h-4 bg-surface2 rounded-full w-48 mx-auto animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill().map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse">
              <div className="h-10 w-10 bg-surface2 rounded-lg mb-3" />
              <div className="h-4 bg-surface2 rounded w-3/4 mb-2" />
              <div className="h-3 bg-surface2 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
