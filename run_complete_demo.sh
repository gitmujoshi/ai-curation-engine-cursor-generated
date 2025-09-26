#!/bin/bash

# AI Curation Engine - Complete End-to-End Demo Setup
# ===================================================
# This script sets up and runs the complete demo with all integrations

set -e  # Exit on any error

# Set BAML logging environment variables
export BAML_LOG_LEVEL=INFO
export BAML_LOG_DIR="$(pwd)/logs"
export BAML_LOG_FILE="$(pwd)/logs/baml.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${PURPLE}"
    echo "================================================================"
    echo "🚀 AI CURATION ENGINE - COMPLETE E2E DEMO"
    echo "================================================================"
    echo -e "${NC}"
}

print_section() {
    echo -e "${CYAN}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if port is in use
port_in_use() {
    lsof -i ":$1" >/dev/null 2>&1
}

# Kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        kill -9 $pid 2>/dev/null || true
        sleep 1
    fi
}

# Function to wait for service
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    print_info "Waiting for $name to start..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            print_success "$name is ready!"
            return 0
        fi
        sleep 2
        ((attempt++))
        echo -n "."
    done
    
    print_warning "$name may not have started properly"
    return 1
}

# Prerequisites check
check_prerequisites() {
    print_section "Checking Prerequisites"
    
    local missing_deps=()
    
    # Check required software
    if ! command_exists python3; then
        missing_deps+=("Python 3")
    fi
    
    if ! command_exists node; then
        missing_deps+=("Node.js")
    fi
    
    if ! command_exists mongod; then
        missing_deps+=("MongoDB")
    fi
    
    if ! command_exists ollama; then
        print_warning "Ollama not found - BAML will use fallback mode"
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_info "Please install missing dependencies. See LOCAL_DEPLOYMENT_GUIDE.md for help."
        exit 1
    fi
    
    print_success "All prerequisites found"
}

# Setup Python environment
setup_python() {
    print_section "Setting up Python Environment"
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_info "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install requirements
    print_info "Installing Python dependencies..."
    pip install --upgrade pip > /dev/null 2>&1
    pip install flask flask-cors requests pymongo bcrypt pyjwt python-dotenv > /dev/null 2>&1
    
    # Install test app requirements
    if [ -f "test-app/requirements.txt" ]; then
        pip install -r test-app/requirements.txt > /dev/null 2>&1
    fi
    
    print_success "Python environment ready"
}

# Setup Node.js environment
setup_nodejs() {
    print_section "Setting up Node.js Environment"
    
    # Install BAML CLI if not present
    if ! command_exists baml-cli; then
        print_info "Installing BAML CLI..."
        npm install -g @boundaryml/baml > /dev/null 2>&1
    fi
    
    # Setup backend dependencies
    if [ -d "integrated-backend" ]; then
        cd integrated-backend
        if [ ! -d "node_modules" ]; then
            print_info "Installing backend dependencies..."
            npm init -y > /dev/null 2>&1
            npm install express cors mongoose bcrypt jsonwebtoken dotenv child_process > /dev/null 2>&1
        fi
        cd ..
    fi
    
    print_success "Node.js environment ready"
}

# Setup BAML
setup_baml() {
    print_section "Setting up BAML Integration"
    
    # Create directories
    mkdir -p logs baml_client
    
    # Generate BAML Python client
    if [ -f "baml_src/content_classification.baml" ]; then
        print_info "Generating BAML Python client..."
        
        # Clean any existing client first
        rm -rf baml_client_python/baml_client 2>/dev/null || true
        
        # Generate client and check for actual success
        if baml-cli generate --from ./baml_src > /dev/null 2>&1; then
            # Verify client was actually generated
            if [ -d "baml_client_python/baml_client" ] && [ -f "baml_client_python/baml_client/__init__.py" ]; then
                print_success "BAML Python client generated successfully"
                print_info "Client location: baml_client_python/baml_client/"
            else
                print_warning "BAML generation completed but client files not found"
            fi
        else
            print_warning "BAML client generation failed - demo will use fallback mode"
        fi
    else
        print_warning "BAML source file not found - skipping client generation"
    fi
    
    # Install required BAML Python packages
    print_info "Installing BAML Python packages..."
    pip install baml-py==0.208.5 pydantic > /dev/null 2>&1 || {
        print_warning "BAML Python package installation failed"
    }
    
    print_success "BAML setup complete"
}

