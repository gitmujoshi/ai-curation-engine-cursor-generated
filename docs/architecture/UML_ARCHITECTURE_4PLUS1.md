# 🎯 AI Curation Engine - 4+1 Architecture Views

## Overview

This document provides the **4+1 architectural view model** using **Mermaid diagrams** for the AI Curation Engine. The 4+1 views provide comprehensive system understanding from different perspectives.

---

## 📐 The 4+1 Architectural Views

1. **Logical View** - Functional requirements and domain model
2. **Process View** - Dynamic behavior and runtime interactions  
3. **Development View** - Software structure and organization
4. **Physical View** - Deployment and infrastructure
5. **+1 Scenarios** - Key application flows

---

## 1️⃣ Logical View: Use Case & Class Models

### 1.1 Use Case Diagram

**Purpose**: This diagram illustrates the primary actors and their interactions with the AI Curation Engine system, showing who uses the system and what they can do.

**Actors**: Parent/Guardian, Child/User, System Administrator, Compliance Officer, Content Platform

**Description**: The use case diagram identifies five key actors and their associated use cases. Parents/Guardians manage child profiles and safety settings. Children access and view filtered content. System Administrators configure the underlying AI models and policies. Compliance Officers audit decisions and generate regulatory reports. Content Platforms submit content for classification and receive filtering results. Each actor is represented as a circle (UML actor notation), and use cases are shown as double circles with dashed borders.

```mermaid
graph LR
    %% Actors
    PARENT((👨‍👩‍👧 Parent))
    CHILD((🧒 Child))
    ADMIN((👤 Admin))
    COMP((⚖️ Compliance))
    PLAT((🌐 Platform))
    
    %% Parent Use Cases
    UC1(("Create Child<br/>Profile"))
    UC2(("Configure<br/>Safety Rules"))
    UC3(("Monitor<br/>Activity"))
    UC4(("Adjust<br/>Filters"))
    UC5(("Review<br/>Reports"))
    
    %% Child Use Cases  
    UC6(("Access<br/>Content"))
    UC7(("View Filtered<br/>Content"))
    UC8(("Request<br/>Override"))
    
    %% Admin Use Cases
    UC9(("Manage<br/>Policies"))
    UC10(("Configure<br/>LLM Models"))
    UC11(("Monitor<br/>Performance"))
    UC12(("Update<br/>Strategies"))
    
    %% Compliance Use Cases
    UC13(("Audit<br/>Decisions"))
    UC14(("Generate<br/>Reports"))
    
    %% Platform Use Cases
    UC15(("Submit<br/>Content"))
    UC16(("Receive<br/>Classification"))
    
    %% Parent Relationships
    PARENT --> UC1
    PARENT --> UC2
    PARENT --> UC3
    PARENT --> UC4
    PARENT --> UC5
    
    %% Child Relationships
    CHILD --> UC6
    CHILD --> UC7
    CHILD --> UC8
    
    %% Admin Relationships
    ADMIN --> UC9
    ADMIN --> UC10
    ADMIN --> UC11
    ADMIN --> UC12
    
    %% Compliance Relationships
    COMP --> UC13
    COMP --> UC14
    
    %% Platform Relationships
    PLAT --> UC15
    PLAT --> UC16
    
    %% Styling
    style PARENT fill:#e8f5e9,stroke:#4caf50,stroke-width:3px,color:#000
    style CHILD fill:#fff3e0,stroke:#ff9800,stroke-width:3px,color:#000
    style ADMIN fill:#e3f2fd,stroke:#2196f3,stroke-width:3px,color:#000
    style COMP fill:#f3e5f5,stroke:#9c27b0,stroke-width:3px,color:#000
    style PLAT fill:#fce4ec,stroke:#e91e63,stroke-width:3px,color:#000
    
    style UC1 fill:#fff,stroke:#4caf50,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style UC2 fill:#fff,stroke:#4caf50,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style UC3 fill:#fff,stroke:#4caf50,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style UC4 fill:#fff,stroke:#4caf50,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style UC5 fill:#fff,stroke:#4caf50,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    
    style UC6 fill:#fff,stroke:#ff9800,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style UC7 fill:#fff,stroke:#ff9800,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style UC8 fill:#fff,stroke:#ff9800,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    
    style UC9 fill:#fff,stroke:#2196f3,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style UC10 fill:#fff,stroke:#2196f3,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style UC11 fill:#fff,stroke:#2196f3,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style UC12 fill:#fff,stroke:#2196f3,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    
    style UC13 fill:#fff,stroke:#9c27b0,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style UC14 fill:#fff,stroke:#9c27b0,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    
    style UC15 fill:#fff,stroke:#e91e63,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style UC16 fill:#fff,stroke:#e91e63,stroke-width:2px,stroke-dasharray: 5 5,color:#000
```

### 1.2 Core Class Model

**Purpose**: This class diagram shows the core domain entities, their attributes, methods, and relationships that form the foundation of the AI Curation Engine.

**Domain Entities and Relationships**

