import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { ToastProvider } from '@/components/ui/Toast'

const Dashboard  = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Markets    = lazy(() => import('@/pages/Markets').then(m => ({ default: m.Markets })))
const Assets     = lazy(() => import('@/pages/Assets').then(m => ({ default: m.Assets })))
const Watchlists = lazy(() => import('@/pages/Watchlists').then(m => ({ default: m.Watchlists })))
const Alerts     = lazy(() => import('@/pages/Alerts').then(m => ({ default: m.Alerts })))
const AIInsights = lazy(() => import('@/pages/AIInsights').then(m => ({ default: m.AIInsights })))
const Users      = lazy(() => import('@/pages/Users').then(m => ({ default: m.Users })))
const System     = lazy(() => import('@/pages/System').then(m => ({ default: m.System })))
const Admin      = lazy(() => import('@/pages/Admin').then(m => ({ default: m.Admin })))
const Settings   = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })))
const Login      = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })))
const Register   = lazy(() => import('@/pages/Register').then(m => ({ default: m.Register })))
const NotFound   = lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-0)]">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-8 h-8">
          <div className="w-8 h-8 border-2 border-[var(--border-2)] border-t-[var(--accent)] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] opacity-60" />
          </div>
        </div>
        <p className="text-[12px] text-[var(--text-3)] font-medium tracking-wide">Loading…</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"    element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
            <Route path="/register" element={<Suspense fallback={<PageLoader />}><Register /></Suspense>} />

            <Route element={<AppLayout />}>
              <Route index              element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
              <Route path="/markets"    element={<Suspense fallback={<PageLoader />}><Markets /></Suspense>} />
              <Route path="/assets"     element={<Suspense fallback={<PageLoader />}><Assets /></Suspense>} />
              <Route path="/watchlists" element={<Suspense fallback={<PageLoader />}><Watchlists /></Suspense>} />
              <Route path="/alerts"     element={<Suspense fallback={<PageLoader />}><Alerts /></Suspense>} />
              <Route path="/ai"         element={<Suspense fallback={<PageLoader />}><AIInsights /></Suspense>} />
              <Route path="/users"      element={<Suspense fallback={<PageLoader />}><Users /></Suspense>} />
              <Route path="/system"     element={<Suspense fallback={<PageLoader />}><System /></Suspense>} />
              <Route path="/admin"      element={<Suspense fallback={<PageLoader />}><Admin /></Suspense>} />
              <Route path="/settings"   element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
            </Route>

            <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  )
}
