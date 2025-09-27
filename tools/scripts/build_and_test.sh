#!/bin/bash

# AI Curation Engine - Build and Test Script
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}   AI Curation Engine - Build & Test   ${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

run_pre_build_checks() {
    print_step "Pre-build Checks"
    
    # Check Python version
    local python_version=$(python3 --version | cut -d' ' -f2)
    print_info "Python version: $python_version"
    
    # Check if we're in the right directory
    if [ ! -f "tools/scripts/curation_engine_pluggable.py" ]; then
        print_error "Not in AI Curation Engine directory"
        exit 1
    fi
    print_info "✓ In correct project directory"
    
    # Check for required files
    local required_files=("src/ui/demo-frontend/app.js" "tools/scripts/curation_engine_pluggable.py" "tools/scripts/BAML_Integration_Real.py")
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_info "✓ Found $file"
        else
            print_error "Missing required file: $file"
            exit 1
        fi
    done
    
    echo ""
}

install_dependencies() {
    print_step "Installing Dependencies"
    
    # Create requirements.txt if it doesn't exist
    if [ ! -f "requirements.txt" ]; then
        print_info "Creating requirements.txt..."
        cat > requirements.txt << EOF
# AI Curation Engine Dependencies
flask==2.3.3
flask-cors==4.0.0
requests==2.31.0
pydantic==2.4.2
python-dotenv==1.0.0

# BAML Dependencies
baml-py>=0.46.0

# Optional for enhanced functionality
openai>=1.3.0
anthropic>=0.3.0
EOF
        print_info "✓ Created requirements.txt"
    fi
    
    # Install dependencies
    print_info "Installing Python packages..."
    pip3 install -r requirements.txt > logs/pip-install.log 2>&1
    print_success "✓ Dependencies installed"
    
    echo ""
}

generate_baml_files() {
    print_step "Generating BAML Client"
    
    # Create logs directory
    mkdir -p logs
    
    # Check if BAML source exists
    if [ -d "config/baml_src" ]; then
        print_info "Found BAML source directory"
        
        # Try to generate BAML client
        if command -v baml-cli &> /dev/null; then
            print_info "Generating BAML client..."
            baml-cli generate > logs/baml-generate.log 2>&1
            if [ $? -eq 0 ]; then
                print_success "✓ BAML client generated"
            else
                print_warning "BAML generation failed - check logs/baml-generate.log"
            fi
        else
            print_warning "BAML CLI not found - install with: pip install baml-py"
        fi
    else
        print_info "No BAML source found - using existing implementation"
    fi
    
    echo ""
}

run_lint_checks() {
    print_step "Running Code Quality Checks"
    
    # Check Python syntax
    print_info "Checking Python syntax..."
    local python_files=("src/ui/demo-frontend/app.js" "tools/scripts/curation_engine_pluggable.py" "tools/scripts/BAML_Integration_Real.py")
    for file in "${python_files[@]}"; do
        if [ -f "$file" ]; then
            python3 -m py_compile "$file" 2>/dev/null
            if [ $? -eq 0 ]; then
                print_info "✓ $file syntax OK"
            else
                print_error "✗ $file has syntax errors"
                exit 1
            fi
        fi
    done
    
    # Check for common issues
    print_info "Checking for common issues..."
    
    # Check for remaining fallback references
    local fallback_count=$(grep -r -i "fallback\|mock.*baml\|demo.*baml" --include="*.py" . | grep -v logs | wc -l)
    if [ "$fallback_count" -gt 0 ]; then
        print_warning "Found $fallback_count potential fallback references"
        grep -r -i "fallback\|mock.*baml\|demo.*baml" --include="*.py" . | grep -v logs | head -5
    else
        print_success "✓ No BAML fallback references found"
    fi
    
    echo ""
}

test_functionality() {
    print_step "Testing Core Functionality"
    
    # Test imports
    print_info "Testing Python imports..."
    python3 -c "
import sys
sys.path.append('tools/scripts')
try:
    from curation_engine_pluggable import CurationEngine, CurationStrategy
    from BAML_Integration_Real import RealBAMLContentAnalyzer
    print('✓ Core imports successful')
except Exception as e:
    print(f'✗ Import error: {e}')
    exit(1)
" || exit 1
    
    # Test pluggable engine initialization
    print_info "Testing curation engine initialization..."
    python3 -c "
import sys
sys.path.append('tools/scripts')
try:
    from curation_engine_pluggable import CurationEngine, CurationStrategy
    engine = CurationEngine(CurationStrategy.LLM_ONLY)
    strategy_info = engine.get_strategy_info()
    print(f'✓ Engine initialized with strategy: {strategy_info[\"strategy_name\"]}')
except Exception as e:
    print(f'✗ Engine initialization error: {e}')
    exit(1)
" || exit 1
    
    print_success "✓ Core functionality tests passed"
    echo ""
}

build_documentation() {
    print_step "Building Documentation"
    
    # Create API documentation
    cat > API_ENDPOINTS.md << 'EOF'
# AI Curation Engine - API Endpoints

## Main Application URLs

### Frontend
- **Demo UI**: `http://localhost:5001/`
- **Content Tester**: `http://localhost:5001/content-test`

### Health & Status
- **Health Check**: `GET http://localhost:5001/health`
  - Returns service status and configuration

## Content Classification API

### Classify Content
- **Endpoint**: `POST http://localhost:5001/api/classify`
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "content": "Text content to analyze",
    "childId": "child_1"
  }
  ```
- **Response**:
  ```json
  {
    "safety": {
      "safety_score": 0.85,
      "reasoning": "Content analysis reasoning",
      "content_warnings": ["warning1"],
      "age_appropriate": "13+"
    },
    "educational": {
      "score": 0.75,
      "learning_objectives": ["objective1"],
      "subject_areas": ["area1"],
      "cognitive_level": "understand"
    },
    "viewpoint": {
      "political_leaning": "neutral",
      "bias_score": 0.2,
      "reasoning": "Viewpoint analysis",
      "source_credibility": 0.8
    },
    "recommendation": "allow",
    "confidence": 0.85,
    "processing_time": 2.45,
    "model": "LLM-Only Strategy (llm_only)",
    "strategy_info": {
      "strategy_name": "LLM-Only Strategy",
      "strategy_type": "llm_only"
    }
  }
  ```

## Strategy Management API

### Get Current Strategy
- **Endpoint**: `GET http://localhost:5001/api/strategy`
- **Response**:
  ```json
  {
    "current_strategy": {
      "strategy_name": "LLM-Only Strategy",
      "strategy_type": "llm_only"
    },
    "available_strategies": ["llm_only", "multi_layer", "hybrid"]
  }
  ```

### Switch Strategy
- **Endpoint**: `POST http://localhost:5001/api/strategy`
- **Body**:
  ```json
  {
    "strategy": "multi_layer"
  }
  ```

## User Management API

### Get Child Profiles
- **Endpoint**: `GET http://localhost:5001/api/children`
- **Response**: List of child profiles with safety settings

## Infrastructure URLs

### Ollama (if running)
- **API Base**: `http://localhost:11434`
- **Models List**: `GET http://localhost:11434/api/tags`
- **Model Info**: `GET http://localhost:11434/api/show/{model_name}`

## Curation Strategies

### Available Strategies
1. **LLM-Only** (`llm_only`)
   - Uses BAML with Llama 3.2 for comprehensive analysis
   - Best for detailed reasoning and complex content
   - Processing time: 5-10 seconds

2. **Multi-Layer** (`multi_layer`)
   - Fast filters → Specialized AI → LLM (if needed)
   - Optimized for performance with selective LLM usage
   - Processing time: 0.1-5 seconds

3. **Hybrid** (`hybrid`)
   - Dynamically switches between strategies based on content complexity
   - Balances speed and accuracy
   - Processing time: Variable

## Error Responses

All endpoints may return error responses:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad request (invalid input)
- `500`: Internal server error
EOF

    print_success "✓ API documentation generated"
    echo ""
}

