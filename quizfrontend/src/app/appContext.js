"use client";

/**
 * appContext.js — App-wide state ONLY
 *
 * Handles: user, alert, loader, confirm, sound
 * Game-specific state (score, correct, wrong, etc.) stays in QuizBoxContext
 *
 * FIX: checkuser now called ONCE here only — removed from Quiz provider
 */

import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios'
import { postData } from "./endpoints";
import Cookies from 'js-cookie'

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [alert, setAlert]     = useState(null);
  const [loader, setLoader]   = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [sound, setSound]     = useState(false);

  // On app load: set JWT header + check login — runs ONCE only
  useEffect(() => {
    const token = Cookies.get('token')

    // Attach token to ALL future axios requests globally
    if (token) {
      axios.defaults.headers.common['Authorization'] = `JWT ${token}`
    }

    postData("checkuser")
      .then(res => setUser(res?.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoader(false))
  }, [])

  // Auto-dismiss alert after 5 seconds
  useEffect(() => {
    if (!alert) return
    const timer = setTimeout(() => setAlert(null), 5000)
    return () => clearTimeout(timer)
  }, [alert]);

  return (
    <AppContext.Provider value={{
      user, setUser,
      alert, setAlert,
      loader, setLoader,
      confirm, setConfirm,
      sound, setSound,
    }}>

      {/* Global loader overlay */}
      {loader && (
        <div className="fixed inset-0 z-[500] bg-bg/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-border border-t-accent animate-spin" />
            <span className="text-muted text-sm font-medium">Loading...</span>
          </div>
        </div>
      )}

      {/* Global alert banner */}
      {alert && (
        <div className="fixed top-[70px] left-1/2 -translate-x-1/2 z-[400] w-[min(92vw,500px)] bg-[#2a1515] border border-danger rounded-xl px-[18px] py-[14px] flex items-center gap-3 text-danger text-[0.95rem]">
          <span>⚠ {alert}</span>
          <button
            onClick={() => setAlert(null)}
            className="ml-auto bg-transparent border-none text-danger cursor-pointer text-lg opacity-70 hover:opacity-100"
          >✕</button>
        </div>
      )}

      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
