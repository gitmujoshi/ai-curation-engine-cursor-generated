#!/bin/bash

# AI Curation Engine - Health Check Script
# This script checks the status of all services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo "============================================"
    echo "🔍 AI Curation Engine Health Check"
    echo "============================================"
    echo ""
}

check_service() {
    local service_name="$1"
    local url="$2"
    local expected_response="${3:-200}"
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_response"; then
        echo -e "   • $service_name: ${GREEN}✅ Healthy${NC}"
        return 0
    else
        echo -e "   • $service_name: ${RED}❌ Unhealthy${NC}"
        return 1
    fi
}

check_mongodb() {
    if mongosh --quiet --eval "db.runCommand('ping')" curation_engine > /dev/null 2>&1; then
        echo -e "   • MongoDB: ${GREEN}✅ Healthy${NC}"
        return 0
    else
        echo -e "   • MongoDB: ${RED}❌ Unhealthy${NC}"
        return 1
    fi
}

check_process() {
    local service_name="$1"
    local process_pattern="$2"
    
    if pgrep -f "$process_pattern" > /dev/null 2>&1; then
        echo -e "   • $service_name: ${GREEN}✅ Running${NC}"
        return 0
    else
        echo -e "   • $service_name: ${RED}❌ Not Running${NC}"
        return 1
    fi
}

main() {
    print_header
    
    echo "📊 Service Status:"
    
    local healthy_count=0
    local total_count=0
    
    # Check MongoDB
    ((total_count++))
    if check_mongodb; then
        ((healthy_count++))
    fi
    
    # Check Ollama
    ((total_count++))
    if check_service "Ollama API" "http://localhost:11434/api/tags"; then
        ((healthy_count++))
    fi
    
    # Check Backend API
    ((total_count++))
    if check_service "Backend API" "http://localhost:3001/api/health"; then
        ((healthy_count++))
    fi
    
    # Check Test App
    ((total_count++))
    if check_service "Test Web App" "http://localhost:5000/api/health"; then
        ((healthy_count++))
    fi
    
    echo ""
    echo "🔍 Process Status:"
    
    check_process "MongoDB Process" "mongod"
    check_process "Ollama Process" "ollama serve"
    check_process "Backend Process" "npm run backend"
    check_process "Test App Process" "python app.py"
    
    echo ""
    echo "📈 Overall Health: $healthy_count/$total_count services healthy"
    
    if [ $healthy_count -eq $total_count ]; then
        echo -e "${GREEN}🎉 All services are healthy!${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  Some services need attention${NC}"
        echo ""
        echo "🔧 Troubleshooting:"
        echo "   • Check logs in ./logs/ directory"
        echo "   • Run ./start_local.sh to restart services"
        echo "   • See LOCAL_DEPLOYMENT_GUIDE.md for help"
        exit 1
    fi
}

main "$@"
