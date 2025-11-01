# 🚀 Render.com Deployment Guide for AI Curation Engine

## Overview

This guide shows how to deploy the AI Curation Engine to **Render.com**, a cloud platform that supports persistent services, Docker containers, and managed databases - making it perfect for deploying the full application with Ollama and all dependencies.

## ✅ Why Render.com?

### Advantages Over Vercel

| Feature | Vercel | Render.com |
|---------|--------|------------|
| **Long-Running Services** | ❌ 60s timeout | ✅ Persistent services |
| **Ollama Support** | ❌ Not possible | ✅ Full Docker support |
| **MongoDB** | ❌ External only | ✅ Managed database |
| **Background Processes** | ❌ Not supported | ✅ Native support |
| **Docker Containers** | ⚠️ Limited | ✅ Full support |
| **Free Tier** | ✅ Yes | ✅ Yes (with limits) |
| **Cost** | Free-$20/month | Free-$85/month |

## 📋 Prerequisites

1. **Render.com Account**: Sign up at https://render.com
2. **GitHub Repository**: Push your code to GitHub
3. **Docker**: For local testing (optional)

## 🏗️ Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Render.com Services                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐    ┌──────────────────┐         │
│  │  Web Service     │    │  Ollama Worker   │         │
│  │  (Demo Frontend) │    │  (AI Processing) │         │
│  │  Python Flask    │    │  Docker          │         │
│  │  Port 5001       │    │  Port 11434      │         │
│  └────────┬─────────┘    └────────┬─────────┘         │
│           │                       │                     │
│           │                       ▼                     │
│           │              ┌──────────────────┐         │
│           │              │  MongoDB Managed │         │
│           │              │  Database        │         │
│           │              │  Port 27017      │         │
│           │              └──────────────────┘         │
│           │                                            │
│           ▼                                            │
│  ┌──────────────────┐                                 │
│  │  Redis Managed   │                                 │
│  │  Cache           │                                 │
│  │  Port 6379       │                                 │
│  └──────────────────┘                                 │
└─────────────────────────────────────────────────────────┘
```

## 📝 Step 1: Prepare for Deployment

### 1.1 Create Dockerfile for Demo Frontend

```dockerfile
# Dockerfile (in project root)
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js for BAML CLI
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Install BAML CLI globally
RUN npm install -g @boundaryml/baml

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install BAML Python client
RUN pip install baml-py>=0.46.0 pydantic

# Copy BAML source files
COPY config/baml_src/ ./baml_src/
COPY tools/scripts/BAML_Integration_Real.py .
COPY tools/scripts/curation_engine_pluggable.py .

# Generate BAML client
RUN baml-cli generate --from ./baml_src --lang python --output ./baml_client || \
    echo "BAML generation failed, using fallback"

# Copy application code
COPY src/ui/demo-frontend/ ./demo/
COPY tools/scripts/ ./scripts/

# Create directories
RUN mkdir -p logs templates static

# Set environment
ENV PYTHONPATH=/app
ENV PORT=5001

EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s \
    CMD curl -f http://localhost:5001/api/health || exit 1

CMD ["python", "demo/app.js"]
```

### 1.2 Create Render Configuration File

```yaml
# render.yaml (in project root)
services:
  # Demo Frontend Web Service
  - type: web
    name: ai-curation-demo
    env: docker
    dockerfilePath: ./Dockerfile
    dockerContext: .
    plan: standard  # $7/month - required for persistent services
    region: oregon
    buildCommand: ""
    startCommand: "python demo/app.js"
    envVars:
      - key: OLLAMA_URL
        fromService:
          name: ollama-service
          type: worker
          property: host
      - key: MONGODB_URI
        fromDatabase:
          name: curation-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: curation-cache
          type: redis
          property: connectionString
      - key: PYTHON_VERSION
        value: 3.11
    healthCheckPath: /api/health

  # Ollama Worker Service (Background AI Processing)
  - type: worker
    name: ollama-service
    env: docker
    dockerfilePath: ./Dockerfile.ollama
    dockerContext: .
    plan: standard  # $7/month - for AI processing
    region: oregon
    dockerCommand: ""
    envVars:
      - key: OLLAMA_ORIGINS
        value: "*"
      - key: OLLAMA_HOST
        value: 0.0.0.0
    numInstances: 1

  # MongoDB Database
  - type: pspg
    name: curation-db
    plan: starter  # Free tier for development
    databaseName: curation_engine
    region: oregon

  # Redis Cache
  - type: redis
    name: curation-cache
    plan: free  # Free tier
    region: oregon
```

### 1.3 Create Dockerfile for Ollama Service

```dockerfile
# Dockerfile.ollama (in project root)
FROM ollama/ollama:latest

# Add health check script
COPY build/docker/scripts/healthcheck.sh /healthcheck.sh
RUN chmod +x /healthcheck.sh

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD /healthcheck.sh || exit 1

EXPOSE 11434

