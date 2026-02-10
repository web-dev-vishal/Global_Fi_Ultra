# 🚀 Quick Reference - AI Features

## Setup (2 minutes)

```bash
# 1. Get API key
https://console.groq.com/keys

# 2. Add to .env
GROQ_API_KEY=gsk_your_key_here

# 3. Test
npm run test:integration

# 4. Start
npm run dev
```

## Commands

```bash
# Server
npm run dev              # Start server
npm run test:integration # Test config

# Redis
npm run redis:monitor    # Monitor cache
npm run redis:watch      # Auto-refresh
npm run redis:stats      # Statistics

# AI
npm run ai:demo          # Test AI
npm run ai:integrate     # Integration server
```

## API Endpoints

```bash
# Sentiment
POST /api/v1/ai/sentiment
{"text": "Stock market rallies"}

# Analysis
POST /api/v1/ai/analyze
{"symbol": "AAPL", "priceData": {...}}

# Recommendations
POST /api/v1/ai/recommend
{"userProfile": {...}, "marketData": [...]}

# Predictions
POST /api/v1/ai/predict
{"symbol": "AAPL", "historicalData": [...]}

# News
POST /api/v1/ai/news/summary
{"newsArticles": [...]}
```

## WebSocket

```javascript
const socket = io('http://localhost:3000');

// Chat
socket.emit('ai:chat', {
  message: 'Explain inflation',
  sessionId: '123'
});

socket.on('ai:stream:chunk', (data) => {
  console.log(data.chunk);
});

// Analysis
socket.emit('ai:analyze', {
  symbol: 'AAPL',
  priceData: {...}
});

socket.on('ai:analysis:complete', (data) => {
  console.log(data.analysis);
});
```

## Health Check

```bash
# Basic health
curl http://localhost:3000/health

# Response
{
  "status": "healthy",
  "features": {
    "ai": true
  }
}

# Readiness
curl http://localhost:3000/api/v1/health/readiness

# Response
{
  "status": "ready",
  "checks": {
    "database": true,
    "redis": true,
    "ai": {
      "enabled": true,
      "websocket": true,
      "jobQueue": true
    }
  }
}
```

## Troubleshooting

### AI not working?

```bash
# Check config
npm run test:integration

# Check logs
tail -f logs/app.log | grep AI

# Check health
curl http://localhost:3000/health
```

### Common Issues

**"AI features disabled"**
→ Add `GROQ_API_KEY` to `.env`

**"Invalid API key"**
→ Check key at https://console.groq.com/keys

**"Redis connection failed"**
→ Start Redis: `docker-compose up redis`

**"Job queue not available"**
→ Optional - AI works without it

## File Structure

```
src/
├── infrastructure/ai/       # AI client
├── application/services/    # AI services
├── presentation/
│   ├── controllers/         # AI controller
│   └── routes/              # AI routes
└── tools/                   # Redis monitor

examples/
├── test-ai-features.js      # Demo
├── integrate-ai.js          # Integration
└── websocket-client.html    # Chat UI

docs/
├── AI_FEATURES.md           # Full docs
├── QUICK_START_AI.md        # Quick start
├── INTEGRATION_GUIDE.md     # Integration
└── ARCHITECTURE.md          # Architecture
```

## Key Features

✅ 11 REST endpoints  
✅ 5 WebSocket events  
✅ Redis caching  
✅ Job queue (optional)  
✅ Streaming responses  
✅ Auto-retry logic  
✅ Error handling  
✅ Health checks  

## Performance

- Cached: < 1ms
- Simple (8B): 100-200ms
- Complex (70B): 200-500ms
- Streaming: First token < 100ms

## Rate Limits (Free)

- 300K tokens/min
- 1K requests/min
- No daily limits ✅

## Documentation

📖 **START_HERE.md** - Begin here  
📋 **GET_STARTED_CHECKLIST.md** - 10-min setup  
📚 **docs/AI_FEATURES.md** - Complete docs  
🔧 **docs/INTEGRATION_GUIDE.md** - Integration  
🏗️ **docs/ARCHITECTURE.md** - Architecture  
✅ **AI_INTEGRATION_COMPLETE.md** - This integration  

## Support

- Groq: https://console.groq.com/docs
- Redis: https://redis.io/docs
- Socket.io: https://socket.io/docs

## Quick Test

```bash
# 1. Start server
npm run dev

# 2. Test sentiment
curl -X POST http://localhost:3000/api/v1/ai/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text":"Stock market hits record high"}'

# 3. Open chat
open examples/websocket-client.html

# 4. Monitor cache
npm run redis:monitor
```

---

**Status**: ✅ Production-Ready  
**Version**: 1.0.0  
**Last Updated**: February 10, 2026
