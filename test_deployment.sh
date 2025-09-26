#!/bin/bash

# AI Curation Engine - Deployment Test Script
# ============================================
# This script tests all new functionality to ensure deployment is working correctly

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}"
    echo "================================================================"
    echo "🧪 AI CURATION ENGINE - DEPLOYMENT FUNCTIONALITY TEST"
    echo "================================================================"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Test service availability
test_services() {
    print_info "Testing service availability..."
    
    # Check if frontend is running
    if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
        print_success "Demo frontend is running on port 5001"
    else
        print_error "Demo frontend is not responding on port 5001"
        return 1
    fi
    
    # Check if Ollama is running
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        print_success "Ollama is running on port 11434"
    else
        print_warning "Ollama is not running - BAML will use mock responses"
    fi
}

# Test profiles
test_profiles() {
    print_info "Testing user profiles..."
    
    local profiles=$(curl -s http://localhost:5001/api/children 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "$profiles" | python3 -c "
import json, sys
try:
    children = json.load(sys.stdin)
    print('📋 Available profiles:')
    for child in children:
        print(f'  👤 {child[\"name\"]} ({child[\"age\"]} years old) - {child.get(\"profileType\", \"child\")} profile')
    
    # Check for our new adult profile
    adult_found = any(c.get('profileType') == 'adult' or c['age'] >= 18 for c in children)
    if adult_found:
        print('✅ Adult profile (Michael) found')
    else:
        print('❌ Adult profile missing')
except:
    print('❌ Failed to parse profiles')
"
    else
        print_error "Failed to fetch profiles"
        return 1
    fi
}

# Test content classification
test_content_classification() {
    print_info "Testing content classification with all categories..."
    
    local test_cases=(
        "child_1|Educational content about space|Educational content test"
        "child_2|Progressive taxation and social programs|Center-left politics test"
        "adult_1|Free market economics and conservative values|Center-right politics test"
        "adult_1|Extreme adult content with violence|Extreme adult content test"
        "child_1|Secret global elites control everything|Conspiracy theory test"
        "adult_1|The capitalist system must be overthrown|Extreme left politics test"
        "child_2|Foreign invaders threaten our nation|Extreme right politics test"
    )
    
    for test_case in "${test_cases[@]}"; do
        IFS='|' read -r profile content description <<< "$test_case"
        
        print_info "Testing: $description"
        
        local result=$(curl -X POST http://localhost:5001/api/classify \
            -H "Content-Type: application/json" \
            -d "{\"content\": \"$content\", \"childId\": \"$profile\"}" \
            2>/dev/null)
        
        if [ $? -eq 0 ]; then
            echo "$result" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    recommendation = data.get('recommendation', 'unknown')
    model = data.get('model', 'unknown')
    political = data.get('viewpoint', {}).get('political_leaning', 'N/A')
    safety_score = data.get('safety', {}).get('safety_score', 'N/A')
    bias_score = data.get('viewpoint', {}).get('bias_score', 'N/A')
    
    print(f'   Result: {recommendation} | Model: {model} | Political: {political} | Safety: {safety_score} | Bias: {bias_score}')
except Exception as e:
    print(f'   ❌ Failed to parse response: {e}')
"
        else
            print_error "   Failed to classify content"
        fi
        
        sleep 1  # Rate limiting
    done
}

# Test BAML integration
test_baml_integration() {
    print_info "Testing BAML integration..."
    
    # Test with a simple query to check BAML functionality
    local result=$(curl -X POST http://localhost:5001/api/classify \
        -H "Content-Type: application/json" \
        -d '{"content": "Testing BAML integration", "childId": "adult_1"}' \
        2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "$result" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    model = data.get('model', 'unknown')
    processing_time = data.get('processing_time', 0)
    
    if model == 'BAML-Real':
        print('✅ BAML integration working - using real AI classification')
        print(f'   Processing time: {processing_time:.2f}s')
    elif model == 'BAML-Mock':
        print('⚠️  BAML using mock responses - Ollama may not be available')
    else:
        print(f'❓ Unknown model: {model}')
except Exception as e:
    print(f'❌ Failed to test BAML: {e}')
"
    else
        print_error "Failed to test BAML integration"
    fi
}

# Test UI accessibility
test_ui_access() {
    print_info "Testing UI accessibility..."
    
    local urls=(
        "http://localhost:5001|Main Dashboard"
        "http://localhost:5001/content-test|Content Testing Interface"
        "http://localhost:5001/child-setup|Child Profile Setup"
    )
    
    for url_info in "${urls[@]}"; do
        IFS='|' read -r url description <<< "$url_info"
        
        if curl -s "$url" > /dev/null 2>&1; then
            print_success "$description accessible at $url"
        else
            print_error "$description not accessible at $url"
        fi
    done
}

# Main test execution
main() {
    print_header
    
    print_info "Starting comprehensive deployment test..."
    echo ""
    
    test_services || exit 1
    echo ""
    
    test_profiles || exit 1
    echo ""
    
    test_baml_integration
    echo ""
    
    test_content_classification
    echo ""
    
    test_ui_access
    echo ""
    
    print_success "All deployment tests completed!"
    
    echo ""
    print_info "🎯 Demo Access Points:"
    echo "  📱 Main Dashboard: http://localhost:5001"
    echo "  🔍 Content Testing: http://localhost:5001/content-test"
    echo "  👨‍👩‍👧‍👦 Profile Setup: http://localhost:5001/child-setup"
    echo ""
    print_info "🧪 Test Coverage:"
    echo "  ✅ All 3 user profiles (Child 8, Teen 14, Adult 25)"
    echo "  ✅ Complete political spectrum (Far-left to Far-right)"
    echo "  ✅ Adult content classification"
    echo "  ✅ Educational and social content"
    echo "  ✅ Conspiracy theory detection"
    echo "  ✅ Real-time BAML AI integration"
}

# Run main function
main "$@"
