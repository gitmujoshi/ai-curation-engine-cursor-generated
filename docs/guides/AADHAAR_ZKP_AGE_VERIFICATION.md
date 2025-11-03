# 🇮🇳 Aadhaar-Based Zero-Knowledge Proof Age Verification

## Overview

This document outlines the implementation of **Aadhaar-based Zero-Knowledge Proof (ZKP)** age verification for the AI Curation Engine in India. This approach enables privacy-preserving age verification that complies with India's Digital Personal Data Protection Act (DPDPA) 2023 and Aadhaar regulations.

---

## 🔐 Understanding Zero-Knowledge Proofs (ZKP)

### What is a Zero-Knowledge Proof?

A **Zero-Knowledge Proof** is a cryptographic protocol that allows one party (the **Prover**) to prove to another party (the **Verifier**) that a statement is true, without revealing any information beyond the validity of the statement itself.

**Real-World Analogy**: Imagine you want to prove you're over 18 years old to enter a venue, but you don't want to reveal your exact age or date of birth. A Zero-Knowledge Proof allows you to prove "I am 18+" without disclosing that you're actually 25, 30, or any specific age.

### Core Properties of ZKP

A valid Zero-Knowledge Proof must satisfy three fundamental properties:

#### 1. **Completeness**
If the statement is true and both parties follow the protocol honestly, the Verifier will be convinced.

```
If age >= 18 (true statement)
→ Honest Prover can always convince Honest Verifier
→ Verification succeeds with probability = 1
```

#### 2. **Soundness**
If the statement is false, no cheating Prover can convince the Verifier (except with negligible probability).

```
If age < 18 (false statement)
→ Even dishonest Prover cannot convince Verifier
→ Verification fails with probability ≈ 1
→ Success probability for cheater < 2^-128 (negligible)
```

#### 3. **Zero-Knowledge**
The Verifier learns nothing except that the statement is true. No information about the actual value is revealed.

```
Verifier learns: age >= 18 ✓
Verifier does NOT learn: age = 25
Verifier does NOT learn: date of birth
Verifier does NOT learn: any other personal information
```

### How ZKP Works: Interactive vs Non-Interactive

#### Interactive ZKP (Original Concept)

```mermaid
sequenceDiagram
    participant P as Prover<br/>(Has secret: age=25)
    participant V as Verifier<br/>(Wants proof: age>=18)
    
    Note over P,V: Round 1: Commitment
    P->>P: Generate random r
    P->>P: Compute commitment C = Commit(age, r)
    P->>V: Send commitment C
    
    Note over P,V: Round 2: Challenge
    V->>V: Generate random challenge c
    V->>P: Send challenge c
    
    Note over P,V: Round 3: Response
    P->>P: Compute response z = f(age, r, c)
    P->>V: Send response z
    
    Note over P,V: Verification
    V->>V: Check: Verify(C, c, z, threshold=18)
    alt Valid Proof
        V->>V: Accept: age >= 18 ✓
    else Invalid Proof
        V->>V: Reject: Proof failed ✗
    end
    
    Note over V: Verifier learns ONLY: age >= 18<br/>Does NOT learn actual age
```

**Characteristics**:
- Multiple rounds of communication
- Verifier generates random challenges
- Prover responds to challenges
- Secure but requires interaction

#### Non-Interactive ZKP (Fiat-Shamir Heuristic)

```mermaid
graph TB
    subgraph "Prover Side"
        Secret[Secret: age = 25<br/>threshold = 18]
        Commit[Generate Commitment<br/>C = Commit age, r]
        Hash[Compute Challenge<br/>c = Hash C, public_params]
        Response[Compute Response<br/>z = f age, r, c]
        Proof[Create Proof<br/>π = C, z, timestamp]
    end
    
    subgraph "Verifier Side"
        ReceiveProof[Receive Proof π]
        RecomputeHash[Recompute Challenge<br/>c' = Hash C, public_params]
        Verify[Verify Equation<br/>Check z, C, c']
        Decision{Valid?}
        Accept[Accept: age >= 18 ✓]
        Reject[Reject: Invalid ✗]
    end
    
    Secret --> Commit
    Commit --> Hash
    Hash --> Response
    Response --> Proof
    
    Proof --> ReceiveProof
    ReceiveProof --> RecomputeHash
    RecomputeHash --> Verify
    Verify --> Decision
    Decision -->|Yes| Accept
    Decision -->|No| Reject
    
    style Secret fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000
    style Proof fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,color:#000
    style Accept fill:#c8e6c9,stroke:#66bb6a,stroke-width:2px,color:#000
    style Reject fill:#ffcdd2,stroke:#e57373,stroke-width:2px,color:#000
```

**Characteristics**:
- Single message from Prover to Verifier
- Challenge derived from hash function (Fiat-Shamir transform)
- No interaction required
- Suitable for blockchain and offline verification

### ZKP Standards and Protocols

#### 1. **zk-SNARKs** (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge)

**Full Name**: Zero-Knowledge Succinct Non-Interactive Argument of Knowledge

**Properties**:
- **Zero-Knowledge**: Reveals nothing beyond validity
- **Succinct**: Proof size is very small (~200 bytes)
- **Non-Interactive**: Single message proof
- **Argument**: Computationally sound (secure against polynomial-time adversaries)
- **of Knowledge**: Prover must "know" the secret

**Mathematical Foundation**:
```
Based on elliptic curve pairings (bilinear maps)
Uses polynomial commitments (KZG, FRI)
Requires trusted setup ceremony
```

**Popular Implementations**:
- **Groth16**: Most efficient, requires trusted setup per circuit
- **PLONK**: Universal trusted setup, more flexible
- **Halo2**: No trusted setup, recursive proofs

**Use Cases**:
- Zcash (private cryptocurrency)
- Tornado Cash (private transactions)
- zkRollups (Ethereum scaling)
- Age verification (our use case)

**Pros**:
- ✅ Very small proof size (~200 bytes)
- ✅ Fast verification (~5-10ms)
- ✅ Constant proof size regardless of computation

**Cons**:
- ❌ Requires trusted setup (except Halo2)
- ❌ Slow proof generation (seconds to minutes)
- ❌ Complex mathematics

**Code Example**:
```python
from zksnark import Groth16

# Define circuit: prove age >= threshold
circuit = """
def age_check(age, threshold):
    delta = age - threshold
    assert delta >= 0
    return True
"""

# Setup (one-time, requires trusted ceremony)
proving_key, verification_key = Groth16.setup(circuit)

# Prover: Generate proof
age = 25
threshold = 18
proof = Groth16.prove(
    proving_key,
    public_inputs=[threshold],
    private_inputs=[age]
)

# Verifier: Verify proof
is_valid = Groth16.verify(
    verification_key,
    proof,
    public_inputs=[threshold]
)
# is_valid = True, but verifier doesn't learn age
```

#### 2. **Bulletproofs**

**Properties**:
- **No Trusted Setup**: Can be used immediately
- **Short Proofs**: Logarithmic size in computation
- **Range Proofs**: Excellent for proving value in range
- **Aggregatable**: Multiple proofs can be combined

**Mathematical Foundation**:
```
Based on Pedersen commitments
Uses inner product arguments
Relies on discrete logarithm hardness
```

**Use Cases**:
- Monero (confidential transactions)
- Range proofs (prove 0 <= value <= 2^64)
- Age verification (prove age >= threshold)
- Confidential assets

**Pros**:
- ✅ No trusted setup required
- ✅ Transparent and auditable
- ✅ Excellent for range proofs
- ✅ Can aggregate multiple proofs

**Cons**:
- ❌ Larger proof size than SNARKs (~1-2 KB)
- ❌ Slower verification (linear in range size)
- ❌ Proof generation slower than SNARKs for complex circuits

**Code Example**:
```python
from bulletproofs import RangeProof, PedersenCommitment

# Prover: Commit to age
age = 25
commitment, randomness = PedersenCommitment.commit(age)

# Prover: Generate range proof (age in [18, 150])
range_proof = RangeProof.prove(
    value=age,
    commitment=commitment,
    randomness=randomness,
    min_value=18,
    max_value=150,
    bit_length=8  # 2^8 = 256
)

# Verifier: Verify range proof
is_valid = RangeProof.verify(
    proof=range_proof,
    commitment=commitment,
    min_value=18,
    max_value=150
)
# is_valid = True, verifier learns age in [18, 150] but not exact age
```

#### 3. **STARKs** (Scalable Transparent Arguments of Knowledge)

