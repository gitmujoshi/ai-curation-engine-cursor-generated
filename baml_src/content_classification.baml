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
  provider "ollama"
  options {
    model "llama3.2"
    base_url "http://localhost:11434"
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

// Data structures
class UserContext {
  age_category AgeCategory
  jurisdiction Jurisdiction
  parental_controls ParentalControls
  sensitivity_level SensitivityLevel
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
  overall_confidence float @description("Overall confidence score from 0.0 to 1.0")
  recommendation string @description("Final recommendation: allow, caution, or block")
  summary_reasoning string @description("Summary of the comprehensive analysis")
}

// Functions for content classification
function ClassifySafety(content: string, user_context: UserContext) -> SafetyClassification {
  client GPT4
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
  client GPT4
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
  client GPT4
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
  client GPT4
  prompt #"
    Perform a comprehensive analysis of the following content, covering safety, 
    educational value, and viewpoint/bias.

    Content to analyze:
    """
    {{ content }}
    """

    User Context:
    - Age Category: {{ user_context.age_category }}
    - Jurisdiction: {{ user_context.jurisdiction }}
    - Parental Controls: {{ user_context.parental_controls }}
    - Sensitivity Level: {{ user_context.sensitivity_level }}

    Provide a thorough analysis that includes:
    1. Safety assessment with specific warnings
    2. Educational value evaluation
    3. Viewpoint and bias analysis
    4. Overall recommendation (allow/caution/block)
    5. Confidence score for your assessment

    Consider the user context when making recommendations.

    {{ ctx.output_format }}
  "#
}