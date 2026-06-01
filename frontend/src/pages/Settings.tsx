import React from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, Monitor, Bell, Globe, Shield, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/common/PageHeader'
import { useApp } from '@/context/AppContext'
import type { Theme } from '@/types'
import { useTheme } from '@/hooks/useTheme'

const themes: { value: Theme; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function Settings() {
  const { currentUser, logout } = useApp()
  const { theme, setTheme } = useTheme()

  return (
    <div className="p-4 sm:p-6 max-w-[800px] mx-auto">
      <PageHeader title="Settings" description="Manage your preferences and account" />

      <div className="space-y-4">
        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-4 w-4" aria-hidden="true" />
                Appearance
              </CardTitle>
              <CardDescription>Customize how Global-Fi Ultra looks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">Theme</p>
                <div className="flex gap-2" role="radiogroup" aria-label="Theme selection">
                  {themes.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      role="radio"
                      aria-checked={theme === value}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        theme === value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" aria-hidden="true" />
                Account
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg">
                      {currentUser.firstName[0]}{currentUser.lastName[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{currentUser.firstName} {currentUser.lastName}</p>
                      <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                    </div>
                    <Badge variant={currentUser.isActive ? 'success' : 'destructive'} className="ml-auto">
                      {currentUser.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Default Currency</p>
                      <p className="font-medium">{currentUser.preferences?.defaultCurrency ?? 'USD'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Default Stock</p>
                      <p className="font-medium">{currentUser.preferences?.defaultStockSymbol ?? 'IBM'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email Notifications</p>
                      <p className="font-medium">{currentUser.preferences?.notifications?.email ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">WebSocket Notifications</p>
                      <p className="font-medium">{currentUser.preferences?.notifications?.websocket ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>
                  <Separator />
                  <Button variant="destructive" size="sm" onClick={logout}>
                    Sign out
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">You're not signed in.</p>
                  <Button size="sm" onClick={() => window.location.href = '/login'}>
                    Sign in
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* API Info */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4" aria-hidden="true" />
                API Configuration
              </CardTitle>
              <CardDescription>Backend connection settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'API Base URL', value: '/api/v1' },
                { label: 'WebSocket', value: 'ws://localhost:4000' },
                { label: 'API Version', value: '1.0.0' },
                { label: 'Rate Limit', value: '100 req / 15 min' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{item.value}</code>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
