# 🧪 API Testing Guide

Complete guide to test all Global-Fi Ultra APIs with Postman and curl.

## 📦 Postman Collection

**File**: `postman-collection.json`

### Import to Postman

1. Open Postman
2. Click "Import" button
3. Select `postman-collection.json`
4. Collection will be imported with all endpoints

### Configure Base URL

The collection uses a variable `{{baseUrl}}` set to `http://localhost:3000`

To change:
1. Click on collection name
2. Go to "Variables" tab
3. Update `baseUrl` value

## 🚀 Quick Start Testing

### 1. Start Server

```bash
npm run dev
```

### 2. Test Health Check

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-10T...",
  "requestId": "...",
  "features": {
    "ai": true
  }
}
```

### 3. Test AI Endpoint

```bash
curl -X POST http://localhost:3000/api/v1/ai/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text":"Stock market hits all-time high"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "sentiment": "positive",
    "confidence": 85,
    "reasoning": "..."
  }
}
```

## 📋 All Endpoints with Examples

### Health & Status

#### 1. Health Check
```bash
curl http://localhost:3000/health
```

#### 2. Readiness Check
```bash
curl http://localhost:3000/api/v1/health/readiness
```

#### 3. Circuit Breaker Status
```bash
curl http://localhost:3000/api/v1/status/circuit-breakers
```

---

### AI Features (11 Endpoints)

#### 1. Sentiment Analysis
```bash
curl -X POST http://localhost:3000/api/v1/ai/sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Stock market hits all-time high as tech stocks surge",
    "type": "news"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sentiment": "positive",
    "confidence": 85,
    "reasoning": "The text indicates strong market performance"
  }
}
```

#### 2. Asset Analysis
```bash
curl -X POST http://localhost:3000/api/v1/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "priceData": {
      "current": 150.25,
      "change24h": 2.5,
      "volume": 50000000,
      "marketCap": "2.5T"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trend": "bullish",
    "confidence": 75,
    "support": 145.00,
    "resistance": 155.00,
    "outlook": "positive",
    "risk": "medium",
    "reasoning": "Strong upward momentum with healthy volume"
  }
}
```

#### 3. Compare Assets
```bash
curl -X POST http://localhost:3000/api/v1/ai/compare \
  -H "Content-Type: application/json" \
  -d '{
    "assets": [
      {
        "symbol": "AAPL",
        "price": 150.25,
        "change24h": 2.5,
        "volume": 50000000
      },
      {
        "symbol": "MSFT",
        "price": 380.50,
        "change24h": 1.8,
        "volume": 30000000
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendation": "AAPL",
    "reasoning": "Better momentum and volume",
    "rankings": ["AAPL", "MSFT"],
    "riskComparison": "AAPL shows lower volatility"
  }
}
```

#### 4. Investment Recommendation
```bash
curl -X POST http://localhost:3000/api/v1/ai/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "userProfile": {
      "riskTolerance": "moderate",
      "horizon": "long-term",
      "portfolioSize": 50000,
      "sectors": ["technology", "healthcare"]
    },
    "marketData": [
      {
        "symbol": "AAPL",
        "price": 150.25,
        "change24h": 2.5,
        "sector": "technology"
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "symbol": "AAPL",
        "allocation": 40,
        "reasoning": "Strong fundamentals and growth potential"
      }
    ],
    "strategy": "Diversified growth strategy...",
    "riskWarnings": ["Market volatility high"]
  },
  "disclaimer": "This is not financial advice..."
}
```

#### 5. Portfolio Analysis
```bash
curl -X POST http://localhost:3000/api/v1/ai/portfolio \
  -H "Content-Type: application/json" \
  -d '{
    "holdings": [
      {
        "symbol": "AAPL",
        "shares": 100,
        "avgPrice": 145.00,
        "currentPrice": 150.25
      }
    ],
    "marketConditions": {
      "trend": "bullish",
      "volatility": "moderate"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "health": "good",
    "diversificationScore": 75,
    "riskLevel": "medium",
    "adjustments": ["Consider adding bonds"],
    "strengths": ["Good sector diversity"],
    "weaknesses": ["High tech concentration"]
  }
}
```

#### 6. Price Prediction
```bash
curl -X POST http://localhost:3000/api/v1/ai/predict \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "historicalData": [
      {"date": "2024-01-01", "price": 145.00},
      {"date": "2024-01-02", "price": 147.50},
      {"date": "2024-01-03", "price": 150.25}
    ],
    "daysAhead": 7
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "direction": "up",
    "confidence": 60,
    "priceRange": {
      "low": 148.00,
      "high": 155.00
    },
    "factors": ["Strong earnings", "Market momentum"],
    "disclaimer": "This is not financial advice..."
  },
  "disclaimer": "Predictions are for educational purposes only..."
}
```

#### 7. Explain Movement
```bash
curl -X POST http://localhost:3000/api/v1/ai/explain \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "changePercent": 5.2,
    "recentNews": [
      {
        "title": "Apple announces record iPhone sales"
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "explanation": "AAPL moved up 5.2% due to strong iPhone sales announcement..."
  }
}
```

#### 8. News Impact Analysis
```bash
curl -X POST http://localhost:3000/api/v1/ai/news/impact \
  -H "Content-Type: application/json" \
  -d '{
    "newsArticles": [
      {
        "title": "Fed raises interest rates by 0.25%"
      },
      {
        "title": "Tech stocks rally on strong earnings"
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overallSentiment": "positive",
    "confidence": 75,
    "keyThemes": ["interest rates", "tech earnings"],
    "affectedSectors": ["technology", "finance"],
    "summary": "Market shows positive sentiment..."
  }
}
```

#### 9. News Summary
```bash
curl -X POST http://localhost:3000/api/v1/ai/news/summary \
  -H "Content-Type: application/json" \
  -d '{
    "newsArticles": [
      {
        "title": "Markets rally on strong jobs report",
        "description": "Unemployment falls to 3.5%"
      }
    ],
    "maxLength": 100
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Markets rallied today following a strong jobs report..."
  }
}
```

#### 10. Submit AI Job
```bash
curl -X POST http://localhost:3000/api/v1/ai/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "jobType": "sentiment",
    "data": {
      "text": "Stock market shows strong momentum"
    },
    "priority": 1
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Job submitted successfully"
}
```

**Note:** Requires RabbitMQ to be running

#### 11. Get Job Queue Stats
```bash
curl http://localhost:3000/api/v1/ai/jobs/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sentiment": {
      "messages": 5,
      "consumers": 1
    },
    "analysis": {
      "messages": 3,
      "consumers": 1
    }
  }
}
```

---

### Financial Data

#### 1. Get Live Data
```bash
curl http://localhost:3000/api/v1/financial/live
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stocks": [...],
    "crypto": [...],
    "forex": [...],
    "news": [...],
    "economic": [...]
  },
  "timestamp": "2026-02-10T..."
}
```

#### 2. Get Cached Data
```bash
curl http://localhost:3000/api/v1/financial/cached
```

**Response:** Same as live but from cache (faster)

---

### Users

#### 1. List Users
```bash
curl "http://localhost:3000/api/v1/users?page=1&limit=10"
```

#### 2. Create User
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "name": "John Doe",
    "preferences": {
      "currency": "USD",
      "notifications": true
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "USER_ID",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "createdAt": "2026-02-10T..."
  }
}
```