**Description**: The class model illustrates the object-oriented design with key entities including User management (User, ChildProfile, UserPreferences), Content Curation (CurationEngine, Strategy implementations, CurationResult), BAML Integration (RealBAMLContentAnalyzer, UserContext, ClassificationResult), Compliance (ComplianceHandler implementations for different jurisdictions), and Gateway Integration (GatewayProxy, ProfileManager, DecisionEngine). Relationships show inheritance (Strategy pattern), composition (Engine has Strategies), and associations (User has ChildProfiles). This design enables pluggable curation strategies, multi-jurisdiction compliance, and flexible content filtering.

```mermaid
classDiagram
    class User {
        -UUID id
        -String email
        -String firstName
        -String lastName
        -String role
        -UserStatus status
        +authenticate()
        +getProfile()
        +updateProfile()
    }
    
    class ChildProfile {
        -UUID id
        -UUID parentId
        -String name
        -Integer age
        -List~String~ vulnerabilities
        -SafetyLevel safetyLevel
        -TimeLimits timeLimits
        +updateSafetyLevel()
        +getPreferences()
    }
    
    class CurationEngine {
        -CurationStrategy strategy
        -RealBAMLContentAnalyzer llmAnalyzer
        -FastFilterLayer fastFilters
        +curateContent(content, profile)
        +switchStrategy(strategy)
        +getRecommendation()
    }
    
    class CurationStrategy {
        <<abstract>>
        +analyzeContent()*
        +getStrategyName()*
    }
    
    class LLMOnlyStrategy {
        -RealBAMLContentAnalyzer analyzer
        +analyzeContent()
        +getStrategyName()
    }
    
    class MultiLayerStrategy {
        -FastFilterLayer fastFilters
        -RealBAMLContentAnalyzer analyzer
        +analyzeContent()
        +getStrategyName()
    }
    
    class HybridStrategy {
        -LLMOnlyStrategy llmStrategy
        -MultiLayerStrategy multiStrategy
        +analyzeContent()
        +getStrategyName()
    }
    
    class RealBAMLContentAnalyzer {
        -Collector collector
        -File logFile
        +comprehensiveAnalysis()
        +classifySafety()
        +classifyEducational()
        +classifyViewpoint()
        +createUserContext()
    }
    
    class CurationResult {
        -String action
        -String reason
        -Float confidence
        -Float safetyScore
        -Integer processingTime
        -String strategy
        +toJSON()
    }
    
    class ComplianceHandler {
        <<interface>>
        +validateAgeVerification()*
        +ensureDataLocalization()*
        +provideTransparency()*
    }
    
    class GDPRHandler {
        +validateAgeVerification()
        +ensureDataLocalization()
        +provideTransparency()
    }
    
    class COPPAHandler {
        +validateAgeVerification()
        +provideTransparency()
    }
    
    class GatewayProxy {
        -String curationAPI
        -ClientSession session
        +handleRequest()
        +checkContent()
        +forwardRequest()
        +blockResponse()
    }
    
    class ProfileManager {
        -MongoDB db
        -Map~UUID,Profile~ profiles
        +createProfile()
        +getProfile()
        +updatePolicy()
        +checkTimeLimits()
    }
    
    User "1" --> "*" ChildProfile : has
    CurationEngine "1" --> "1" CurationStrategy : uses
    CurationStrategy <|-- LLMOnlyStrategy
    CurationStrategy <|-- MultiLayerStrategy
    CurationStrategy <|-- HybridStrategy
    
    LLMOnlyStrategy --> RealBAMLContentAnalyzer : uses
    MultiLayerStrategy --> RealBAMLContentAnalyzer : uses
    
    CurationEngine --> CurationResult : returns
    GatewayProxy --> CurationEngine : calls
    GatewayProxy --> ProfileManager : uses
    
    ComplianceHandler <|.. GDPRHandler
    ComplianceHandler <|.. COPPAHandler
```

### 1.3 Business Domain Model

**Purpose**: This simplified class diagram shows the core business concepts and relationships without technical implementation details, focusing on the domain language and business rules.

**Business Entities and Relationships**

**Description**: The business domain model represents the real-world concepts in the AI content curation domain. A **Family** consists of a **Guardian** (parent) who manages multiple **Dependents** (children or vulnerable adults). Each Dependent has a **SafetyProfile** defining their protection level, content preferences, and usage limits. **Content** from various **Sources** (platforms, websites) is evaluated by the **CurationService** which applies **SafetyRules** and **ComplianceRequirements** based on the Dependent's profile and jurisdiction. The service produces a **CurationDecision** (Allow/Block/Caution) with reasoning. **ActivityLogs** track all content access for monitoring and reporting. This model focuses on business concepts rather than technical implementation, making it accessible to non-technical stakeholders.

