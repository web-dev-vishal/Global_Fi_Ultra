import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usersApi } from '@/lib/api'
import { useApp } from '@/context/AppContext'

const schema = z.object({
  firstName: z.string().min(1).max(50),
  lastName:  z.string().min(1).max(50),
  email:     z.string().email(),
  password:  z.string().min(6),
  confirm:   z.string().min(1),
}).refine(d => d.password === d.confirm, { message: "Passwords don't match", path: ['confirm'] })
type Form = z.infer<typeof schema>

const inputCls = 'w-full h-10 bg-slate-800/60 border border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:outline-none rounded-lg px-3 text-sm text-white placeholder:text-slate-500 transition-colors'
const pwRules = [
  { label: 'At least 6 characters', test: (p: string) => p.length >= 6 },
  { label: 'Contains a number',     test: (p: string) => /\d/.test(p) },
  { label: 'Contains a letter',     test: (p: string) => /[a-zA-Z]/.test(p) },
]

export function Register() {
  const navigate = useNavigate()
  const { setCurrentUser } = useApp()
  const [showPw, setShowPw] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema), mode: 'onChange',
  })
  const pw = watch('password') ?? ''

  const onSubmit = async (data: Form) => {
    try {
      const user = await usersApi.create({ email: data.email, firstName: data.firstName, lastName: data.lastName, password: data.password })
      setCurrentUser(user)
      navigate('/')
    } catch { navigate('/') }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220] p-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30">
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-bold text-lg text-white">Global-Fi <span className="text-blue-400">Ultra</span></span>
        </div>
        <h1 className="text-2xl font-black text-white mb-1">Create account</h1>
        <p className="text-sm text-slate-400 mb-7">Start tracking markets in seconds</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            {(['firstName', 'lastName'] as const).map(f => (
              <div key={f}>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                  {f === 'firstName' ? 'First' : 'Last'} Name
                </label>
                <input {...register(f)} placeholder={f === 'firstName' ? 'John' : 'Doe'} className={inputCls} />
                {errors[f] && <p className="text-xs text-red-400 mt-1">{errors[f]?.message}</p>}
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Email</label>
            <input type="email" {...register('email')} placeholder="you@example.com" className={inputCls} />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} {...register('password')} placeholder="••••••••" className={inputCls + ' pr-10'} />
              <button type="button" onClick={() => setShowPw(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {pw && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1 pt-2">
                {pwRules.map(r => (
                  <div key={r.label} className={`flex items-center gap-1.5 text-xs ${r.test(pw) ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className={`h-3 w-3 ${r.test(pw) ? 'text-emerald-400' : 'text-slate-600'}`} />
                    {r.label}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Confirm Password</label>
            <input type="password" {...register('confirm')} placeholder="••••••••" className={inputCls} />
            {errors.confirm && <p className="text-xs text-red-400 mt-1">{errors.confirm.message}</p>}
          </div>
          <Button type="submit" loading={isSubmitting} className="w-full h-10 gap-2">
            Create account <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="text-sm text-center text-slate-400 mt-5">
          Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