create_deployment_package() {
    print_step "Creating Deployment Package"
    
    # Create deployment info
    cat > DEPLOYMENT_INFO.md << EOF
# AI Curation Engine - Deployment Information

## Quick Start
\`\`\`bash
# Deploy locally
./deploy_local.sh

# Check status
./status_check.sh

# Stop services
./stop_services.sh
\`\`\`

## Service URLs
- **Main App**: http://localhost:5001
- **Content Tester**: http://localhost:5001/content-test
- **API Health**: http://localhost:5001/health

## Architecture
- **Frontend**: Flask (Python) on port 5001
- **AI Engine**: BAML + Llama 3.2 via Ollama
- **Strategies**: LLM-Only, Multi-Layer, Hybrid

## Build Info
- **Built**: $(date)
- **Python**: $(python3 --version)
- **Platform**: $(uname -s)

## Log Files
- Frontend: \`logs/demo-frontend.log\`
- Ollama: \`logs/ollama.log\`
- BAML: \`logs/baml-generate.log\`
EOF

    print_success "✓ Deployment package created"
    echo ""
}

main() {
    print_header
    
    run_pre_build_checks
    install_dependencies
    generate_baml_files
    run_lint_checks
    test_functionality
    build_documentation
    create_deployment_package
    
    print_success "🎉 Build and test completed successfully!"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "   1. Deploy locally: ./deploy_local.sh"
    echo "   2. Test the app: http://localhost:5001"
    echo "   3. Check status: ./status_check.sh"
    echo ""
    echo -e "${BLUE}Documentation:${NC}"
    echo "   • API Endpoints: API_ENDPOINTS.md"
    echo "   • Deployment Info: DEPLOYMENT_INFO.md"
    echo ""
}

main "$@"
