#!/bin/bash

# AI Curation Engine - Local Startup Script
# This script starts all services locally for development and testing

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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
    echo "=================================================="
    echo "🚀 AI Curation Engine - Local Development Setup"
    echo "=================================================="
    echo ""
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if a port is in use
port_in_use() {
    lsof -i ":$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("Node.js")
    fi
    
    if ! command_exists python3; then
        missing_deps+=("Python 3")
    fi
    
    if ! command_exists mongod; then
        missing_deps+=("MongoDB")
    fi
    
    if ! command_exists ollama; then
        missing_deps+=("Ollama")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install missing dependencies and try again."
        print_status "See LOCAL_DEPLOYMENT_GUIDE.md for installation instructions."
        exit 1
    fi
    
    print_success "All prerequisites found"
}

# Setup Python virtual environment
setup_python_env() {
    print_status "Setting up Python environment..."
    
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    
    print_status "Installing Python dependencies..."
    pip install --upgrade pip > /dev/null 2>&1
    
    # Install requirements from test-app
    if [ -f "test-app/requirements.txt" ]; then
        pip install -r test-app/requirements.txt > /dev/null 2>&1
    fi
    
    print_success "Python environment ready"
}

# Setup Node.js dependencies
setup_node_env() {
    print_status "Setting up Node.js environment..."
    
    # Install BAML CLI if not present
    if ! command_exists baml-cli; then
        print_status "Installing BAML CLI..."
        npm install -g @boundaryml/baml
    fi
    
    # Install backend dependencies
    if [ -d "curation-engine-ui" ]; then
        cd curation-engine-ui
        if [ ! -d "node_modules" ]; then
            print_status "Installing backend dependencies..."
            npm install > /dev/null 2>&1
        fi
        cd ..
    fi
    
    print_success "Node.js environment ready"
}

# Setup BAML client
setup_baml() {
    print_status "Setting up BAML client..."
    
    # Generate BAML client for Llama
    if [ -f "baml_src/llama_content_classification.baml" ]; then
        baml-cli generate --from ./baml_src/llama_content_classification.baml --lang python --output ./baml_client_llama > /dev/null 2>&1 || {
            print_warning "BAML client generation failed"
        }
    fi
    
    # Generate standard BAML client as backup
    if [ -f "baml_src/content_classification.baml" ]; then
        baml-cli generate --from ./baml_src/content_classification.baml --lang python --output ./baml_client > /dev/null 2>&1 || {
            print_warning "Standard BAML client generation failed"
        }
    fi
    
    print_success "BAML setup complete"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p data/db
    mkdir -p logs
    mkdir -p test-app/templates
    mkdir -p test-app/static
    
    print_success "Directories created"
}

# Start MongoDB
start_mongodb() {
    print_status "Starting MongoDB..."
    
    if port_in_use 27017; then
        print_warning "MongoDB already running on port 27017"
        return 0
    fi
    
    # Start MongoDB in background
    mongod --dbpath ./data/db --fork --logpath ./logs/mongodb.log --quiet
    
    # Wait for MongoDB to start
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if mongosh --quiet --eval "db.runCommand('ping')" > /dev/null 2>&1; then
            break
        fi
        sleep 1
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "MongoDB failed to start"
        return 1
    fi
    
    print_success "MongoDB started successfully"
}

# Start Ollama
start_ollama() {
    print_status "Starting Ollama..."
    
    if port_in_use 11434; then
        print_warning "Ollama already running on port 11434"
        return 0
    fi
    
    # Start Ollama in background
    nohup ollama serve > ./logs/ollama.log 2>&1 &
    
    # Wait for Ollama to start
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            break
        fi
        sleep 1
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "Ollama failed to start"
        return 1
    fi
    
    print_success "Ollama started successfully"
}

