import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Eye, EyeOff, ArrowRight, TrendingUp, Cpu, Gauge } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usersApi } from '@/lib/api'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'

const schema = z.object({ email: z.string().email('Invalid email address'), password: z.string().min(1, 'Password required') })
type Form = z.infer<typeof schema>

/* ── Premium input style ── */
const INPUT_CLS = cn(
  'w-full h-9 bg-[var(--bg-input)] border border-[var(--border-2)]',
  'hover:border-[var(--border-3)] hover:bg-[var(--bg-3)]',
  'focus:border-[var(--accent)] focus:outline-none focus:shadow-[var(--shadow-accent)] focus:bg-[var(--bg-input)]',
  'rounded-lg px-3 text-[13px] text-[var(--text-1)] placeholder:text-[var(--text-3)]',
  'transition-all duration-150 font-[inherit]'
)

/* ── Feature stats ── */
const STATS = [
  { value: '6 APIs',    label: 'Data Sources', icon: TrendingUp },
  { value: 'LLaMA 3.3', label: 'AI Model',     icon: Cpu },
  { value: '< 100ms',  label: 'Latency',       icon: Gauge },
]

export function Login() {
  const navigate = useNavigate()
  const { setCurrentUser, setToken } = useApp()
  const [showPw, setShowPw] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Form) => {
    try {
      const r = await usersApi.login(data)
      if (r.token) setToken(r.token)
      if (r.user)  setCurrentUser(r.user)
      navigate('/')
    } catch {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg-0)]">

      {/* ── Left Panel — Brand ── */}
      <div className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 relative overflow-hidden border-r border-[var(--border-1)]">
        {/* Background texture */}
        <div className="absolute inset-0 bg-grid opacity-60" />
        {/* Blue radial glow */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-[var(--accent)] opacity-[0.04] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-[var(--ai)] opacity-[0.03] blur-[100px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--accent-muted)] border border-[rgba(37,99,235,0.3)]">
            <Zap className="w-4.5 h-4.5 text-[var(--accent-bright)]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[15px] font-semibold text-[var(--text-1)] tracking-tight">Global-Fi</span>
            <span className="text-[15px] font-semibold text-[var(--accent-bright)] tracking-tight">Ultra</span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 max-w-[400px]">
          <h2 className="text-[32px] font-bold text-[var(--text-1)] leading-[1.2] tracking-[-0.03em] mb-4">
            Real-time financial intelligence at your fingertips
          </h2>
          <p className="text-[14px] text-[var(--text-2)] leading-relaxed mb-10">
            Monitor stocks, crypto, and forex. Get AI-powered insights from Groq LLaMA. 
            All in one premium dashboard built for serious traders.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {STATS.map(s => (
              <div
                key={s.label}
                className="rounded-xl border border-[var(--border-2)] bg-[var(--bg-2)] p-4"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <s.icon className="h-4 w-4 text-[var(--accent-bright)] mb-2.5" />
                <p className="text-[16px] font-bold text-[var(--text-0)] num tracking-tight leading-none">{s.value}</p>
                <p className="text-[11px] text-[var(--text-3)] mt-1 leading-none">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <div className="relative z-10">
          <p className="text-[11px] text-[var(--text-4)]">
            © 2024 Global-Fi Ultra. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Subtle bg glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[var(--accent)] opacity-[0.03] blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-[360px]"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-9 lg:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--accent-muted)] border border-[rgba(37,99,235,0.3)]">
              <Zap className="w-4 h-4 text-[var(--accent-bright)]" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[14px] font-semibold text-[var(--text-1)]">Global-Fi</span>
              <span className="text-[14px] font-semibold text-[var(--accent-bright)]">Ultra</span>
            </div>
          </div>

          {/* Form header */}
          <div className="mb-7">
            <h1 className="text-[24px] font-bold text-[var(--text-1)] tracking-[-0.025em] leading-none mb-2">
              Welcome back
            </h1>
            <p className="text-[13px] text-[var(--text-3)]">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[var(--text-2)] tracking-wide uppercase">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="you@example.com"
                autoComplete="email"
                className={INPUT_CLS}
              />
              {errors.email && (
                <p className="text-[11px] text-[var(--danger-bright)] flex items-center gap-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold text-[var(--text-2)] tracking-wide uppercase">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[11px] text-[var(--accent-bright)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn(INPUT_CLS, 'pr-9')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-[var(--danger-bright)]">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full h-9 mt-2"
              iconRight={!isSubmitting ? <ArrowRight className="h-4 w-4" /> : undefined}
            >
              Sign in
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center my-6">
            <div className="flex-1 h-px bg-[var(--border-2)]" />
            <span className="px-3 text-[11px] text-[var(--text-4)]">or</span>
            <div className="flex-1 h-px bg-[var(--border-2)]" />
          </div>

          {/* Footer links */}
          <div className="space-y-3 text-center">
            <p className="text-[13px] text-[var(--text-3)]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[var(--accent-bright)] hover:text-[var(--accent-hover)] font-medium transition-colors"
              >
                Create one free
              </Link>
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-[12px] text-[var(--text-4)] hover:text-[var(--text-3)] transition-colors"
            >
              Continue without signing in →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
