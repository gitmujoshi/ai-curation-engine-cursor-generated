# Repository Structure - Professional Organization

**AI Content Curation Engine - Google Engineering Standards**

This document outlines the professional repository structure following Google engineering team best practices for scalability, maintainability, and clear separation of concerns.

## 🏗️ **Repository Organization**

```
ai-curation-engine/
├── README.md                          # Main project overview
├── LICENSE                            # MIT License
├── .gitignore                         # Git ignore rules
├── REPOSITORY_STRUCTURE.md            # This file
│
├── docs/                              # 📚 Documentation Hub
│   ├── README.md                      # Documentation index
│   ├── papers/                        # Technical papers and research
│   │   ├── TECHNICAL_PAPER_BAML_ARCHITECTURE.md
│   │   ├── BAML_INTEGRATION_TECHNICAL_PAPER.md
│   │   └── TECHNICAL_PAPER_BAML_ARCHITECTURE.html
│   ├── guides/                        # User and developer guides
│   │   ├── LOCAL_DEPLOYMENT_GUIDE.md
│   │   ├── REAL_PROJECT_OVERVIEW.md
│   │   ├── DEMO_GUIDE.md
│   │   ├── STRATEGY_DEMO_GUIDE.md
│   │   ├── BAML_IMPLEMENTATION_STATUS.md
│   │   ├── BAML_LOGGING_GUIDE.md
│   │   ├── integration/               # Integration documentation
│   │   │   ├── BoundaryML_Integration_README.md
│   │   │   ├── INTEGRATION_COMPLETE.md
│   │   │   ├── GITHUB_SETUP_INSTRUCTIONS.md
│   │   │   └── UNIVERSAL_INTEGRATION_EXPANSION.md
│   │   └── publishing/                # Publishing and distribution
│   │       └── CREATE_PDF_INSTRUCTIONS.md
│   ├── api/                          # API documentation
│   │   └── APP_URLS_COMPLETE.md
│   └── architecture/                  # System architecture
│       ├── AI_Curation_Engine_Architecture.md
│       ├── Advanced_Architecture_Diagrams.md
│       └── PRODUCTION_CURATION_ARCHITECTURE.md
│
├── src/                              # 💻 Source Code
│   ├── core/                         # Core engine implementation
│   │   ├── baml_client/              # Generated BAML TypeScript client
│   │   ├── baml_client_python/       # Generated BAML Python client
│   │   └── baml_types.ts             # TypeScript type definitions
│   ├── api/                          # Backend API services
│   │   └── integrated-backend/       # Integrated backend service
│   └── ui/                           # Frontend applications
│       ├── demo-frontend/            # Main demo application
│       ├── curation-engine/          # Advanced UI application
│       ├── test-app/                 # Test application
│       └── components/               # Shared UI components
│           └── enhanced-child-profile-setup.jsx
│
├── tools/                            # 🔧 Development & Deployment Tools
│   ├── scripts/                      # Automation scripts
│   │   ├── deploy_local.sh          # Local deployment
│   │   ├── start_local.sh           # Start services
│   │   ├── stop_local.sh            # Stop services
│   │   ├── health_check.sh          # Health monitoring
│   │   ├── status_check.sh          # Status verification
│   │   ├── build_and_test.sh        # Build and test automation
│   │   ├── test_deployment.sh       # Deployment testing
│   │   ├── setup_baml.sh            # BAML setup
│   │   ├── create_pdf.py            # PDF generation
│   │   ├── curation_engine_pluggable.py  # Core engine module
│   │   ├── BAML_Integration_Implementation.py
│   │   ├── BAML_Integration_Real.py
│   │   ├── BoundaryML_Integration_Implementation.py
│   │   ├── ollama_proxy.py          # Ollama proxy service
│   │   ├── start_baml_logging.py    # Logging utilities
│   │   ├── test_demo_setup.py       # Demo testing
│   │   └── extract_baml_logs.sh     # Log extraction
│   ├── deployment/                   # Deployment configurations
│   │   └── deployment/
│   │       ├── docs/
│   │       │   └── CLOUD_DEPLOYMENT_GUIDE.md
│   │       └── scripts/
│   │           └── deploy_aws.sh
│   └── testing/                      # Testing utilities
│
├── config/                           # ⚙️ Configuration Files
│   ├── baml_src/                     # BAML source definitions
│   │   └── content_classification.baml
│   ├── environments/                 # Environment-specific configs
│   └── policies/                     # Content curation policies
│
├── infra/                            # 🏢 Infrastructure as Code
│   ├── terraform/                    # Multi-cloud infrastructure
│   │   ├── TERRAFORM_ARCHITECTURE.md
│   │   ├── aws/                      # AWS deployment
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── azure/                    # Azure deployment
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── oci/                      # Oracle Cloud deployment
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   └── modules/                  # Reusable Terraform modules
│   │       ├── ai-curation-app/
│   │       ├── networking/
│   │       ├── security/
│   │       ├── storage/
│   │       └── compute/
│   └── kubernetes/                   # Container orchestration
│
├── research/                         # 🔬 Research & Analysis
│   ├── papers/                       # Research papers
│   │   └── LINKEDIN_POST.md
│   ├── case-studies/                 # Implementation case studies
│   │   └── AI_ASSISTED_DEVELOPMENT_CASE_STUDY.md
│   └── data-analysis/                # Performance and usage analysis
│       ├── PAPER_STATISTICS_SOURCE.md
│       ├── PAPER_TITLE_OPTIONS.md
│       ├── REFERENCES_ACADEMIC_INTEGRITY_ISSUE.md
│       └── CUSTOM_INPUT_ENHANCEMENT.md
│
├── examples/                         # 📖 Example Implementations
│   ├── quick-start/                  # Getting started examples
│   ├── integration/                  # Integration patterns
│   └── tutorials/                    # Step-by-step tutorials
│
├── tests/                            # 🧪 Test Suites
│   ├── unit/                         # Unit tests
│   ├── integration/                  # Integration tests
│   └── e2e/                          # End-to-end tests
│
├── build/                            # 🔨 Build & CI/CD
│   ├── docker/                       # Container definitions
│   │   └── docker-compose.yml
│   ├── ci-cd/                        # Continuous integration
│   ├── BAML_COLLECTOR_UPDATE.md     # Build documentation
│   ├── BAML_UPDATE_SUMMARY.md
│   ├── DIAGRAM_UPDATES_SUMMARY.md
│   └── UI_ENHANCEMENTS_SUMMARY.md
│
├── data/                             # 📊 Runtime Data
│   ├── logs/                         # Application logs
│   └── cache/                        # Performance cache
│
└── venv/                             # 🐍 Python virtual environment
```