# Download Llama models
download_models() {
    print_status "Checking Llama models..."
    
    local models=("llama3.2:latest" "llama3.1:latest" "codellama:latest")
    local installed_models
    installed_models=$(ollama list | awk 'NR>1 {print $1}')
    
    for model in "${models[@]}"; do
        if echo "$installed_models" | grep -q "^${model%:*}"; then
            print_success "Model $model already installed"
        else
            print_status "Downloading $model (this may take several minutes)..."
            ollama pull "$model"
            print_success "Model $model downloaded"
        fi
    done
}

# Start backend API
start_backend() {
    print_status "Starting backend API..."
    
    if port_in_use 3001; then
        print_warning "Backend API already running on port 3001"
        return 0
    fi
    
    if [ -d "curation-engine-ui" ]; then
        cd curation-engine-ui
        nohup npm run backend > ../logs/backend.log 2>&1 &
        cd ..
        
        # Wait for backend to start
        local max_attempts=30
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
                break
            fi
            sleep 1
            ((attempt++))
        done
        
        if [ $attempt -gt $max_attempts ]; then
            print_warning "Backend API may not have started properly"
        else
            print_success "Backend API started successfully"
        fi
    else
        print_warning "Backend directory not found, skipping"
    fi
}

# Start test application
start_test_app() {
    print_status "Starting test web application..."
    
    if port_in_use 5000; then
        print_warning "Test app already running on port 5000"
        return 0
    fi
    
    # Activate Python virtual environment
    source venv/bin/activate
    
    # Start test app in background
    cd test-app
    nohup python app.py > ../logs/test-app.log 2>&1 &
    cd ..
    
    # Wait for test app to start
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
            break
        fi
        sleep 1
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_warning "Test app may not have started properly"
    else
        print_success "Test web application started successfully"
    fi
}

# Display service URLs
show_urls() {
    echo ""
    echo "=================================================="
    echo "🎉 All Services Started Successfully!"
    echo "=================================================="
    echo ""
    echo "📱 Test Web Interface:  http://localhost:5000"
    echo "🔌 Backend API:         http://localhost:3001"
    echo "🦙 Ollama API:          http://localhost:11434"
    echo "📄 MongoDB:             mongodb://localhost:27017"
    echo ""
    echo "📊 Service Status:"
    echo "   • MongoDB:    $(curl -s http://localhost:27017 > /dev/null 2>&1 && echo "✅ Running" || echo "❌ Stopped")"
    echo "   • Ollama:     $(curl -s http://localhost:11434/api/tags > /dev/null 2>&1 && echo "✅ Running" || echo "❌ Stopped")"
    echo "   • Backend:    $(curl -s http://localhost:3001/api/health > /dev/null 2>&1 && echo "✅ Running" || echo "❌ Stopped")"
    echo "   • Test App:   $(curl -s http://localhost:5000/api/health > /dev/null 2>&1 && echo "✅ Running" || echo "❌ Stopped")"
    echo ""
    echo "📝 Logs located in: ./logs/"
    echo "🛑 To stop all services, run: ./stop_local.sh"
    echo ""
}

# Cleanup function
cleanup() {
    print_status "Cleaning up background processes..."
    
    # Kill any background processes we started
    pkill -f "ollama serve" 2>/dev/null || true
    pkill -f "npm run backend" 2>/dev/null || true
    pkill -f "python app.py" 2>/dev/null || true
    
    # MongoDB should be stopped manually with mongod --shutdown
    mongod --dbpath ./data/db --shutdown 2>/dev/null || true
}

# Main execution
main() {
    print_header
    
    # Setup trap for cleanup on exit
    trap cleanup EXIT
    
    # Check prerequisites
    check_prerequisites
    
    # Setup environments
    create_directories
    setup_python_env
    setup_node_env
    setup_baml
    
    # Start services
    start_mongodb
    start_ollama
    download_models
    start_backend
    start_test_app
    
    # Show results
    show_urls
    
    # Wait for user input to stop
    echo "Press Ctrl+C or Enter to stop all services..."
    read -r
}

# Run main function
main "$@"
