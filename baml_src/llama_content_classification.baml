// BAML Content Classification Functions for AI Curation Engine - Local Llama Version
// This file defines structured LLM interactions using local Llama models via Ollama

// Define the local Llama client configurations
client<llm> Llama3 {
  provider "openai"
  options {
    base_url "http://localhost:11434/v1"
    model "llama3.2"
    api_key "ollama"
  }
}

client<llm> Llama3_1 {
  provider "openai"
  options {
    base_url "http://localhost:11434/v1"
    model "llama3.1"
    api_key "ollama"
  }
}

client<llm> CodeLlama {
  provider "openai"
  options {
    base_url "http://localhost:11434/v1"
    model "codellama"
    api_key "ollama"
  }
}

// Fallback to OpenAI if needed
client<llm> GPT4_Fallback {
  provider "openai"
  options {
    model "gpt-4o-mini"
    api_key env.OPENAI_API_KEY
  }
}

// Define data structures for classification results (same as before)

class SafetyClassification {
  safety_score float @description("Overall safety score from 0.0 to 1.0")
  violence_level float @description("Violence content level from 0.0 to 1.0")
  adult_content bool @description("Contains adult/sexual content")
  hate_speech float @description("Hate speech detection score from 0.0 to 1.0")
  misinformation_risk float @description("Risk of misinformation from 0.0 to 1.0")
  age_appropriateness string @description("Recommended minimum age (e.g., '13+', '16+', '18+')")
  reasoning string @description("Explanation of the safety assessment")
  content_warnings string[] @description("List of specific content warnings")
}

class EducationalValue {
  educational_score float @description("Educational value score from 0.0 to 1.0")
  learning_objectives string[] @description("Identified learning objectives")
  subject_areas string[] @description("Academic subject areas covered")
  cognitive_level string @description("Bloom's taxonomy level (remember, understand, apply, analyze, evaluate, create)")
  reading_level int @description("Grade-level reading difficulty")
  factual_accuracy float @description("Factual accuracy assessment from 0.0 to 1.0")
  pedagogical_quality float @description("Teaching effectiveness score from 0.0 to 1.0")
  reasoning string @description("Explanation of educational assessment")
}

class ViewpointAnalysis {
  political_leaning string @description("Political perspective (left, center-left, center, center-right, right, neutral)")
  bias_score float @description("Overall bias detection from 0.0 (neutral) to 1.0 (highly biased)")
  perspective_diversity float @description("Diversity of viewpoints presented from 0.0 to 1.0")
  controversy_level float @description("Level of controversial content from 0.0 to 1.0")
  source_credibility float @description("Credibility assessment from 0.0 to 1.0")
  echo_chamber_risk float @description("Risk of reinforcing echo chambers from 0.0 to 1.0")
  reasoning string @description("Explanation of viewpoint analysis")
  balanced_sources string[] @description("Suggestions for balanced alternative sources")
}

class UserContext {
  age_category string @description("User age category (child, teen, adult)")
  jurisdiction string @description("Legal jurisdiction (US, EU, India, etc.)")
  parental_controls bool @description("Whether parental controls are active")
  content_preferences string[] @description("User's content preferences")
  sensitivity_level string @description("Content sensitivity level (low, medium, high)")
}

class ComprehensiveClassification {
  safety SafetyClassification
  educational EducationalValue
  viewpoint ViewpointAnalysis
  overall_recommendation string @description("Overall content recommendation")
  confidence_score float @description("Confidence in classification from 0.0 to 1.0")
}

// Main classification functions using local Llama models