**Full Name**: Scalable Transparent Argument of Knowledge

**Properties**:
- **Scalable**: Prover time quasi-linear
- **Transparent**: No trusted setup
- **Post-Quantum Secure**: Resistant to quantum computers
- **Succinct**: Polylogarithmic proof size

**Mathematical Foundation**:
```
Based on hash functions (collision resistance)
Uses FRI (Fast Reed-Solomon Interactive Oracle Proofs)
Relies on algebraic intermediate representation (AIR)
```

**Use Cases**:
- StarkNet (Ethereum Layer 2)
- StarkEx (dYdX, Immutable X)
- Post-quantum cryptography
- Large-scale computations

**Pros**:
- ✅ No trusted setup
- ✅ Post-quantum secure
- ✅ Transparent and auditable
- ✅ Scales to very large computations

**Cons**:
- ❌ Larger proof size (~100-200 KB)
- ❌ Slower verification than SNARKs
- ❌ Complex implementation

#### 4. **Sigma Protocols** (Classical Interactive ZKP)

**Examples**: Schnorr Protocol, Chaum-Pedersen Protocol

**Properties**:
- **Simple**: Easy to understand and implement
- **Interactive**: Requires challenge-response
- **Efficient**: Fast proof generation and verification
- **Composable**: Can be combined for complex statements

**Mathematical Foundation**:
```
Based on discrete logarithm problem
Uses commitment-challenge-response pattern
Can be made non-interactive via Fiat-Shamir
```

**Schnorr Protocol Example**:
```
Prove knowledge of x such that Y = g^x (without revealing x)

1. Prover: Choose random r, compute R = g^r, send R
2. Verifier: Choose random challenge c, send c
3. Prover: Compute s = r + c*x, send s
4. Verifier: Check g^s = R * Y^c
```

**Use Cases**:
- Digital signatures (Schnorr signatures)
- Authentication protocols
- Simple zero-knowledge proofs
- Building blocks for complex protocols

**Pros**:
- ✅ Very simple and efficient
- ✅ Easy to implement
- ✅ Well-understood security
- ✅ Fast proof and verification

**Cons**:
- ❌ Interactive (unless Fiat-Shamir applied)
- ❌ Limited to simple statements
- ❌ Not suitable for complex computations

### Comparison Table

| Protocol | Proof Size | Prover Time | Verifier Time | Trusted Setup | Post-Quantum | Best For |
|----------|-----------|-------------|---------------|---------------|--------------|----------|
| **zk-SNARKs (Groth16)** | ~200 bytes | Seconds | ~5ms | ✅ Required | ❌ No | Small proofs, fast verification |
| **zk-SNARKs (PLONK)** | ~400 bytes | Seconds | ~10ms | ⚠️ Universal | ❌ No | Flexible circuits |
| **zk-SNARKs (Halo2)** | ~1 KB | Seconds | ~20ms | ✅ None | ❌ No | No trusted setup |
| **Bulletproofs** | ~1-2 KB | Seconds | ~50ms | ✅ None | ❌ No | Range proofs |
| **STARKs** | ~100 KB | Minutes | ~100ms | ✅ None | ✅ Yes | Large computations, post-quantum |
| **Sigma Protocols** | ~100 bytes | Milliseconds | ~1ms | ✅ None | ❌ No | Simple proofs, authentication |

### Our Choice: Hybrid Approach

For Aadhaar-based age verification, we use a **hybrid approach**:

```mermaid
graph TB
    subgraph "Age Verification Protocol"
        Aadhaar[Aadhaar Authentication<br/>Retrieve Age Attribute]
        
        subgraph "ZKP Layer"
            Commitment[Pedersen Commitment<br/>Commit to age]
            RangeProof[Bulletproofs<br/>Prove age >= threshold]
            Signature[Schnorr Signature<br/>Bind proof to user]
        end
        
        Token[Age Verification Token<br/>Non-interactive proof]
    end
    
    Aadhaar --> Commitment
    Commitment --> RangeProof
    RangeProof --> Signature
    Signature --> Token
    
    style Aadhaar fill:#e3f2fd,stroke:#2196f3,stroke-width:2px,color:#000
    style Commitment fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000
    style RangeProof fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px,color:#000
    style Signature fill:#ffecb3,stroke:#ffa726,stroke-width:2px,color:#000
    style Token fill:#c8e6c9,stroke:#66bb6a,stroke-width:3px,color:#000
```

**Why This Combination?**

1. **Pedersen Commitment**: 
   - Perfectly hiding (information-theoretically secure)
   - Computationally binding
   - Simple and efficient

2. **Bulletproofs for Range Proof**:
   - No trusted setup (transparent)
   - Excellent for age range proofs
   - Reasonable proof size (~1 KB)
   - Well-audited implementation

3. **Schnorr Signature**:
   - Binds proof to specific user
   - Prevents proof replay attacks
   - Fast and simple

**Security Level**: 128-bit security (equivalent to AES-128)

### ZKP Security Guarantees

#### Cryptographic Assumptions

Our ZKP implementation relies on:

1. **Discrete Logarithm Problem (DLP)**:
   ```
   Given g, Y = g^x, it's hard to find x
   Security: 2^128 operations to break
   ```

2. **Elliptic Curve Discrete Logarithm Problem (ECDLP)**:
   ```
   Given G, Y = x*G on elliptic curve, it's hard to find x
   Security: 2^128 operations to break (256-bit curve)
   ```

3. **Collision-Resistant Hash Functions**:
   ```
   SHA-256: Hard to find x ≠ y such that H(x) = H(y)
   Security: 2^128 operations to find collision
   ```

#### Attack Resistance

| Attack Type | Mitigation | Security Level |
|-------------|------------|----------------|
| **Brute Force** | 256-bit keys | 2^128 operations |
| **Replay Attack** | Timestamp + nonce | Prevented |
| **Man-in-the-Middle** | TLS 1.3 + signatures | Prevented |
| **Proof Forgery** | Soundness property | 2^-128 success probability |
| **Side-Channel** | Constant-time operations | Resistant |
| **Quantum Computer** | 256-bit curves | ~2^64 quantum operations |

#### Privacy Guarantees

```
Information Leaked to Verifier:
✓ User is above threshold age (e.g., 18+)
✗ Exact age (e.g., 25)
✗ Date of birth
✗ Year of birth
✗ Any other demographic information

Information Leaked to Network Observer:
✗ Nothing (all encrypted with TLS 1.3)

Information Stored in Database:
✓ Verification status (boolean)
✓ Threshold verified (e.g., 18)
✓ Verification timestamp
✗ Actual age
✗ Date of birth
✗ Aadhaar number (only hashed)
```

### Standards and Specifications

#### 1. **NIST Standards**

- **FIPS 186-4**: Digital Signature Standard (DSS)
  - Elliptic Curve Digital Signature Algorithm (ECDSA)
  - Used for signing ZKP tokens

- **FIPS 202**: SHA-3 Standard
  - Cryptographic hash functions
  - Used in Fiat-Shamir transform

- **SP 800-56A**: Elliptic Curve Cryptography
  - Key agreement and derivation
  - Curve selection (P-256, P-384)

#### 2. **IETF Standards**

- **RFC 8032**: Edwards-Curve Digital Signature Algorithm (EdDSA)
  - Ed25519 signatures
  - Used in modern ZKP implementations

- **RFC 7748**: Elliptic Curves for Security
  - Curve25519, Curve448
  - Used in Bulletproofs

#### 3. **Industry Standards**

- **BN128/BN254**: Barreto-Naehrig Curves
  - Used in zk-SNARKs (Groth16)
  - Supported by Ethereum

- **BLS12-381**: Barreto-Lynn-Scott Curves
  - Used in modern zk-SNARKs (PLONK, Halo2)
  - Better security margins

### Academic References

