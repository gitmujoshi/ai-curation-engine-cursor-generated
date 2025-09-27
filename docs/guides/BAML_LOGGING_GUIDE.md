# BAML Logging Guide

## Where to Find BAML Logs

BAML (BoundaryML) outputs logs directly to the console/terminal where the application is running. The logs are not automatically captured by Python's logging system.

## BAML Log Locations

### 1. Console Output (Primary)
When running the demo, BAML logs appear directly in the terminal:
```bash
# Start the demo and watch console output
python3 demo-frontend/app.js
```

BAML logs look like:
```
2025-09-25T21:15:38.333 [BAML WARN] Function ComprehensiveContentAnalysis:
   Client: Ollama (llama3.2:latest) - 1058ms. StopReason: stop. Tokens(in/out): 581/1
   ---PROMPT---
   user: You are a content classification system...
   ---LLM REPLY---
   {...json response...}
```

### 2. Application Logs
Our application logs BAML integration status to:
- `logs/demo-frontend.log` - Application startup and BAML initialization
- `logs/baml.log` - Application-level BAML logging (our custom logs)

### 3. Capturing BAML Console Logs

To capture BAML's console output to a file:

```bash
# Method 1: Redirect all output
python3 demo-frontend/app.js 2>&1 | tee logs/full-output.log

# Method 2: Use script command to capture terminal session
script -a logs/baml-console.log
python3 demo-frontend/app.js
# Press Ctrl+D to stop recording

# Method 3: Run in background with output redirection
nohup python3 demo-frontend/app.js > logs/demo-with-baml.log 2>&1 &
```

## BAML Log Levels

BAML outputs different log levels:
- `[BAML INFO]` - General information
- `[BAML WARN]` - Warnings and non-critical issues
- `[BAML ERROR]` - Error conditions

## Understanding BAML Log Content

### Function Execution Logs
```
[BAML WARN] Function ComprehensiveContentAnalysis:
   Client: Ollama (llama3.2:latest) - 1058ms. StopReason: stop. Tokens(in/out): 581/1
```
- Function name being executed
- LLM client used (Ollama with llama3.2:latest)
- Execution time (1058ms)
- Token counts (input/output)

### Prompt and Response
```
   ---PROMPT---
   user: [prompt content]
   ---LLM REPLY---
   [LLM response]
```
- Shows the exact prompt sent to the LLM
- Shows the raw response received

### Error Cases
When BAML fails to parse LLM responses:
```
BamlValidationError(message=Failed to parse LLM response: Failed to coerce value...
```
- Detailed parsing error information
- Raw LLM output that failed to parse

## Environment Variables

You can control BAML logging with environment variables:
```bash
export BAML_LOG_LEVEL=DEBUG  # Set log level
export RUST_LOG=debug        # Enable Rust-level debugging (BAML is written in Rust)
```

## Monitoring BAML in Production

For production monitoring:
1. Use structured logging to capture application-level BAML events
2. Monitor BAML function execution times and success rates
3. Set up alerts for BAML parsing failures
4. Use the application's built-in fallback mechanisms when BAML fails

## Current Demo Status

✅ **BAML is working correctly with local Llama**
✅ **Console logs show detailed BAML execution information**
✅ **Application logs capture integration status**
✅ **Fallback mechanisms handle edge cases**

The system is production-ready with comprehensive logging and monitoring capabilities.