function ClassifySafetyLlama(content: string, user_context: UserContext) -> SafetyClassification {
  client Llama3
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

    Analyze the content for:
    1. Violence and graphic content (including cartoon/animated violence)
    2. Adult themes and sexual content
    3. Hate speech, discrimination, and harmful stereotypes
    4. Misinformation, conspiracy theories, and factual accuracy
    5. Age-appropriate language and concepts
    6. Psychological harm potential (anxiety, depression triggers)
    7. Substance abuse references
    8. Self-harm or dangerous behavior promotion

    Consider jurisdiction-specific regulations:
    - US: COPPA compliance for under-13
    - EU: GDPR and DSA requirements
    - India: DPDPA and IT Rules compliance

    Provide specific content warnings and detailed reasoning for your assessment.

    Respond in JSON format with the following structure:
    {
      "safety_score": <float between 0.0 and 1.0>,
      "violence_level": <float between 0.0 and 1.0>,
      "adult_content": <boolean>,
      "hate_speech": <float between 0.0 and 1.0>,
      "misinformation_risk": <float between 0.0 and 1.0>,
      "age_appropriateness": "<string like '13+', '16+', '18+'>",
      "reasoning": "<detailed explanation>",
      "content_warnings": ["<warning1>", "<warning2>"]
    }

    {{ ctx.output_format }}
  "#
}

function AnalyzeEducationalValueLlama(content: string) -> EducationalValue {
  client Llama3
  prompt #"
    You are an expert educational content analyst and pedagogical researcher. Evaluate the educational value of the following content.

    Content to analyze:
    """
    {{ content }}
    """

    Assess the content based on:
    1. Clear learning objectives and outcomes
    2. Subject matter expertise and accuracy
    3. Cognitive complexity using Bloom's Taxonomy:
       - Remember: Recall facts and basic concepts
       - Understand: Explain ideas or concepts
       - Apply: Use information in new situations
       - Analyze: Draw connections among ideas
       - Evaluate: Justify a stand or decision
       - Create: Produce new or original work
    4. Reading level and accessibility for target audience
    5. Factual accuracy and evidence quality
    6. Pedagogical effectiveness and engagement
    7. Practical applicability and real-world relevance
    8. Inclusion of diverse perspectives and examples

    Consider multiple intelligence types (linguistic, logical-mathematical, spatial, musical, bodily-kinesthetic, interpersonal, intrapersonal, naturalistic).

    Provide specific learning objectives and detailed reasoning for your assessment.

    Respond in JSON format with the following structure:
    {
      "educational_score": <float between 0.0 and 1.0>,
      "learning_objectives": ["<objective1>", "<objective2>"],
      "subject_areas": ["<area1>", "<area2>"],
      "cognitive_level": "<Bloom's taxonomy level>",
      "reading_level": <integer grade level>,
      "factual_accuracy": <float between 0.0 and 1.0>,
      "pedagogical_quality": <float between 0.0 and 1.0>,
      "reasoning": "<detailed explanation>"
    }

    {{ ctx.output_format }}
  "#
}

function AnalyzeViewpointLlama(content: string) -> ViewpointAnalysis {
  client Llama3
  prompt #"
    You are an expert media bias analyst and political science researcher. Analyze the viewpoint and potential bias in the following content.

    Content to analyze:
    """
    {{ content }}
    """

    Examine the content for:
    1. Political perspective and ideological positioning
    2. Bias indicators including:
       - Loaded language and emotional appeals
       - Cherry-picking of facts or statistics
       - False dichotomies or oversimplification
       - Ad hominem attacks or strawman arguments
       - Source selection bias
    3. Perspective diversity and balance
    4. Controversial elements and sensitive topics
    5. Source credibility indicators:
       - Author expertise and credentials
       - Publication reputation and fact-checking history
       - Citation quality and verifiability
       - Transparency about funding and conflicts of interest
    6. Echo chamber reinforcement potential
    7. Polarization risk assessment

    Consider various political spectrums:
    - Economic: Socialist ↔ Capitalist
    - Social: Progressive ↔ Conservative
    - Authority: Libertarian ↔ Authoritarian

    Suggest balanced alternative sources that present different perspectives on the same topic.

    Provide detailed reasoning for your bias assessment.

    Respond in JSON format with the following structure:
    {
      "political_leaning": "<left, center-left, center, center-right, right, neutral>",
      "bias_score": <float between 0.0 and 1.0>,
      "perspective_diversity": <float between 0.0 and 1.0>,
      "controversy_level": <float between 0.0 and 1.0>,
      "source_credibility": <float between 0.0 and 1.0>,
      "echo_chamber_risk": <float between 0.0 and 1.0>,
      "reasoning": "<detailed explanation>",
      "balanced_sources": ["<source1>", "<source2>"]
    }

    {{ ctx.output_format }}
  "#
}

