#!/bin/bash
# Extract BAML logs from console output

echo "🔍 Extracting BAML logs from console output..."

# Extract BAML logs to separate file
if [ -f logs/baml-console.log ]; then
    grep -A 100 "\[BAML" logs/baml-console.log > logs/baml-extracted.log
    echo "✅ BAML logs extracted to logs/baml-extracted.log"
    echo "📊 Log statistics:"
    echo "   - Total console log lines: $(wc -l < logs/baml-console.log)"
    echo "   - BAML log lines: $(wc -l < logs/baml-extracted.log)"
    echo "   - BAML function calls: $(grep -c "\[BAML" logs/baml-console.log)"
else
    echo "❌ Console log file not found. Run the demo first with:"
    echo "   cd demo-frontend && python3 app.js 2>&1 | tee ../logs/baml-console.log"
fi
