// AI Curation Engine - Content Classification Functions
// Unified BAML definitions for safety, educational, and viewpoint analysis

// Generator for Python client
generator python_client {
  output_type "python/pydantic"
  output_dir "../baml_client_python"
  version "0.208.5"
}

// Client configurations
client<llm> GPT4 {
  provider "openai"
  options {
    model "gpt-4o"
    api_key env.OPENAI_API_KEY
  }
}

client<llm> Claude {
  provider "anthropic"
  options {
    model "claude-3-5-sonnet-20241022"
    api_key env.ANTHROPIC_API_KEY
  }
}

client<llm> Ollama {
  provider "openai"
  options {
    model "llama3.2:latest"
    base_url "http://localhost:11434/v1"
    api_key "ollama"
    temperature 0.1
    max_tokens 800
    default_role "user"
  }
}

// Enums for user context
enum AgeCategory {
  UNDER_13
  UNDER_16 
  UNDER_18
  ADULT
}

enum Jurisdiction {
  EU
  US
  INDIA
  CHINA
}

enum ParentalControls {
  NONE
  MILD
  MODERATE
  STRICT
}

enum SensitivityLevel {
  LOW
  MEDIUM
  HIGH
}

enum VulnerabilityType {
  ELDERLY
  INVESTMENT_SCAM_TARGET
  FREQUENT_NEWS_CONSUMER
  ISOLATION_RISK
  COGNITIVE_IMPAIRMENT
  RECENT_LOSS
  FINANCIAL_STRESS
}

enum ScamType {
  INVESTMENT_FRAUD
  ROMANCE_SCAM
  TECH_SUPPORT_SCAM
  MEDICARE_SCAM
  LOTTERY_SCAM
  CHARITY_FRAUD
  GRANDPARENT_SCAM
  IDENTITY_THEFT
  PHISHING
  CRYPTOCURRENCY_SCAM
}

// Data structures
class UserContext {
  age_category AgeCategory
  jurisdiction Jurisdiction
  parental_controls ParentalControls
  sensitivity_level SensitivityLevel
  vulnerability_factors VulnerabilityType[] @description("List of vulnerability factors for this user")
  protection_level string @description("Protection level: minimal, moderate, high, maximum")
}

class SafetyClassification {
  safety_score float @description("Overall safety score from 0.0 to 1.0")
  violence_level float @description("Violence content level from 0.0 to 1.0")
  adult_content bool @description("Contains adult/sexual content")
  hate_speech float @description("Hate speech detection score from 0.0 to 1.0")
  misinformation_risk float @description("Risk of misinformation from 0.0 to 1.0")
  age_appropriateness string @description("Recommended minimum age")
  reasoning string @description("Explanation of the safety assessment")
  content_warnings string[] @description("List of specific content warnings")
}

class EducationalValue {
  educational_score float @description("Educational value score from 0.0 to 1.0")
  learning_objectives string[] @description("Identified learning objectives")
  subject_areas string[] @description("Academic subject areas covered")
  cognitive_level string @description("Cognitive complexity level")
  reading_level int @description("Grade-level reading difficulty")
  factual_accuracy float @description("Factual accuracy assessment from 0.0 to 1.0")
  reasoning string @description("Explanation of the educational assessment")
}

class ScamDetection {
  is_scam bool @description("Whether this content appears to be a scam")
  scam_types ScamType[] @description("Types of scams detected")
  scam_confidence float @description("Confidence in scam detection from 0.0 to 1.0")
  urgency_tactics bool @description("Uses urgency or pressure tactics")
  too_good_to_be_true bool @description("Makes unrealistic promises")
  requests_personal_info bool @description("Requests sensitive personal information")
  unverified_claims bool @description("Makes unverified or false claims")
  emotional_manipulation bool @description("Uses emotional manipulation tactics")
  warning_flags string[] @description("Specific warning flags detected")
  protection_recommendation string @description("Recommended protection action")
}

