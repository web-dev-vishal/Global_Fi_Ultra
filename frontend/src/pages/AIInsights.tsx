import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Send, StopCircle, Trash2, Sparkles, TrendingUp,
  Newspaper, BarChart3, Brain, Loader2, User, Copy, Check
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/common/PageHeader'
import { useWebSocket } from '@/hooks/useWebSocket'
import { aiApi } from '@/lib/api'
import type { SentimentResult, AssetAnalysis } from '@/types'
import { getSentimentColor, formatPercent } from '@/lib/utils'
import { useApp } from '@/context/AppContext'

export function AIInsights() {
  const { toast } = useApp()
  const {
    connected, aiMessages, isAIStreaming,
    sendAIChat, stopAIStream, clearAIMessages
  } = useWebSocket({ autoConnect: true })

  const [chatInput, setChatInput] = useState('')
  const [sentimentText, setSentimentText] = useState('')
  const [sentimentResult, setSentimentResult] = useState<SentimentResult | null>(null)
  const [sentimentLoading, setSentimentLoading] = useState(false)
  const [analysisSymbol, setAnalysisSymbol] = useState('AAPL')
  const [analysisResult, setAnalysisResult] = useState<AssetAnalysis | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages])

  const handleSendChat = () => {
    if (!chatInput.trim() || isAIStreaming) return
    sendAIChat(chatInput.trim())
    setChatInput('')
  }

  const handleSentimentAnalysis = async () => {
    if (!sentimentText.trim()) return
    try {
      setSentimentLoading(true)
      const result = await aiApi.analyzeSentiment(sentimentText)
      setSentimentResult(result.data)
    } catch (err) {
      toast.error('Analysis failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSentimentLoading(false)
    }
  }

  const handleAssetAnalysis = async () => {
    if (!analysisSymbol.trim()) return
    try {
      setAnalysisLoading(true)
      const mockPriceData = {
        current: 150,
        change: 2.5,
        changePercent: 1.7,
        high: 155,
        low: 148,
        volume: 50000000,
      }
      const result = await aiApi.analyzeAsset(analysisSymbol.toUpperCase(), mockPriceData)
      setAnalysisResult(result.data)
    } catch (err) {
      toast.error('Analysis failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setAnalysisLoading(false)
    }
  }

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const trendColors = {
    bullish: 'text-emerald-500',
    bearish: 'text-red-500',
    neutral: 'text-yellow-500',
  }

  const recommendationColors = {
    buy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    sell: 'bg-red-500/10 text-red-600 dark:text-red-400',
    hold: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="AI Insights"
        description="Powered by Groq LLaMA — real-time financial intelligence"
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={connected ? 'success' : 'destructive'} className="text-xs">
              {connected ? '● Connected' : '○ Disconnected'}
            </Badge>
          </div>
        }
      />

      {!connected && (
        <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
          <Bot className="h-4 w-4 shrink-0" aria-hidden="true" />
          WebSocket not connected. AI chat requires a live connection to the backend.
        </div>
      )}

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chat" className="gap-1.5">
            <Bot className="h-3.5 w-3.5" aria-hidden="true" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="gap-1.5">
            <Brain className="h-3.5 w-3.5" aria-hidden="true" />
            Sentiment
          </TabsTrigger>
          <TabsTrigger value="analysis" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
            Asset Analysis
          </TabsTrigger>
        </TabsList>

        {/* AI Chat */}
        <TabsContent value="chat">
          <Card className="flex flex-col h-[600px]">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" aria-hidden="true" />
                  Financial AI Assistant
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={clearAIMessages}
                  aria-label="Clear chat history"
                  disabled={aiMessages.length === 0}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              role="log"
              aria-label="Chat messages"
              aria-live="polite"
            >
              {aiMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-3">
                    <Sparkles className="h-8 w-8 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold mb-1">Ask me anything about finance</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    I can analyze markets, explain trends, compare assets, and provide investment insights.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 w-full max-w-md">
                    {[
                      'What are the key factors affecting Bitcoin price?',
                      'Explain the current Fed interest rate policy',
                      'Compare growth vs value investing strategies',
                      'What is a good portfolio allocation for 2025?',
                    ].map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => { setChatInput(prompt); }}
                        className="text-left text-xs p-2.5 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/40 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence>
                {aiMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${
                      msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </div>
                    <div className={`group relative max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}>
                        {msg.content || (msg.isStreaming && (
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                            <span className="text-xs opacity-70">Thinking...</span>
                          </span>
                        ))}
                        {msg.isStreaming && msg.content && (
                          <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse" aria-hidden="true" />
                        )}
                      </div>
                      {msg.content && !msg.isStreaming && (
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="absolute -top-1 -right-8 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
                          aria-label="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                  placeholder={connected ? 'Ask about markets, stocks, crypto...' : 'Connect to backend to chat'}
                  disabled={!connected || isAIStreaming}
                  aria-label="Chat message input"
                  className="flex-1"
                />
                {isAIStreaming ? (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={stopAIStream}
                    aria-label="Stop AI response"
                  >
                    <StopCircle className="h-4 w-4" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    onClick={handleSendChat}
                    disabled={!connected || !chatInput.trim()}
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                AI responses are for informational purposes only. Not financial advice.
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Sentiment Analysis */}
        <TabsContent value="sentiment">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" aria-hidden="true" />
                  Sentiment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="sentiment-text" className="text-sm font-medium">
                    Text to analyze
                  </label>
                  <textarea
                    id="sentiment-text"
                    value={sentimentText}
                    onChange={(e) => setSentimentText(e.target.value)}
                    placeholder="Paste a news headline, article excerpt, or any financial text..."
                    className="w-full h-32 px-3 py-2 text-sm rounded-md border border-input bg-transparent resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
                    aria-label="Text for sentiment analysis"
                  />
                </div>
                <Button
                  onClick={handleSentimentAnalysis}
                  loading={sentimentLoading}
                  disabled={!sentimentText.trim()}
                  className="w-full"
                >
                  <Brain className="h-4 w-4 mr-2" aria-hidden="true" />
                  Analyze Sentiment
                </Button>
              </CardContent>
            </Card>

            {sentimentResult && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Analysis Result</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Sentiment</span>
                      <span className={`text-lg font-bold capitalize ${getSentimentColor(sentimentResult.sentiment)}`}>
                        {sentimentResult.sentiment}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-semibold">{sentimentResult.confidence}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${sentimentResult.confidence}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            sentimentResult.sentiment === 'bullish' || sentimentResult.sentiment === 'positive'
                              ? 'bg-emerald-500'
                              : sentimentResult.sentiment === 'bearish' || sentimentResult.sentiment === 'negative'
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                          }`}
                          aria-label={`Confidence: ${sentimentResult.confidence}%`}
                        />
                      </div>
                    </div>
                    {sentimentResult.reasoning && (
                      <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                        {sentimentResult.reasoning}
                      </div>
                    )}
                    {sentimentResult.keywords && sentimentResult.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {sentimentResult.keywords.map((kw) => (
                          <Badge key={kw} variant="muted" className="text-xs">{kw}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </TabsContent>

        {/* Asset Analysis */}
        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" aria-hidden="true" />
                  Asset Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="analysis-symbol" className="text-sm font-medium">
                    Stock / Crypto Symbol
                  </label>
                  <Input
                    id="analysis-symbol"
                    value={analysisSymbol}
                    onChange={(e) => setAnalysisSymbol(e.target.value.toUpperCase())}
                    placeholder="AAPL, BTC, TSLA..."
                    aria-label="Asset symbol for analysis"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Analysis uses mock price data for demonstration. In production, connect to live price feeds.
                </p>
                <Button
                  onClick={handleAssetAnalysis}
                  loading={analysisLoading}
                  disabled={!analysisSymbol.trim()}
                  className="w-full"
                >
                  <TrendingUp className="h-4 w-4 mr-2" aria-hidden="true" />
                  Analyze Asset
                </Button>
              </CardContent>
            </Card>

            {analysisResult && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle>{analysisResult.symbol}</CardTitle>
                      <Badge
                        className={`capitalize ${
                          analysisResult.recommendation === 'buy'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : analysisResult.recommendation === 'sell'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                            : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                        }`}
                      >
                        {analysisResult.recommendation?.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Trend</p>
                        <p className={`text-sm font-semibold capitalize mt-0.5 ${trendColors[analysisResult.trend as keyof typeof trendColors] ?? ''}`}>
                          {analysisResult.trend}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Risk Level</p>
                        <p className="text-sm font-semibold capitalize mt-0.5">{analysisResult.riskLevel}</p>
                      </div>
                      {analysisResult.support && (
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Support</p>
                          <p className="text-sm font-semibold mt-0.5">${analysisResult.support}</p>
                        </div>
                      )}
                      {analysisResult.resistance && (
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Resistance</p>
                          <p className="text-sm font-semibold mt-0.5">${analysisResult.resistance}</p>
                        </div>
                      )}
                    </div>
                    {analysisResult.reasoning && (
                      <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground leading-relaxed">
                        {analysisResult.reasoning}
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      ⚠️ Not financial advice. For educational purposes only.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
