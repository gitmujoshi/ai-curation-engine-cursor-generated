#!/bin/bash

# BAML Setup Script for AI Curation Engine
# This script sets up BoundaryML (BAML) for the AI Curation Engine project

set -e  # Exit on any error

echo "🚀 Setting up BoundaryML (BAML) for AI Curation Engine..."

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

# Check if Node.js is installed
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        echo "Visit: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v)
    print_success "Node.js found: $NODE_VERSION"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    NPM_VERSION=$(npm -v)
    print_success "npm found: $NPM_VERSION"
}

# Install BAML CLI
install_baml_cli() {
    print_status "Installing BAML CLI..."
    
    if command -v baml &> /dev/null; then
        print_warning "BAML CLI already installed. Updating..."
        npm update -g @boundaryml/baml
    else
        npm install -g @boundaryml/baml
    fi
    
    # Verify installation
    if command -v baml &> /dev/null; then
        BAML_VERSION=$(baml --version 2>/dev/null || echo "unknown")
        print_success "BAML CLI installed: $BAML_VERSION"
    else
        print_error "BAML CLI installation failed"
        exit 1
    fi
}

# Create BAML project structure
setup_baml_project() {
    print_status "Setting up BAML project structure..."
    
    # Create config/baml_src directory if it doesn't exist
    if [ ! -d "config/baml_src" ]; then
        mkdir -p config/baml_src
        print_success "Created config/baml_src directory"
    fi
    
    # Create src/core/baml_client directory for generated code
    if [ ! -d "src/core/baml_client" ]; then
        mkdir -p src/core/baml_client
        print_success "Created src/core/baml_client directory"
    fi
    
    # Create __pycache__ in .gitignore if not present
    if [ ! -f ".gitignore" ]; then
        touch .gitignore
    fi
    
    # Add BAML-specific entries to .gitignore
    if ! grep -q "src/core/baml_client/" .gitignore; then
        echo "" >> .gitignore
        echo "# BAML generated files" >> .gitignore
        echo "baml_client/" >> .gitignore
        echo "*.baml.lock" >> .gitignore
        print_success "Added BAML entries to .gitignore"
    fi
}

# Generate Python client from BAML files
generate_python_client() {
    print_status "Generating Python client from BAML files..."
    
    if [ ! -f "config/baml_src/content_classification.baml" ]; then
        print_error "BAML file not found: config/baml_src/content_classification.baml"
        print_warning "Please ensure the BAML file exists before running client generation."
        return 1
    fi
    
    # Generate Python client
    if baml-cli generate --from ./config/baml_src --lang python --output ./src/core/baml_client; then
        print_success "Python client generated successfully"
    else
        print_error "Failed to generate Python client"
        return 1
    fi
}

# Generate TypeScript client from BAML files
generate_typescript_client() {
    print_status "Generating TypeScript client from BAML files..."
    
    if [ ! -f "config/baml_src/content_classification.baml" ]; then
        print_error "BAML file not found: config/baml_src/content_classification.baml"
        print_warning "Please ensure the BAML file exists before running client generation."
        return 1
    fi
    
    # Generate TypeScript client
    if baml-cli generate --from ./config/baml_src --lang typescript --output ./src/core/baml_client_ts; then
        print_success "TypeScript client generated successfully"
    else
        print_error "Failed to generate TypeScript client"
        return 1
    fi
}

# Install Python dependencies
install_python_deps() {
    print_status "Installing Python dependencies..."
    
    # Check if Python is available
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
    else
        print_error "Python is not installed. Please install Python first."
        return 1
    fi
    
    # Install required packages
    $PYTHON_CMD -m pip install --upgrade pip
    
    # Install BAML Python client (if available as package)
    # Note: This might not be available as a PyPI package yet
    if $PYTHON_CMD -m pip install baml-client 2>/dev/null; then
        print_success "Installed baml-client from PyPI"
    else
        print_warning "baml-client not available on PyPI. Using generated client."
    fi
    
    # Install other dependencies
    $PYTHON_CMD -m pip install asyncio aiohttp
    print_success "Python dependencies installed"
}

