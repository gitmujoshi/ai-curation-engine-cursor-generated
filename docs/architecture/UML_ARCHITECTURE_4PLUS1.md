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

**Actors**: Parent/Guardian, Child/User, System Administrator, Compliance Officer, Content Platform

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
    style PARENT fill:#e8f5e9,stroke:#4caf50,stroke-width:3px
    style CHILD fill:#fff3e0,stroke:#ff9800,stroke-width:3px
    style ADMIN fill:#e3f2fd,stroke:#2196f3,stroke-width:3px
    style COMP fill:#f3e5f5,stroke:#9c27b0,stroke-width:3px
    style PLAT fill:#fce4ec,stroke:#e91e63,stroke-width:3px
    
    style UC1 fill:#fff,stroke:#4caf50,stroke-width:2px,stroke-dasharray: 5 5
    style UC2 fill:#fff,stroke:#4caf50,stroke-width:2px,stroke-dasharray: 5 5
    style UC3 fill:#fff,stroke:#4caf50,stroke-width:2px,stroke-dasharray: 5 5
    style UC4 fill:#fff,stroke:#4caf50,stroke-width:2px,stroke-dasharray: 5 5
    style UC5 fill:#fff,stroke:#4caf50,stroke-width:2px,stroke-dasharray: 5 5
    
    style UC6 fill:#fff,stroke:#ff9800,stroke-width:2px,stroke-dasharray: 5 5
    style UC7 fill:#fff,stroke:#ff9800,stroke-width:2px,stroke-dasharray: 5 5
    style UC8 fill:#fff,stroke:#ff9800,stroke-width:2px,stroke-dasharray: 5 5
    
    style UC9 fill:#fff,stroke:#2196f3,stroke-width:2px,stroke-dasharray: 5 5
    style UC10 fill:#fff,stroke:#2196f3,stroke-width:2px,stroke-dasharray: 5 5
    style UC11 fill:#fff,stroke:#2196f3,stroke-width:2px,stroke-dasharray: 5 5
    style UC12 fill:#fff,stroke:#2196f3,stroke-width:2px,stroke-dasharray: 5 5
    
    style UC13 fill:#fff,stroke:#9c27b0,stroke-width:2px,stroke-dasharray: 5 5
    style UC14 fill:#fff,stroke:#9c27b0,stroke-width:2px,stroke-dasharray: 5 5
    
    style UC15 fill:#fff,stroke:#e91e63,stroke-width:2px,stroke-dasharray: 5 5
    style UC16 fill:#fff,stroke:#e91e63,stroke-width:2px,stroke-dasharray: 5 5
```

### 1.2 Core Class Model

**Domain Entities and Relationships**

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

---

## 2️⃣ Process View: Sequence Diagrams

### 2.1 Content Classification Flow

**Real-Time Processing Sequence**

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

**Runtime Strategy Configuration**

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

**Hybrid Strategy Processing**

```mermaid
sequenceDiagram
    participant Input as Content Input
    participant Engine as Curation Engine
    participant Fast as Fast Filter Layer
    participant AI as Specialized AI Layer
    participant LLM as LLM Analysis
    participant Agg as Result Aggregator
    
    Input->>Engine: Submit content for curation
    activate Engine
    
    Engine->>Fast: Check fast filters
    Fast->>Fast: Pattern matching
    Fast-->>Engine: Pattern check result
    
    alt BLOCK Decision
        Engine-->>Input: Return BLOCK (50ms)
        deactivate Engine
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
            Engine-->>Input: Return decision
            deactivate Engine
        else Low Confidence or Edge Case
            Engine->>LLM: Deep analysis
            activate LLM
            LLM->>LLM: LLM processing (5-7s)
            LLM-->>Engine: LLM Classification
            deactivate LLM
            
            Engine->>Agg: Aggregate all results
            Agg-->>Engine: Final Decision
            Engine-->>Input: Return decision
            deactivate Engine
        end
    end
```

---

## 3️⃣ Development View: Component Diagram

### Software Architecture and Module Organization

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

**Single Machine Setup**

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

**Containerized Services**

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

**AWS Multi-Tier Architecture**

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

**User Registration and Profile Setup**

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

**Live Content Classification and Filtering**

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

**Hybrid Strategy Adaptive Processing**

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
        activate F
        
        alt Fast Filter Blocks
            F->>F: Pattern matching
            F-->>H: BLOCK (50ms)
            deactivate F
            H-->>S: Return BLOCK
        else Fast Filter Passes
            F-->>H: PASS
            deactivate F
            
            H->>C: Check cache
            activate C
            
            alt Cache Hit
                C-->>H: Cached result (10ms)
                deactivate C
                H-->>S: Return cached decision
            else Cache Miss
                C-->>H: Not found
                deactivate C
                
                H->>L: Deep LLM analysis
                activate L
                L->>L: Comprehensive analysis (5s)
                L-->>H: Classification result
                deactivate L
                
                H->>C: Store in cache (TTL: 5min)
                activate C
                C-->>H: Stored
                deactivate C
                
                H-->>S: Return decision
            end
        end
    end
    
    deactivate H
    
    Note over S,L: Performance Gains:<br/>85% faster than pure LLM<br/>through filtering & caching
```

### Scenario 4: Compliance Audit Trail

**GDPR Compliance Reporting**

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

**Cross-Device Profile Synchronization**

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