CMD ["ollama", "serve"]
```

### 1.4 Create Requirements File

```txt
# requirements.txt (in project root)
Flask==3.0.0
Flask-CORS==4.0.0
requests==2.31.0
pydantic==2.4.2
python-dotenv==1.0.0
baml-py>=0.46.0
```

## 🚀 Step 2: Deploy to Render

### 2.1 Option A: Deploy via GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Connect to Render**
   - Go to https://render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the branch (main)
   - Render will detect `render.yaml` automatically

3. **Auto-Deploy**
   - Render reads `render.yaml` and creates all services
   - Services deploy in dependency order
   - You get URLs for each service

### 2.2 Option B: Manual Service Setup

If you prefer to set up services individually:

1. **Create PostgreSQL Database**
   - Go to "New +" → "PostgreSQL"
   - Name: `curation-db`
   - Plan: Starter (free tier)
   - Note the connection string

2. **Create Redis Instance**
   - Go to "New +" → "Redis"
   - Name: `curation-cache`
   - Plan: Free
   - Note the connection string

3. **Create Ollama Worker**
   - Go to "New +" → "Background Worker"
   - Name: `ollama-service`
   - Plan: Standard ($7/month)
   - Use Dockerfile.ollama
   - Note the internal URL

4. **Create Web Service**
   - Go to "New +" → "Web Service"
   - Name: `ai-curation-demo`
   - Plan: Standard ($7/month)
   - Connect to your GitHub repo
   - Use main Dockerfile
   - Add environment variables from above services

## 🔧 Step 3: Configuration

### 3.1 Environment Variables

Set these in the Render dashboard for the Web Service:

```bash
# Application
PORT=5001
FLASK_ENV=production
PYTHON_VERSION=3.11

# Ollama Connection
OLLAMA_URL=https://ollama-service.onrender.com
# OR for internal communication:
OLLAMA_URL=http://ollama-service:11434

# Database
MONGODB_URI=<from PostgreSQL service>

# Cache
REDIS_URL=<from Redis service>

# Optional: API Keys for cloud LLMs
OPENAI_API_KEY=<your-key>
ANTHROPIC_API_KEY=<your-key>
```

### 3.2 Download Llama Models

After Ollama service starts:

```bash
# SSH into Ollama service or use Render shell
curl https://ollama-service.onrender.com/api/pull -d '{"name": "llama3.2:latest"}'
curl https://ollama-service.onrender.com/api/pull -d '{"name": "llama3.1:latest"}'
```

## 📊 Step 4: Verify Deployment

### 4.1 Check Service Status

In Render dashboard, verify all services are "Live":

- ✅ ai-curation-demo (Web Service)
- ✅ ollama-service (Worker)
- ✅ curation-db (Database)
- ✅ curation-cache (Redis)

### 4.2 Test Health Endpoint

```bash
# Get your Render URL
curl https://ai-curation-demo.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "ollama": "connected",
    "database": "connected",
    "cache": "connected"
  },
  "demo_frontend": "running"
}
```

### 4.3 Test Content Classification

```bash
curl -X POST https://ai-curation-demo.onrender.com/api/classify \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Learning about space exploration is fascinating!",
    "childId": "child_1"
  }'
```

## 💰 Pricing

### Free Tier (Development)
- ✅ PostgreSQL: Starter plan (free)
- ✅ Redis: Free tier
- ❌ Web Service: Minimum $7/month
- ❌ Ollama Worker: Minimum $7/month
- **Total: ~$14/month minimum**

### Paid Tier (Production)
- ✅ PostgreSQL: Standard ($20/month)
- ✅ Redis: Standard ($10/month)
- ✅ Web Service: Standard ($7/month, scales to $85/month)
- ✅ Ollama Worker: Standard ($7/month, scales to $85/month)
- **Total: ~$44-200/month depending on usage**

## 🔍 Troubleshooting

### Ollama Not Responding

**Issue**: Timeout errors connecting to Ollama

**Solutions**:
1. Use internal service URLs: `http://ollama-service:11434`
2. Increase timeout in app: `OLLAMA_TIMEOUT=60000`
3. Check Ollama worker logs in Render dashboard

### Database Connection Issues

**Issue**: Cannot connect to MongoDB/PostgreSQL

**Solutions**:
1. Use full connection string from Render dashboard
2. Ensure database is in same region as app
3. Check network security settings

### Build Failures

**Issue**: Docker build fails

**Solutions**:
1. Test Dockerfile locally: `docker build -t test .`
2. Check logs in Render build logs
3. Ensure all files are in correct paths
4. Verify baml-cli is installed in Dockerfile

## 🎯 Next Steps

### Scaling

1. **Increase Worker Instances**: Add more Ollama workers
2. **Upgrade Plans**: Move to higher tiers for better performance
3. **Add Load Balancer**: Use Render's load balancing

### Monitoring

1. **Set Up Alerts**: Configure Slack/email alerts in Render
2. **View Logs**: Use Render's log streaming
3. **Metrics**: Monitor CPU, memory, response times

### Custom Domain

1. **Add Domain**: In Render dashboard → Custom Domains
2. **Configure DNS**: Add CNAME record
3. **SSL**: Render auto-provisions Let's Encrypt certificates

## 📚 Related Resources

- **Render Docs**: https://render.com/docs
- **Docker Guide**: `build/docker/docker-compose.yml`
- **Cloud Deployment**: `docs/guides/COMPLETE_DEPLOYMENT_GUIDE.md`
- **Local Deployment**: `docs/guides/LOCAL_DEPLOYMENT_GUIDE.md`

## ✅ Deployment Checklist

- [ ] Created Dockerfile for web service
- [ ] Created Dockerfile.ollama for Ollama
- [ ] Created render.yaml configuration
- [ ] Created requirements.txt
- [ ] Pushed code to GitHub
- [ ] Connected repo to Render
- [ ] Deployed all 4 services
- [ ] Configured environment variables
- [ ] Downloaded Llama models
- [ ] Tested health endpoint
- [ ] Tested content classification
- [ ] Set up custom domain (optional)
- [ ] Configured monitoring alerts

---

**🎉 Your AI Curation Engine is now live on Render.com!**

Visit your web service URL to see the demo dashboard and test the content classification features.