```mermaid
classDiagram
    class Family {
        +String familyId
        +String familyName
        +Date createdDate
    }
    
    class Guardian {
        +String guardianId
        +String name
        +String email
        +String jurisdiction
        +verifyIdentity()
        +manageDependents()
        +reviewActivity()
    }
    
    class Dependent {
        +String dependentId
        +String name
        +Integer age
        +VulnerabilityType type
        +accessContent()
        +requestOverride()
    }
    
    class SafetyProfile {
        +ProtectionLevel level
        +List~ContentCategory~ allowedCategories
        +List~ContentCategory~ blockedCategories
        +TimeLimit dailyLimit
        +TimeLimit sessionLimit
        +Boolean requireApproval
    }
    
    class Content {
        +String contentId
        +String title
        +String source
        +ContentType type
        +String description
        +Date publishedDate
    }
    
    class ContentSource {
        +String sourceId
        +String name
        +SourceType type
        +TrustLevel trustLevel
    }
    
    class CurationService {
        +evaluateContent()
        +applyRules()
        +checkCompliance()
        +makeDecision()
    }
    
    class SafetyRule {
        +String ruleId
        +String name
        +RuleType type
        +Severity severity
        +evaluate()
    }
    
    class ComplianceRequirement {
        +String requirementId
        +Jurisdiction jurisdiction
        +RegulationType type
        +enforce()
    }
    
    class CurationDecision {
        +DecisionType decision
        +Float confidenceScore
        +String reasoning
        +List~String~ appliedRules
        +Date timestamp
    }
    
    class ActivityLog {
        +String logId
        +Date timestamp
        +String contentAccessed
        +DecisionType decision
        +Duration timeSpent
    }
    
    class VulnerabilityType {
        <<enumeration>>
        CHILD
        ELDERLY
        COGNITIVE_IMPAIRMENT
        FINANCIAL_VULNERABILITY
    }
    
    class ProtectionLevel {
        <<enumeration>>
        MINIMAL
        MODERATE
        STRICT
        MAXIMUM
    }
    
    class DecisionType {
        <<enumeration>>
        ALLOW
        BLOCK
        CAUTION
        REQUIRE_APPROVAL
    }
    
    %% Relationships
    Family "1" --> "1..*" Guardian : has
    Family "1" --> "0..*" Dependent : protects
    Guardian "1" --> "0..*" Dependent : manages
    Dependent "1" --> "1" SafetyProfile : has
    
    Content "1" --> "1" ContentSource : from
    
    CurationService --> Content : evaluates
    CurationService --> SafetyProfile : applies
    CurationService --> SafetyRule : uses
    CurationService --> ComplianceRequirement : enforces
    CurationService --> CurationDecision : produces
    
    Dependent "1" --> "0..*" ActivityLog : generates
    ActivityLog --> Content : references
    ActivityLog --> CurationDecision : records
    
    SafetyProfile --> ProtectionLevel : uses
    Dependent --> VulnerabilityType : classified_as
    CurationDecision --> DecisionType : has
    
    %% Styling
    style Family fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,color:#000
    style Guardian fill:#e3f2fd,stroke:#2196f3,stroke-width:2px,color:#000
    style Dependent fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000
    style SafetyProfile fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px,color:#000
    style Content fill:#fce4ec,stroke:#e91e63,stroke-width:2px,color:#000
    style CurationService fill:#fff9c4,stroke:#fbc02d,stroke-width:3px,color:#000
    style CurationDecision fill:#c8e6c9,stroke:#66bb6a,stroke-width:2px,color:#000
    style VulnerabilityType fill:#ffecb3,stroke:#ffa726,stroke-width:2px,color:#000
    style ProtectionLevel fill:#d1c4e9,stroke:#7e57c2,stroke-width:2px,color:#000
    style DecisionType fill:#b2dfdb,stroke:#26a69a,stroke-width:2px,color:#000
```

---

## 2️⃣ Process View: Sequence Diagrams

### 2.1 Content Classification Flow

**Purpose**: This sequence diagram shows the real-time content classification process from user request to final decision.

**Real-Time Processing Sequence**

**Description**: This diagram illustrates the complete flow when a user requests content. The Gateway Proxy intercepts the request, retrieves the user's profile and policies from the Profile Manager, then sends the content to the Curation Engine. The Engine selects an appropriate strategy and uses the LLM Analyzer to perform comprehensive content analysis (safety, educational value, viewpoint). The Decision Engine evaluates the results against the user's policy and either allows or blocks the content. The entire process typically completes in 5-10 seconds, providing real-time protection while maintaining a reasonable user experience.

