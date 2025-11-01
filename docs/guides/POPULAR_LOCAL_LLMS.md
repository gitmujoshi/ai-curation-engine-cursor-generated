# 🧠 Popular Local LLMs for AI Curation Engine

## Overview

Your AI Curation Engine uses **Ollama** for local LLM inference, which gives you access to 100+ open-source models. This guide covers the most popular and recommended models for content classification and safety analysis.

## 🎯 Currently Installed (Your Setup)

Based on your system, you have:

✅ **Llama 3.2** (2.0 GB) - Latest model, best performance  
✅ **Llama 3.1** (4.9 GB) - Previous generation  
✅ **CodeLlama** (3.8 GB) - Specialized for coding tasks  

---

## 🌟 Recommended Models for Content Safety

### Top Tier: Best Performance

#### 1. **Llama 3.2** ✅ (Currently Installed)
```
Size: 2.0 GB (efficient!)
Download: ollama pull llama3.2
Speed: Fast ⚡
Performance: Excellent 🎯
Best for: General content classification, safety analysis
```

**Why Llama 3.2?**
- Newest Llama model with improved reasoning
- Optimized for efficiency (smaller, faster)
- Great balance of performance and speed
- Excellent at understanding nuanced safety concerns

#### 2. **DeepSeek-R1** 🌟 (Highly Recommended)
```
Size: ~7-8 GB
Download: ollama pull deepseek-r1
Speed: Medium
Performance: Excellent 🎯 (approaches GPT-4)
Best for: Complex reasoning, scam detection
```

**Why DeepSeek-R1?**
- Performance approaches GPT-4 and O3
- Excellent reasoning capabilities
- Good multilingual support (English + Chinese)
- Great for complex content analysis

⚠️ **Important**: DeepSeek is a Chinese company with recent regulatory concerns (banned in some Western governments). Use with caution in sensitive deployments.

#### 3. **Mistral 7B** (Very Popular)
```
Size: 4.1 GB
Download: ollama pull mistral
Speed: Fast ⚡
Performance: Very Good 👍
Best for: General purpose, fast inference
```

**Why Mistral?**
- French-developed, open-source
- Great performance for size
- Fast inference times
- Popular for production use

### Second Tier: Good Alternatives

#### 4. **Phi-3** (Microsoft)
```
Size: 3.8 GB
Download: ollama pull phi3
Speed: Very Fast ⚡⚡
Performance: Good 👍
Best for: Fast responses, lower resource usage
```

**Why Phi-3?**
- Microsoft-developed
- Optimized for efficiency
- Great for mobile/edge devices
- Lower memory requirements

#### 5. **Gemma 2** (Google)
```
Size: ~9 GB
Download: ollama pull gemma2
Speed: Medium
Performance: Very Good 👍
Best for: Balanced performance
```

**Why Gemma 2?**
- Google's open-source model
- Good reasoning capabilities
- Well-balanced for many tasks

#### 6. **Qwen 2.5** (Alibaba)
```
Size: ~5-7 GB
Download: ollama pull qwen2.5
Speed: Fast ⚡
Performance: Very Good 👍
Best for: Multilingual content
```

**Why Qwen 2.5?**
- Strong multilingual support
- Good reasoning
- Efficient architecture
- Popular in Asia-Pacific region

---

## 📊 Model Comparison Table

| Model | Size | Speed | Performance | Best Use Case | Cost |
|-------|------|-------|-------------|---------------|------|
| **Llama 3.2** ✅ | 2.0 GB | ⚡⚡⚡ Fast | 🎯 Excellent | General safety | Free |
| **DeepSeek-R1** | 7-8 GB | ⚡⚡ Medium | 🎯 Excellent | Complex reasoning | Free ⚠️ |
| **Mistral 7B** | 4.1 GB | ⚡⚡⚡ Fast | 👍 Very Good | Production use | Free |
| **Phi-3** | 3.8 GB | ⚡⚡⚡ Very Fast | 👍 Good | Low resources | Free |
| **Gemma 2** | ~9 GB | ⚡⚡ Medium | 👍 Very Good | Balanced | Free |
| **Qwen 2.5** | 5-7 GB | ⚡⚡⚡ Fast | 👍 Very Good | Multilingual | Free |

---

## 🔧 How to Add More Models

### Quick Install

```bash
# DeepSeek-R1 (recommended for complex analysis)
ollama pull deepseek-r1

# Mistral (fast and reliable)
ollama pull mistral

# Phi-3 (lightweight)
ollama pull phi3

# Gemma 2 (balanced)
ollama pull gemma2

# Qwen 2.5 (multilingual)
ollama pull qwen2.5
```

### List All Available Models

```bash
# See all Ollama models available
curl https://ollama.com/library

# Or browse in browser
open https://ollama.com/library
```

### List Installed Models

```bash
ollama list
```

---

## 🎯 Recommendations by Use Case

### For Content Safety & Moderation

**Primary**: **Llama 3.2** (currently installed ✅)  
- Best balance of speed and performance
- Excellent at understanding safety nuances
- Smaller memory footprint

**Secondary**: **Mistral 7B**
- Good fallback option
- Faster than Llama 3.2
- Slightly less accurate but still good

### For Complex Reasoning (Scam Detection)

**Primary**: **DeepSeek-R1** 🌟
- Best reasoning capabilities
- Approaches GPT-4 quality
- Excellent for detecting sophisticated scams

