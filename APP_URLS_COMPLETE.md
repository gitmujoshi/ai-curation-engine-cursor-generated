# AI Curation Engine - Complete URL Reference

## 🎯 Main Application URLs

### Primary Frontend
- **🏠 Home/Demo UI**: `http://localhost:5001/`
  - Main dashboard with overview and navigation
  - Child profile management interface
  - Quick content testing

- **🧪 Content Tester**: `http://localhost:5001/content-test`
  - Interactive content classification interface
  - Pre-loaded content samples for testing
  - Strategy switching and performance monitoring
  - Real-time analysis results display

### Health & Monitoring
- **❤️ Health Check**: `http://localhost:5001/health`
  - Service status and configuration
  - BAML integration status
  - Available strategies and system info

## 🔧 API Endpoints

### Content Classification
- **🤖 Classify Content**: `POST http://localhost:5001/api/classify`
  ```bash
  curl -X POST http://localhost:5001/api/classify \
       -H "Content-Type: application/json" \
       -d '{"content": "Your content here", "childId": "child_1"}'
  ```

### Strategy Management
- **⚙️ Get Current Strategy**: `GET http://localhost:5001/api/strategy`
- **🔄 Switch Strategy**: `POST http://localhost:5001/api/strategy`
  ```bash
  curl -X POST http://localhost:5001/api/strategy \
       -H "Content-Type: application/json" \
       -d '{"strategy": "multi_layer"}'
  ```

### User Management
- **👥 Child Profiles**: `GET http://localhost:5001/api/children`
- **👤 Specific Child**: `GET http://localhost:5001/api/children/{childId}`

## 🦙 Ollama Infrastructure (Local LLM)

### Main Ollama URLs
- **🔗 API Base**: `http://localhost:11434`
- **📋 Models List**: `http://localhost:11434/api/tags`
- **📊 Model Info**: `http://localhost:11434/api/show/llama3.2`
- **💬 Chat Completion**: `POST http://localhost:11434/api/chat`

### Ollama Management
- **🔍 Version Info**: `http://localhost:11434/api/version`
- **📈 Generate**: `POST http://localhost:11434/api/generate`

## 📊 Content Samples (Pre-loaded for Testing)

Access these through the Content Tester interface:

### Educational Content
- **Science**: "The water cycle is a fascinating natural process..."
- **History**: "The Renaissance period marked a significant..."
- **Math**: "Understanding fractions is fundamental..."

### Safety Testing Content
- **Safe Content**: "Today is a beautiful sunny day..."
- **Concerning Content**: "This content contains concerning material..."
- **Adult Content**: "This is mature content not suitable for children..."

### Political Bias Testing
- **Neutral**: "Democracy requires participation from all citizens..."
- **Left-leaning**: "Progressive policies can help address inequality..."
- **Right-leaning**: "Traditional values and free markets..."
- **Center-left**: "Balanced social programs with fiscal responsibility..."
- **Center-right**: "Moderate conservative approach to governance..."

## 🛠️ Development & Debugging URLs

### Log Monitoring
- **Frontend Logs**: `tail -f logs/demo-frontend.log`
- **Ollama Logs**: `tail -f logs/ollama.log`
- **BAML Generation**: `tail -f logs/baml-generate.log`

### Process Monitoring
- **Frontend Process**: Check PID in `logs/demo-frontend.pid`
- **Active Ports**: 
  - 5001 (Demo Frontend)
  - 11434 (Ollama)

## 🚀 Quick Test Commands

### Basic Health Check
```bash
curl http://localhost:5001/health | jq
```

### Content Classification Test
```bash
curl -X POST http://localhost:5001/api/classify \
     -H "Content-Type: application/json" \
     -d '{"content": "This is educational content about science", "childId": "child_1"}' | jq
```

### Strategy Switch Test
```bash
# Check current strategy
curl http://localhost:5001/api/strategy | jq

# Switch to multi-layer
curl -X POST http://localhost:5001/api/strategy \
     -H "Content-Type: application/json" \
     -d '{"strategy": "multi_layer"}' | jq

# Switch to hybrid
curl -X POST http://localhost:5001/api/strategy \
     -H "Content-Type: application/json" \
     -d '{"strategy": "hybrid"}' | jq
```

### Performance Testing
```bash
# Test processing time with different strategies
time curl -X POST http://localhost:5001/api/classify \
     -H "Content-Type: application/json" \
     -d '{"content": "Complex political content requiring deep analysis", "childId": "child_1"}'
```

## 🎮 Curation Strategies

### 1. LLM-Only Strategy (`llm_only`)
- **Best for**: Detailed analysis, complex reasoning
- **Processing time**: 5-10 seconds
- **Use case**: High-accuracy content moderation

### 2. Multi-Layer Strategy (`multi_layer`)
- **Best for**: High-volume processing
- **Processing time**: 0.1-5 seconds (depending on content)
- **Use case**: Production content filtering

### 3. Hybrid Strategy (`hybrid`)
- **Best for**: Balanced speed/accuracy
- **Processing time**: Variable (1-8 seconds)
- **Use case**: Adaptive content moderation

## 📱 Mobile/Remote Access

If you need to access from other devices on the same network:

1. **Find your local IP**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **Access URLs**:
   - `http://[YOUR_IP]:5001/` (Main app)
   - `http://[YOUR_IP]:5001/content-test` (Content tester)

## 🔒 Security Notes

- **Local Development Only**: These URLs are for local development
- **No Authentication**: Current setup has no authentication
- **CORS Enabled**: For development purposes
- **Production Deployment**: Would require additional security measures

## 🛠️ Management Scripts

- **🚀 Deploy**: `./deploy_local.sh`
- **🔍 Status Check**: `./status_check.sh`
- **🛑 Stop Services**: `./stop_services.sh`
- **🏗️ Build & Test**: `./build_and_test.sh`

## 📚 Additional Resources

- **API Documentation**: `API_ENDPOINTS.md`
- **Deployment Guide**: `DEPLOYMENT_INFO.md`
- **Architecture**: `PRODUCTION_CURATION_ARCHITECTURE.md`
- **BAML Implementation**: `BAML_IMPLEMENTATION_STATUS.md`

---

**🎉 Quick Start**: Run `./deploy_local.sh` and open `http://localhost:5001/content-test` to start testing!
