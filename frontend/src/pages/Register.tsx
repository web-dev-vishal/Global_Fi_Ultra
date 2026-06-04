import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Eye, EyeOff, ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usersApi } from '@/lib/api'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'

const schema = z.object({
  firstName: z.string().min(1).max(50),
  lastName:  z.string().min(1).max(50),
  email:     z.string().email(),
  password:  z.string().min(6),
  confirm:   z.string().min(1),
}).refine(d => d.password === d.confirm, { message: "Passwords don't match", path: ['confirm'] })
type Form = z.infer<typeof schema>

const INPUT_CLS = cn(
  'w-full h-9 bg-[var(--bg-input)] border border-[var(--border-2)]',
  'hover:border-[var(--border-3)] hover:bg-[var(--bg-3)]',
  'focus:border-[var(--accent)] focus:outline-none focus:shadow-[var(--shadow-accent)] focus:bg-[var(--bg-input)]',
  'rounded-lg px-3 text-[13px] text-[var(--text-1)] placeholder:text-[var(--text-3)]',
  'transition-all duration-150 font-[inherit]'
)

const PW_RULES = [
  { label: 'At least 6 characters', test: (p: string) => p.length >= 6 },
  { label: 'Contains a number',     test: (p: string) => /\d/.test(p) },
  { label: 'Contains a letter',     test: (p: string) => /[a-zA-Z]/.test(p) },
]

export function Register() {
  const navigate = useNavigate()
  const { setCurrentUser } = useApp()
  const [showPw, setShowPw] = useState(false)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })
  const pw = watch('password') ?? ''

  const onSubmit = async (data: Form) => {
    try {
      const user = await usersApi.create({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
      })
      setCurrentUser(user)
      navigate('/')
    } catch { navigate('/') }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-0)] p-6 relative">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--ai)] opacity-[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[var(--accent)] opacity-[0.03] blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[380px]"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--accent-muted)] border border-[rgba(37,99,235,0.3)]">
            <Zap className="w-4 h-4 text-[var(--accent-bright)]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[14px] font-semibold text-[var(--text-1)]">Global-Fi</span>
            <span className="text-[14px] font-semibold text-[var(--accent-bright)]">Ultra</span>
          </div>
        </div>

        <div className="mb-7">
          <h1 className="text-[24px] font-bold text-[var(--text-1)] tracking-[-0.025em] leading-none mb-2">
            Create account
          </h1>
          <p className="text-[13px] text-[var(--text-3)]">Start tracking markets in seconds</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            {(['firstName', 'lastName'] as const).map(f => (
              <div key={f} className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-[var(--text-2)] tracking-wide uppercase">
                  {f === 'firstName' ? 'First' : 'Last'}
                </label>
                <input
                  {...register(f)}
                  placeholder={f === 'firstName' ? 'John' : 'Doe'}
                  className={INPUT_CLS}
                />
                {errors[f] && (
                  <p className="text-[11px] text-[var(--danger-bright)]">{errors[f]?.message}</p>
                )}
              </div>
            ))}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[var(--text-2)] tracking-wide uppercase">
              Email
            </label>
            <input type="email" {...register('email')} placeholder="you@example.com" className={INPUT_CLS} />
            {errors.email && <p className="text-[11px] text-[var(--danger-bright)]">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[var(--text-2)] tracking-wide uppercase">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
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

            {/* Password strength */}
            {pw && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 space-y-1.5 overflow-hidden"
              >
                {PW_RULES.map(r => {
                  const ok = r.test(pw)
                  return (
                    <div key={r.label} className={cn(
                      'flex items-center gap-1.5 text-[11px] transition-colors',
                      ok ? 'text-[var(--success-bright)]' : 'text-[var(--text-3)]'
                    )}>
                      {ok
                        ? <CheckCircle2 className="h-3 w-3 text-[var(--success-bright)]" />
                        : <Circle       className="h-3 w-3" />
                      }
                      {r.label}
                    </div>
                  )
                })}
              </motion.div>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[var(--text-2)] tracking-wide uppercase">
              Confirm Password
            </label>
            <input
              type="password"
              {...register('confirm')}
              placeholder="••••••••"
              className={INPUT_CLS}
            />
            {errors.confirm && <p className="text-[11px] text-[var(--danger-bright)]">{errors.confirm.message}</p>}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            loading={isSubmitting}
            className="w-full h-9 mt-1"
            iconRight={!isSubmitting ? <ArrowRight className="h-4 w-4" /> : undefined}
          >
            Create account
          </Button>
        </form>

        <div className="relative flex items-center my-6">
          <div className="flex-1 h-px bg-[var(--border-2)]" />
          <span className="px-3 text-[11px] text-[var(--text-4)]">or</span>
          <div className="flex-1 h-px bg-[var(--border-2)]" />
        </div>

        <p className="text-[13px] text-center text-[var(--text-3)]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-[var(--accent-bright)] hover:text-[var(--accent-hover)] font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
