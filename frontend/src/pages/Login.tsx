import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usersApi } from '@/lib/api'
import { useApp } from '@/context/AppContext'

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })
type Form = z.infer<typeof schema>

const inputCls = 'w-full h-10 bg-slate-800/60 border border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:outline-none rounded-lg px-3 text-sm text-white placeholder:text-slate-500 transition-colors'

export function Login() {
  const navigate = useNavigate()
  const { setCurrentUser, setToken } = useApp()
  const [showPw, setShowPw] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Form) => {
    try {
      const r = await usersApi.login(data)
      if (r.token) setToken(r.token)
      if (r.user) setCurrentUser(r.user)
      navigate('/')
    } catch { navigate('/') } // allow demo access
  }

  return (
    <div className="min-h-screen flex bg-[#0B1220]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-600/10 via-[#0B1220] to-[#0B1220] border-r border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.12),transparent_60%)]" />
        <div className="relative z-10 max-w-sm text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xl font-bold text-white">Global-Fi <span className="text-blue-400">Ultra</span></span>
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Real-time financial intelligence</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            Track stocks, crypto, forex & economic indicators. Get AI-powered insights powered by Groq LLaMA.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[{ v: '6 APIs', l: 'Data Sources' }, { v: 'LLaMA 3.3', l: 'AI Model' }, { v: '< 100ms', l: 'Latency' }].map(s => (
              <div key={s.l} className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-3 text-center">
                <p className="text-base font-bold text-blue-400">{s.v}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-bold text-lg text-white">Global-Fi <span className="text-blue-400">Ultra</span></span>
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Sign in</h1>
          <p className="text-sm text-slate-400 mb-7">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" {...register('email')} placeholder="you@example.com" autoComplete="email" className={inputCls} />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} {...register('password')} placeholder="••••••••"
                  autoComplete="current-password" className={inputCls + ' pr-10'} />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" loading={isSubmitting} className="w-full h-10 gap-2">
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-5 space-y-3">
            <p className="text-sm text-center text-slate-400">
              No account? <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Create one</Link>
            </p>
            <div className="relative flex items-center"><div className="flex-1 h-px bg-slate-700" /><span className="px-3 text-xs text-slate-500">or</span><div className="flex-1 h-px bg-slate-700" /></div>
            <button onClick={() => navigate('/')}
              className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-1">
              Continue without signing in →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