#### 3. Get User by ID
```bash
curl http://localhost:3000/api/v1/users/USER_ID
```

#### 4. Update User
```bash
curl -X PATCH http://localhost:3000/api/v1/users/USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith"
  }'
```

#### 5. Delete User
```bash
curl -X DELETE http://localhost:3000/api/v1/users/USER_ID
```

---

### Watchlists

#### 1. Create Watchlist
```bash
curl -X POST http://localhost:3000/api/v1/watchlists \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "name": "Tech Stocks",
    "description": "My favorite tech stocks",
    "assets": [
      {"symbol": "AAPL", "type": "stock"},
      {"symbol": "MSFT", "type": "stock"}
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "WATCHLIST_ID",
    "name": "Tech Stocks",
    "assets": [...]
  }
}
```

#### 2. Add Asset to Watchlist
```bash
curl -X POST http://localhost:3000/api/v1/watchlists/WATCHLIST_ID/assets \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "GOOGL",
    "type": "stock"
  }'
```

---

### Alerts

#### 1. Create Alert
```bash
curl -X POST http://localhost:3000/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "symbol": "AAPL",
    "type": "price",
    "condition": "above",
    "threshold": 160.00,
    "message": "AAPL crossed $160"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ALERT_ID",
    "symbol": "AAPL",
    "threshold": 160.00,
    "active": true
  }
}
```

