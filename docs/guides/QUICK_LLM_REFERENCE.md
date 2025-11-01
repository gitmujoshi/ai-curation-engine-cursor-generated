# ⚡ Quick LLM Reference Card

## 🎯 Your Current Setup

```
✅ Llama 3.2 (2.0 GB)  - Primary, best overall
✅ Llama 3.1 (4.9 GB)  - Backup
✅ CodeLlama (3.8 GB)  - Coding tasks
```

## 🌟 Top Recommendations to Add

| Model | Size | Install Command | Use Case |
|-------|------|-----------------|----------|
| **Mistral** | 4.1 GB | `ollama pull mistral` | Fast, reliable 🟢 |
| **DeepSeek-R1** | 7-8 GB | `ollama pull deepseek-r1` | Best reasoning ⚠️ |
| **Phi-3** | 3.8 GB | `ollama pull phi3` | Ultra-fast ⚡ |

## 🚦 Quick Decision Guide

**Need best accuracy?** → DeepSeek-R1  
**Need speed?** → Llama 3.2 (you have it!) or Phi-3  
**Need reliability?** → Mistral  
**Government/sensitive?** → Avoid DeepSeek, use Mistral/Llama  

## 📦 Quick Install All

```bash
ollama pull mistral      # Fast, reliable
ollama pull phi3         # Ultra-fast
ollama pull gemma2       # Balanced
ollama pull deepseek-r1  # Best reasoning (⚠️ regulatory concerns)
```

## 🔍 Check What You Have

```bash
ollama list              # Show installed
ollama search deepseek   # Search models
ollama show mistral      # Model info
```

## ⚡ Test a Model

```bash
ollama run llama3.2 "Classify this content for safety"
ollama run mistral "Is this spam?"
```

## 📊 Size Guide

- **< 4 GB**: Llama 3.2, Phi-3, Mistral
- **4-8 GB**: Llama 3.1, Gemma 2, Qwen 2.5
- **> 8 GB**: DeepSeek-R1, Large models

---

**Full Guide**: `docs/guides/POPULAR_LOCAL_LLMS.md`

