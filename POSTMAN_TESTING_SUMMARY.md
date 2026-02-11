# 📬 Postman Testing - Complete Guide

## 🎯 Quick Start

### 1. Import Postman Collection

**File**: `postman-collection.json`

**Steps:**
1. Open Postman
2. Click "Import" button (top left)
3. Drag & drop `postman-collection.json` OR click "Upload Files"
4. Collection "Global-Fi Ultra API - Complete Collection" will appear

### 2. Start Server

```bash
npm run dev
```

### 3. Test in Postman

1. Open collection in Postman
2. Click on any request
3. Click "Send" button
4. View response

## 📦 What's Included

### Collection Contents

- **50+ API Endpoints** with dummy data
- **11 AI Endpoints** fully configured
- **Health & Status** checks
- **Financial Data** endpoints
- **User Management** CRUD
- **Watchlists** operations
- **Alerts** management
- **Admin** functions

### Pre-configured Data

All requests include realistic dummy data:
- ✅ Stock symbols (AAPL, MSFT, GOOGL)
- ✅ Price data with volume
- ✅ News articles
- ✅ User profiles
- ✅ Portfolio holdings
- ✅ Market conditions

## 🧪 Testing Workflow

### Step 1: Health Checks

**Folder**: Health & Status

1. **Health Check**
   - Click "Health Check"
   - Click "Send"
   - Should return: `"status": "healthy"`
   - Check: `"ai": true` (if configured)

2. **Readiness Check**
   - Click "Readiness Check"
   - Click "Send"
   - Should show all services status

3. **Circuit Breakers**
   - Click "Circuit Breaker Status"
   - Click "Send"
   - Shows external API health

### Step 2: AI Features

**Folder**: AI Features

#### Test Each Endpoint:

1. **Sentiment Analysis**
   ```json
   Request: {"text": "Stock market hits all-time high..."}
   Response: {
     "success": true,
     "data": {
       "sentiment": "positive",
       "confidence": 85,
       "reasoning": "..."
     }
   }
   ```

2. **Asset Analysis**
   ```json
   Request: {"symbol": "AAPL", "priceData": {...}}
   Response: {
     "success": true,
     "data": {
       "trend": "bullish",
       "confidence": 75,
       "support": 145.00,
       "resistance": 155.00
     }
   }
   ```

3. **Compare Assets**
   ```json
   Request: {"assets": [{...}, {...}]}
   Response: {
     "success": true,
     "data": {
       "recommendation": "AAPL",
       "rankings": ["AAPL", "MSFT"]
     }
   }
   ```

4. **Investment Recommendation**
   ```json
   Request: {"userProfile": {...}, "marketData": [...]}
   Response: {
     "success": true,
     "data": {
       "recommendations": [...],
       "strategy": "...",
       "riskWarnings": [...]
     }
   }
   ```

5. **Portfolio Analysis**
   ```json
   Request: {"holdings": [...], "marketConditions": {...}}
   Response: {
     "success": true,
     "data": {
       "health": "good",
       "diversificationScore": 75,
       "adjustments": [...]
     }
   }
   ```

6. **Price Prediction**
   ```json
   Request: {"symbol": "AAPL", "historicalData": [...]}
   Response: {
     "success": true,
     "data": {
       "direction": "up",
       "priceRange": {"low": 148, "high": 155}
     }
   }
   ```

7. **Explain Movement**
   ```json
   Request: {"symbol": "AAPL", "changePercent": 5.2}
   Response: {
     "success": true,
     "data": {
       "explanation": "AAPL moved up 5.2% due to..."
     }
   }
   ```

8. **News Impact**
   ```json
   Request: {"newsArticles": [...]}
   Response: {
     "success": true,
     "data": {
       "overallSentiment": "positive",
       "keyThemes": [...],
       "affectedSectors": [...]
     }
   }
   ```

9. **News Summary**
   ```json
   Request: {"newsArticles": [...], "maxLength": 100}
   Response: {
     "success": true,
     "data": {
       "summary": "Markets rallied today..."
     }
   }
   ```

10. **Submit AI Job** (requires RabbitMQ)
    ```json
    Request: {"jobType": "sentiment", "data": {...}}
    Response: {
      "success": true,
      "message": "Job submitted successfully"
    }
    ```

11. **Job Queue Stats**
    ```json
    Request: GET /api/v1/ai/jobs/stats
    Response: {
      "success": true,
      "data": {
        "sentiment": {"messages": 5, "consumers": 1}
      }
    }
    ```

### Step 3: Financial Data

**Folder**: Financial Data

1. **Get Live Data**
   - Fetches fresh data from all APIs
   - Slower but current
   - Returns: stocks, crypto, forex, news, economic data

2. **Get Cached Data**
   - Returns cached data from Redis
   - Faster (< 1ms)
   - May be up to 60 seconds old

### Step 4: User Management

**Folder**: Users

1. **Create User**
   - Use provided dummy data
   - Save returned `_id` for next steps

2. **List Users**
   - See all users with pagination

3. **Get User by ID**
   - Replace `:userId` with actual ID
   - Or use Postman variable

4. **Update User**
   - Modify user data

5. **Delete User**
   - Remove user

### Step 5: Watchlists

**Folder**: Watchlists

1. **Create Watchlist**
   - Use dummy tech stocks data
   - Save returned `_id`

