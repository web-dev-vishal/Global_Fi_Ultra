import React from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, Monitor, Shield, Zap, Bell, Globe, Palette } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { PageHeader } from '@/components/common/PageHeader'
import { useApp } from '@/context/AppContext'
import type { Theme } from '@/types'
import { useTheme } from '@/hooks/useTheme'
import { useNavigate } from 'react-router-dom'

const themes: { value: Theme; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'light', label: 'Light', icon: Sun, desc: 'Clean white interface' },
  { value: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
  { value: 'system', label: 'System', icon: Monitor, desc: 'Follows OS setting' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export function Settings() {
  const { currentUser, logout } = useApp()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <div className="p-4 sm:p-6 max-w-[800px] mx-auto">
      <PageHeader title="Settings" description="Manage your preferences and account" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {/* ── Appearance ── */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-purple-500" aria-hidden="true" />
                Appearance
              </CardTitle>
              <CardDescription>Choose how Global-Fi Ultra looks to you</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium mb-3">Theme</p>
              <div
                className="grid grid-cols-3 gap-3"
                role="radiogroup"
                aria-label="Theme selection"
              >
                {themes.map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    role="radio"
                    aria-checked={theme === value}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      theme === value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-border/80 hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span>{label}</span>
                    <span className="text-[10px] font-normal opacity-70">{desc}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Account ── */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" aria-hidden="true" />
                Account
              </CardTitle>
              <CardDescription>Your profile and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-4">
                    <div
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg shrink-0"
                      aria-hidden="true"
                    >
                      {currentUser.firstName[0]}{currentUser.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {currentUser.firstName} {currentUser.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {currentUser.email}
                      </p>
                    </div>
                    <Badge
                      variant={currentUser.isActive ? 'success' : 'destructive'}
                    >
                      {currentUser.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    {[
                      { label: 'Default Currency', value: currentUser.preferences?.defaultCurrency ?? 'USD' },
                      { label: 'Default Stock', value: currentUser.preferences?.defaultStockSymbol ?? 'IBM' },
                      { label: 'Default Crypto', value: currentUser.preferences?.defaultCryptoIds ?? 'bitcoin,ethereum' },
                      { label: 'User ID', value: currentUser._id.slice(-8) + '…' },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-muted-foreground text-xs">{item.label}</p>
                        <p className="font-medium mt-0.5 truncate">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Notification toggles */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                      Notifications
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Email notifications</p>
                        <p className="text-xs text-muted-foreground">
                          Receive alerts via email
                        </p>
                      </div>
                      <Switch
                        checked={currentUser.preferences?.notifications?.email ?? true}
                        aria-label="Toggle email notifications"
                        disabled
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">WebSocket notifications</p>
                        <p className="text-xs text-muted-foreground">
                          Real-time in-app alerts
                        </p>
                      </div>
                      <Switch
                        checked={currentUser.preferences?.notifications?.websocket ?? true}
                        aria-label="Toggle WebSocket notifications"
                        disabled
                      />
                    </div>
                  </div>

                  <Separator />

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={logout}
                    aria-label="Sign out of your account"
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign in to manage your account settings.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/register')}
                    >
                      Create account
                    </Button>
                    <Button size="sm" onClick={() => navigate('/login')}>
                      Sign in
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── API Configuration ── */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" aria-hidden="true" />
                API Configuration
              </CardTitle>
              <CardDescription>Backend connection details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: 'API Base URL', value: '/api/v1' },
                  { label: 'WebSocket', value: 'ws://localhost:4000' },
                  { label: 'API Version', value: '1.0.0' },
                  { label: 'Global Rate Limit', value: '100 req / 15 min' },
                  { label: 'AI Rate Limit', value: '10 req / 1 min' },
                  { label: 'Auth Rate Limit', value: '5 req / 15 min' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">
                      {item.label}
                    </span>
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                      {item.value}
                    </code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── External APIs ── */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-green-500" aria-hidden="true" />
                External Data Sources
              </CardTitle>
              <CardDescription>
                APIs powering the financial data engine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { name: 'Alpha Vantage', type: 'Stocks', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
                  { name: 'CoinGecko', type: 'Crypto', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
                  { name: 'ExchangeRate API', type: 'Forex', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
                  { name: 'NewsAPI', type: 'News', color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400' },
                  { name: 'FRED', type: 'Economic', color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
                  { name: 'Finnhub', type: 'Market News', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
                ].map((api) => (
                  <div
                    key={api.name}
                    className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-muted/30"
                  >
                    <span className="text-xs font-semibold">{api.name}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full w-fit ${api.color}`}>
                      {api.type}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
