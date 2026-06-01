import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy-loaded pages for code splitting
const Dashboard   = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Markets     = lazy(() => import('@/pages/Markets').then((m) => ({ default: m.Markets })))
const Assets      = lazy(() => import('@/pages/Assets').then((m) => ({ default: m.Assets })))
const Watchlists  = lazy(() => import('@/pages/Watchlists').then((m) => ({ default: m.Watchlists })))
const Alerts      = lazy(() => import('@/pages/Alerts').then((m) => ({ default: m.Alerts })))
const AIInsights  = lazy(() => import('@/pages/AIInsights').then((m) => ({ default: m.AIInsights })))
const Users       = lazy(() => import('@/pages/Users').then((m) => ({ default: m.Users })))
const System      = lazy(() => import('@/pages/System').then((m) => ({ default: m.System })))
const Admin       = lazy(() => import('@/pages/Admin').then((m) => ({ default: m.Admin })))
const Settings    = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.Settings })))
const Login       = lazy(() => import('@/pages/Login').then((m) => ({ default: m.Login })))
const Register    = lazy(() => import('@/pages/Register').then((m) => ({ default: m.Register })))
const NotFound    = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })))

function PageLoader() {
  return (
    <div className="p-6 space-y-4" aria-busy="true" aria-label="Loading page">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Auth routes (no app shell) ── */}
          <Route
            path="/login"
            element={
              <Suspense fallback={<PageLoader />}>
                <Login />
              </Suspense>
            }
          />
          <Route
            path="/register"
            element={
              <Suspense fallback={<PageLoader />}>
                <Register />
              </Suspense>
            }
          />

          {/* ── App routes (with sidebar + header) ── */}
          <Route element={<AppLayout />}>
            <Route
              index
              element={
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="/markets"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Markets />
                </Suspense>
              }
            />
            <Route
              path="/assets"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Assets />
                </Suspense>
              }
            />
            <Route
              path="/watchlists"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Watchlists />
                </Suspense>
              }
            />
            <Route
              path="/alerts"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Alerts />
                </Suspense>
              }
            />
            <Route
              path="/ai"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AIInsights />
                </Suspense>
              }
            />
            <Route
              path="/users"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Users />
                </Suspense>
              }
            />
            <Route
              path="/system"
              element={
                <Suspense fallback={<PageLoader />}>
                  <System />
                </Suspense>
              }
            />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Admin />
                </Suspense>
              }
            />
            <Route
              path="/settings"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Settings />
                </Suspense>
              }
            />
          </Route>

          {/* ── 404 catch-all ── */}
          <Route
            path="*"
            element={
              <Suspense fallback={<PageLoader />}>
                <NotFound />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