```mermaid
sequenceDiagram
    participant User as User Device
    participant Gateway as Gateway Proxy
    participant Profile as Profile Manager
    participant Engine as Curation Engine
    participant Router as Strategy Router
    participant LLM as LLM Analyzer
    participant Decision as Decision Engine
    participant DB as MongoDB
    
    User->>Gateway: HTTP GET Request
    activate Gateway
    
    Gateway->>Gateway: Extract User ID
    Gateway->>Profile: getProfile(userId)
    activate Profile
    Profile->>DB: Query user profile
    DB-->>Profile: Profile data
    Profile-->>Gateway: UserProfile + Policies
    deactivate Profile
    
    Gateway->>Engine: checkContent(url, profile)
    activate Engine
    
    Engine->>Router: selectStrategy(content)
    activate Router
    Router->>Router: Assess complexity
    Router-->>Engine: Strategy Type
    deactivate Router
    
    Engine->>LLM: analyzeContent(content, profile)
    activate LLM
    LLM->>LLM: comprehensiveAnalysis()
    LLM->>LLM: classifySafety()
    LLM->>LLM: classifyEducational()
    LLM->>LLM: classifyViewpoint()
    LLM-->>Engine: ClassificationResult
    deactivate LLM
    
    Engine-->>Gateway: Analysis Result
    deactivate Engine
    
    Gateway->>Decision: decide(analysis, policy)
    activate Decision
    Decision->>Decision: Check safety score
    Decision->>Decision: Check categories
    Decision->>Decision: Check time limits
    Decision-->>Gateway: Decision {allow/block}
    deactivate Decision
    
    alt Decision = ALLOW
        Gateway->>DB: Log + Cache result
        Gateway-->>User: Forward to Internet
    else Decision = BLOCK
        Gateway->>DB: Log block event
        Gateway-->>User: Show block page
    end
    deactivate Gateway
```

### 2.2 Strategy Switching Flow

**Purpose**: This sequence diagram demonstrates how system administrators can dynamically switch between different curation strategies without system restart.

**Runtime Strategy Configuration**

**Description**: This diagram shows the hot-swapping capability of the curation engine. An administrator sends a strategy change request (LLM-Only, Multi-Layer, or Hybrid) to the Curation Engine. The Strategy Router stops the current strategy and initializes the new one. For the Hybrid strategy, it configures delegation rules to route complex cases to LLM analysis and simple cases to Multi-Layer filtering. The entire switch happens in real-time without interrupting ongoing content classification, allowing for adaptive performance tuning based on system load and accuracy requirements.

```mermaid
sequenceDiagram
    participant Admin as System Admin
    participant Engine as Curation Engine
    participant Router as Strategy Router
    participant LLM as LLM Strategy
    participant Multi as Multi-Layer
    participant Hybrid as Hybrid
    
    Admin->>Engine: POST /api/strategy {"strategy": "hybrid"}
    activate Engine
    
    Engine->>Router: switchStrategy("hybrid")
    activate Router
    
    Router->>Router: Stop current strategy
    Router->>Hybrid: initialize()
    
    alt Strategy = LLM-Only
        Router-->>LLM: Use LLM-Only
    else Strategy = Multi-Layer
        Router-->>Multi: Use Multi-Layer
    else Strategy = Hybrid
        Router-->>Hybrid: Use Hybrid
        Hybrid->>LLM: Delegate complex cases
        Hybrid->>Multi: Delegate simple cases
    end
    
    Router-->>Engine: Strategy Ready
    deactivate Router
    
    Engine-->>Admin: Success - Strategy switched
    deactivate Engine
    
    Note over Admin: Strategy change effective immediately<br/>No restart required
```

### 2.3 Multi-Layer Filtering Flow

**Purpose**: This sequence diagram illustrates the multi-layer filtering approach that optimizes performance by using fast filters before expensive LLM analysis.

**Hybrid Strategy Processing**

**Description**: This diagram shows how the Hybrid strategy processes content through multiple layers for optimal performance. First, Fast Filters perform quick pattern matching (50ms) to block obviously inappropriate content. If content passes, Specialized AI performs heuristic checks. Based on confidence levels, the system either returns a decision immediately (high confidence) or escalates to deep LLM analysis (low confidence or edge cases). The Result Aggregator combines all analyses to make the final decision. This multi-layer approach achieves 85% faster processing than pure LLM analysis while maintaining high accuracy.

```mermaid
sequenceDiagram
    participant Input as Content Input
    participant Engine as Curation Engine
    participant Fast as Fast Filter Layer
    participant AI as Specialized AI Layer
    participant LLM as LLM Analysis
    participant Agg as Result Aggregator
    
    Input->>+Engine: Submit content for curation
    
    Engine->>Fast: Check fast filters
    Fast->>Fast: Pattern matching
    Fast-->>Engine: Pattern check result
    
    alt BLOCK Decision
        Engine-->>-Input: Return BLOCK (50ms)
    else PASS Decision
        Engine->>AI: Specialized analysis
        activate AI
        AI->>AI: Heuristic checks
        AI-->>Engine: AI Classification
        deactivate AI
        
        Engine->>Engine: Evaluate confidence
        
        alt High Confidence
            Engine->>Agg: Aggregate results
            Agg-->>Engine: Final Decision
            Engine-->>-Input: Return decision
        else Low Confidence or Edge Case
            Engine->>LLM: Deep analysis
            activate LLM
            LLM->>LLM: LLM processing (5-7s)
            LLM-->>Engine: LLM Classification
            deactivate LLM
            
            Engine->>Agg: Aggregate all results
            Agg-->>Engine: Final Decision
            Engine-->>-Input: Return decision
        end
    end
```

---

## 3️⃣ Development View: Component Diagram

**Purpose**: This component diagram shows the software architecture, module organization, and dependencies between different layers of the system.

### Software Architecture and Module Organization

