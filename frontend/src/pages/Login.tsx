import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { usersApi } from '@/lib/api'
import { useApp } from '@/context/AppContext'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
type LoginForm = z.infer<typeof loginSchema>

export function Login() {
  const navigate = useNavigate()
  const { setCurrentUser, setToken, toast } = useApp()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const handleSubmit = async (data: LoginForm) => {
    try {
      const result = await usersApi.login(data)
      if (result.token) setToken(result.token)
      if (result.user) setCurrentUser(result.user)
      toast.success('Welcome back!', `Signed in as ${result.user?.firstName ?? data.email}`)
      navigate('/')
    } catch (err) {
      toast.error('Sign in failed', err instanceof Error ? err.message : 'Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary">
            <Zap className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
          </div>
          <span className="font-bold text-xl tracking-tight">Global-Fi Ultra</span>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <h1 className="text-xl font-bold text-center">Sign in</h1>
            <p className="text-sm text-muted-foreground text-center">
              Enter your credentials to access the dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-sm font-medium">Email</label>
                <Input
                  id="login-email"
                  type="email"
                  {...form.register('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                  error={!!form.formState.errors.email}
                  aria-describedby={form.formState.errors.email ? 'login-email-error' : undefined}
                />
                {form.formState.errors.email && (
                  <p id="login-email-error" className="text-xs text-destructive" role="alert">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    {...form.register('password')}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    error={!!form.formState.errors.password}
                    className="pr-10"
                    aria-describedby={form.formState.errors.password ? 'login-password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p id="login-password-error" className="text-xs text-destructive" role="alert">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={form.formState.isSubmitting}
                size="lg"
              >
                <LogIn className="h-4 w-4 mr-2" aria-hidden="true" />
                Sign in
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Create one
                </Link>
              </p>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground text-center">
              Or{' '}
              <button
                onClick={() => navigate('/')}
                className="text-primary hover:underline"
              >
                continue without signing in
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
