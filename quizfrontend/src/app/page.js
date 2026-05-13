'use client'
import Link from 'next/link'
import React from 'react'

const FEATURES = [
  { icon: '⚡', title: 'Engaging Quizzes',  desc: 'Interactive and challenging quizzes across a wide range of topics.' },
  { icon: '📊', title: 'Real-Time Scores',  desc: 'Instantly track your performance with live feedback after every answer.' },
  { icon: '🏆', title: 'Leaderboard',       desc: 'Compete with players worldwide and climb the global rankings.' },
  { icon: '📚', title: 'Learn & Grow',      desc: 'Expand your knowledge across subjects while having fun.' },
];

const SIGNUP_PERKS = [
  { icon: '🎯', title: 'Diverse Challenges', desc: 'Unlock quizzes of all difficulty levels across dozens of categories.' },
  { icon: '👥', title: 'Multiplayer Mode',   desc: 'Challenge friends in real-time head-to-head quiz battles.' },
  { icon: '💾', title: 'Save Progress',      desc: 'Your scores, streaks, and achievements are always saved to your profile.' },
];

function App() {
  return (
    <div className="bg-bg min-h-screen text-txt font-body">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="min-h-screen flex items-center px-5 py-20 relative overflow-hidden">

        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(184,255,87,0.07) 0%, transparent 70%)' }}
        />

        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">

          {/* Left — text */}
          <div>
            <span className="inline-block text-xs font-bold tracking-[0.15em] uppercase text-accent bg-accent/10 border border-accent/25 rounded-full px-[14px] py-[5px] mb-5">
              The Ultimate Quiz Experience
            </span>

            <h1 className="font-head text-[clamp(2.6rem,6vw,4.2rem)] font-extrabold leading-[1.05] mb-4 text-txt">
              Challenge Your Mind<br />
              with <span className="text-accent">Quizzify</span>
            </h1>

            <p className="text-muted text-[1.1rem] leading-[1.7] mb-9 max-w-[440px]">
              Test your knowledge, compete with others, and learn something new every day — one question at a time.
            </p>

            <div className="flex gap-3 flex-wrap">
              <Link
                href={{ pathname: "home" }}
                className="inline-flex items-center justify-center px-[30px] py-[14px] rounded-xl bg-accent text-bg font-bold text-base no-underline transition-opacity hover:opacity-85 active:scale-[0.97]"
              >
                Play Quiz →
              </Link>
              <Link
                href={{ pathname: "account/signup" }}
                className="inline-flex items-center justify-center px-[30px] py-[14px] rounded-xl bg-transparent text-txt border border-border font-bold text-base no-underline transition-all hover:border-accent hover:text-accent active:scale-[0.97]"
              >
                Sign Up Free
              </Link>
            </div>
          </div>

          {/* Right — hero image */}
          <div className="rounded-[18px] overflow-hidden border border-border aspect-[4/3] order-first md:order-last relative">
            <div className="absolute inset-0 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(184,255,87,0.08) 0%, transparent 60%)' }}
            />
            {/* Replace /quiz2.jpg with your actual public folder image */}
            <img src="/quiz2.jpg" alt="Quizzify in action" className="w-full h-full object-cover block" />
          </div>

        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="py-[90px] px-5">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-14">
            <span className="block text-[0.72rem] font-bold uppercase tracking-[0.15em] text-accent mb-3">What we offer</span>
            <h2 className="font-head text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold text-txt mb-3">Packed with Features</h2>
            <p className="text-muted text-base max-w-[500px] mx-auto">Everything you need for a competitive, fun, and educational quiz experience.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                data-aos="fade-up" data-aos-delay={i * 100}
                className="bg-surface border border-border rounded-xl px-[22px] py-7 transition-all duration-200 hover:border-accent hover:-translate-y-1"
              >
                <div className="w-[46px] h-[46px] bg-accent/10 rounded-[10px] flex items-center justify-center text-[1.3rem] mb-[18px]">
                  {f.icon}
                </div>
                <div className="font-head text-base font-bold text-txt mb-2">{f.title}</div>
                <p className="text-muted text-[0.875rem] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Sign Up perks ─────────────────────────────────────────── */}
      <section className="py-[90px] px-5 bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-14">
            <span className="block text-[0.72rem] font-bold uppercase tracking-[0.15em] text-accent mb-3">Members only</span>
            <h2 className="font-head text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold text-txt mb-3">Level Up with an Account</h2>
            <p className="text-muted text-base max-w-[500px] mx-auto">Create a free account to unlock the full Quizzify experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SIGNUP_PERKS.map((p, i) => (
              <div
                key={i}
                data-aos="fade-up" data-aos-delay={i * 100}
                className="bg-bg border border-border rounded-xl px-6 py-8 text-center transition-all duration-200 hover:border-accent"
              >
                <div className="text-[2rem] mb-4">{p.icon}</div>
                <div className="font-head text-[1.1rem] font-bold text-txt mb-[10px]">{p.title}</div>
                <p className="text-muted text-[0.875rem] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-11">
            <p className="text-muted mb-5 text-base">Join thousands of players already on the leaderboard.</p>
            <Link
              href={{ pathname: "account/signup" }}
              className="inline-flex items-center justify-center px-[30px] py-[14px] rounded-xl bg-accent text-bg font-bold text-base no-underline transition-opacity hover:opacity-85 active:scale-[0.97]"
            >
              Create Free Account →
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}

export default App;