**Description**: The system is organized into four layers: Presentation Layer (Demo Frontend, Admin UI), Application Layer (Flask API, Gateway Service), Domain Layer (Curation Engine, Strategy Implementations, BAML Integration, Profile Manager, Compliance Engine), and Infrastructure Layer (Ollama Service, MongoDB, Redis, Logging). Components communicate through well-defined interfaces, with the Domain Layer containing the core business logic. This layered architecture enables separation of concerns, independent deployment of components, and easy testing. The diagram shows both synchronous (HTTP, internal calls) and asynchronous (caching, logging) communication patterns.

```mermaid
graph TB
    subgraph "Presentation Layer"
        Frontend[Demo Frontend<br/>Flask + HTML/JS]
        AdminUI[Admin UI<br/>Dashboard & Config]
    end
    
    subgraph "Application Layer"
        API[Flask API<br/>REST Endpoints]
        Gateway[Gateway Service<br/>Proxy + Filter]
    end
    
    subgraph "Domain Layer"
        Engine[Curation Engine<br/>Orchestration]
        Strategies[Strategy Implementations<br/>LLM/Multi/Hybrid]
        BAML[BAML Integration<br/>LLM Client]
        Profile[Profile Manager<br/>Users & Policies]
        Compliance[Compliance Engine<br/>GDPR/COPPA/LGPD]
    end
    
    subgraph "Infrastructure Layer"
        Ollama[Ollama Service<br/>LLM Runtime]
        MongoDB[(MongoDB<br/>Data Storage)]
        Redis[(Redis<br/>Cache)]
        Logs[Logging Service]
    end
    
    Frontend --> API
    AdminUI --> API
    Gateway --> Engine
    API --> Engine
    API --> Profile
    
    Engine --> Strategies
    Strategies --> BAML
    BAML --> Ollama
    
    Engine --> Profile
    Gateway --> Compliance
    Profile --> MongoDB
    Profile --> Redis
    
    Engine --> MongoDB
    Engine --> Redis
    Engine --> Logs
```

### Component Dependency Matrix

| Component | Depends On | Used By |
|-----------|-----------|---------|
| **Frontend** | Flask API | Users |
| **Flask API** | Curation Engine, Profile Manager | Frontend, AdminUI |
| **Gateway** | Curation Engine, Profile Manager | Users (indirect) |
| **Curation Engine** | Strategy Implementations, BAML | API, Gateway |
| **Strategies** | BAML Integration | Curation Engine |
| **BAML** | Ollama Service | Strategies |
| **Profile Manager** | MongoDB, Redis | API, Gateway |
| **Ollama** | None (external) | BAML |
| **MongoDB** | None | Profile Manager, Engine |
| **Redis** | None | Profile Manager, Engine |

---

## 4️⃣ Physical View: Deployment Diagrams

### 4.1 Local Development Deployment

**Purpose**: This deployment diagram shows how to run the entire system on a single development machine for testing and development.

**Single Machine Setup**

**Description**: For local development, all services run on localhost with different ports. The User Browser connects to Flask Dev Server (port 5001), which communicates with Ollama Service (port 11434) for LLM processing, MongoDB (local) for data storage, and Redis (local) for caching. This setup requires approximately 3-4GB for model downloads and 8GB RAM minimum. All services can be started with Docker Compose or run natively. This configuration is perfect for development, testing, and demonstration purposes without requiring cloud infrastructure.

```mermaid
graph TB
    subgraph "Local Machine"
        subgraph "Applications"
            Browser[User Browser<br/>localhost:5001]
        end
        
        subgraph "Services"
            Flask[Demo Frontend<br/>Flask :5001]
            Ollama[Ollama Server<br/>:11434]
            MongoDB[(MongoDB<br/>:27017)]
            Redis[(Redis<br/>:6379)]
        end
    end
    
    Browser --> Flask
    Flask --> Ollama
    Flask --> MongoDB
    Flask --> Redis
    
    style Flask fill:#4A90E2,stroke:#2D5F8F,stroke-width:2px,color:#fff
    style Ollama fill:#FFD93D,stroke:#CCAE31,stroke-width:2px,color:#000
    style MongoDB fill:#4DB33D,stroke:#2F7F2F,stroke-width:2px,color:#fff
    style Redis fill:#DC382D,stroke:#A92A21,stroke-width:2px,color:#fff
```

### 4.2 Docker Container Deployment

**Purpose**: This deployment diagram illustrates how the system runs in isolated Docker containers for consistent deployment across environments.

**Containerized Services**

**Description**: Docker deployment packages each service in its own container within a shared network. The demo-frontend container (Flask, port 5001) handles user requests, ollama-service container provides LLM processing (port 11434), mongodb container stores persistent data (port 27017), and curation-cache container (Redis, port 6379) handles caching. External users connect to the frontend container, which orchestrates calls to other services. This containerized approach provides isolation, easy scaling, simplified deployment, and version control. The entire stack can be launched with a single `docker-compose up` command.