# Start MongoDB
start_mongodb() {
    print_section "Starting MongoDB"
    
    if port_in_use 27017; then
        print_warning "MongoDB already running on port 27017"
        return 0
    fi
    
    # Create data directory
    mkdir -p data/db
    
    # Start MongoDB
    print_info "Starting MongoDB..."
    mongod --dbpath ./data/db --fork --logpath ./logs/mongodb.log --quiet
    
    wait_for_service "mongodb://localhost:27017" "MongoDB"
    print_success "MongoDB started"
}

# Start Ollama (optional)
start_ollama() {
    print_section "Starting Ollama (Optional)"
    
    if ! command_exists ollama; then
        print_warning "Ollama not available - BAML will use fallback mode"
        return 0
    fi
    
    if port_in_use 11434; then
        print_warning "Ollama already running on port 11434"
        return 0
    fi
    
    print_info "Starting Ollama..."
    nohup ollama serve > ./logs/ollama.log 2>&1 &
    
    if wait_for_service "http://localhost:11434/api/tags" "Ollama"; then
        print_info "Checking for required models..."
        
        # Check and download models if needed
        local models=("llama3.2:latest")
        for model in "${models[@]}"; do
            if ! ollama list | grep -q "${model%:*}"; then
                print_info "Downloading $model (this may take several minutes)..."
                ollama pull "$model" > /dev/null 2>&1 &
                print_warning "Model download started in background"
            else
                print_success "Model $model already available"
            fi
        done
    fi
}

# Start Backend
start_backend() {
    print_section "Starting Integrated Backend"
    
    # Kill any existing backend process
    kill_port 3001
    
    # Create environment file
    cat > integrated-backend/.env << EOF
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/curation_engine_demo
JWT_SECRET=demo-jwt-secret-change-in-production
PYTHON_PATH=$(which python3)
OLLAMA_BASE_URL=http://localhost:11434
EOF
    
    # Start backend
    cd integrated-backend
    print_info "Starting backend server..."
    nohup node server.js > ../logs/backend.log 2>&1 &
    cd ..
    
    wait_for_service "http://localhost:3001/api/health" "Backend API"
    print_success "Backend started on port 3001"
}

# Start Demo Frontend
start_demo_frontend() {
    print_section "Starting Demo Frontend"
    
    # Kill any existing frontend process
    kill_port 5001
    
    # Activate Python environment
    source venv/bin/activate
    
    # Start demo frontend with BAML logging
    print_info "Starting demo frontend with BAML logging..."
    nohup python3 start_baml_logging.py > logs/demo-frontend.log 2>&1 &
    
    wait_for_service "http://localhost:5001/api/health" "Demo Frontend"
    print_success "Demo frontend started on port 5001"
}

# Create demo data
create_demo_data() {
    print_section "Creating Demo Data"
    
    print_info "Setting up sample user and data..."
    
    # Create a sample user and demo data via API
    curl -s -X POST http://localhost:3001/api/auth/register \
        -H "Content-Type: application/json" \
        -d '{
            "email": "demo@parent.com",
            "password": "demo123",
            "firstName": "Demo",
            "lastName": "Parent"
        }' > /dev/null 2>&1 || print_warning "Demo user may already exist"
    
    print_success "Demo data created"
}