## 🎯 **Google Engineering Standards Applied**

### **1. Clear Separation of Concerns**

**Source Code (`src/`)**
- `core/` - Business logic and BAML integration
- `api/` - Backend services and APIs  
- `ui/` - Frontend applications and components

**Development Tools (`tools/`)**
- `scripts/` - Automation and deployment scripts
- `deployment/` - Deployment configurations and guides
- `testing/` - Testing utilities and frameworks

**Infrastructure (`infra/`)**
- `terraform/` - Infrastructure as Code for multiple clouds
- `kubernetes/` - Container orchestration configurations

### **2. Documentation-First Approach**

**Hierarchical Documentation (`docs/`)**
- `papers/` - Technical research and academic papers
- `guides/` - User and developer documentation
- `api/` - API reference and integration guides
- `architecture/` - System design and architecture

**Audience-Specific Organization**
- **Families/Educators**: guides/DEMO_GUIDE.md → guides/LOCAL_DEPLOYMENT_GUIDE.md
- **Developers**: api/ → guides/integration/ → papers/BAML_INTEGRATION_TECHNICAL_PAPER.md
- **Researchers**: papers/ → research/ → architecture/
- **Operations**: infra/ → tools/deployment/ → guides/

### **3. Configuration Management**

**Environment Separation (`config/`)**
- `baml_src/` - BAML source definitions
- `environments/` - Environment-specific configurations
- `policies/` - Content curation policies and rules

### **4. Research and Analysis Tracking**

**Research Repository (`research/`)**
- `papers/` - Published research and analysis
- `case-studies/` - Real-world implementation studies
- `data-analysis/` - Performance metrics and statistics

### **5. Build and Deployment Pipeline**

**Automated Build System (`build/`)**
- `docker/` - Containerization configurations
- `ci-cd/` - Continuous integration pipelines
- Build summaries and update documentation

## 🚀 **Navigation Paths**

### **For New Users**
1. **README.md** - Project overview and quick start
2. **docs/guides/DEMO_GUIDE.md** - See system in action
3. **docs/guides/LOCAL_DEPLOYMENT_GUIDE.md** - Set up locally

### **For Developers**
1. **docs/api/APP_URLS_COMPLETE.md** - API reference
2. **docs/guides/integration/** - Integration patterns
3. **src/core/** - Core implementation

### **For Researchers**
1. **docs/papers/** - Technical papers
2. **research/case-studies/** - Implementation analysis
3. **docs/architecture/** - System design

### **For Operations**
1. **infra/terraform/** - Infrastructure deployment
2. **tools/scripts/** - Automation scripts
3. **tools/deployment/** - Deployment guides

## 📋 **Benefits of This Structure**

### **Scalability**
- Clear boundaries between components
- Easy to add new features without conflicts
- Modular architecture supports team growth

### **Maintainability**  
- Logical organization reduces cognitive load
- Consistent naming conventions
- Clear ownership and responsibility

### **Discoverability**
- Intuitive directory structure
- Comprehensive documentation index
- Audience-specific navigation paths

### **Professional Standards**
- Follows Google engineering best practices
- Enterprise-ready organization
- Production deployment patterns

## 🔄 **Migration Benefits**

### **Before Reorganization**
- 52 files scattered in root directory
- Mixed purposes (scripts, docs, source, config)
- Difficult to navigate for new contributors
- No clear structure for different audiences

### **After Reorganization**
- Professional directory hierarchy
- Clear separation of concerns
- Audience-specific documentation paths
- Enterprise-ready structure
- Easy onboarding for developers and users

This structure positions the AI Content Curation Engine as a professional, enterprise-ready project that can scale with team growth and organizational needs while maintaining clarity and accessibility for all stakeholders.