```mermaid
graph TB
    subgraph "Docker Host"
        subgraph "Container Network"
            Frontend[demo-frontend<br/>Flask<br/>Port 5001]
            OllamaSV[ollama-service<br/>Ollama<br/>Port 11434]
            MongoDBCont[(mongodb<br/>MongoDB<br/>Port 27017)]
            RedisCont[(curation-cache<br/>Redis<br/>Port 6379)]
        end
    end
    
    Frontend --> OllamaSV
    Frontend --> MongoDBCont
    Frontend --> RedisCont
    
    User[External Users] --> Frontend
    
    style Frontend fill:#4A90E2,stroke:#2D5F8F,stroke-width:2px,color:#fff
    style OllamaSV fill:#FFD93D,stroke:#CCAE31,stroke-width:2px,color:#000
    style MongoDBCont fill:#4DB33D,stroke:#2F7F2F,stroke-width:2px,color:#fff
    style RedisCont fill:#DC382D,stroke:#A92A21,stroke-width:2px,color:#fff
```

### 4.3 Cloud Production Deployment

**Purpose**: This deployment diagram shows a production-ready, scalable cloud architecture on AWS with high availability and auto-scaling capabilities.

**AWS Multi-Tier Architecture**

**Description**: The production deployment uses AWS cloud services for enterprise-scale operation. Internet users connect through an Application Load Balancer (ALB) with SSL termination. An Auto Scaling Group manages multiple EC2 instances running the Flask application, automatically scaling based on load. GPU instances run Ollama for LLM processing with CUDA support. The private subnet contains managed databases: RDS PostgreSQL for profiles and logs, ElastiCache Redis for caching, and DocumentDB (MongoDB-compatible) for user data. S3 stores models and logs, while CloudWatch provides monitoring and logging. This architecture supports thousands of concurrent users with 99.9% uptime, automatic failover, and horizontal scaling.

```mermaid
graph TB
    subgraph "AWS Cloud Infrastructure"
        subgraph "Public Subnet"
            ALB[Application Load Balancer<br/>ALB with SSL]
            ASG[Auto Scaling Group<br/>EC2 Instances]
            EC2_1[EC2 Instance 1<br/>Flask App]
            EC2_2[EC2 Instance 2<br/>Flask App]
            EC2_3[EC2 Instance 3<br/>Flask App]
            GPU[GPU Instance<br/>Ollama LLM]
        end
        
        subgraph "Private Subnet"
            RDS[(RDS PostgreSQL<br/>Managed DB)]
            ElastiCache[(ElastiCache Redis<br/>Managed Cache)]
            DocDB[(DocumentDB<br/>MongoDB)]
        end
        
        subgraph "Storage & Monitoring"
            S3[S3 Bucket<br/>Models & Logs]
            CloudWatch[CloudWatch<br/>Monitoring]
            Logs[CloudWatch Logs]
        end
    end
    
    Internet[Internet Users] --> ALB
    ALB --> ASG
    ASG --> EC2_1
    ASG --> EC2_2
    ASG --> EC2_3
    
    EC2_1 --> GPU
    EC2_2 --> GPU
    EC2_3 --> GPU
    
    EC2_1 --> RDS
    EC2_1 --> ElastiCache
    EC2_1 --> DocDB
    EC2_1 --> S3
    
    EC2_1 --> CloudWatch
    EC2_1 --> Logs
    
    EC2_2 --> RDS
    EC2_3 --> RDS
    
    style ALB fill:#4A90E2,stroke:#2D5F8F,stroke-width:2px,color:#fff
    style ASG fill:#4DB33D,stroke:#2F7F2F,stroke-width:2px,color:#fff
    style GPU fill:#FFD93D,stroke:#CCAE31,stroke-width:2px,color:#000
    style RDS fill:#4DB33D,stroke:#2F7F2F,stroke-width:2px,color:#fff
    style S3 fill:#FF6B6B,stroke:#CC5555,stroke-width:2px,color:#fff
```

---

## +1 Scenarios: Key Application Flows

### Scenario 1: New User Onboarding

**Purpose**: This scenario demonstrates the complete user onboarding flow from initial registration through child profile setup.

**User Registration and Profile Setup**

**Description**: A new parent registers by providing email and password through the Registration UI. The system performs age verification using Zero-Knowledge Proof (ZKP) to confirm the user is an adult without storing sensitive identity data. After verification, the parent completes their profile with preferences and settings. They then add their first child profile, configuring safety levels, time limits, and content restrictions. The entire onboarding process takes approximately 6 minutes and results in a fully configured account ready for content filtering. The system stores all data in the database and displays the dashboard with demo data to help parents understand the interface.

```mermaid
sequenceDiagram
    participant P as New Parent
    participant UI as Registration UI
    participant API as Auth API
    participant AgeVer as Age Verification
    participant Profile as Profile Service
    participant Onboard as Onboarding Flow
    participant DB as Database
    
    P->>UI: Access registration page
    UI->>API: POST /register {email, password}
    API->>API: Validate inputs
    API->>DB: Check existing user
    API->>DB: Create user account
    API-->>UI: User created, auth token
    
    UI->>AgeVer: Initiate age verification
    AgeVer->>AgeVer: ZKP verification process
    AgeVer-->>UI: Verification complete
    
    UI->>Onboard: Start onboarding
    Onboard->>Profile: Complete parent profile
    Profile->>DB: Store parent profile
    Profile-->>Onboard: Profile created
    
    Onboard->>Profile: Add first child profile
    Profile->>DB: Store child profile
    Profile-->>Onboard: Child added
    
    Onboard->>Profile: Configure safety settings
    Profile->>DB: Save preferences
    Profile-->>Onboard: Configuration complete
    
    Onboard-->>UI: Onboarding complete
    UI->>P: Display dashboard
```