function ComprehensiveContentAnalysisLlama(content: string, user_context: UserContext) -> ComprehensiveClassification {
  client Llama3_1
  prompt #"
    You are an expert content analyst combining safety, educational, and bias analysis expertise. Provide a comprehensive analysis of the following content.

    Content to analyze:
    """
    {{ content }}
    """

    User Context:
    - Age Category: {{ user_context.age_category }}
    - Jurisdiction: {{ user_context.jurisdiction }}
    - Parental Controls: {{ user_context.parental_controls }}
    - Content Preferences: {{ user_context.content_preferences }}
    - Sensitivity Level: {{ user_context.sensitivity_level }}

    Perform a comprehensive analysis covering:

    SAFETY ANALYSIS:
    - Violence, adult content, hate speech
    - Misinformation and psychological harm risks
    - Age appropriateness and content warnings
    - Jurisdiction-specific compliance

    EDUCATIONAL VALUE:
    - Learning objectives and cognitive level
    - Subject areas and pedagogical quality
    - Factual accuracy and reading level
    - Real-world applicability

    VIEWPOINT ANALYSIS:
    - Political leaning and bias detection
    - Perspective diversity and controversy level
    - Source credibility and echo chamber risk
    - Alternative balanced sources

    OVERALL RECOMMENDATION:
    Synthesize all analyses to provide:
    1. Clear recommendation (allow, caution, block)
    2. Reasoning that balances safety, education, and diversity
    3. Suggested content modifications or alternatives
    4. Confidence level in the overall assessment

    Consider the user's context and preferences while maintaining objective analysis standards.

    Respond in JSON format with the following structure:
    {
      "safety": {
        "safety_score": <float>,
        "violence_level": <float>,
        "adult_content": <boolean>,
        "hate_speech": <float>,
        "misinformation_risk": <float>,
        "age_appropriateness": "<string>",
        "reasoning": "<string>",
        "content_warnings": ["<string>"]
      },
      "educational": {
        "educational_score": <float>,
        "learning_objectives": ["<string>"],
        "subject_areas": ["<string>"],
        "cognitive_level": "<string>",
        "reading_level": <integer>,
        "factual_accuracy": <float>,
        "pedagogical_quality": <float>,
        "reasoning": "<string>"
      },
      "viewpoint": {
        "political_leaning": "<string>",
        "bias_score": <float>,
        "perspective_diversity": <float>,
        "controversy_level": <float>,
        "source_credibility": <float>,
        "echo_chamber_risk": <float>,
        "reasoning": "<string>",
        "balanced_sources": ["<string>"]
      },
      "overall_recommendation": "<allow, caution, or block>",
      "confidence_score": <float between 0.0 and 1.0>
    }

    {{ ctx.output_format }}
  "#
}

// Utility functions for boundary analysis using CodeLlama for technical content

function AnalyzeCodeContentLlama(content: string, classification_type: string) -> string {
  client CodeLlama
  prompt #"
    You are analyzing code or technical content for content classification boundaries.

    Content: """{{ content }}"""
    Classification Type: {{ classification_type }}

    For code/technical content, identify:
    1. Educational value (tutorials, examples, documentation)
    2. Safety concerns (malicious code, security vulnerabilities)
    3. Complexity level (beginner, intermediate, advanced)
    4. Programming language and domain
    5. Potential misuse or security implications

    Provide analysis as a detailed explanation focusing on the technical aspects
    and their implications for content classification.
  "#
}

// Streaming function for real-time analysis using local Llama
function StreamingContentAnalysisLlama(content: string, user_context: UserContext) -> ComprehensiveClassification {
  client Llama3
  prompt #"
    Provide real-time streaming analysis of content as it's being processed.
    Focus on progressive classification updates.

    Content (streaming): """{{ content }}"""
    User Context: {{ user_context }}

    As you analyze the content, provide incremental updates on:
    1. Initial safety assessment
    2. Educational value indicators
    3. Viewpoint and bias signals
    4. Overall recommendation formation

    Update your analysis as more content becomes available, explaining how 
    additional context changes your assessment.

    {{ ctx.output_format }}
  "#
}
