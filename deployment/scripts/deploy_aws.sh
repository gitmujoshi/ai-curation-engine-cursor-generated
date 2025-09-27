#!/bin/bash

# ===============================================
# AI Curation Engine - AWS Deployment Script
# ===============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TERRAFORM_DIR="$PROJECT_ROOT/terraform/aws"

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}   AI Curation Engine - AWS Deployment ${NC}"
    echo -e "${BLUE}========================================${NC}"
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

check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is required but not installed"
        echo "Install it from: https://aws.amazon.com/cli/"
        exit 1
    fi
    print_info "✓ AWS CLI: $(aws --version)"
    
    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is required but not installed"
        echo "Install it from: https://terraform.io/downloads"
        exit 1
    fi
    print_info "✓ Terraform: $(terraform version | head -1)"
    
    # Check jq
    if ! command -v jq &> /dev/null; then
        print_warning "jq not found - install for better output formatting"
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured"
        echo "Run: aws configure"
        exit 1
    fi
    print_info "✓ AWS credentials configured"
    
    echo ""
}

create_terraform_vars() {
    local environment=$1
    local region=$2
    local key_pair=$3
    local domain=$4
    
    print_step "Creating Terraform variables file..."
    
    cat > "$TERRAFORM_DIR/terraform.tfvars" << EOF
# AI Curation Engine - AWS Deployment Variables
# Generated on $(date)

# Environment Configuration
environment    = "$environment"
project_name   = "ai-curation-engine"
owner          = "$(whoami)"
aws_region     = "$region"

# Compute Configuration
instance_type     = "${INSTANCE_TYPE:-t3.large}"
key_pair_name     = "$key_pair"
min_instances     = ${MIN_INSTANCES:-1}
max_instances     = ${MAX_INSTANCES:-3}
desired_instances = ${DESIRED_INSTANCES:-2}

# Database Configuration
db_instance_class        = "${DB_INSTANCE_CLASS:-db.t3.micro}"
db_allocated_storage     = ${DB_ALLOCATED_STORAGE:-20}
db_max_allocated_storage = ${DB_MAX_ALLOCATED_STORAGE:-100}

# Networking
vpc_cidr = "${VPC_CIDR:-10.0.0.0/16}"

# Domain (optional)
domain_name = "$domain"

# Application Configuration
app_config = {
  baml_log_level              = "ERROR"
  boundary_telemetry_disabled = true
  ollama_timeout_ms           = 60000
  enable_caching              = true
  default_strategy            = "hybrid"
}

# Model Configuration
ollama_models = ["llama3.2", "llama3.1"]
model_storage_size = ${MODEL_STORAGE_SIZE:-50}

# Monitoring
enable_monitoring = ${ENABLE_MONITORING:-true}
log_retention_days = ${LOG_RETENTION_DAYS:-7}

# Backup
backup_retention_days = ${BACKUP_RETENTION_DAYS:-7}
EOF

    print_info "✓ Created terraform.tfvars"
    echo ""
}

deploy_infrastructure() {
    print_step "Deploying infrastructure with Terraform..."
    
    cd "$TERRAFORM_DIR"
    
    # Initialize Terraform
    print_info "Initializing Terraform..."
    terraform init
    
    # Plan deployment
    print_info "Planning deployment..."
    terraform plan -out=tfplan
    
    # Confirm deployment
    echo ""
    read -p "Do you want to apply this deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled"
        exit 0
    fi
    
    # Apply deployment
    print_info "Applying deployment..."
    terraform apply tfplan
    
    print_success "Infrastructure deployed successfully!"
    echo ""
}

