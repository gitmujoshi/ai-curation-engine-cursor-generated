#!/bin/bash

# AI Curation Engine - Service Status Check
# ==========================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${BLUE}   AI Curation Engine - Service Status   ${NC}"
    echo -e "${BLUE}==========================================${NC}"
    echo ""
}

check_port() {
    local port=$1
    local service_name=$2
    local url=$3
    
    if curl -s --max-time 3 "$url" > /dev/null 2>&1; then
        echo -e "   • $service_name: ${GREEN}✓ Running${NC} (port $port)"
        return 0
    else
        echo -e "   • $service_name: ${RED}✗ Not running${NC} (port $port)"
        return 1
    fi
}

check_service_detailed() {
    local service_name=$1
    local url=$2
    local description=$3
    
    echo -e "${CYAN}Testing $service_name:${NC}"
    if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
        echo -e "   ${GREEN}✓ $description${NC}"
        
        # Get additional info if it's a health endpoint
        if [[ "$url" == *"/health"* ]]; then
            local response=$(curl -s --max-time 3 "$url" 2>/dev/null || echo '{}')
            echo -e "   ${BLUE}Response: $response${NC}"
        fi
    else
        echo -e "   ${RED}✗ $description${NC}"
    fi
    echo ""
}

check_processes() {
    echo -e "${PURPLE}Active Processes:${NC}"
    
    # Demo Frontend
    local demo_pids=$(pgrep -f "python.*app.js" 2>/dev/null || true)
    if [ -n "$demo_pids" ]; then
        echo -e "   • Demo Frontend: ${GREEN}PID(s) $demo_pids${NC}"
    else
        echo -e "   • Demo Frontend: ${RED}Not running${NC}"
    fi
    
    # Ollama
    local ollama_pids=$(pgrep -f "ollama" 2>/dev/null || true)
    if [ -n "$ollama_pids" ]; then
        echo -e "   • Ollama: ${GREEN}PID(s) $ollama_pids${NC}"
    else
        echo -e "   • Ollama: ${RED}Not running${NC}"
    fi
    
    echo ""
}

check_files() {
    echo -e "${PURPLE}Important Files:${NC}"
    
    # BAML Client
    if [ -f "baml_client/__init__.py" ]; then
        echo -e "   • BAML Client: ${GREEN}✓ Generated${NC}"
    else
        echo -e "   • BAML Client: ${YELLOW}⚠️  Missing${NC}"
    fi
    
    # Log files
    if [ -d "logs" ]; then
        echo -e "   • Log Directory: ${GREEN}✓ Present${NC}"
        local log_count=$(find logs -name "*.log" | wc -l)
        echo -e "   • Log Files: ${BLUE}$log_count files${NC}"
    else
        echo -e "   • Log Directory: ${YELLOW}⚠️  Missing${NC}"
    fi
    
    # PID files
    if [ -f "logs/demo-frontend.pid" ]; then
        local pid=$(cat logs/demo-frontend.pid)
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "   • Frontend PID: ${GREEN}✓ Valid ($pid)${NC}"
        else
            echo -e "   • Frontend PID: ${RED}✗ Stale ($pid)${NC}"
        fi
    else
        echo -e "   • Frontend PID: ${YELLOW}⚠️  No PID file${NC}"
    fi
    
    echo ""
}

test_api_endpoints() {
    echo -e "${PURPLE}API Endpoint Tests:${NC}"
    
    # Health check
    check_service_detailed "Health Check" "http://localhost:5001/health" "Service health status"
    
    # Quick classification test
    echo -e "${CYAN}Testing Content Classification:${NC}"
    local test_response=$(curl -s --max-time 10 -X POST http://localhost:5001/api/classify \
        -H "Content-Type: application/json" \
        -d '{"content": "This is a test message", "childId": "child_1"}' 2>/dev/null || echo "ERROR")
    
    if [[ "$test_response" == "ERROR" ]] || [[ "$test_response" == *"error"* ]]; then
        echo -e "   ${RED}✗ Classification API failed${NC}"
    else
        echo -e "   ${GREEN}✓ Classification API working${NC}"
        # Extract key info
        local recommendation=$(echo "$test_response" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('recommendation', 'N/A'))" 2>/dev/null || echo "N/A")
        local processing_time=$(echo "$test_response" | python3 -c "import json,sys; data=json.load(sys.stdin); print(f\"{data.get('processing_time', 0):.2f}s\")" 2>/dev/null || echo "N/A")
        echo -e "   ${BLUE}Recommendation: $recommendation, Time: $processing_time${NC}"
    fi
    echo ""
    
    # Strategy endpoint
    check_service_detailed "Strategy API" "http://localhost:5001/api/strategy" "Curation strategy management"
}

print_urls() {
    echo -e "${PURPLE}📍 Available URLs:${NC}"
    echo ""
    
    echo -e "${BLUE}🎯 Main Application:${NC}"
    echo "   📱 Demo UI:           http://localhost:5001"
    echo "   🧪 Content Tester:    http://localhost:5001/content-test"
    echo ""
    
    echo -e "${BLUE}🔧 API Endpoints:${NC}"
    echo "   🔍 Health Check:      GET  http://localhost:5001/health"
    echo "   🤖 Content Classify:  POST http://localhost:5001/api/classify"
    echo "   ⚙️  Strategy Control:  GET  http://localhost:5001/api/strategy"
    echo "   👥 Child Profiles:    GET  http://localhost:5001/api/children"
    echo ""
    
    echo -e "${BLUE}🦙 Ollama (if running):${NC}"
    echo "   🔗 API Base:          http://localhost:11434"
    echo "   📋 Models List:       http://localhost:11434/api/tags"
    echo ""
    
    echo -e "${BLUE}📊 Monitoring:${NC}"
    echo "   📝 Frontend Logs:     tail -f logs/demo-frontend.log"
    echo "   🦙 Ollama Logs:       tail -f logs/ollama.log"
    echo "   🔧 BAML Logs:         tail -f logs/baml-generate.log"
    echo ""
}

print_quick_commands() {
    echo -e "${PURPLE}🚀 Quick Commands:${NC}"
    echo ""
    echo -e "${CYAN}Test Content Classification:${NC}"
    echo 'curl -X POST http://localhost:5001/api/classify \'
    echo '     -H "Content-Type: application/json" \'
    echo '     -d '\''{"content": "Test message", "childId": "child_1"}'\'''
    echo ""
    
    echo -e "${CYAN}Switch Curation Strategy:${NC}"
    echo 'curl -X POST http://localhost:5001/api/strategy \'
    echo '     -H "Content-Type: application/json" \'
    echo '     -d '\''{"strategy": "multi_layer"}'\'''
    echo ""
    
    echo -e "${CYAN}Management:${NC}"
    echo "   Start:    ./deploy_local.sh"
    echo "   Stop:     ./stop_services.sh"
    echo "   Status:   ./status_check.sh"
    echo ""
}

main() {
    print_header
    
    echo -e "${BLUE}🔍 Service Status:${NC}"
    check_port 5001 "Demo Frontend" "http://localhost:5001/health"
    check_port 11434 "Ollama" "http://localhost:11434/api/tags"
    echo ""
    
    check_processes
    check_files
    test_api_endpoints
    print_urls
    print_quick_commands
    
    echo -e "${GREEN}Status check completed!${NC}"
}

main "$@"