# Display service information
show_demo_info() {
    print_section "Demo Information"
    
    echo ""
    echo -e "${GREEN}🎉 AI Curation Engine Demo is Ready!${NC}"
    echo ""
    echo -e "${CYAN}📱 Demo Applications:${NC}"
    echo "   🌐 Main Demo:           http://localhost:5001"
    echo "   🔍 Content Testing:     http://localhost:5001/content-test"
    echo "   👨‍👩‍👧‍👦 Child Setup:        http://localhost:5001/child-setup"
    echo ""
    echo -e "${CYAN}🔌 API Endpoints:${NC}"
    echo "   🚀 Backend API:         http://localhost:3001"
    echo "   ❤️  Health Check:        http://localhost:3001/api/health"
    echo "   🧠 Content Classify:    http://localhost:3001/api/classify"
    echo ""
    echo -e "${CYAN}💾 Database:${NC}"
    echo "   📄 MongoDB:             mongodb://localhost:27017"
    echo "   🗃️  Database Name:       curation_engine_demo"
    echo ""
    
    # Check service status
    echo -e "${CYAN}📊 Service Status:${NC}"
    if curl -s http://localhost:27017 > /dev/null 2>&1; then
        echo "   • MongoDB:       ✅ Running"
    else
        echo "   • MongoDB:       ❌ Not running"
    fi
    
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "   • Ollama:        ✅ Running"
    else
        echo "   • Ollama:        ⚠️  Not running (fallback mode)"
    fi
    
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "   • Backend:       ✅ Running"
    else
        echo "   • Backend:       ❌ Not running"
    fi
    
    if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
        echo "   • Demo Frontend: ✅ Running"
    else
        echo "   • Demo Frontend: ❌ Not running"
    fi
    
    if [ -d "baml_client_python/baml_client" ]; then
        echo "   • BAML Client:   ✅ Generated (Real AI)"
    else
        echo "   • BAML Client:   ⚠️  Using Fallback"
    fi
    
    echo ""
    echo -e "${CYAN}🧪 Demo Features:${NC}"
    echo "   ✅ Parent Dashboard with Child Profiles"
    echo "   ✅ Real-time Content Classification"
    echo "   ✅ BAML AI Integration (with fallback)"
    echo "   ✅ Safety Analytics & Reporting"
    echo "   ✅ Child Profile Management"
    echo "   ✅ Content Testing Interface"
    echo ""
    echo -e "${CYAN}📝 Demo Data:${NC}"
    echo "   👤 Demo Parent: demo@parent.com / demo123"
    echo "   👧 Child 1: Emma (8 years old, strict protection)"
    echo "   👦 Child 2: Alex (14 years old, moderate protection)"
    echo ""
    echo -e "${CYAN}📚 Sample Content:${NC}"
    echo "   📖 Educational: Space exploration content"
    echo "   📱 Social: Friend's beach day post"
    echo "   ⚠️  Concerning: Inappropriate content (blocked)"
    echo "   📰 News: AI technology article"
    echo ""
    echo -e "${YELLOW}📋 Logs Location: ./logs/${NC}"
    echo "   • backend.log - Backend API logs"
    echo "   • demo-frontend.log - Frontend logs"
    echo "   • mongodb.log - Database logs"
    echo "   • ollama.log - AI model logs"
    echo ""
    echo -e "${GREEN}🎯 Ready for Demo! Open http://localhost:5001 to begin${NC}"
    echo ""
}

# Wait for user input to stop
wait_for_stop() {
    echo -e "${YELLOW}Press Ctrl+C or Enter to stop all services...${NC}"
    read -r
}

# Cleanup function
cleanup() {
    print_section "Stopping Services"
    
    print_info "Stopping demo frontend..."
    kill_port 5001
    
    print_info "Stopping backend API..."
    kill_port 3001
    
    print_info "Stopping Ollama..."
    kill_port 11434
    
    print_info "Stopping MongoDB..."
    mongod --dbpath ./data/db --shutdown 2>/dev/null || true
    
    print_success "All services stopped"
    
    echo ""
    echo -e "${GREEN}🎉 Thank you for trying the AI Curation Engine Demo!${NC}"
    echo ""
    echo -e "${CYAN}📚 Next Steps:${NC}"
    echo "   • Deploy to production with real API keys"
    echo "   • Integrate with your content platforms"
    echo "   • Customize safety rules for your family"
    echo "   • Scale with Docker/Kubernetes"
    echo ""
}

# Main execution
main() {
    print_header
    
    # Setup trap for cleanup
    trap cleanup EXIT
    
    # Run setup steps
    check_prerequisites
    setup_python
    setup_nodejs
    setup_baml
    
    # Start services
    start_mongodb
    start_ollama
    start_backend
    start_demo_frontend
    
    # Setup demo data
    create_demo_data
    
    # Show information
    show_demo_info
    
    # Wait for user to stop
    wait_for_stop
}

# Check for command line arguments
case "$1" in
    --help|-h)
        echo "AI Curation Engine - Complete Demo Setup"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --stop         Stop all running services"
        echo "  --status       Check status of all services"
        echo ""
        echo "This script sets up and runs the complete AI Curation Engine demo"
        echo "including backend API, demo frontend, MongoDB, and optional Ollama."
        exit 0
        ;;
    --stop)
        print_header
        cleanup
        exit 0
        ;;
    --status)
        print_header
        print_section "Service Status Check"
        
        echo "Checking running services..."
        echo ""
        
        if port_in_use 27017; then
            echo "✅ MongoDB: Running on port 27017"
        else
            echo "❌ MongoDB: Not running"
        fi
        
        if port_in_use 11434; then
            echo "✅ Ollama: Running on port 11434"
        else
            echo "⚠️  Ollama: Not running"
        fi
        
        if port_in_use 3001; then
            echo "✅ Backend: Running on port 3001"
        else
            echo "❌ Backend: Not running"
        fi
        
        if port_in_use 5000; then
            echo "✅ Demo Frontend: Running on port 5000"
        else
            echo "❌ Demo Frontend: Not running"
        fi
        
        echo ""
        exit 0
        ;;
    "")
        # No arguments, run main demo
        main
        ;;
    *)
        echo "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac
