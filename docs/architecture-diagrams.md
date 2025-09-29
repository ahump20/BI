# Blaze Intelligence System Architecture Diagrams

This document contains Mermaid charts visualizing the Blaze Intelligence platform architecture, data flows, and system components.

## High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Dashboard] 
        B[Mobile App]
        C[API Clients]
        D[Third-party Integrations]
    end
    
    subgraph "Load Balancer & CDN"
        E[Cloudflare Edge]
        F[Nginx Proxy]
    end
    
    subgraph "Application Layer"
        G[Blaze Intelligence App<br/>Node.js + Express]
        H[MCP Server<br/>Cardinals Analytics]
        I[Analytics Worker<br/>Python]
        J[Vision AI Engine<br/>TensorFlow.js]
    end
    
    subgraph "Data Layer"
        K[Neon PostgreSQL<br/>Primary Database]
        L[Redis Cache<br/>Sports Data]
        M[Cloudflare D1<br/>Edge Database]
        N[R2 Storage<br/>Media & Files]
    end
    
    subgraph "External APIs"
        O[MLB Stats API]
        P[ESPN API]
        Q[Perfect Game API]
        R[SportsDataIO]
        S[Stack Overflow API]
    end
    
    A --> E
    B --> E  
    C --> E
    D --> E
    E --> F
    F --> G
    F --> H
    
    G --> I
    G --> J
    G --> K
    G --> L
    G --> M
    G --> N
    
    H --> K
    H --> L
    I --> K
    I --> L
    I --> O
    I --> P
    I --> Q
    I --> R
    
    G --> S
    
    style K fill:#e1f5fe
    style L fill:#f3e5f5
    style M fill:#e8f5e8
    style N fill:#fff3e0
```

## Data Flow Architecture

```mermaid
flowchart LR
    subgraph "Data Sources"
        A[Live Sports APIs]
        B[Youth Baseball<br/>Perfect Game]
        C[NIL Data Sources]
        D[Biometric Sensors]
        E[Stack Overflow<br/>Developer Q&A]
    end
    
    subgraph "Ingestion Layer"
        F[Data Ingestion Service]
        G[Real-time Processors]
        H[Batch ETL Pipeline]
    end
    
    subgraph "Processing Layer"
        I[HAV-F Calculator]
        J[Team Readiness Engine]
        K[Predictive Models]
        L[Biometric Analyzer]
    end
    
    subgraph "Storage Layer"
        M[Neon PostgreSQL<br/>Structured Data]
        N[Redis Cache<br/>Hot Data]
        O[R2 Storage<br/>Files & Media]
    end
    
    subgraph "API Layer"
        P[REST API]
        Q[GraphQL API]
        R[WebSocket Events]
        S[MCP Protocol]
    end
    
    subgraph "Client Applications"
        T[Web Dashboard]
        U[Mobile Apps]
        V[External Integrations]
    end
    
    A --> F
    B --> F
    C --> G
    D --> G
    E --> F
    
    F --> H
    G --> I
    G --> J
    H --> I
    H --> J
    H --> K
    G --> L
    
    I --> M
    J --> M
    K --> M
    L --> M
    I --> N
    J --> N
    L --> O
    
    M --> P
    M --> Q
    N --> P
    N --> Q
    M --> R
    N --> R
    M --> S
    
    P --> T
    Q --> T
    R --> T
    P --> U
    Q --> U
    R --> U
    P --> V
    S --> V
    
    style M fill:#e1f5fe
    style N fill:#f3e5f5
    style O fill:#fff3e0
```

## HAV-F Calculation Pipeline

```mermaid
graph TD
    A[Player Data Input] --> B{Data Validation}
    B --> |Valid| C[Performance Metrics<br/>Extraction]
    B --> |Invalid| D[Error Handling]
    
    C --> E[Champion Readiness<br/>Algorithm]
    C --> F[Cognitive Leverage<br/>Algorithm]  
    C --> G[NIL Trust Score<br/>Algorithm]
    
    E --> H[Weighted Scoring]
    F --> H
    G --> H
    
    H --> I[Composite HAV-F<br/>Calculation]
    I --> J[Percentile Ranking]
    J --> K[Trend Analysis]
    
    K --> L{Score Changed?}
    L --> |Yes| M[Update Database]
    L --> |No| N[Skip Update]
    
    M --> O[Cache Invalidation]
    O --> P[WebSocket Notification]
    P --> Q[End]
    N --> Q
    
    D --> R[Log Error]
    R --> S[Retry Logic]
    S --> B
    
    style E fill:#ffebee
    style F fill:#e8f5e8
    style G fill:#e3f2fd
    style I fill:#fff3e0
```

## API Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant CF as Cloudflare Edge
    participant LB as Load Balancer
    participant API as Blaze API
    participant AUTH as Auth Service
    participant DB as Neon Database
    participant CACHE as Redis Cache
    participant EXT as External APIs
    
    C->>CF: API Request
    CF->>LB: Forward Request
    LB->>API: Route to API Server
    
    API->>AUTH: Validate API Key
    AUTH-->>API: Auth Response
    
    alt Cache Hit
        API->>CACHE: Check Cache
        CACHE-->>API: Cached Data
        API-->>C: Return Cached Response
    else Cache Miss
        API->>DB: Query Database
        DB-->>API: Database Response
        
        opt External Data Needed
            API->>EXT: Fetch External Data
            EXT-->>API: External Response
        end
        
        API->>CACHE: Update Cache
        API-->>C: Return Response
    end
    
    Note over C,EXT: Rate limiting applied at CF edge
    Note over API,DB: Connection pooling for performance
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        A[Local Development<br/>Docker Compose]
        B[Feature Branches<br/>GitHub]
    end
    
    subgraph "CI/CD Pipeline"
        C[GitHub Actions<br/>Test & Build]
        D[Docker Registry<br/>Container Images]
        E[Security Scanning<br/>Vulnerability Checks]
    end
    
    subgraph "Staging Environment"
        F[Staging Deployment<br/>Cloudflare Workers]
        G[Staging Database<br/>Neon Branch]
        H[Integration Tests<br/>Automated QA]
    end
    
    subgraph "Production Environment"
        I[Production Deployment<br/>Multiple Regions]
        J[Production Database<br/>Neon Main Branch]
        K[Monitoring & Alerts<br/>Grafana + Prometheus]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    D --> F
    E --> F
    F --> G
    F --> H
    
    H --> |Tests Pass| I
    I --> J
    I --> K
    
    style A fill:#e8f5e8
    style F fill:#fff3e0
    style I fill:#ffebee
    style J fill:#e1f5fe
```

## Microservices Communication

```mermaid
graph LR
    subgraph "Core Services"
        A[API Gateway<br/>Express.js]
        B[Authentication<br/>Service]
        C[Analytics Engine<br/>Python]
        D[Notification<br/>Service]
    end
    
    subgraph "Sport-Specific Services"
        E[Cardinals Analytics<br/>MCP Server]
        F[Longhorns Service<br/>NCAA Football]
        G[Titans Service<br/>NFL]
        H[Grizzlies Service<br/>NBA]
    end
    
    subgraph "Specialized Services"
        I[Vision AI<br/>TensorFlow.js]
        J[Biometric Processor<br/>Real-time]
        K[NIL Calculator<br/>Market Analysis]
        L[Stack Overflow<br/>Integration]
    end
    
    A <--> B
    A <--> C
    A <--> D
    A <--> E
    A <--> F
    A <--> G
    A <--> H
    A <--> I
    A <--> J
    A <--> K
    A <--> L
    
    C <--> E
    C <--> F
    C <--> G
    C <--> H
    
    I <--> J
    F <--> K
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style L fill:#fff3e0
```

## Developer Support Ecosystem

```mermaid
mindmap
  root((Blaze Intelligence<br/>Developer Ecosystem))
    API Documentation
      OpenAPI Spec
      Interactive Docs
      Code Examples
      SDKs
        JavaScript/Node.js
        Python
        REST Clients
    Stack Overflow Integration
      Automated Q&A Monitoring
      Expert Answers
      Community Support
      Tag Management
        blaze-intelligence
        sports-analytics
        hav-f-scoring
    Developer Tools
      Docker Environment
      Local Development
      Testing Framework
      CI/CD Pipeline
    Community Resources
      GitHub Repository
      Discord Server
      Developer Blog
      Video Tutorials
```

