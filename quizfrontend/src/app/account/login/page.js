'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Cookies from 'js-cookie'
import { endpoint } from '../../endpoints.js'
import { useApp } from '../../appContext.js'

/**
 * src/app/account/login/page.jsx
 *
 * POST ${endpoint}login/
 * Body:    { username, password }
 * Success: { status: true, msg, user, token, refresh }
 * Error:   { status: false, msg }
 *
 * On success:
 *  - Saves token to cookie as 'token' (matches how postData reads it)
 *  - postData() in endpoints.js handles Authorization: JWT ${token} automatically
 *  - Updates global user via useApp()
 *  - Redirects to /home
 */
export default function Login() {
  const router = useRouter()
  const { setUser, setAlert } = useApp()

  const [form, setForm]       = useState({ username: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Username is required'
    if (!form.password)        e.password = 'Password is required'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    try {
      const res = await axios.post(`${endpoint}login/`, form)
      const data = res.data

      if (data.status) {
        // Save token to cookie — postData() reads Cookies.get('token') automatically
        Cookies.set('token', data.token, { expires: 7 })

        // Update global user in AppContext
        setUser(data.user)

        router.push('/home')
      } else {
        setAlert(data.msg || 'Login failed.')
      }
    } catch (err) {
      const status = err.response?.status
      const msg    = err.response?.data?.msg

      if (status === 401) {
        setErrors({ password: 'Invalid username or password' })
      } else {
        setAlert(msg || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-head text-3xl font-extrabold text-txt no-underline">
            <span className="text-accent">Q</span>uizzify
          </Link>
          <p className="text-muted text-sm mt-2">Welcome back — let's play</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl px-6 py-8">

          <h1 className="font-head text-xl font-bold text-txt mb-6">Log In</h1>

          {/* Username */}
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Your username"
              className={`w-full bg-bg border rounded-xl px-4 py-3 text-txt text-sm outline-none transition-all placeholder:text-muted/50 focus:border-accent ${
                errors.username ? 'border-danger' : 'border-border'
              }`}
            />
            {errors.username && (
              <p className="text-danger text-xs mt-1.5">{errors.username}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted">
                Password
              </label>
              <span className="text-accent text-xs cursor-pointer hover:underline">
                Forgot password?
              </span>
            </div>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Your password"
              className={`w-full bg-bg border rounded-xl px-4 py-3 text-txt text-sm outline-none transition-all placeholder:text-muted/50 focus:border-accent ${
                errors.password ? 'border-danger' : 'border-border'
              }`}
            />
            {errors.password && (
              <p className="text-danger text-xs mt-1.5">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-accent text-bg font-bold text-base rounded-xl py-[14px] border-none cursor-pointer transition-opacity hover:opacity-85 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                Logging in...
              </>
            ) : 'Log In →'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted text-xs">don't have an account?</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Sign up link */}
          <Link
            href="/account/signup"
            className="block text-center no-underline border border-border text-muted font-semibold text-sm rounded-xl py-3 transition-all hover:border-accent hover:text-accent"
          >
            Create Account
          </Link>

        </div>

      </div>
    </div>
  )
}