### Scenario 2: Real-Time Content Filtering

**Purpose**: This scenario shows the end-to-end process of real-time content classification when a child user attempts to access online content.

**Live Content Classification and Filtering**

**Description**: When a child opens an article URL, the Browser sends a request to the Gateway, which identifies the user profile. The Gateway forwards the content to the Curation Engine for classification. The LLM Analyzer performs comprehensive analysis including safety checks (2s), educational value assessment (2s), and age appropriateness evaluation (1s), totaling approximately 5 seconds. The Decision Engine then checks the results against the child's profile policy, including safety scores, category restrictions, time limits, and age appropriateness. Based on the decision, the system either displays the article or shows a filter page explaining why the content was blocked. This real-time protection operates transparently, providing immediate feedback to users.

```mermaid
sequenceDiagram
    participant C as Child User
    participant B as Browser
    participant G as Gateway Proxy
    participant E as Curation Engine
    participant L as LLM Analyzer
    participant D as Decision Engine
    participant I as Internet
    
    C->>B: Opens article URL
    B->>G: GET /article
    
    activate G
    G->>G: Extract user_id from session
    G->>E: classifyContent(url, profile)
    
    activate E
    E->>L: analyzeContent(content, profile)
    activate L
    
    Note over L: Processing takes 5-7 seconds
    L->>L: Safety classification (2s)
    L->>L: Educational value (2s)
    L->>L: Age appropriateness (1s)
    
    L-->>E: Complete analysis result
    deactivate L
    E-->>G: Classification complete
    deactivate E
    
    G->>D: evaluateDecision(analysis, policy)
    activate D
    D->>D: Check safety thresholds
    D->>D: Verify category restrictions
    D->>D: Validate time limits
    D-->>G: Decision: ALLOW/BLOCK
    deactivate D
    
    alt Decision = ALLOW
        G->>I: Forward request
        I-->>G: Fetch content
        G-->>B: Return filtered content
        G-->>C: Display article
    else Decision = BLOCK
        G-->>B: Return block page
        B-->>C: Show filter message:<br/>"Content not appropriate for your age"
    end
    deactivate G
```

### Scenario 3: Strategy Performance Optimization

**Purpose**: This scenario illustrates how the Hybrid strategy achieves 85% performance improvement through intelligent multi-layer filtering and caching.

**Hybrid Strategy Adaptive Processing**

**Description**: The Hybrid strategy processes a high-volume content stream through multiple optimization layers. For each content item, Fast Filters perform pattern matching first. Approximately 60% of content is blocked at this stage in just 50ms. For content that passes, the system checks the cache, achieving hits on 30% of requests (10ms response). Only the remaining 10% of content requires expensive LLM analysis (5s). After LLM analysis, results are cached with a 5-minute TTL for future requests. This multi-layer approach dramatically reduces average processing time while maintaining high accuracy. The system can handle thousands of requests per second by avoiding unnecessary LLM calls.

```mermaid
sequenceDiagram
    participant S as System
    participant H as Hybrid
    participant F as Fast Filters
    participant C as Cache Layer
    participant L as LLM Analyzer
    
    S->>H: Classify content stream
    activate H
    
    loop For each content item
        H->>F: Pre-filter check
        F->>F: Pattern matching
        F-->>H: Result
        
        alt Fast Filter Blocks
            H-->>S: Return BLOCK (50ms)
        else Fast Filter Passes
            H->>C: Check cache
            C-->>H: Cache result
            
            alt Cache Hit
                H-->>S: Return cached decision
            else Cache Miss
                H->>L: Deep LLM analysis
                activate L
                L->>L: Comprehensive analysis (5s)
                L-->>H: Classification result
                deactivate L
                
                H->>C: Store in cache (TTL: 5min)
                H-->>S: Return decision
            end
        end
    end
    
    deactivate H
    
    Note over S,L: Performance Gains:<br/>85% faster than pure LLM<br/>through filtering & caching
```

### Scenario 4: Compliance Audit Trail

**Purpose**: This scenario demonstrates how the system generates comprehensive compliance reports for regulatory audits, specifically for GDPR.

**GDPR Compliance Reporting**

**Description**: A Compliance Officer requests a GDPR audit report through the Audit System. The Compliance Engine retrieves data and invokes the GDPR Handler to validate compliance across multiple requirements: data minimization (collecting only necessary data), consent records (verifying user permissions), right to erasure (tracking deletion requests), and data localization (ensuring EU data stays in EU). The system queries audit logs from the Data Store to compile evidence of compliance. The Report Generator aggregates all data points and generates insights showing data processing records, consent timestamps, erasure request handling, and localization proof. This comprehensive report demonstrates regulatory alignment and can be submitted to authorities during audits.