## Data Model Relationships

```mermaid
erDiagram
    TEAMS ||--o{ PLAYERS : "has"
    TEAMS ||--o{ GAMES : "plays_in"
    PLAYERS ||--o{ PLAYER_GAME_STATS : "performs_in"
    GAMES ||--o{ PLAYER_GAME_STATS : "contains"
    USERS ||--o{ API_USAGE : "generates"
    
    TEAMS {
        string team_id PK
        string name
        string sport
        string league
        decimal readiness_score
        jsonb readiness_components
        timestamp created_at
        timestamp updated_at
    }
    
    PLAYERS {
        string player_id PK
        string name
        string sport
        string team_id FK
        string position
        decimal hav_f_champion_readiness
        decimal hav_f_cognitive_leverage
        decimal hav_f_nil_trust_score
        decimal hav_f_composite
        jsonb stats_current
        jsonb biometric_data
        timestamp created_at
        timestamp updated_at
    }
    
    GAMES {
        string game_id PK
        string sport
        string home_team_id FK
        string away_team_id FK
        timestamp game_date
        string status
        integer home_score
        integer away_score
        jsonb analytics_data
    }
    
    PLAYER_GAME_STATS {
        uuid id PK
        string player_id FK
        string game_id FK
        decimal performance_score
        jsonb stats
        jsonb biometric_data
        timestamp created_at
    }
    
    USERS {
        uuid user_id PK
        string email
        string api_key
        string plan
        integer rate_limit_per_hour
        timestamp created_at
    }
    
    API_USAGE {
        uuid id PK
        uuid user_id FK
        string endpoint
        string method
        integer response_code
        timestamp timestamp
    }
```

## Security Architecture

```mermaid
graph TB
    subgraph "External Layer"
        A[Cloudflare WAF<br/>DDoS Protection]
        B[Rate Limiting<br/>API Gateway]
    end
    
    subgraph "Application Security"
        C[Authentication<br/>JWT + API Keys]
        D[Authorization<br/>RBAC]
        E[Input Validation<br/>Schema Validation]
        F[Output Sanitization<br/>XSS Prevention]
    end
    
    subgraph "Data Security"
        G[Database Encryption<br/>At Rest]
        H[Connection Encryption<br/>TLS 1.3]
        I[Row Level Security<br/>PostgreSQL RLS]
        J[Data Masking<br/>PII Protection]
    end
    
    subgraph "Infrastructure Security"
        K[Container Security<br/>Docker Scanning]
        L[Secrets Management<br/>Environment Variables]
        M[Network Security<br/>VPC + Firewalls]
        N[Monitoring & Logging<br/>Security Events]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    
    F --> G
    G --> H
    H --> I
    I --> J
    
    J --> K
    K --> L
    L --> M
    M --> N
    
    style A fill:#ffebee
    style C fill:#e8f5e8
    style G fill:#e1f5fe
    style K fill:#fff3e0
```

## Monitoring & Observability

```mermaid
graph LR
    subgraph "Application Metrics"
        A[Response Times]
        B[Error Rates]
        C[Throughput]
        D[Database Performance]
    end
    
    subgraph "Business Metrics"
        E[API Usage]
        F[HAV-F Calculations]
        G[User Engagement]
        H[Data Freshness]
    end
    
    subgraph "Infrastructure Metrics"
        I[CPU Usage]
        J[Memory Usage]
        K[Network I/O]
        L[Storage Usage]
    end
    
    subgraph "Collection Layer"
        M[Prometheus<br/>Metrics Collection]
        N[Grafana<br/>Visualization]
        O[AlertManager<br/>Notifications]
    end
    
    subgraph "Log Aggregation"
        P[Application Logs]
        Q[Access Logs]
        R[Error Logs]
        S[Audit Logs]
    end
    
    A --> M
    B --> M
    C --> M
    D --> M
    E --> M
    F --> M
    G --> M
    H --> M
    I --> M
    J --> M
    K --> M
    L --> M
    
    M --> N
    M --> O
    
    P --> M
    Q --> M
    R --> M
    S --> M
    
    style M fill:#e1f5fe
    style N fill:#e8f5e8
    style O fill:#ffebee
```