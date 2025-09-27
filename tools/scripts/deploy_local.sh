#!/bin/bash

# AI Curation Engine - Local Deployment Script
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEMO_PORT=5001
OLLAMA_PORT=11434
LOG_DIR="logs"

print_header() {
    echo -e "${BLUE}=================================${NC}"
    echo -e "${BLUE} AI Curation Engine Deployment ${NC}"
    echo -e "${BLUE}=================================${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

check_dependencies() {
    print_step "Checking dependencies..."
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is required but not installed"
        exit 1
    fi
    print_info "✓ Python 3: $(python3 --version)"
    
    # Check pip
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 is required but not installed"
        exit 1
    fi
    print_info "✓ pip3 available"
    
    # Check Ollama (optional)
    if command -v ollama &> /dev/null; then
        print_info "✓ Ollama: $(ollama --version 2>/dev/null || echo 'installed')"
    else
        print_warning "Ollama not found - BAML will use mock responses"
    fi
    
    echo ""
}

setup_environment() {
    print_step "Setting up environment..."
    
    # Create logs directory
    mkdir -p "$LOG_DIR"
    print_info "✓ Created logs directory"
    
    # Set environment variables
    export BAML_LOG_LEVEL=ERROR
    export BOUNDARY_TELEMETRY_DISABLED=true
    print_info "✓ Environment variables set"
    
    # Install Python dependencies
    if [ -f "requirements.txt" ]; then
        print_info "Installing Python dependencies..."
        pip3 install -r requirements.txt > "$LOG_DIR/pip-install.log" 2>&1
        print_info "✓ Python dependencies installed"
    fi
    
    echo ""
}

start_ollama() {
    print_step "Starting Ollama service..."
    
    if command -v ollama &> /dev/null; then
        # Check if Ollama is already running
        if curl -s http://localhost:$OLLAMA_PORT/api/tags > /dev/null 2>&1; then
            print_info "✓ Ollama already running on port $OLLAMA_PORT"
        else
            print_info "Starting Ollama server..."
            ollama serve > "$LOG_DIR/ollama.log" 2>&1 &
            sleep 3
            
            if curl -s http://localhost:$OLLAMA_PORT/api/tags > /dev/null 2>&1; then
                print_success "✓ Ollama server started"
            else
                print_warning "Failed to start Ollama - BAML will use mock responses"
            fi
        fi
        
        # Check for required model
        if ollama list | grep -q "llama3.2"; then
            print_info "✓ Llama 3.2 model available"
        else
            print_info "Downloading Llama 3.2 model..."
            ollama pull llama3.2 > "$LOG_DIR/ollama-pull.log" 2>&1 &
            print_info "✓ Model download started (running in background)"
        fi
    else
        print_warning "Ollama not installed - BAML will use mock responses"
    fi
    
    echo ""
}

generate_baml_client() {
    print_step "Generating BAML client..."
    
    if [ -d "baml_src" ]; then
        if command -v baml-cli &> /dev/null; then
            baml-cli generate > "$LOG_DIR/baml-generate.log" 2>&1
            if [ $? -eq 0 ]; then
                print_success "✓ BAML client generated"
            else
                print_warning "BAML client generation failed - using fallback mode"
            fi
        else
            print_warning "BAML CLI not found - install with: pip install baml-py"
        fi
    else
        print_warning "No BAML source found - using fallback mode"
    fi
    
    echo ""
}

start_demo_frontend() {
    print_step "Starting Demo Frontend..."
    
    # Kill any existing process on the port
    lsof -ti:$DEMO_PORT | xargs kill -9 2>/dev/null || true
    sleep 2
    
    # Start the demo frontend
    cd demo-frontend
    python3 app.js > "../$LOG_DIR/demo-frontend.log" 2>&1 &
    DEMO_PID=$!
    cd ..
    
    # Wait for service to start
    sleep 3
    
    # Check if service is running
    if curl -s http://localhost:$DEMO_PORT/health > /dev/null 2>&1; then
        print_success "✓ Demo Frontend started on port $DEMO_PORT (PID: $DEMO_PID)"
        echo "$DEMO_PID" > "$LOG_DIR/demo-frontend.pid"
    else
        print_error "Failed to start Demo Frontend"
        exit 1
    fi
    
    echo ""
}

print_service_status() {
    print_step "Service Status Check..."
    
    # Demo Frontend
    if curl -s http://localhost:$DEMO_PORT/health > /dev/null 2>&1; then
        echo -e "   • Demo Frontend: ${GREEN}✓ Running${NC} (http://localhost:$DEMO_PORT)"
    else
        echo -e "   • Demo Frontend: ${RED}✗ Not running${NC}"
    fi
    
    # Ollama
    if curl -s http://localhost:$OLLAMA_PORT/api/tags > /dev/null 2>&1; then
        echo -e "   • Ollama:        ${GREEN}✓ Running${NC} (http://localhost:$OLLAMA_PORT)"
    else
        echo -e "   • Ollama:        ${YELLOW}⚠️  Not running${NC} (fallback mode)"
    fi
    
    # BAML Client
    if [ -f "baml_client/__init__.py" ]; then
        echo -e "   • BAML Client:   ${GREEN}✓ Generated${NC}"
    else
        echo -e "   • BAML Client:   ${YELLOW}⚠️  Using Fallback${NC}"
    fi
    
    echo ""
}

print_urls() {
    print_step "Available URLs and Endpoints..."
    
    echo -e "${BLUE}Main Application:${NC}"
    echo "   📱 Demo UI:           http://localhost:$DEMO_PORT"
    echo "   🧪 Content Tester:    http://localhost:$DEMO_PORT/content-test"
    
    echo ""
    echo -e "${BLUE}API Endpoints:${NC}"
    echo "   🔍 Health Check:      http://localhost:$DEMO_PORT/health"
    echo "   🤖 Content Classify:  POST http://localhost:$DEMO_PORT/api/classify"
    echo "   ⚙️  Strategy Control:  GET/POST http://localhost:$DEMO_PORT/api/strategy"
    echo "   👥 Child Profiles:    http://localhost:$DEMO_PORT/api/children"
    
    echo ""
    echo -e "${BLUE}Infrastructure:${NC}"
    echo "   🦙 Ollama API:        http://localhost:$OLLAMA_PORT"
    echo "   📊 Ollama Models:     http://localhost:$OLLAMA_PORT/api/tags"
    
    echo ""
    echo -e "${BLUE}Logs:${NC}"
    echo "   📝 Demo Frontend:     tail -f $LOG_DIR/demo-frontend.log"
    echo "   🦙 Ollama:           tail -f $LOG_DIR/ollama.log"
    echo "   🔧 BAML Generate:    tail -f $LOG_DIR/baml-generate.log"
    
    echo ""
}

main() {
    print_header
    
    check_dependencies
    setup_environment
    start_ollama
    generate_baml_client
    start_demo_frontend
    print_service_status
    print_urls
    
    print_success "🚀 AI Curation Engine deployed successfully!"
    echo ""
    echo -e "${BLUE}Quick Start:${NC}"
    echo "   1. Open: http://localhost:$DEMO_PORT"
    echo "   2. Try the Content Tester: http://localhost:$DEMO_PORT/content-test"
    echo "   3. Test API: curl http://localhost:$DEMO_PORT/health"
    echo ""
    echo -e "${YELLOW}To stop services:${NC} ./stop_services.sh"
    echo -e "${YELLOW}To check status:${NC} ./status_check.sh"
    echo ""
}

# Run main function
main "$@"