class ViewpointAnalysis {
  political_leaning string @description("Political leaning (left, right, neutral)")
  bias_score float @description("Overall bias score from 0.0 to 1.0")
  perspective_diversity float @description("Diversity of perspectives from 0.0 to 1.0")
  controversy_level float @description("Level of controversy from 0.0 to 1.0")
  source_credibility float @description("Source credibility from 0.0 to 1.0")
  reasoning string @description("Explanation of the viewpoint assessment")
}

class ComprehensiveClassification {
  safety SafetyClassification
  educational EducationalValue
  viewpoint ViewpointAnalysis
  scam_detection ScamDetection
  overall_confidence float @description("Overall confidence score from 0.0 to 1.0")
  recommendation string @description("Final recommendation: allow, caution, or block")
  summary_reasoning string @description("Summary of the comprehensive analysis")
}

// Functions for content classification
function ClassifySafety(content: string, user_context: UserContext) -> SafetyClassification {
  client Ollama
  prompt #"
    You are an expert content safety analyst. Analyze the following content for safety and appropriateness.

    Content to analyze:
    """
    {{ content }}
    """

    User Context:
    - Age Category: {{ user_context.age_category }}
    - Jurisdiction: {{ user_context.jurisdiction }}
    - Parental Controls: {{ user_context.parental_controls }}
    - Sensitivity Level: {{ user_context.sensitivity_level }}

    Consider the user's context and provide a comprehensive safety analysis.
    Focus on violence, adult content, hate speech, and misinformation.
    Provide specific content warnings and age-appropriate recommendations.

    {{ ctx.output_format }}
  "#
}

function ClassifyEducational(content: string) -> EducationalValue {
  client Ollama
  prompt #"
    Evaluate the educational value of the following content.

    Content to analyze:
    """
    {{ content }}
    """

    Assess the educational merit, learning objectives, subject areas,
    cognitive complexity, reading level, and factual accuracy.
    Consider how effective this content would be for learning.

    {{ ctx.output_format }}
  "#
}

function ClassifyViewpoint(content: string) -> ViewpointAnalysis {
  client Ollama
  prompt #"
    Analyze the viewpoint and potential bias in the following content.

    Content to analyze:
    """
    {{ content }}
    """

    Evaluate political leaning, bias levels, perspective diversity,
    controversy, and source credibility. Provide a balanced assessment
    that helps users understand the content's perspective.

    {{ ctx.output_format }}
  "#
}

function ComprehensiveContentAnalysis(content: string, user_context: UserContext) -> ComprehensiveClassification {
  client Ollama
  prompt #"
    Analyze this content comprehensively and return ONLY valid JSON. No explanations, no disclaimers, just JSON.

    Content: {{ content }}
    
    User Context:
    - Age: {{ user_context.age_category }}
    - Vulnerability Factors: {{ user_context.vulnerability_factors }}
    - Protection Level: {{ user_context.protection_level }}
    - Parental Controls: {{ user_context.parental_controls }}

    {{ ctx.output_format }}

    CRITICAL SCAM DETECTION RULES for Vulnerable Users:
    {% if "ELDERLY" in user_context.vulnerability_factors or "INVESTMENT_SCAM_TARGET" in user_context.vulnerability_factors %}
    - URGENT: Check for investment scams, Medicare scams, romance scams, tech support scams
    - Look for urgency tactics, unrealistic promises, requests for personal info
    - Red flags: "Act now", "Limited time", "Guaranteed returns", "Secret method", "Call immediately"
    - If scam detected: is_scam = true, recommendation = "block", scam_confidence = high
    - Emotional manipulation targeting elderly: "Don't tell anyone", "You've been selected"
    - Financial pressure tactics: "Send money now", "Your benefits will be cancelled"
    {% endif %}
    
    General Rules:
    - Return ONLY the JSON object above
    - For mature content: safety_score < 0.5, adult_content = true, recommendation = "block"  
    - For safe content: safety_score > 0.7, recommendation = "allow"
    - For detected scams: recommendation = "block", include specific warning_flags
    - Always include reasoning in all reasoning fields
    - Be extra protective for users with vulnerability_factors
  "#
}