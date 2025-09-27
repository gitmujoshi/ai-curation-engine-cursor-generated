#!/bin/bash

# AI Curation Engine - Stop Services Script
# ==========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=================================${NC}"
    echo -e "${BLUE}   Stopping AI Curation Engine   ${NC}"
    echo -e "${BLUE}=================================${NC}"
    echo ""
}

stop_service_by_port() {
    local port=$1
    local service_name=$2
    
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo $pids | xargs kill -9 2>/dev/null || true
        print_success "✓ Stopped $service_name (port $port)"
    else
        print_info "• $service_name not running on port $port"
    fi
}

stop_service_by_pid_file() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            kill -9 "$pid" 2>/dev/null || true
            print_success "✓ Stopped $service_name (PID: $pid)"
        else
            print_info "• $service_name process already stopped"
        fi
        rm -f "$pid_file"
    else
        print_info "• No PID file for $service_name"
    fi
    
    # Also kill any remaining Python app.js processes
    local remaining_pids=$(pgrep -f "Python app.js" 2>/dev/null || true)
    if [ -n "$remaining_pids" ]; then
        echo $remaining_pids | xargs kill -9 2>/dev/null || true
        print_success "✓ Cleaned up remaining Python processes"
    fi
}

main() {
    print_header
    
    print_info "Stopping services..."
    
    # Stop Demo Frontend
    stop_service_by_port 5001 "Demo Frontend"
    stop_service_by_pid_file "logs/demo-frontend.pid" "Demo Frontend"
    
    # Stop any Python processes running app.js
    pkill -f "python3 app.js" 2>/dev/null || true
    pkill -f "python app.js" 2>/dev/null || true
    
    # Stop Ollama (optional - user might want to keep it running)
    read -p "Stop Ollama service? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        stop_service_by_port 11434 "Ollama"
        pkill -f "ollama serve" 2>/dev/null || true
        print_success "✓ Stopped Ollama service"
    else
        print_info "• Keeping Ollama running"
    fi
    
    # Clean up any remaining processes
    pkill -f "baml" 2>/dev/null || true
    
    print_success "🛑 All AI Curation Engine services stopped"
    echo ""
    echo -e "${BLUE}To restart:${NC} ./deploy_local.sh"
    echo -e "${BLUE}To check status:${NC} ./status_check.sh"
    echo ""
}

main "$@"
