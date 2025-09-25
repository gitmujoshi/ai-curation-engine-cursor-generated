#!/bin/bash

# AI Curation Engine - Stop Script
# This script stops all locally running services

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo "============================================"
    echo "🛑 Stopping AI Curation Engine Services"
    echo "============================================"
    echo ""
}

# Function to check if a process is running
process_running() {
    pgrep -f "$1" > /dev/null 2>&1
}

# Stop a service by process name
stop_service() {
    local service_name="$1"
    local process_pattern="$2"
    
    if process_running "$process_pattern"; then
        print_status "Stopping $service_name..."
        pkill -f "$process_pattern" 2>/dev/null || true
        
        # Wait for process to stop
        local max_attempts=10
        local attempt=1
        
        while [ $attempt -le $max_attempts ] && process_running "$process_pattern"; do
            sleep 1
            ((attempt++))
        done
        
        if process_running "$process_pattern"; then
            print_warning "$service_name did not stop gracefully, force killing..."
            pkill -9 -f "$process_pattern" 2>/dev/null || true
        fi
        
        print_success "$service_name stopped"
    else
        print_status "$service_name was not running"
    fi
}

# Stop MongoDB properly
stop_mongodb() {
    print_status "Stopping MongoDB..."
    
    if process_running "mongod"; then
        # Try graceful shutdown first
        mongod --dbpath ./data/db --shutdown 2>/dev/null || true
        
        # Wait a moment
        sleep 2
        
        # If still running, force stop
        if process_running "mongod"; then
            print_warning "MongoDB did not stop gracefully, force stopping..."
            pkill -f "mongod" 2>/dev/null || true
        fi
        
        print_success "MongoDB stopped"
    else
        print_status "MongoDB was not running"
    fi
}

# Clean up log files and temporary data
cleanup_files() {
    print_status "Cleaning up temporary files..."
    
    # Clean up log files (keep them but truncate if they're too large)
    if [ -d "logs" ]; then
        find logs -name "*.log" -size +10M -exec truncate -s 0 {} \;
    fi
    
    # Clean up any temporary Python cache
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "*.pyc" -delete 2>/dev/null || true
    
    print_success "Cleanup complete"
}

# Display final status
show_final_status() {
    echo ""
    echo "============================================"
    echo "✅ All Services Stopped"
    echo "============================================"
    echo ""
    echo "📊 Final Status:"
    
    # Check if services are actually stopped
    local services_stopped=true
    
    if process_running "mongod"; then
        echo "   • MongoDB:    ❌ Still running"
        services_stopped=false
    else
        echo "   • MongoDB:    ✅ Stopped"
    fi
    
    if process_running "ollama serve"; then
        echo "   • Ollama:     ❌ Still running"
        services_stopped=false
    else
        echo "   • Ollama:     ✅ Stopped"
    fi
    
    if process_running "npm run backend"; then
        echo "   • Backend:    ❌ Still running"
        services_stopped=false
    else
        echo "   • Backend:    ✅ Stopped"
    fi
    
    if process_running "python app.py"; then
        echo "   • Test App:   ❌ Still running"
        services_stopped=false
    else
        echo "   • Test App:   ✅ Stopped"
    fi
    
    echo ""
    
    if [ "$services_stopped" = true ]; then
        print_success "All services stopped successfully!"
    else
        print_warning "Some services may still be running. You may need to stop them manually."
        echo "Use 'ps aux | grep -E \"mongod|ollama|npm|python\"' to check running processes"
    fi
    
    echo ""
    echo "🚀 To restart services, run: ./start_local.sh"
    echo "🐳 For Docker deployment, run: docker-compose up"
    echo ""
}

# Main execution
main() {
    print_header
    
    # Stop all services
    stop_service "Test Application" "python app.py"
    stop_service "Backend API" "npm run backend"
    stop_service "Ollama" "ollama serve"
    stop_mongodb
    
    # Cleanup
    cleanup_files
    
    # Show final status
    show_final_status
}

# Run main function
main "$@"
