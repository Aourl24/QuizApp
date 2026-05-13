'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { endpoint } from '../../endpoints.js'
import { useApp } from '../../appContext.js'

/**
 * src/app/account/signup/page.jsx
 *
 * POST ${endpoint}signup/
 * Body:    { username, password }
 * Success: { success: true, msg: '...' }       → redirect to /account/login
 * Error:   { error: true, msg: '...' }          → show msg in alert
 */
export default function SignUp() {
  const router = useRouter()
  const { setAlert } = useApp()

  const [form, setForm]       = useState({ username: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.username.trim())         e.username = 'Username is required'
    else if (form.username.length < 3) e.username = 'Username must be at least 3 characters'
    if (!form.password)                e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
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
      const res = await axios.post(`${endpoint}signup/`, form)
      if (res.data.success) {
        router.push('/account/login')
      } else {
        setAlert(res.data.msg || 'Something went wrong.')
      }
    } catch (err) {
      const msg = err.response?.data?.msg
      setAlert(msg || 'Something went wrong. Please try again.')
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
          <p className="text-muted text-sm mt-2">Create your account and start playing</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl px-6 py-8">

          <h1 className="font-head text-xl font-bold text-txt mb-6">Sign Up</h1>

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
              placeholder="e.g. quizmaster"
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
            <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Min. 6 characters"
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
                Creating account...
              </>
            ) : 'Create Account →'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted text-xs">already have an account?</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Login link */}
          <Link
            href="/account/login"
            className="block text-center no-underline border border-border text-muted font-semibold text-sm rounded-xl py-3 transition-all hover:border-accent hover:text-accent"
          >
            Log In
          </Link>

        </div>

        <p className="text-center text-muted text-xs mt-5 leading-relaxed">
          By signing up you agree to our{' '}
          <span className="text-accent cursor-pointer hover:underline">Terms of Service</span>
        </p>

      </div>
    </div>
  )
}
