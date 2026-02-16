# Global-Fi Ultra — Render.com Deployment Guide

Complete guide to deploying Global-Fi Ultra on [Render.com](https://render.com).

---

## Prerequisites

1. **GitHub repository** with your code pushed to the `main` branch
2. **Render.com account** — [sign up free](https://dashboard.render.com/register)
3. **MongoDB Atlas cluster** — [create free M0 cluster](https://www.mongodb.com/cloud/atlas/register)
4. **API keys** for at least one financial data provider (see [API Keys](#api-keys) below)

---

## Quick Deploy (Blueprint)

The fastest way to deploy — uses `render.yaml` to auto-configure everything:

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect your GitHub repo and select the branch (`main`)
4. Render reads `render.yaml` and shows a preview — click **Apply**
5. Set the required secret environment variables (marked `sync: false` in render.yaml):
   - `MONGODB_URI` — Your MongoDB Atlas connection string
   - `REDIS_URL` — Render Redis internal URL (or external Redis)
   - `ALPHA_VANTAGE_API_KEY`, `NEWS_API_KEY`, `FRED_API_KEY`, `FINNHUB_API_KEY`
   - `GROQ_API_KEY` — For AI features (optional)
   - `CORS_ORIGIN` — Your frontend domain(s)
6. Click **Save** — Render builds and deploys automatically

---

## Manual Deploy (Step-by-Step)

### 1. Create a Web Service

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:

| Setting           | Value                              |
|-------------------|------------------------------------|
| **Name**          | `globalfi-ultra`                   |
| **Region**        | Oregon (or closest to your users)  |
| **Branch**        | `main`                             |
| **Runtime**       | Docker                             |
| **Dockerfile**    | `./Dockerfile`                     |
| **Plan**          | Starter ($7/mo) or Free            |

### 2. Set Environment Variables

Go to **Environment** tab and add:

#### Required Variables

| Variable           | Value                     | Description                            |
|--------------------|---------------------------|----------------------------------------|
| `NODE_ENV`         | `production`              | Enables production optimizations       |
| `PORT`             | `3000`                    | Render maps this to 443 automatically  |
| `HOST`             | `0.0.0.0`                | Bind to all interfaces                 |
| `MONGODB_URI`      | `mongodb+srv://...`      | MongoDB Atlas connection string        |
| `REDIS_URL`        | `redis://...`            | Render Redis or external Redis URL     |

#### API Keys

| Variable                 | Source                                              |
|--------------------------|-----------------------------------------------------|
| `ALPHA_VANTAGE_API_KEY`  | [alphavantage.co](https://www.alphavantage.co/support/#api-key/) |
| `NEWS_API_KEY`           | [newsapi.org](https://newsapi.org/register)         |
| `FRED_API_KEY`           | [fred.stlouisfed.org](https://fred.stlouisfed.org/docs/api/api_key.html) |
| `FINNHUB_API_KEY`        | [finnhub.io](https://finnhub.io/register)           |
| `COINGECKO_API_KEY`      | Optional — free tier works without key              |

#### AI Features (Optional)

| Variable             | Value                           |
|----------------------|---------------------------------|
| `GROQ_API_KEY`       | `gsk_...` from [console.groq.com](https://console.groq.com/keys) |
| `GROQ_PRIMARY_MODEL` | `llama-3.3-70b-versatile`       |
| `GROQ_FAST_MODEL`    | `llama-3.1-8b-instant`          |

#### Security

| Variable                 | Value                                |
|--------------------------|--------------------------------------|
| `CORS_ORIGIN`            | `https://your-frontend.com`         |
| `SOCKET_IO_CORS_ORIGIN`  | `https://your-frontend.com`         |
| `RATE_LIMIT_WINDOW_MS`   | `900000` (15 minutes)               |
| `RATE_LIMIT_MAX_REQUESTS` | `100`                               |

#### Optional Services

| Variable              | Value                     | Notes                            |
|-----------------------|---------------------------|----------------------------------|
| `RABBITMQ_URL`        | `amqp://...`              | For AI job queue & async tasks   |
| `RABBITMQ_QUEUE_PREFIX` | `globalfi`              | Queue name prefix                |
| `LOG_LEVEL`           | `info`                    | `error`, `warn`, `info`, `debug` |

### 3. Configure Health Check

Go to **Settings** → **Health Check Path** and set:

```
/api/v1/health/health
```

Render pings this endpoint to verify your service is running.

### 4. Add Redis (Optional but Recommended)

**Option A — Render Redis:**
1. Go to **New** → **Redis**
2. Name it `globalfi-redis`, select same region
3. Copy the **Internal URL** and set it as `REDIS_URL`

**Option B — External Redis (e.g., Upstash, Railway):**
1. Create a Redis instance on your preferred provider
2. Copy the connection URL and set it as `REDIS_URL`

> [!NOTE]
> The app works without Redis — it falls back to in-memory caching.
> However, Redis is recommended for production rate limiting and cache persistence.

### 5. Set Up MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create a free M0 cluster
2. Under **Network Access**, add `0.0.0.0/0` (allow from anywhere) for Render
3. Under **Database Access**, create a user with readWrite permissions
4. Click **Connect** → **Drivers** → Copy the connection string
5. Replace `<password>` with your database user's password
6. Set this as `MONGODB_URI` in Render

---

## Auto-Deploy from GitHub

Render auto-deploys on every push to `main` by default. To configure:

1. Go to your service **Settings**
2. Under **Build & Deploy**, toggle **Auto-Deploy** on/off
3. Optionally set a specific branch

---

## Custom Domain + SSL

1. Go to your service **Settings** → **Custom Domains**
2. Add your domain: `api.yourdomain.com`
3. Update your DNS provider with the CNAME record Render provides
4. SSL is automatic — Render provisions a Let's Encrypt certificate

---

## Monitoring & Debugging

### Logs
- Go to your service → **Logs** tab for real-time log streaming
- Logs show startup sequence, API requests, and errors

### Health Endpoints
```bash
# Basic liveness (should always return 200)
curl https://your-app.onrender.com/api/v1/health/health

# Readiness (checks MongoDB + Redis)
curl https://your-app.onrender.com/api/v1/health/readiness

# Circuit breaker status
curl https://your-app.onrender.com/api/v1/status/circuit-breakers
```

### Common Issues

| Issue                       | Solution                                                |
|-----------------------------|---------------------------------------------------------|
| App won't start             | Check **Logs** for connection errors (MongoDB/Redis)    |
| Health check failing        | Verify `MONGODB_URI` is correct and Atlas allows `0.0.0.0/0` |
| Rate limiting too strict    | Increase `RATE_LIMIT_MAX_REQUESTS` in env vars          |
| AI features not working     | Verify `GROQ_API_KEY` is set and valid                  |
| WebSocket not connecting    | Update `SOCKET_IO_CORS_ORIGIN` to match your frontend   |
| Slow cold starts (free tier)| Upgrade to Starter plan or implement keep-alive pings    |

---

## Cost Estimate

| Service         | Free Tier      | Starter Plan      |
|-----------------|----------------|--------------------|
| Render Web      | 750 hrs/mo     | $7/mo (always on)  |
| Render Redis    | —              | $10/mo              |
| MongoDB Atlas   | 512MB (M0)     | $9/mo (M2)         |
| **Total**       | **$0/mo**      | **~$26/mo**         |

> [!TIP]
> The free tier is sufficient for development and demo purposes.
> For production, the Starter plan keeps the service always-on (no cold starts).