#### 2. Activate Alert
```bash
curl -X PATCH http://localhost:3000/api/v1/alerts/ALERT_ID/activate
```

#### 3. Deactivate Alert
```bash
curl -X PATCH http://localhost:3000/api/v1/alerts/ALERT_ID/deactivate
```

---

### Admin

#### 1. Clear Cache
```bash
curl -X POST http://localhost:3000/api/v1/admin/cache/clear
```

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared successfully"
}
```

#### 2. Get Metrics
```bash
curl http://localhost:3000/api/v1/admin/metrics
```

---

## 🧪 Testing Workflow

### Step 1: Health Checks
```bash
# 1. Basic health
curl http://localhost:3000/health

# 2. Readiness
curl http://localhost:3000/api/v1/health/readiness

# 3. Circuit breakers
curl http://localhost:3000/api/v1/status/circuit-breakers
```

### Step 2: Test AI Features
```bash
# 1. Sentiment
curl -X POST http://localhost:3000/api/v1/ai/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text":"Stock market rallies"}'

# 2. Asset analysis
curl -X POST http://localhost:3000/api/v1/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","priceData":{"current":150,"change24h":2.5}}'
```

### Step 3: Test Financial Data
```bash
# 1. Cached data (fast)
curl http://localhost:3000/api/v1/financial/cached

# 2. Live data (slower)
curl http://localhost:3000/api/v1/financial/live
```

### Step 4: Test User Management
```bash
# 1. Create user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# 2. List users
curl http://localhost:3000/api/v1/users
```

---

## 📊 Expected Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid data)
- `404` - Not Found
- `500` - Server Error
- `503` - Service Unavailable (AI not configured)

---

## 🐛 Troubleshooting

### AI Endpoints Return 503

**Cause:** AI not configured

**Solution:**
```bash
# Check health
curl http://localhost:3000/health

# Should show: "ai": false

# Add GROQ_API_KEY to .env and restart
```

### Endpoints Return 404

**Cause:** Server not running or wrong URL

**Solution:**
```bash
# Check server is running
curl http://localhost:3000/health

# Check logs
tail -f logs/app.log
```

### Job Queue Endpoints Fail

**Cause:** RabbitMQ not running

**Solution:**
```bash
# Start RabbitMQ
docker-compose up rabbitmq

# Or skip job queue tests (optional feature)
```

---

## 💡 Pro Tips

### 1. Save Response to Variable (bash)
```bash
RESPONSE=$(curl -s http://localhost:3000/health)
echo $RESPONSE | jq .
```

### 2. Pretty Print JSON
```bash
curl http://localhost:3000/health | jq .
```

### 3. Include Headers
```bash
curl -i http://localhost:3000/health
```

### 4. Verbose Output
```bash
curl -v http://localhost:3000/health
```

### 5. Save to File
```bash
curl http://localhost:3000/api/v1/financial/live > data.json
```

---

## 📚 Additional Resources

- **Postman Collection**: `postman-collection.json`
- **API Documentation**: `docs/AI_FEATURES.md`
- **Quick Reference**: `QUICK_REFERENCE.md`
- **Integration Guide**: `docs/INTEGRATION_GUIDE.md`

---

## ✅ Testing Checklist

- [ ] Health check works
- [ ] AI sentiment analysis works
- [ ] AI asset analysis works
- [ ] Financial data endpoints work
- [ ] User CRUD operations work
- [ ] Watchlist operations work
- [ ] Alert operations work
- [ ] Admin endpoints work
- [ ] Error handling works (try invalid data)
- [ ] Rate limiting works (many requests)

---

**Happy Testing!** 🚀