```mermaid
sequenceDiagram
    participant O as Compliance Officer
    participant A as Audit System
    participant C as Compliance Engine
    participant G as GDPR Handler
    participant R as Report Generator
    participant DB as Data Store
    
    O->>A: Request GDPR audit report
    activate A
    
    A->>C: getComplianceData(dateRange)
    activate C
    
    C->>G: validateGDPR(userId)
    activate G
    G->>G: Check data minimization
    G->>G: Verify consent records
    G->>G: Validate erasure requests
    G->>G: Review data localization
    G-->>C: Compliance status
    deactivate G
    
    C->>DB: Query audit logs
    DB-->>C: Log entries
    
    C->>R: Compile compliance report
    activate R
    R->>R: Aggregate data points
    R->>R: Generate insights
    R-->>C: Report data
    deactivate R
    
    C-->>A: Complete report
    deactivate C
    
    A-->>O: GDPR Compliance Report
    deactivate A
    
    Note over O: Report includes:<br/>• Data processing records<br/>• Consent timestamps<br/>• Erasure requests<br/>• Localization proof
```

### Scenario 5: Multi-Device Profile Sync

**Purpose**: This scenario shows how user profiles and settings synchronize in real-time across multiple devices for seamless user experience.

**Cross-Device Profile Synchronization**

**Description**: A parent creates a child profile on Device 1 (mobile). The Profile Service stores the profile in the Central Database and publishes a "profile.created" event to the Event Bus. When the parent logs in on Device 2 (tablet), the system syncs all profiles from the database. Later, when the parent modifies the safety level on Device 1, the Profile Service updates the database and publishes a "profile.updated" event. The Event Bus immediately notifies Device 2, which fetches the updated profile and refreshes its UI. This real-time synchronization ensures consistency across all devices using event-driven architecture. Parents can manage settings from any device, and changes propagate instantly, providing a seamless multi-device experience with eventual consistency guarantees.

```mermaid
sequenceDiagram
    participant P as Parent
    participant D1 as Device 1 (Mobile)
    participant D2 as Device 2 (Tablet)
    participant PS as Profile Service
    participant DB as Central Database
    participant PubSub as Event Bus
    
    P->>D1: Create child profile
    D1->>PS: createProfile(childData)
    PS->>DB: Store profile
    PS->>PubSub: Publish "profile.created"
    PS-->>D1: Profile created
    
    P->>D2: Login to account
    D2->>PS: getProfile(userId)
    PS->>DB: Query user profiles
    DB-->>PS: All profiles
    PS-->>D2: Sync profiles to device
    
    P->>D1: Modify safety level
    
    D1->>PS: updateProfile(childId, newLevel)
    PS->>DB: Update profile
    PS->>PubSub: Publish "profile.updated"
    PS-->>D1: Update confirmed
    
    PubSub->>D2: Profile update notification
    D2->>PS: Fetch updated profile
    PS->>DB: Get latest profile
    DB-->>PS: Updated data
    PS-->>D2: Refresh profile
    D2->>D2: Update UI
    
    Note over P,D2: Real-time synchronization<br/>across all user devices
```

---

## 🏗️ Architecture Summary

### System Layers

| Layer | Components | Technology |
|-------|-----------|-----------|
| **Presentation** | Frontend, Admin UI | Flask, HTML/JS, Bootstrap |
| **Application** | API, Gateway | Python Flask, aiohttp |
| **Domain** | Engine, Strategies, BAML | Python, BAML framework |
| **Infrastructure** | Ollama, MongoDB, Redis | Ollama, MongoDB, Redis |

### Key Architectural Patterns

| Pattern | Usage | Benefit |
|---------|-------|---------|
| **Strategy** | Pluggable curation approaches | Runtime flexibility |
| **Factory** | Strategy creation | Centralized instantiation |
| **Proxy** | Gateway interception | Universal content control |
| **Observer** | Event-driven updates | Real-time synchronization |
| **Chain of Responsibility** | Multi-layer filtering | Performance optimization |

### Quality Attributes

| Attribute | Target | Status |
|-----------|--------|--------|
| **Performance** | <10s classification | ✅ 5-10s achieved |
| **Availability** | 99.9% uptime | ✅ Multi-AZ ready |
| **Scalability** | 1-100 instances | ✅ Auto-scaling configured |
| **Security** | Zero data exposure | ✅ Local processing |
| **Compliance** | GDPR/COPPA/DPDPA/LGPD | ✅ Framework ready |

---

## 📚 References

- **Architecture Guide**: `AI_Curation_Engine_Architecture.md`
- **Implementation**: `BAML_README.md`
- **Deployment**: `COMPLETE_DEPLOYMENT_GUIDE.md`
- **Gateway Design**: `DEVICE_LEVEL_INTERNET_GATEWAY.md`

---

**Document Version**: 1.0  
**Created**: October 31, 2024  
**Architecture Model**: 4+1 View Model (Kruchten)  
**Diagram Format**: Mermaid