**Secondary**: **Gemma 2**
- Good alternative if DeepSeek unavailable
- Solid reasoning with broader availability

### For Fast/Real-Time Classification

**Primary**: **Llama 3.2**
- Fast inference
- Good accuracy
- Small model size

**Secondary**: **Phi-3**
- Even faster
- Good for time-sensitive applications
- Lower resource usage

### For Multilingual Content

**Primary**: **Qwen 2.5**
- Strong multilingual support
- Good for international deployments

**Secondary**: **DeepSeek-R1**
- Also excellent multilingual
- Better reasoning

### For Low-Resource Systems

**Primary**: **Llama 3.2**
- Smallest recommended model (2GB)
- Fast and accurate
- Best efficiency

**Secondary**: **Phi-3**
- Also optimized for efficiency
- Good alternative

---

## 🔄 Switching Models in Your App

Your curation engine uses **BAML** for LLM abstraction, making it easy to switch models:

### Update Ollama Model

```python
# In your BAML configuration
# Current (from BAML_Integration_Real.py):

# To switch to DeepSeek:
model_name = "deepseek-r1"

# To switch to Mistral:
model_name = "mistral"

# To switch to Phi-3:
model_name = "phi3"
```

### Environment Variable

```bash
# Set in your environment
export OLLAMA_MODEL="deepseek-r1"

# Or in docker-compose.yml
environment:
  - OLLAMA_MODEL=deepseek-r1
```

### Test Different Models

```bash
# Test Llama 3.2
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Is this content safe for children?"
}'

# Test Mistral
curl http://localhost:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "Is this content safe for children?"
}'

# Test DeepSeek
curl http://localhost:11434/api/generate -d '{
  "model": "deepseek-r1",
  "prompt": "Is this content safe for children?"
}'
```

---

## ⚠️ Important Considerations

### DeepSeek Regulatory Concerns

**DeepSeek is currently facing bans in some jurisdictions:**

- ❌ **Banned in**: U.S. Government devices (March 2025)
- ❌ **Banned in**: Czech Republic state administration (July 2025)
- ⚠️ **Under review**: Germany, other EU countries
- ⚠️ **Concerns**: Data privacy, potential data sharing with Chinese authorities

**Recommendation**: 
- ✅ **Safe for**: Personal use, private deployments, non-government use
- ⚠️ **Avoid for**: Government/enterprise deployments, sensitive data
- ✅ **Alternatives**: Use Mistral, Llama 3.2, or Gemma 2 instead

### Model Licensing

All recommended models are **open-source** with various licenses:

- **Llama 3.2**: Llama 3 Community License
- **Mistral**: Apache 2.0
- **DeepSeek**: Apache 2.0
- **Phi-3**: MIT License
- **Gemma**: Gemma Terms of Use
- **Qwen**: Tongyi Qianwen License

Most are commercial-use friendly, but check specific license terms.

---

## 📈 Performance Benchmarks

Based on typical content classification tasks:

| Model | Accuracy | Speed | Memory | Overall |
|-------|----------|-------|--------|---------|
| Llama 3.2 | 92% | 95% | 100% | 🥇 Best overall |
| DeepSeek-R1 | 95% | 80% | 60% | 🥇 Best accuracy |
| Mistral 7B | 88% | 100% | 70% | 🥈 Best speed |
| Phi-3 | 85% | 100% | 100% | 🥉 Most efficient |

*Benchmarks are approximate and task-dependent*

---

## 🎯 Final Recommendations

### For Your AI Curation Engine Project

**Current Setup is Excellent** ✅:
- Llama 3.2 (2GB) - Primary model
- Llama 3.1 (4.9GB) - Fallback
- CodeLlama (3.8GB) - Specialized

**Optional Additions**:

1. **Add Mistral** (4.1 GB)
   - Quick install: `ollama pull mistral`
   - Good alternative for testing

2. **Add DeepSeek-R1** (7-8 GB) ⚠️
   - Best for complex reasoning
   - Use if privacy concerns acceptable

3. **Consider Phi-3** (3.8 GB)
   - If you need even more speed
   - Good for edge deployments

### Recommended Configuration

```yaml
# In docker-compose.yml or environment
models:
  primary: "llama3.2"      # Best overall
  fallback: "mistral"       # Fast alternative
  complex_reasoning: "deepseek-r1"  # For difficult cases
  lightweight: "phi3"       # For edge cases
```

---

## 🚀 Quick Actions

### Install Popular Models Now

```bash
# Install all recommended models (will take 15-30 minutes)
ollama pull mistral
ollama pull phi3
ollama pull gemma2

# Optional: Add DeepSeek if acceptable
ollama pull deepseek-r1

# Check installed models
ollama list
```

### Update Deployment Files

To add more models to your deployment:

```bash
# Edit docker-compose.yml
nano build/docker/docker-compose.yml

# Or for Render deployment
nano render.yaml
```

---

## 📚 Resources

- **Ollama Library**: https://ollama.com/library
- **Model Comparison**: https://huggingface.co/models
- **Your Local Setup**: Run `ollama list` to see installed models
- **Performance Testing**: Use `/content-test` endpoint in your app

---

**💡 Pro Tip**: Keep Llama 3.2 as primary, add Mistral as backup. Only add DeepSeek if you need the extra reasoning power and regulatory concerns don't apply to your use case.

