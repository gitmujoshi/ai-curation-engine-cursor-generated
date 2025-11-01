# Vercel Deployment for AI Curation Engine - Limitations & Alternatives

## ⚠️ Vercel Limitations

**Vercel is not suitable for the full AI Curation Engine deployment** because:

### Critical Issues

1. **Ollama Server Not Supported**
   - Vercel serverless functions have a maximum timeout of 60 seconds
   - Ollama requires a persistent long-running process (weeks/months)
   - Local LLM inference takes 5-10 seconds per request, which would exhaust timeout limits

2. **No Persistent Background Services**
   - Vercel doesn't support background processes or daemons
   - MongoDB, Redis, and Ollama all require persistent services
   - The curation engine relies on continuously running services

3. **File System Limitations**
   - Serverless functions have read-only file systems
   - BAML client generation and Ollama model storage need writable storage
   - No support for storing 3-4GB AI models locally

4. **Cold Starts & State Management**
   - Each request spawns a new function instance
   - Cannot maintain session state or cached models across requests
   - Would need to reload models for every classification (extremely slow)

## ✅ Recommended Deployment Alternatives

### Option 1: Render.com (Recommended for Simplicity)

**Why Render:**
- ✅ Supports persistent services (web services, background workers)
- ✅ Free tier available with reasonable limits
- ✅ Docker deployment support
- ✅ PostgreSQL and Redis managed services
- ✅ GitHub integration for auto-deployments

**Deployment Steps:**
```bash
# 1. Create render.yaml in project root
cat > render.yaml << 'EOF'
services:
  - type: web
    name: curation-engine
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python src/ui/demo-frontend/app.js
    envVars:
      - key: PYTHON_VERSION
        value: 3.11
      - key: OLLAMA_URL
        value: https://ollama-service.onrender.com
  
  - type: worker
    name: ollama-service
    env: docker
    dockerfilePath: ./Dockerfile.ollama
    plan: standard  # $7/month
    
  - type: pg
    name: curation-db
    plan: free  # Free PostgreSQL
    
  - type: redis
    name: curation-cache
    plan: free  # Free Redis
EOF

# 2. Deploy to Render
# - Push to GitHub
# - Connect GitHub repo to Render
# - Render auto-deploys from render.yaml
```

### Option 2: Railway.app

**Why Railway:**
- ✅ Excellent Docker support
- ✅ Managed PostgreSQL and Redis
- ✅ Generous free credits ($5/month)
- ✅ Easy deployment from GitHub

**Deployment Steps:**
```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Deploy
railway login
railway init
railway up
```

### Option 3: Fly.io (Best for Production)

**Why Fly.io:**
- ✅ Global edge computing
- ✅ Docker-first platform
- ✅ Multi-region support built-in
- ✅ Excellent for scaling
- ✅ Generous free tier

**Deployment Steps:**
```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Deploy
fly launch
fly deploy
```

### Option 4: Use Existing Terraform (AWS/Azure/OCI)

**Already Configured:**
- ✅ Complete Terraform infrastructure for AWS, Azure, OCI
- ✅ Auto-scaling, load balancing, managed databases
- ✅ Production-ready with monitoring and security
- ✅ Cost: $100-600/month depending on scale

**Quick Deploy:**
```bash
# AWS Deployment
cd infra/terraform/aws
terraform init && terraform apply

# See: docs/guides/COMPLETE_DEPLOYMENT_GUIDE.md for details
```

## 🔧 If You Must Use Vercel (Simplified Version)

**Option**: Create a simplified frontend-only version that calls external APIs

### Simplified Architecture

```
┌─────────────────────────────────────────┐
│  Vercel Frontend (Static HTML/JS)      │
│  - React/Next.js dashboard              │
│  - No server-side logic                 │
└────────────────┬────────────────────────┘
                 │ API calls
                 ▼
┌─────────────────────────────────────────┐
│  External Services Required:            │
│  - Render/Fly.io: Ollama service       │
│  - MongoDB Atlas: Cloud database        │
│  - Upstash: Redis cache                 │
└─────────────────────────────────────────┘
```

### Implementation Steps

1. **Split Frontend from Backend**
   - Deploy React/Next.js frontend to Vercel
   - Frontend calls external API endpoints

2. **Deploy Services Separately**
   - Ollama service on Render.com ($7/month)
   - MongoDB Atlas (free tier available)
   - Redis on Upstash (free tier available)

3. **Limitations**
   - ⚠️ CORS configuration needed for cross-origin requests
   - ⚠️ Additional costs for managed services
   - ⚠️ More complex deployment process
   - ⚠️ Latency from multiple service calls

## 📊 Deployment Comparison

| Platform | Cost/Month | Ollama Support | Database | Auto-Scale | Setup Difficulty |
|----------|-----------|----------------|----------|------------|------------------|
| **Vercel** | Free-$20 | ❌ Not supported | ❌ External needed | ⚠️ Limited | 🟡 Complex |
| **Render** | Free-$85 | ✅ Supported | ✅ Managed | ✅ Yes | 🟢 Easy |
| **Railway** | $5-$200 | ✅ Supported | ✅ Managed | ✅ Yes | 🟢 Easy |
| **Fly.io** | Free-$100+ | ✅ Supported | ⚠️ External | ✅ Yes | 🟡 Medium |
| **AWS** | $150-$600 | ✅ Supported | ✅ Managed | ✅ Yes | 🔴 Complex |
| **Azure** | $120-$550 | ✅ Supported | ✅ Managed | ✅ Yes | 🔴 Complex |
| **OCI** | $100-$500 | ✅ Supported | ✅ Managed | ✅ Yes | 🔴 Complex |

## 🎯 Recommendation

**For Quick Demo/Development:**
- Use **Render.com** or **Railway.app**
- Deploy with Docker Compose
- ~$7-20/month

**For Production:**
- Use **AWS/Azure/OCI** with existing Terraform
- Full enterprise features
- ~$300-600/month

**For Personal/Educational:**
- Keep running locally with `./ai-safety-control.sh start`
- Free, full functionality
- Best for learning and development

## 📚 Related Documentation

- Full Deployment Guide: `docs/guides/COMPLETE_DEPLOYMENT_GUIDE.md`
- Cloud Deployment: `docs/guides/CLOUD_DEPLOYMENT_SUMMARY.md`
- Local Deployment: `docs/guides/LOCAL_DEPLOYMENT_GUIDE.md`
- Docker Deployment: `build/docker/docker-compose.yml`