1. **Goldwasser, Micali, Rackoff (1985)**
   - "The Knowledge Complexity of Interactive Proof Systems"
   - Original ZKP paper
   - [Link](https://people.csail.mit.edu/silvio/Selected%20Scientific%20Papers/Proof%20Systems/The_Knowledge_Complexity_Of_Interactive_Proof_Systems.pdf)

2. **Groth (2016)**
   - "On the Size of Pairing-based Non-interactive Arguments"
   - Groth16 zk-SNARK
   - [Link](https://eprint.iacr.org/2016/260.pdf)

3. **Bünz et al. (2018)**
   - "Bulletproofs: Short Proofs for Confidential Transactions"
   - Bulletproofs protocol
   - [Link](https://eprint.iacr.org/2017/1066.pdf)

4. **Ben-Sasson et al. (2018)**
   - "Scalable, transparent, and post-quantum secure computational integrity"
   - STARKs protocol
   - [Link](https://eprint.iacr.org/2018/046.pdf)

---

## 🎯 Objectives

1. **Privacy-Preserving**: Verify age without storing or transmitting date of birth
2. **Aadhaar Integration**: Leverage India's national identity system
3. **DPDPA Compliance**: Meet data protection requirements
4. **Zero-Knowledge**: Prove age threshold without revealing actual age
5. **Secure**: Cryptographically secure verification process

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technical Requirements](#technical-requirements)
3. [Implementation Approach](#implementation-approach)
4. [Integration with UIDAI](#integration-with-uidai)
5. [ZKP Protocol Design](#zkp-protocol-design)
6. [Code Implementation](#code-implementation)
7. [Compliance Requirements](#compliance-requirements)
8. [Security Considerations](#security-considerations)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Guide](#deployment-guide)

---

## 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph "User Device"
        User[User/Guardian]
        Browser[Web Browser]
        AadhaarApp[Aadhaar App/mAadhaar]
    end
    
    subgraph "AI Curation Engine"
        Frontend[Registration Frontend]
        AgeVerify[Age Verification Service]
        ZKPEngine[ZKP Verification Engine]
        ProfileDB[(User Profile DB)]
    end
    
    subgraph "UIDAI Infrastructure"
        AUA[Authentication User Agency]
        ASA[Authentication Service Agency]
        CIDR[Central Identities Data Repository]
    end
    
    subgraph "ZKP Components"
        ProofGen[Proof Generator]
        ProofVerify[Proof Verifier]
        Commitment[Commitment Scheme]
    end
    
    User -->|1. Initiate Registration| Browser
    Browser -->|2. Request Age Verification| Frontend
    Frontend -->|3. Generate Challenge| AgeVerify
    AgeVerify -->|4. Create ZKP Request| ZKPEngine
    
    Browser -->|5. Trigger Aadhaar Auth| AadhaarApp
    AadhaarApp -->|6. Biometric/OTP Auth| AUA
    AUA -->|7. Forward to ASA| ASA
    ASA -->|8. Verify with CIDR| CIDR
    CIDR -->|9. Return Age Attribute| ASA
    ASA -->|10. Age Attribute| AUA
    
    AUA -->|11. Age Data| ProofGen
    ProofGen -->|12. Generate ZK Proof| Commitment
    Commitment -->|13. Age Proof Token| AgeVerify
    
    AgeVerify -->|14. Verify Proof| ProofVerify
    ProofVerify -->|15. Verification Result| AgeVerify
    AgeVerify -->|16. Store Verification Status| ProfileDB
    ProfileDB -->|17. Confirmation| Frontend
    Frontend -->|18. Registration Complete| Browser
    
    style User fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,color:#000
    style AgeVerify fill:#fff9c4,stroke:#fbc02d,stroke-width:3px,color:#000
    style ZKPEngine fill:#f3e5f5,stroke:#9c27b0,stroke-width:3px,color:#000
    style CIDR fill:#e3f2fd,stroke:#2196f3,stroke-width:2px,color:#000
    style ProofGen fill:#ffecb3,stroke:#ffa726,stroke-width:2px,color:#000
    style ProofVerify fill:#c8e6c9,stroke:#66bb6a,stroke-width:2px,color:#000
```

---

## 🔧 Technical Requirements

### 1. Regulatory Requirements

#### UIDAI (Aadhaar) Requirements
- **AUA License**: Authentication User Agency license from UIDAI
- **ASA Partnership**: Partner with registered Authentication Service Agency
- **Compliance Certificate**: UIDAI security audit compliance
- **Data Localization**: All Aadhaar data must remain in India

#### DPDPA 2023 Compliance
- **Consent Management**: Explicit user consent for age verification
- **Data Minimization**: Only verify age threshold, not store DOB
- **Purpose Limitation**: Use age data only for verification
- **Right to Erasure**: Ability to delete verification records

#### IT Act 2000 & Rules
- **Section 43A**: Reasonable security practices
- **SPDI Rules**: Sensitive Personal Data protection
- **Encryption**: End-to-end encryption for all data transmission

### 2. Technical Infrastructure

#### Hardware Requirements
- **HSM (Hardware Security Module)**: For cryptographic operations
- **Secure Servers**: India-based data centers (Mumbai/Bangalore)
- **Biometric Devices**: UIDAI-certified devices (if on-premise)

#### Software Requirements
- **Aadhaar SDK**: UIDAI-provided authentication SDK
- **ZKP Library**: zk-SNARKs or Bulletproofs implementation
- **Encryption**: AES-256, RSA-2048 minimum
- **TLS**: TLS 1.3 for all communications

#### Network Requirements
- **Dedicated Leased Line**: For AUA-ASA communication
- **Static IP**: Whitelisted with UIDAI
- **Bandwidth**: Minimum 10 Mbps dedicated
- **Uptime**: 99.5% SLA

### 3. Development Requirements

#### Programming Languages
- **Backend**: Python 3.9+ or Java 11+
- **Cryptography**: C/C++ for performance-critical ZKP operations
- **Frontend**: JavaScript/TypeScript with Web Crypto API

#### Libraries & Frameworks
```python
# Python Dependencies
aadhaar-py==2.1.0          # Aadhaar authentication
py-ecc==6.0.0              # Elliptic curve cryptography
zksnark==0.3.0             # Zero-knowledge proofs
cryptography==41.0.0       # Encryption primitives
pycryptodome==3.19.0       # Additional crypto operations
```

#### APIs & SDKs
- **UIDAI Auth API**: v2.5 or later
- **eKYC API**: For attribute retrieval
- **eSign API**: For consent management

---

## 🔐 Implementation Approach

### Phase 1: UIDAI Registration & Setup

#### Step 1: Obtain AUA License

**Timeline**: 3-6 months

**Requirements**:
1. **Company Registration**: Indian registered entity
2. **Business Plan**: Detailed use case documentation
3. **Security Audit**: CERT-IN empaneled auditor
4. **Infrastructure**: Proof of India-based infrastructure
5. **Application Fee**: ₹10,000 (non-refundable)

**Documents Required**:
- Certificate of Incorporation
- PAN Card of Company
- GST Registration
- Board Resolution
- Security Policy Document
- Data Protection Policy
- Disaster Recovery Plan
- Business Continuity Plan

**Application Process**:
```
1. Visit: https://uidai.gov.in/ecosystem/authentication-ecosystem/auas.html
2. Download AUA application form
3. Submit documents to UIDAI Regional Office
4. Security audit by CERT-IN auditor
5. UIDAI review and approval
6. Sign AUA agreement
7. Receive AUA code and credentials
```

#### Step 2: Partner with ASA

**Timeline**: 1-2 months

**Options**:
1. **NSDL e-Gov**: National Securities Depository Limited
2. **Protean (formerly NSDL)**: Leading ASA provider
3. **C-DAC**: Centre for Development of Advanced Computing
4. **NIC**: National Informatics Centre

**Partnership Requirements**:
- AUA license number
- Technical integration capability
- Commercial agreement
- SLA commitment

**Costs**:
- Setup Fee: ₹50,000 - ₹2,00,000
- Per Transaction: ₹0.50 - ₹2.00
- Annual Maintenance: ₹1,00,000 - ₹5,00,000

#### Step 3: Infrastructure Setup

**Data Center Requirements**:
```yaml
Location: India (Mumbai/Bangalore/Hyderabad)
Tier: Tier III or higher
Certifications:
  - ISO 27001
  - ISO 27017 (Cloud Security)
  - SOC 2 Type II
  - PCI DSS (if handling payments)

Network:
  - Dedicated leased line to ASA
  - Static IP whitelisted with UIDAI
  - Redundant internet connections
  - DDoS protection

Security:
  - Hardware Security Module (HSM)
  - Intrusion Detection System (IDS)
  - Web Application Firewall (WAF)
  - 24/7 Security Operations Center (SOC)
```

### Phase 2: ZKP Protocol Design

#### Age Verification ZKP Protocol

**Objective**: Prove `age >= threshold` without revealing actual age

**Protocol Steps**:

```
1. Setup Phase:
   - Generate public parameters (pp)
   - Define age thresholds: [13, 18, 21, 65]
   - Create commitment scheme

2. Registration Phase:
   - User initiates age verification
   - System generates challenge (nonce)
   - User authenticates with Aadhaar

3. Proof Generation Phase:
   - ASA returns age attribute (encrypted)
   - Local proof generator creates ZK proof
   - Proof: π = Prove(age >= threshold, pp, nonce)

4. Verification Phase:
   - System verifies proof: Verify(π, threshold, pp, nonce)
   - Store verification status (not age)
   - Issue age verification token

5. Token Usage:
   - Token contains: {verified: true, threshold: 18, expires: timestamp}
   - No actual age stored
   - Cryptographically signed
```

#### Cryptographic Primitives

**1. Commitment Scheme (Pedersen Commitment)**
```python
# Commit to age without revealing it
commitment = g^age * h^randomness mod p

# Properties:
# - Hiding: Cannot determine age from commitment
# - Binding: Cannot change age after commitment
```

**2. Range Proof (Bulletproofs)**
```python
# Prove: age ∈ [threshold, 150] without revealing age
range_proof = Bulletproof.prove(
    value=age,
    min=threshold,
    max=150,
    commitment=commitment
)

# Verification:
is_valid = Bulletproof.verify(range_proof, commitment, threshold, 150)
```

**3. Schnorr Signature (for authentication)**
```python
# Sign the proof with user's private key
signature = Schnorr.sign(proof, user_private_key)

# Prevents proof replay attacks
```

### Phase 3: Aadhaar Authentication Integration

#### Authentication Methods

**1. OTP-Based Authentication** (Recommended for web)
```python
class AadhaarOTPAuth:
    def __init__(self, aua_code, asa_url, license_key):
        self.aua_code = aua_code
        self.asa_url = asa_url
        self.license_key = license_key
    
    def request_otp(self, aadhaar_number):
        """Request OTP to be sent to registered mobile"""
        request = {
            "uid": self.encrypt_aadhaar(aadhaar_number),
            "txn": self.generate_transaction_id(),
            "ac": "public",  # Auth type: public
            "sa": "Y",       # Sub-AUA code
            "lk": self.license_key,
            "ver": "2.5"
        }
        
        response = self.send_to_asa(request, "/otp/request")
        return response["txn"]  # Transaction ID for verification
    
    def verify_otp(self, transaction_id, otp, request_age_attribute=True):
        """Verify OTP and optionally request age attribute"""
        request = {
            "uid": transaction_id,
            "otp": self.hash_otp(otp),
            "txn": transaction_id,
            "pi": {
                "yob": "Y" if request_age_attribute else "N"  # Year of Birth
            },
            "timestamp": self.get_timestamp()
        }
        
        # Sign request with AUA private key
        signed_request = self.sign_request(request)
        
        response = self.send_to_asa(signed_request, "/otp/verify")
        
        if response["status"] == "Y":
            # Extract age attribute if requested
            if request_age_attribute and "yob" in response:
                year_of_birth = self.decrypt_attribute(response["yob"])
                age = self.calculate_age(year_of_birth)
                return {"verified": True, "age": age}
            return {"verified": True}
        
        return {"verified": False, "error": response["err"]}
```

**2. Biometric Authentication** (For kiosks/offline)
```python
class AadhaarBiometricAuth:
    def __init__(self, aua_code, asa_url, device_id):
        self.aua_code = aua_code
        self.asa_url = asa_url
        self.device_id = device_id  # UIDAI-certified device
    
    def capture_biometric(self, biometric_type="FP"):
        """
        Capture biometric from UIDAI-certified device
        biometric_type: FP (fingerprint), IRIS, FACE
        """
        device = BiometricDevice(self.device_id)
        biometric_data = device.capture(biometric_type)
        
        # Device returns PID (Biometric Data) in encrypted format
        return biometric_data
    
    def authenticate(self, aadhaar_number, biometric_data):
        """Authenticate using biometric"""
        request = {
            "uid": self.encrypt_aadhaar(aadhaar_number),
            "txn": self.generate_transaction_id(),
            "bio": biometric_data,  # Encrypted PID from device
            "pi": {"yob": "Y"},     # Request year of birth
            "timestamp": self.get_timestamp()
        }
        
        signed_request = self.sign_request(request)
        response = self.send_to_asa(signed_request, "/auth/biometric")
        
        if response["status"] == "Y" and "yob" in response:
            year_of_birth = self.decrypt_attribute(response["yob"])
            age = self.calculate_age(year_of_birth)
            return {"verified": True, "age": age}
        
        return {"verified": False}
```

**3. eKYC (Full KYC with consent)**
```python
class AadhaarEKYC:
    """
    eKYC provides full demographic and biometric data
    Requires explicit user consent
    Use only when necessary (not recommended for age verification alone)
    """
    def request_ekyc(self, aadhaar_number, otp):
        """Request full eKYC data"""
        request = {
            "uid": self.encrypt_aadhaar(aadhaar_number),
            "otp": self.hash_otp(otp),
            "txn": self.generate_transaction_id(),
            "consent": "Y",  # User consent required
            "timestamp": self.get_timestamp()
        }
        
        response = self.send_to_asa(request, "/ekyc/request")
        
        if response["status"] == "Y":
            # Decrypt eKYC data
            kyc_data = self.decrypt_ekyc(response["ekyc"])
            
            # Extract only age for ZKP
            dob = kyc_data["dob"]
            age = self.calculate_age_from_dob(dob)
            
            # DO NOT STORE DOB - only use for ZKP generation
            return {"verified": True, "age": age}
        
        return {"verified": False}
```

---

## 💻 Code Implementation

### Complete ZKP Age Verification System

#### 1. ZKP Proof Generator

```python
# zkp_age_verifier.py

from py_ecc.bn128 import G1, multiply, add, FQ
from Crypto.Hash import SHA256
from Crypto.Random import get_random_bytes
import json
from datetime import datetime, timedelta

class ZKPAgeProofGenerator:
    """
    Zero-Knowledge Proof generator for age verification
    Uses Pedersen Commitments and Range Proofs
    """
    
    def __init__(self):
        # Elliptic curve parameters (BN128)
        self.G = G1  # Generator point
        self.H = multiply(G1, 12345)  # Second generator (nothing-up-my-sleeve)
        self.curve_order = 21888242871839275222246405745257275088548364400416034343698204186575808495617
    
    def generate_commitment(self, age: int, randomness: int = None):
        """
        Generate Pedersen commitment: C = age*G + randomness*H
        
        Args:
            age: Actual age to commit to
            randomness: Random blinding factor (generated if not provided)
        
        Returns:
            commitment: Elliptic curve point
            randomness: Blinding factor (needed for proof generation)
        """
        if randomness is None:
            randomness = int.from_bytes(get_random_bytes(32), 'big') % self.curve_order
        
        # C = age*G + randomness*H
        age_point = multiply(self.G, age)
        random_point = multiply(self.H, randomness)
        commitment = add(age_point, random_point)
        
        return commitment, randomness
    
    def generate_range_proof(self, age: int, threshold: int, commitment, randomness: int):
        """
        Generate range proof: Prove age >= threshold without revealing age
        
        Uses Bulletproofs-style range proof (simplified)
        
        Args:
            age: Actual age
            threshold: Minimum age to prove
            commitment: Pedersen commitment to age
            randomness: Blinding factor from commitment
        
        Returns:
            proof: Dictionary containing range proof
        """
        if age < threshold:
            raise ValueError("Cannot prove age >= threshold when age < threshold")
        
        # Delta = age - threshold (must be >= 0)
        delta = age - threshold
        
        # Generate commitment to delta
        delta_randomness = int.from_bytes(get_random_bytes(32), 'big') % self.curve_order
        delta_commitment, _ = self.generate_commitment(delta, delta_randomness)
        
        # Generate Schnorr-style proof of knowledge
        # Prove: I know (age, randomness) such that C = age*G + randomness*H
        #        AND age >= threshold
        
        # Challenge generation
        challenge_input = json.dumps({
            "commitment": self.point_to_string(commitment),
            "delta_commitment": self.point_to_string(delta_commitment),
            "threshold": threshold,
            "timestamp": datetime.utcnow().isoformat()
        }, sort_keys=True)
        
        challenge = int.from_bytes(
            SHA256.new(challenge_input.encode()).digest(),
            'big'
        ) % self.curve_order
        
        # Response generation
        response_age = (age + challenge * delta) % self.curve_order
        response_randomness = (randomness + challenge * delta_randomness) % self.curve_order
        
        proof = {
            "commitment": self.point_to_string(commitment),
            "delta_commitment": self.point_to_string(delta_commitment),
            "challenge": challenge,
            "response_age": response_age,
            "response_randomness": response_randomness,
            "threshold": threshold,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return proof
    
    def generate_age_token(self, age: int, threshold: int, user_id: str, 
                          validity_days: int = 365):
        """
        Generate complete age verification token with ZKP
        
        Args:
            age: Actual age from Aadhaar
            threshold: Minimum age to verify
            user_id: User identifier
            validity_days: Token validity period
        
        Returns:
            token: Complete age verification token
        """
        # Generate commitment
        commitment, randomness = self.generate_commitment(age)
        
        # Generate range proof
        proof = self.generate_range_proof(age, threshold, commitment, randomness)
        
        # Create token
        token = {
            "user_id": user_id,
            "threshold": threshold,
            "proof": proof,
            "issued_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(days=validity_days)).isoformat(),
            "version": "1.0"
        }
        
        # Sign token (in production, use HSM)
        token["signature"] = self.sign_token(token)
        
        return token
    
    def point_to_string(self, point):
        """Convert elliptic curve point to string representation"""
        return {
            "x": str(point[0]),
            "y": str(point[1])
        }
    
    def string_to_point(self, point_dict):
        """Convert string representation to elliptic curve point"""
        return (FQ(int(point_dict["x"])), FQ(int(point_dict["y"])))
    
    def sign_token(self, token):
        """Sign token with private key (simplified - use HSM in production)"""
        token_string = json.dumps(token, sort_keys=True)
        return SHA256.new(token_string.encode()).hexdigest()


class ZKPAgeProofVerifier:
    """
    Zero-Knowledge Proof verifier for age verification
    """
    
    def __init__(self):
        self.G = G1
        self.H = multiply(G1, 12345)
        self.curve_order = 21888242871839275222246405745257275088548364400416034343698204186575808495617
    
    def verify_range_proof(self, proof: dict) -> bool:
        """
        Verify range proof: Check if proof is valid without learning age
        
        Args:
            proof: Range proof dictionary
        
        Returns:
            bool: True if proof is valid, False otherwise
        """
        try:
            # Extract proof components
            commitment = self.string_to_point(proof["commitment"])
            delta_commitment = self.string_to_point(proof["delta_commitment"])
            challenge = proof["challenge"]
            response_age = proof["response_age"]
            response_randomness = proof["response_randomness"]
            threshold = proof["threshold"]
            
            # Verify challenge
            challenge_input = json.dumps({
                "commitment": proof["commitment"],
                "delta_commitment": proof["delta_commitment"],
                "threshold": threshold,
                "timestamp": proof["timestamp"]
            }, sort_keys=True)
            
            expected_challenge = int.from_bytes(
                SHA256.new(challenge_input.encode()).digest(),
                'big'
            ) % self.curve_order
            
            if challenge != expected_challenge:
                return False
            
            # Verify proof equation
            # Check: response_age*G + response_randomness*H = 
            #        commitment + challenge*delta_commitment
            
            left_side = add(
                multiply(self.G, response_age),
                multiply(self.H, response_randomness)
            )
            
            right_side = add(
                commitment,
                multiply(delta_commitment, challenge)
            )
            
            return left_side == right_side
            
        except Exception as e:
            print(f"Verification error: {e}")
            return False
    
    def verify_token(self, token: dict) -> dict:
        """
        Verify complete age verification token
        
        Args:
            token: Age verification token
        
        Returns:
            dict: Verification result with details
        """
        # Check expiration
        expires_at = datetime.fromisoformat(token["expires_at"])
        if datetime.utcnow() > expires_at:
            return {
                "valid": False,
                "reason": "Token expired",
                "threshold": token["threshold"]
            }
        
        # Verify signature
        token_copy = token.copy()
        signature = token_copy.pop("signature")
        expected_signature = SHA256.new(
            json.dumps(token_copy, sort_keys=True).encode()
        ).hexdigest()
        
        if signature != expected_signature:
            return {
                "valid": False,
                "reason": "Invalid signature",
                "threshold": token["threshold"]
            }
        
        # Verify ZKP
        proof_valid = self.verify_range_proof(token["proof"])
        
        if not proof_valid:
            return {
                "valid": False,
                "reason": "Invalid zero-knowledge proof",
                "threshold": token["threshold"]
            }
        
        return {
            "valid": True,
            "user_id": token["user_id"],
            "threshold": token["threshold"],
            "issued_at": token["issued_at"],
            "expires_at": token["expires_at"]
        }
    
    def string_to_point(self, point_dict):
        """Convert string representation to elliptic curve point"""
        return (FQ(int(point_dict["x"])), FQ(int(point_dict["y"])))
```

#### 2. Aadhaar Integration Service

```python
# aadhaar_service.py

import requests
import xml.etree.ElementTree as ET
from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Hash import SHA256
from Crypto.Signature import pkcs1_15
import base64
from datetime import datetime
import uuid

class AadhaarAuthenticationService:
    """
    Service for Aadhaar authentication and age attribute retrieval
    Integrates with ASA (Authentication Service Agency)
    """
    
    def __init__(self, aua_code, asa_url, aua_private_key_path, 
                 uidai_public_key_path, license_key):
        """
        Initialize Aadhaar authentication service
        
        Args:
            aua_code: AUA (Authentication User Agency) code from UIDAI
            asa_url: ASA (Authentication Service Agency) endpoint URL
            aua_private_key_path: Path to AUA private key for signing
            uidai_public_key_path: Path to UIDAI public key for encryption
            license_key: License key for ASA
        """
        self.aua_code = aua_code
        self.asa_url = asa_url
        self.license_key = license_key
        
        # Load keys
        with open(aua_private_key_path, 'rb') as f:
            self.aua_private_key = RSA.import_key(f.read())
        
        with open(uidai_public_key_path, 'rb') as f:
            self.uidai_public_key = RSA.import_key(f.read())
    
    def encrypt_aadhaar_number(self, aadhaar_number: str) -> str:
        """
        Encrypt Aadhaar number using UIDAI public key
        
        Args:
            aadhaar_number: 12-digit Aadhaar number
        
        Returns:
            Encrypted and base64-encoded Aadhaar number
        """
        cipher = PKCS1_OAEP.new(self.uidai_public_key)
        encrypted = cipher.encrypt(aadhaar_number.encode())
        return base64.b64encode(encrypted).decode()
    
    def generate_session_key(self) -> tuple:
        """
        Generate AES session key for encrypting PID data
        
        Returns:
            (session_key, encrypted_session_key)
        """
        # Generate random 256-bit AES key
        session_key = get_random_bytes(32)
        
        # Encrypt session key with UIDAI public key
        cipher = PKCS1_OAEP.new(self.uidai_public_key)
        encrypted_session_key = cipher.encrypt(session_key)
        
        return session_key, base64.b64encode(encrypted_session_key).decode()
    
    def create_pid_block(self, otp: str, timestamp: str) -> str:
        """
        Create PID (Personal Identity Data) block for OTP authentication
        
        Args:
            otp: One-time password
            timestamp: ISO format timestamp
        
        Returns:
            PID XML block
        """
        pid_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
        <Pid ts="{timestamp}" ver="2.0">
            <Demo>
                <Pi ms="E" />
            </Demo>
            <Pv otp="{otp}" />
        </Pid>"""
        
        return pid_xml
    
    def encrypt_pid_block(self, pid_xml: str, session_key: bytes) -> str:
        """
        Encrypt PID block using session key
        
        Args:
            pid_xml: PID XML string
            session_key: AES session key
        
        Returns:
            Encrypted and base64-encoded PID block
        """
        # AES encryption in CBC mode
        cipher = AES.new(session_key, AES.MODE_CBC)
        
        # Pad PID XML to AES block size
        pad_length = 16 - (len(pid_xml) % 16)
        padded_pid = pid_xml + (chr(pad_length) * pad_length)
        
        # Encrypt
        encrypted = cipher.encrypt(padded_pid.encode())
        
        # Return IV + encrypted data
        return base64.b64encode(cipher.iv + encrypted).decode()
    
    def create_auth_request(self, aadhaar_number: str, otp: str, 
                           request_age: bool = True) -> str:
        """
        Create authentication request XML
        
        Args:
            aadhaar_number: 12-digit Aadhaar number
            otp: One-time password
            request_age: Whether to request age attribute
        
        Returns:
            Signed authentication request XML
        """
        # Generate transaction ID
        txn_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S")
        
        # Generate session key
        session_key, encrypted_session_key = self.generate_session_key()
        
        # Create PID block
        pid_xml = self.create_pid_block(otp, timestamp)
        encrypted_pid = self.encrypt_pid_block(pid_xml, session_key)
        
        # Encrypt Aadhaar number
        encrypted_uid = self.encrypt_aadhaar_number(aadhaar_number)
        
        # Create auth request XML
        auth_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
        <Auth uid="{encrypted_uid}" 
              tid="public" 
              ac="{self.aua_code}" 
              sa="public"
              ver="2.5" 
              txn="{txn_id}" 
              lk="{self.license_key}">
            <Uses otp="y" {'pi="y"' if request_age else ''} />
            <Meta udc="UDC_CODE" fdc="FDC_CODE" idc="IDC_CODE" 
                  pip="PUBLIC_IP" lot="P" lov="560103" />
            <Skey ci="CERT_IDENTIFIER">{encrypted_session_key}</Skey>
            <Data type="X">{encrypted_pid}</Data>
            {'<Tkn type="yob" />' if request_age else ''}
        </Auth>"""
        
        # Sign the request
        signed_xml = self.sign_xml(auth_xml)
        
        return signed_xml, txn_id
    
    def sign_xml(self, xml_string: str) -> str:
        """
        Sign XML request with AUA private key
        
        Args:
            xml_string: XML to sign
        
        Returns:
            Signed XML with signature
        """
        # Calculate hash
        hash_obj = SHA256.new(xml_string.encode())
        
        # Sign hash
        signature = pkcs1_15.new(self.aua_private_key).sign(hash_obj)
        signature_b64 = base64.b64encode(signature).decode()
        
        # Add signature to XML
        signed_xml = xml_string.replace(
            "</Auth>",
            f"<Signature>{signature_b64}</Signature></Auth>"
        )
        
        return signed_xml
    
    def send_auth_request(self, signed_xml: str) -> dict:
        """
        Send authentication request to ASA
        
        Args:
            signed_xml: Signed authentication request XML
        
        Returns:
            Authentication response dictionary
        """
        headers = {
            'Content-Type': 'application/xml',
            'User-Agent': 'AISafetyCurationEngine/1.0'
        }
        
        try:
            response = requests.post(
                f"{self.asa_url}/auth",
                data=signed_xml,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                return self.parse_auth_response(response.text)
            else:
                return {
                    "status": "error",
                    "error_code": response.status_code,
                    "message": "Authentication request failed"
                }
        
        except requests.exceptions.RequestException as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    def parse_auth_response(self, response_xml: str) -> dict:
        """
        Parse authentication response XML
        
        Args:
            response_xml: Response XML from ASA
        
        Returns:
            Parsed response dictionary
        """
        root = ET.fromstring(response_xml)
        
        result = {
            "status": root.get("ret"),  # Y=success, N=failure
            "error_code": root.get("err"),
            "transaction_id": root.get("txn"),
            "timestamp": root.get("ts")
        }
        
        # Extract age attribute if present
        tkn_element = root.find("Tkn")
        if tkn_element is not None and tkn_element.get("type") == "yob":
            # Year of birth is encrypted, decrypt it
            encrypted_yob = tkn_element.text
            year_of_birth = self.decrypt_attribute(encrypted_yob)
            
            # Calculate age
            current_year = datetime.now().year
            age = current_year - int(year_of_birth)
            
            result["age"] = age
        
        return result
    
    def decrypt_attribute(self, encrypted_attribute: str) -> str:
        """
        Decrypt attribute using AUA private key
        
        Args:
            encrypted_attribute: Base64-encoded encrypted attribute
        
        Returns:
            Decrypted attribute value
        """
        encrypted_data = base64.b64decode(encrypted_attribute)
        cipher = PKCS1_OAEP.new(self.aua_private_key)
        decrypted = cipher.decrypt(encrypted_data)
        return decrypted.decode()
    
    def authenticate_and_get_age(self, aadhaar_number: str, otp: str) -> dict:
        """
        Complete authentication flow with age retrieval
        
        Args:
            aadhaar_number: 12-digit Aadhaar number
            otp: One-time password
        
        Returns:
            Authentication result with age
        """
        # Create and send auth request
        signed_xml, txn_id = self.create_auth_request(
            aadhaar_number, 
            otp, 
            request_age=True
        )
        
        # Send to ASA
        response = self.send_auth_request(signed_xml)
        
        if response["status"] == "Y" and "age" in response:
            return {
                "authenticated": True,
                "age": response["age"],
                "transaction_id": txn_id,
                "timestamp": response["timestamp"]
            }
        else:
            return {
                "authenticated": False,
                "error": response.get("error_code", "Unknown error"),
                "transaction_id": txn_id
            }
```

#### 3. Complete Age Verification Service

```python
# age_verification_service.py

from zkp_age_verifier import ZKPAgeProofGenerator, ZKPAgeProofVerifier
from aadhaar_service import AadhaarAuthenticationService
from typing import Dict, Optional
import logging

class AgeVerificationService:
    """
    Complete age verification service integrating Aadhaar and ZKP
    """
    
    def __init__(self, config: dict):
        """
        Initialize age verification service
        
        Args:
            config: Configuration dictionary with Aadhaar and ZKP settings
        """
        self.aadhaar_service = AadhaarAuthenticationService(
            aua_code=config["aua_code"],
            asa_url=config["asa_url"],
            aua_private_key_path=config["aua_private_key_path"],
            uidai_public_key_path=config["uidai_public_key_path"],
            license_key=config["license_key"]
        )
        
        self.zkp_generator = ZKPAgeProofGenerator()
        self.zkp_verifier = ZKPAgeProofVerifier()
        
        self.logger = logging.getLogger(__name__)
    
    def verify_age_with_aadhaar(self, user_id: str, aadhaar_number: str, 
                                otp: str, age_threshold: int) -> Dict:
        """
        Complete age verification flow
        
        1. Authenticate with Aadhaar and retrieve age
        2. Generate ZKP for age >= threshold
        3. Return verification token (without storing actual age)
        
        Args:
            user_id: User identifier
            aadhaar_number: 12-digit Aadhaar number
            otp: One-time password from Aadhaar
            age_threshold: Minimum age to verify (e.g., 18)
        
        Returns:
            Verification result with ZKP token
        """
        try:
            # Step 1: Authenticate with Aadhaar
            self.logger.info(f"Authenticating user {user_id} with Aadhaar")
            auth_result = self.aadhaar_service.authenticate_and_get_age(
                aadhaar_number, 
                otp
            )
            
            if not auth_result["authenticated"]:
                return {
                    "success": False,
                    "error": "Aadhaar authentication failed",
                    "details": auth_result.get("error")
                }
            
            age = auth_result["age"]
            self.logger.info(f"User {user_id} authenticated, age retrieved")
            
            # Step 2: Check if age meets threshold
            if age < age_threshold:
                return {
                    "success": False,
                    "error": f"Age verification failed: minimum age is {age_threshold}",
                    "meets_threshold": False
                }
            
            # Step 3: Generate ZKP token
            self.logger.info(f"Generating ZKP token for user {user_id}")
            zkp_token = self.zkp_generator.generate_age_token(
                age=age,
                threshold=age_threshold,
                user_id=user_id,
                validity_days=365
            )
            
            # Step 4: DO NOT STORE ACTUAL AGE
            # Only store verification status and token
            
            return {
                "success": True,
                "verified": True,
                "meets_threshold": True,
                "threshold": age_threshold,
                "token": zkp_token,
                "transaction_id": auth_result["transaction_id"],
                "message": f"Age verified: user is {age_threshold}+ years old"
            }
        
        except Exception as e:
            self.logger.error(f"Age verification error: {str(e)}")
            return {
                "success": False,
                "error": "Age verification failed",
                "details": str(e)
            }
    
    def verify_token(self, token: dict) -> Dict:
        """
        Verify ZKP age token
        
        Args:
            token: Age verification token
        
        Returns:
            Verification result
        """
        try:
            result = self.zkp_verifier.verify_token(token)
            return result
        
        except Exception as e:
            self.logger.error(f"Token verification error: {str(e)}")
            return {
                "valid": False,
                "reason": str(e)
            }
    
    def request_aadhaar_otp(self, aadhaar_number: str) -> Dict:
        """
        Request OTP to be sent to Aadhaar-registered mobile
        
        Args:
            aadhaar_number: 12-digit Aadhaar number
        
        Returns:
            OTP request result with transaction ID
        """
        # This would call ASA's OTP request endpoint
        # Implementation depends on ASA provider
        pass
```

---

## 📜 Compliance Requirements

### 1. DPDPA 2023 Compliance Checklist

```yaml
Data Protection Requirements:
  ✅ Consent Management:
    - Explicit consent before Aadhaar authentication
    - Clear purpose specification
    - Consent withdrawal mechanism
  
  ✅ Data Minimization:
    - Only request age attribute, not full demographics
    - Do not store date of birth
    - Store only verification status
  
  ✅ Purpose Limitation:
    - Use age data only for verification
    - No secondary use without consent
  
  ✅ Data Localization:
    - All data stored in India
    - No cross-border transfer of Aadhaar data
  
  ✅ Security Measures:
    - End-to-end encryption
    - HSM for key management
    - Regular security audits
  
  ✅ User Rights:
    - Right to access verification status
    - Right to erasure of verification records
    - Right to data portability
  
  ✅ Accountability:
    - Data Protection Officer appointed
    - Privacy policy published
    - Audit logs maintained
```

### 2. Aadhaar Act 2016 Compliance

```yaml
Aadhaar Regulations:
  ✅ AUA License:
    - Valid AUA license from UIDAI
    - Annual renewal
    - Compliance certificate
  
  ✅ Authentication Purpose:
    - Legitimate purpose (child safety)
    - No profiling or surveillance
    - User benefit clearly defined
  
  ✅ Data Protection:
    - Aadhaar number encrypted in transit
    - Aadhaar number encrypted at rest
    - No storage of biometric data
    - No sharing with third parties
  
  ✅ Consent:
    - Informed consent before authentication
    - Consent recorded and auditable
    - Alternative authentication available
  
  ✅ Security:
    - ISO 27001 certified infrastructure
    - Regular security audits
    - Incident response plan
  
  ✅ Audit Trail:
    - All authentications logged
    - Logs retained for 2 years
    - Logs available for UIDAI audit
```

### 3. IT Act 2000 Compliance

```yaml
Information Technology Act:
  ✅ Section 43A - Data Protection:
    - Reasonable security practices
    - ISO 27001 or equivalent
    - Compensation for data breach
  
  ✅ SPDI Rules:
    - Sensitive data protection
    - Encryption requirements
    - Access controls
  
  ✅ Section 72A - Disclosure:
    - No unauthorized disclosure
    - Penalties for breach
```

---

## 🔒 Security Considerations

### 1. Threat Model

**Threats**:
1. **Man-in-the-Middle (MITM)**: Attacker intercepts Aadhaar communication
2. **Replay Attack**: Attacker reuses valid authentication
3. **Proof Forgery**: Attacker creates fake ZKP
4. **Key Compromise**: Private keys stolen
5. **Side-Channel**: Timing or power analysis attacks

**Mitigations**:
1. **TLS 1.3**: All communications encrypted
2. **Nonce/Timestamp**: Prevent replay attacks
3. **Cryptographic Binding**: Proof tied to user and session
4. **HSM**: Keys stored in hardware security module
5. **Constant-Time Operations**: Prevent timing attacks

### 2. Key Management

```yaml
Key Hierarchy:
  Root Key (HSM):
    - Master key for all operations
    - Never leaves HSM
    - Backed up in secure offline storage
  
  AUA Signing Key (HSM):
    - Signs authentication requests
    - 2048-bit RSA minimum
    - Rotated annually
  
  Session Keys:
    - Generated per authentication
    - 256-bit AES
    - Destroyed after use
  
  ZKP Keys:
    - Elliptic curve keys (BN128)
    - Generated per proof
    - Not stored long-term
```

### 3. Audit Logging

```python
# audit_logger.py

class AuditLogger:
    """
    Comprehensive audit logging for compliance
    """
    
    def log_authentication_attempt(self, user_id, aadhaar_masked, 
                                   success, ip_address):
        """Log Aadhaar authentication attempt"""
        log_entry = {
            "event": "aadhaar_authentication",
            "user_id": user_id,
            "aadhaar": aadhaar_masked,  # Only last 4 digits
            "success": success,
            "ip_address": ip_address,
            "timestamp": datetime.utcnow().isoformat(),
            "user_agent": request.headers.get('User-Agent')
        }
        self.write_audit_log(log_entry)
    
    def log_zkp_generation(self, user_id, threshold, token_id):
        """Log ZKP token generation"""
        log_entry = {
            "event": "zkp_token_generated",
            "user_id": user_id,
            "threshold": threshold,
            "token_id": token_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.write_audit_log(log_entry)
    
    def log_token_verification(self, token_id, valid, user_id):
        """Log ZKP token verification"""
        log_entry = {
            "event": "zkp_token_verified",
            "token_id": token_id,
            "valid": valid,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.write_audit_log(log_entry)
```

---

## 🧪 Testing Strategy

### 1. Unit Tests

```python
# test_zkp_age_verifier.py

import unittest
from zkp_age_verifier import ZKPAgeProofGenerator, ZKPAgeProofVerifier

class TestZKPAgeVerification(unittest.TestCase):
    
    def setUp(self):
        self.generator = ZKPAgeProofGenerator()
        self.verifier = ZKPAgeProofVerifier()
    
    def test_valid_proof_above_threshold(self):
        """Test valid proof for age above threshold"""
        age = 25
        threshold = 18
        user_id = "test_user_123"
        
        # Generate token
        token = self.generator.generate_age_token(age, threshold, user_id)
        
        # Verify token
        result = self.verifier.verify_token(token)
        
        self.assertTrue(result["valid"])
        self.assertEqual(result["threshold"], threshold)
    
    def test_invalid_proof_below_threshold(self):
        """Test that proof cannot be generated for age below threshold"""
        age = 15
        threshold = 18
        user_id = "test_user_456"
        
        with self.assertRaises(ValueError):
            token = self.generator.generate_age_token(age, threshold, user_id)
    
    def test_proof_non_transferable(self):
        """Test that proof is bound to specific user"""
        age = 30
        threshold = 18
        user_id_1 = "user_1"
        user_id_2 = "user_2"
        
        # Generate token for user 1
        token = self.generator.generate_age_token(age, threshold, user_id_1)
        
        # Try to use for user 2
        token["user_id"] = user_id_2
        
        # Verification should fail (signature mismatch)
        result = self.verifier.verify_token(token)
        self.assertFalse(result["valid"])
    
    def test_expired_token(self):
        """Test that expired tokens are rejected"""
        age = 25
        threshold = 18
        user_id = "test_user_789"
        
        # Generate token with 0 days validity
        token = self.generator.generate_age_token(
            age, threshold, user_id, validity_days=0
        )
        
        # Wait a moment
        import time
        time.sleep(1)
        
        # Verification should fail (expired)
        result = self.verifier.verify_token(token)
        self.assertFalse(result["valid"])
        self.assertEqual(result["reason"], "Token expired")
```

### 2. Integration Tests

```python
# test_aadhaar_integration.py

import unittest
from unittest.mock import Mock, patch
from age_verification_service import AgeVerificationService

class TestAadhaarIntegration(unittest.TestCase):
    
    def setUp(self):
        self.config = {
            "aua_code": "TEST_AUA",
            "asa_url": "https://test-asa.example.com",
            "aua_private_key_path": "test_keys/aua_private.pem",
            "uidai_public_key_path": "test_keys/uidai_public.pem",
            "license_key": "TEST_LICENSE"
        }
        self.service = AgeVerificationService(self.config)
    
    @patch('aadhaar_service.AadhaarAuthenticationService.authenticate_and_get_age')
    def test_successful_age_verification(self, mock_auth):
        """Test successful age verification flow"""
        # Mock Aadhaar authentication
        mock_auth.return_value = {
            "authenticated": True,
            "age": 25,
            "transaction_id": "TXN123456",
            "timestamp": "2025-01-01T00:00:00"
        }
        
        # Verify age
        result = self.service.verify_age_with_aadhaar(
            user_id="test_user",
            aadhaar_number="123456789012",
            otp="123456",
            age_threshold=18
        )
        
        self.assertTrue(result["success"])
        self.assertTrue(result["verified"])
        self.assertTrue(result["meets_threshold"])
        self.assertIn("token", result)
    
    @patch('aadhaar_service.AadhaarAuthenticationService.authenticate_and_get_age')
    def test_age_below_threshold(self, mock_auth):
        """Test age verification failure when below threshold"""
        # Mock Aadhaar authentication with age below threshold
        mock_auth.return_value = {
            "authenticated": True,
            "age": 15,
            "transaction_id": "TXN123457",
            "timestamp": "2025-01-01T00:00:00"
        }
        
        # Verify age
        result = self.service.verify_age_with_aadhaar(
            user_id="test_user",
            aadhaar_number="123456789012",
            otp="123456",
            age_threshold=18
        )
        
        self.assertFalse(result["success"])
        self.assertFalse(result["meets_threshold"])
```

### 3. Security Tests

```python
# test_security.py

import unittest
from zkp_age_verifier import ZKPAgeProofGenerator, ZKPAgeProofVerifier

class TestSecurityProperties(unittest.TestCase):
    
    def test_zero_knowledge_property(self):
        """Test that verifier learns nothing except age >= threshold"""
        generator = ZKPAgeProofGenerator()
        verifier = ZKPAgeProofVerifier()
        
        # Generate proofs for different ages above threshold
        ages = [18, 25, 30, 40, 50]
        threshold = 18
        tokens = []
        
        for age in ages:
            token = generator.generate_age_token(age, threshold, f"user_{age}")
            tokens.append(token)
        
        # Verify all tokens
        for token in tokens:
            result = verifier.verify_token(token)
            self.assertTrue(result["valid"])
            # Verifier only knows threshold, not actual age
            self.assertEqual(result["threshold"], threshold)
            self.assertNotIn("age", result)
    
    def test_proof_replay_protection(self):
        """Test that proofs cannot be replayed"""
        generator = ZKPAgeProofGenerator()
        verifier = ZKPAgeProofVerifier()
        
        age = 25
        threshold = 18
        user_id = "test_user"
        
        # Generate token
        token = generator.generate_age_token(age, threshold, user_id)
        
        # First verification should succeed
        result1 = verifier.verify_token(token)
        self.assertTrue(result1["valid"])
        
        # Modify timestamp (simulate replay)
        token["proof"]["timestamp"] = "2024-01-01T00:00:00"
        
        # Second verification should fail (challenge mismatch)
        result2 = verifier.verify_token(token)
        self.assertFalse(result2["valid"])
```

---

## 🚀 Deployment Guide

### Phase 1: Development Environment (Weeks 1-4)

```bash
# 1. Set up development environment
mkdir aadhaar-zkp-age-verification
cd aadhaar-zkp-age-verification

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Generate test keys
openssl genrsa -out test_keys/aua_private.pem 2048
openssl rsa -in test_keys/aua_private.pem -pubout -out test_keys/aua_public.pem

# 5. Run unit tests
pytest tests/unit/

# 6. Run integration tests (with mocked Aadhaar)
pytest tests/integration/
```

### Phase 2: Staging Environment (Weeks 5-8)

```bash
# 1. Set up India-based staging server
# - AWS Mumbai region or Azure India Central
# - Ubuntu 22.04 LTS
# - 8 vCPUs, 16GB RAM, 100GB SSD

# 2. Install dependencies
sudo apt update
sudo apt install python3.9 python3-pip nginx postgresql redis-server

# 3. Set up HSM (software HSM for staging)
sudo apt install softhsm2
softhsm2-util --init-token --slot 0 --label "AUA_KEY"

# 4. Configure firewall
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# 5. Deploy application
git clone https://github.com/yourorg/aadhaar-zkp-verification.git
cd aadhaar-zkp-verification
pip install -r requirements.txt

# 6. Configure environment
cp .env.example .env
nano .env  # Add staging credentials

# 7. Run application
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

### Phase 3: Production Environment (Weeks 9-12)

```yaml
Production Deployment Checklist:

Infrastructure:
  ✅ India-based data center (Mumbai/Bangalore)
  ✅ Tier III+ certified facility
  ✅ Redundant power and cooling
  ✅ 24/7 security and monitoring
  ✅ Disaster recovery site

Hardware:
  ✅ Hardware Security Module (HSM)
  ✅ Load balancers (2x for redundancy)
  ✅ Application servers (4x minimum)
  ✅ Database servers (2x with replication)
  ✅ Cache servers (2x Redis cluster)

Network:
  ✅ Dedicated leased line to ASA
  ✅ Static IP whitelisted with UIDAI
  ✅ DDoS protection
  ✅ Web Application Firewall (WAF)
  ✅ Intrusion Detection System (IDS)

Security:
  ✅ ISO 27001 certification
  ✅ Regular penetration testing
  ✅ Security Operations Center (SOC)
  ✅ Incident response plan
  ✅ Backup and recovery procedures

Compliance:
  ✅ AUA license active
  ✅ ASA agreement signed
  ✅ DPDPA compliance verified
  ✅ Privacy policy published
  ✅ Data Protection Officer appointed
  ✅ Audit logs configured

Monitoring:
  ✅ Application monitoring (Prometheus/Grafana)
  ✅ Log aggregation (ELK Stack)
  ✅ Uptime monitoring (Pingdom/UptimeRobot)
  ✅ Security monitoring (SIEM)
  ✅ Performance monitoring (APM)
```

---

## 📊 Cost Estimation

### One-Time Costs

| Item | Cost (INR) | Notes |
|------|------------|-------|
| AUA License Application | 10,000 | Non-refundable |
| Security Audit (CERT-IN) | 5,00,000 - 10,00,000 | Annual |
| ASA Setup Fee | 50,000 - 2,00,000 | Varies by provider |
| Hardware Security Module | 5,00,000 - 15,00,000 | One-time purchase |
| Infrastructure Setup | 10,00,000 - 25,00,000 | Data center, servers |
| Development | 20,00,000 - 40,00,000 | 6-12 months |
| **Total One-Time** | **₹41,60,000 - ₹93,10,000** | |

### Recurring Costs (Annual)

| Item | Cost (INR/year) | Notes |
|------|-----------------|-------|
| ASA Transaction Fees | 50,000 - 5,00,000 | ₹0.50-₹2 per auth |
| ASA Annual Maintenance | 1,00,000 - 5,00,000 | Fixed fee |
| Infrastructure (Cloud) | 6,00,000 - 12,00,000 | AWS/Azure India |
| Security Audit | 5,00,000 - 10,00,000 | Annual compliance |
| Monitoring & Support | 2,00,000 - 5,00,000 | 24/7 operations |
| **Total Annual** | **₹14,50,000 - ₹37,00,000** | |

### Transaction Costs

| Volume | Cost per Auth | Monthly Cost | Annual Cost |
|--------|---------------|--------------|-------------|
| 10,000/month | ₹1.00 | ₹10,000 | ₹1,20,000 |
| 50,000/month | ₹0.75 | ₹37,500 | ₹4,50,000 |
| 1,00,000/month | ₹0.60 | ₹60,000 | ₹7,20,000 |
| 5,00,000/month | ₹0.50 | ₹2,50,000 | ₹30,00,000 |

---

## 📞 Support & Resources

### UIDAI Resources
- **Website**: https://uidai.gov.in
- **AUA Application**: https://uidai.gov.in/ecosystem/authentication-ecosystem/auas.html
- **Developer Portal**: https://authportal.uidai.gov.in
- **Support Email**: authsupport@uidai.gov.in
- **Helpline**: 1947 (toll-free)

### ASA Providers
1. **NSDL e-Gov**: https://www.nsdl.co.in
2. **Protean**: https://www.protean-tinpan.com
3. **C-DAC**: https://www.cdac.in
4. **NIC**: https://www.nic.in

### Compliance Resources
- **DPDPA 2023**: https://www.meity.gov.in/dpdpa2023
- **IT Act 2000**: https://www.meity.gov.in/content/information-technology-act
- **CERT-IN**: https://www.cert-in.org.in

---

## 🔄 Next Steps

1. **Week 1-2**: Apply for AUA license
2. **Week 3-4**: Partner with ASA
3. **Week 5-8**: Develop ZKP implementation
4. **Week 9-12**: Integrate with Aadhaar
5. **Week 13-16**: Security testing
6. **Week 17-20**: Staging deployment
7. **Week 21-24**: Production deployment

---

## 📝 Conclusion

This document provides a comprehensive guide for implementing Aadhaar-based Zero-Knowledge Proof age verification in India. The approach ensures:

✅ **Privacy**: No storage of date of birth or actual age  
✅ **Security**: Cryptographically secure verification  
✅ **Compliance**: DPDPA 2023 and Aadhaar Act compliant  
✅ **Scalability**: Can handle millions of verifications  
✅ **User Experience**: Quick and seamless verification  

For questions or support, contact: tech@aisafety.example.com

---

**Document Version**: 1.0  
**Last Updated**: November 3, 2025  
**Author**: AI Safety Curation Engine Team