display_outputs() {
    print_step "Deployment information..."
    
    cd "$TERRAFORM_DIR"
    
    # Get outputs
    local app_url=$(terraform output -raw application_url 2>/dev/null || echo "Not available")
    local content_tester_url=$(terraform output -raw content_tester_url 2>/dev/null || echo "Not available")
    local health_url=$(terraform output -raw health_check_url 2>/dev/null || echo "Not available")
    local api_url=$(terraform output -raw api_base_url 2>/dev/null || echo "Not available")
    
    echo -e "${BLUE}🎯 Application URLs:${NC}"
    echo "   📱 Main App:       $app_url"
    echo "   🧪 Content Tester: $content_tester_url"
    echo "   ❤️ Health Check:   $health_url"
    echo "   🔧 API Base:       $api_url"
    echo ""
    
    echo -e "${BLUE}🧪 Test Commands:${NC}"
    if command -v jq &> /dev/null; then
        echo "   curl -s \"$health_url\" | jq"
        echo "   curl -X POST \"$api_url/classify\" -H 'Content-Type: application/json' -d '{\"content\": \"Test content\", \"childId\": \"child_1\"}' | jq"
    else
        echo "   curl -s \"$health_url\""
        echo "   curl -X POST \"$api_url/classify\" -H 'Content-Type: application/json' -d '{\"content\": \"Test content\", \"childId\": \"child_1\"}'"
    fi
    echo ""
    
    echo -e "${BLUE}📊 Management:${NC}"
    echo "   View logs:    aws logs tail \$(terraform output -raw log_group_name) --follow"
    echo "   SSH access:   aws ec2-instance-connect ssh --instance-id <instance-id>"
    echo "   Destroy:      terraform destroy"
    echo ""
}

test_deployment() {
    print_step "Testing deployment..."
    
    cd "$TERRAFORM_DIR"
    
    local health_url=$(terraform output -raw health_check_url 2>/dev/null)
    
    if [ -n "$health_url" ] && [ "$health_url" != "Not available" ]; then
        print_info "Testing health endpoint..."
        
        # Wait for deployment to be ready
        local max_attempts=30
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if curl -s "$health_url" > /dev/null 2>&1; then
                print_success "✓ Application is responding"
                
                if command -v jq &> /dev/null; then
                    echo ""
                    print_info "Health check response:"
                    curl -s "$health_url" | jq
                fi
                break
            else
                print_info "Waiting for application... (attempt $attempt/$max_attempts)"
                sleep 30
                ((attempt++))
            fi
        done
        
        if [ $attempt -gt $max_attempts ]; then
            print_warning "Application may still be starting up. Check the health URL manually."
        fi
    else
        print_warning "Unable to get health check URL from Terraform outputs"
    fi
    
    echo ""
}

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Deploy AI Curation Engine to AWS"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV     Environment (dev, staging, production) [default: dev]"
    echo "  -r, --region REGION       AWS region [default: us-west-2]"
    echo "  -k, --key-pair KEY        AWS Key Pair name (required)"
    echo "  -d, --domain DOMAIN       Domain name (optional)"
    echo "  --skip-test              Skip deployment testing"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  INSTANCE_TYPE            EC2 instance type [default: t3.large]"
    echo "  DB_INSTANCE_CLASS        RDS instance class [default: db.t3.micro]"
    echo "  MIN_INSTANCES            Minimum instances [default: 1]"
    echo "  MAX_INSTANCES            Maximum instances [default: 3]"
    echo "  DESIRED_INSTANCES        Desired instances [default: 2]"
    echo "  MODEL_STORAGE_SIZE       Model storage size in GB [default: 50]"
    echo ""
    echo "Examples:"
    echo "  $0 --environment dev --region us-west-2 --key-pair my-key"
    echo "  $0 -e production -r us-east-1 -k prod-key -d example.com"
    echo ""
}

main() {
    # Default values
    local environment="dev"
    local region="us-west-2"
    local key_pair=""
    local domain=""
    local skip_test=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                environment="$2"
                shift 2
                ;;
            -r|--region)
                region="$2"
                shift 2
                ;;
            -k|--key-pair)
                key_pair="$2"
                shift 2
                ;;
            -d|--domain)
                domain="$2"
                shift 2
                ;;
            --skip-test)
                skip_test=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # Validate required parameters
    if [ -z "$key_pair" ]; then
        print_error "AWS Key Pair name is required"
        usage
        exit 1
    fi
    
    print_header
    
    print_info "Deployment Configuration:"
    print_info "  Environment: $environment"
    print_info "  Region: $region"
    print_info "  Key Pair: $key_pair"
    print_info "  Domain: ${domain:-"Not specified"}"
    echo ""
    
    check_prerequisites
    create_terraform_vars "$environment" "$region" "$key_pair" "$domain"
    deploy_infrastructure
    display_outputs
    
    if [ "$skip_test" != true ]; then
        test_deployment
    fi
    
    print_success "🎉 AWS deployment completed successfully!"
    print_info "Access your application at the URLs listed above."
}

# Run main function
main "$@"
