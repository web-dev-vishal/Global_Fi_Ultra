import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Eye, EyeOff, UserPlus, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { usersApi } from '@/lib/api'
import { useApp } from '@/context/AppContext'

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

const passwordRules = [
  { label: 'At least 6 characters', test: (p: string) => p.length >= 6 },
  { label: 'Contains a number', test: (p: string) => /\d/.test(p) },
  { label: 'Contains a letter', test: (p: string) => /[a-zA-Z]/.test(p) },
]

export function Register() {
  const navigate = useNavigate()
  const { setCurrentUser, setToken, toast } = useApp()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  })

  const password = form.watch('password')

  const handleSubmit = async (data: RegisterForm) => {
    try {
      const user = await usersApi.create({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
      })
      setCurrentUser(user)
      toast.success('Account created!', `Welcome, ${user.firstName}!`)
      navigate('/')
    } catch (err) {
      toast.error(
        'Registration failed',
        err instanceof Error ? err.message : 'Please try again.'
      )
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
            <h1 className="text-xl font-bold text-center">Create account</h1>
            <p className="text-sm text-muted-foreground text-center">
              Start tracking markets in seconds
            </p>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
              noValidate
            >
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="reg-first" className="text-sm font-medium">
                    First name
                  </label>
                  <Input
                    id="reg-first"
                    {...form.register('firstName')}
                    placeholder="John"
                    autoComplete="given-name"
                    error={!!form.formState.errors.firstName}
                    aria-describedby={
                      form.formState.errors.firstName
                        ? 'reg-first-error'
                        : undefined
                    }
                  />
                  {form.formState.errors.firstName && (
                    <p
                      id="reg-first-error"
                      className="text-xs text-destructive"
                      role="alert"
                    >
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="reg-last" className="text-sm font-medium">
                    Last name
                  </label>
                  <Input
                    id="reg-last"
                    {...form.register('lastName')}
                    placeholder="Doe"
                    autoComplete="family-name"
                    error={!!form.formState.errors.lastName}
                    aria-describedby={
                      form.formState.errors.lastName
                        ? 'reg-last-error'
                        : undefined
                    }
                  />
                  {form.formState.errors.lastName && (
                    <p
                      id="reg-last-error"
                      className="text-xs text-destructive"
                      role="alert"
                    >
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="reg-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="reg-email"
                  type="email"
                  {...form.register('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                  error={!!form.formState.errors.email}
                  aria-describedby={
                    form.formState.errors.email ? 'reg-email-error' : undefined
                  }
                />
                {form.formState.errors.email && (
                  <p
                    id="reg-email-error"
                    className="text-xs text-destructive"
                    role="alert"
                  >
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="reg-password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    {...form.register('password')}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    error={!!form.formState.errors.password}
                    className="pr-10"
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

                {/* Password strength indicators */}
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1 pt-1"
                    aria-label="Password requirements"
                  >
                    {passwordRules.map((rule) => {
                      const passed = rule.test(password)
                      return (
                        <div
                          key={rule.label}
                          className={`flex items-center gap-1.5 text-xs transition-colors ${
                            passed
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <CheckCircle2
                            className={`h-3 w-3 transition-colors ${
                              passed ? 'text-emerald-500' : 'text-muted-foreground/40'
                            }`}
                            aria-hidden="true"
                          />
                          {rule.label}
                        </div>
                      )
                    })}
                  </motion.div>
                )}

                {form.formState.errors.password && (
                  <p className="text-xs text-destructive" role="alert">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label htmlFor="reg-confirm" className="text-sm font-medium">
                  Confirm password
                </label>
                <div className="relative">
                  <Input
                    id="reg-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    {...form.register('confirmPassword')}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    error={!!form.formState.errors.confirmPassword}
                    className="pr-10"
                    aria-describedby={
                      form.formState.errors.confirmPassword
                        ? 'reg-confirm-error'
                        : undefined
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p
                    id="reg-confirm-error"
                    className="text-xs text-destructive"
                    role="alert"
                  >
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={form.formState.isSubmitting}
                size="lg"
              >
                <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
                Create account
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