2. **Add Asset**
   - Add more stocks to watchlist

3. **Remove Asset**
   - Remove stock from watchlist

### Step 6: Alerts

**Folder**: Alerts

1. **Create Alert**
   - Set price threshold
   - Save returned `_id`

2. **Activate Alert**
   - Enable alert

3. **Deactivate Alert**
   - Disable alert

### Step 7: Admin

**Folder**: Admin

1. **Clear Cache**
   - Clears all Redis cache

2. **Get Metrics**
   - System performance metrics

## 🔧 Postman Tips

### 1. Use Variables

Set collection variable for base URL:
```
{{baseUrl}} = http://localhost:3000
```

### 2. Save Response IDs

After creating user/watchlist/alert:
1. Click "Tests" tab
2. Add script:
```javascript
pm.collectionVariables.set("userId", pm.response.json().data._id);
```

### 3. Environment Variables

Create environment for different setups:
- **Local**: `http://localhost:3000`
- **Staging**: `https://staging.example.com`
- **Production**: `https://api.example.com`

### 4. Test Scripts

Add to "Tests" tab:
```javascript
// Check status code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Check response structure
pm.test("Response has success field", function () {
    pm.expect(pm.response.json()).to.have.property('success');
});

// Check AI response
pm.test("AI sentiment is valid", function () {
    const data = pm.response.json().data;
    pm.expect(['positive', 'negative', 'neutral']).to.include(data.sentiment);
});
```

### 5. Pre-request Scripts

Add to "Pre-request Script" tab:
```javascript
// Generate random email
pm.collectionVariables.set("randomEmail", 
    "user" + Math.floor(Math.random() * 10000) + "@example.com"
);
```

## 🚀 Automated Testing

### Run Collection

1. Click collection name
2. Click "Run" button
3. Select requests to run
4. Click "Run Global-Fi Ultra API"
5. View results

### Command Line (Newman)

```bash
# Install Newman
npm install -g newman

# Run collection
newman run postman-collection.json

# With environment
newman run postman-collection.json -e environment.json

# Generate report
newman run postman-collection.json --reporters cli,html
```

## 📊 Expected Responses

### Success Responses

**200 OK**
```json
{
  "success": true,
  "data": {...}
}
```

**201 Created**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    ...
  }
}
```

### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "error": "Invalid input data"
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**503 Service Unavailable**
```json
{
  "success": false,
  "error": "AI service not available"
}
```

## 🐛 Troubleshooting

### AI Endpoints Return 503

**Cause**: AI not configured

**Solution**:
1. Check `.env` has `GROQ_API_KEY`
2. Restart server
3. Check health endpoint shows `"ai": true`

### Connection Refused

**Cause**: Server not running

**Solution**:
```bash
npm run dev
```

### Invalid Response

**Cause**: Wrong data format

**Solution**:
1. Check request body matches schema
2. Verify Content-Type is `application/json`
3. Check for typos in JSON

### Timeout

**Cause**: Server slow or not responding

**Solution**:
1. Increase timeout in Postman settings
2. Check server logs
3. Try cached endpoints instead of live

## 📝 Testing Checklist

### Basic Tests
- [ ] Health check returns 200
- [ ] AI features enabled in health check
- [ ] Readiness check shows all services
- [ ] Circuit breakers show status

### AI Tests
- [ ] Sentiment analysis works
- [ ] Asset analysis returns trend
- [ ] Compare assets returns recommendation
- [ ] Portfolio analysis returns health score
- [ ] News summary generates text
- [ ] All AI endpoints return valid JSON

### CRUD Tests
- [ ] Create user works
- [ ] List users returns array
- [ ] Get user by ID works
- [ ] Update user works
- [ ] Delete user works

### Integration Tests
- [ ] Create watchlist with assets
- [ ] Add asset to watchlist
- [ ] Remove asset from watchlist
- [ ] Create alert
- [ ] Activate/deactivate alert

### Performance Tests
- [ ] Cached data faster than live
- [ ] AI responses < 5 seconds
- [ ] Health check < 100ms

## 🎓 Additional Resources

### Files
- **postman-collection.json** - Postman collection
- **API_TESTING_GUIDE.md** - Detailed testing guide
- **test-all-endpoints.sh** - Bash test script
- **test-all-endpoints.ps1** - PowerShell test script

### Commands
```bash
# Test with scripts
npm run test:endpoints        # Linux/Mac
npm run test:endpoints:win    # Windows

# Manual testing
npm run test:integration      # Check config
npm run ai:demo              # Test AI features
```

### Documentation
- **docs/AI_FEATURES.md** - AI documentation
- **QUICK_REFERENCE.md** - Quick reference
- **docs/INTEGRATION_GUIDE.md** - Integration guide

## ✅ Success Criteria

Your API is working correctly if:

✅ Health check shows `"status": "healthy"`  
✅ AI features show `"ai": true`  
✅ Sentiment analysis returns sentiment  
✅ Asset analysis returns trend  
✅ Financial data returns stocks/crypto  
✅ User CRUD operations work  
✅ No 500 errors  
✅ Response times < 5 seconds  

---

**Happy Testing!** 🚀

For issues, check:
- Server logs: `tail -f logs/app.log`
- Redis monitor: `npm run redis:monitor`
- Health endpoint: `curl http://localhost:3000/health`