# Create environment file template
create_env_template() {
    print_status "Creating environment file template..."
    
    if [ ! -f ".env.example" ]; then
        cat > .env.example << EOF
# BAML Configuration
# Copy this file to .env and fill in your API keys

# OpenAI API Key (required for GPT models)
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic API Key (required for Claude models)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google API Key (optional, for Gemini models)
GOOGLE_API_KEY=your_google_api_key_here

# BAML Configuration
BAML_LOG_LEVEL=INFO
BAML_CACHE_ENABLED=true
BAML_TIMEOUT_MS=30000
BAML_RETRY_ATTEMPTS=3

# Curation Engine Configuration
CURATION_ENGINE_API_BASE_URL=http://localhost:3000
CURATION_ENGINE_DB_URL=mongodb://localhost:27017/curation_engine
EOF
        print_success "Created .env.example template"
    else
        print_warning ".env.example already exists"
    fi
    
    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_success "Created .env file from template"
        print_warning "Please edit .env file and add your API keys"
    fi
}

# Validate BAML files
validate_baml_files() {
    print_status "Validating BAML files..."
    
    if [ ! -f "config/baml_src/content_classification.baml" ]; then
        print_error "BAML file not found: config/baml_src/content_classification.baml"
        return 1
    fi
    
    # Use BAML CLI to validate files
    if baml-cli validate --from ./config/baml_src; then
        print_success "BAML files are valid"
    else
        print_error "BAML file validation failed"
        return 1
    fi
}

# Create test script
create_test_script() {
    print_status "Creating test script..."
    
    cat > test_baml.py << 'EOF'
#!/usr/bin/env python3
"""
Test script for BAML integration
Run this to verify that BAML is working correctly
"""

import asyncio
import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def test_baml_integration():
    """Test BAML integration with sample content."""
    
    try:
        from BAML_Integration_Implementation import BAMLContentAnalyzer, UserContext
        print("✅ Successfully imported BAML integration")
    except ImportError as e:
        print(f"❌ Failed to import BAML integration: {e}")
        return False
    
    # Create analyzer
    analyzer = BAMLContentAnalyzer()
    
    # Test content
    test_content = """
    This is a sample article about artificial intelligence and its applications
    in education. AI can help personalize learning experiences and provide
    adaptive feedback to students.
    """
    
    # User context
    user_context = UserContext(
        age_category="teen",
        jurisdiction="US",
        parental_controls=True,
        content_preferences=["educational", "technology"],
        sensitivity_level="medium"
    )
    
    print("🧪 Testing content classification...")
    
    try:
        # Test safety classification
        safety = await analyzer.classify_safety(test_content, user_context)
        print(f"✅ Safety classification: {safety.safety_score:.2f}")
        
        # Test educational analysis
        educational = await analyzer.analyze_educational_value(test_content)
        print(f"✅ Educational value: {educational.educational_score:.2f}")
        
        # Test viewpoint analysis
        viewpoint = await analyzer.analyze_viewpoint(test_content)
        print(f"✅ Viewpoint analysis: {viewpoint.political_leaning}")
        
        print("🎉 All tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_baml_integration())
    sys.exit(0 if result else 1)
EOF
    
    chmod +x test_baml.py
    print_success "Created test script: test_baml.py"
}

# Main setup function
main() {
    echo "================================================"
    echo "🤖 BAML Setup for AI Curation Engine"
    echo "================================================"
    echo ""
    
    # Check prerequisites
    check_nodejs
    check_npm
    
    # Install and setup BAML
    install_baml_cli
    setup_baml_project
    
    # Generate clients (these might fail if BAML files don't exist yet)
    if generate_python_client; then
        print_success "Python client generation completed"
    else
        print_warning "Python client generation skipped (BAML files may not exist yet)"
    fi
    
    # Install dependencies
    install_python_deps
    
    # Create configuration
    create_env_template
    
    # Validate if possible
    if validate_baml_files; then
        print_success "BAML files validated"
    else
        print_warning "BAML file validation skipped"
    fi
    
    # Create test script
    create_test_script
    
    echo ""
    echo "================================================"
    echo "🎉 BAML Setup Complete!"
    echo "================================================"
    echo ""
    print_status "Next steps:"
    echo "1. Edit .env file and add your API keys"
    echo "2. Run 'python3 test_baml.py' to test the integration"
    echo "3. Use 'baml-cli generate --from ./config/baml_src --lang python' to regenerate clients"
    echo ""
    print_warning "Important: Make sure you have valid API keys in your .env file"
    echo ""
}

# Run main function
main "$@"
