// BAML Content Classification Functions for AI Curation Engine
// This file defines structured LLM interactions for content safety,
// educational value, and viewpoint analysis

// Define the client configurations
client<llm> GPT4 {
  provider "openai"
  options {
    model "gpt-4o"
    api_key env.OPENAI_API_KEY
  }
}

client<llm> GPT4Mini {
  provider "openai"
  options {
    model "gpt-4o-mini"
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

// Define data structures for classification results

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

// Main classification functions

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

    {{ ctx.output_format }}
  "#
}

function AnalyzeEducationalValue(content: string) -> EducationalValue {
  client GPT4
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

    {{ ctx.output_format }}
  "#
}

function AnalyzeViewpoint(content: string) -> ViewpointAnalysis {
  client GPT4
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

    {{ ctx.output_format }}
  "#
}

function ComprehensiveContentAnalysis(content: string, user_context: UserContext) -> ComprehensiveClassification {
  client GPT4
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
    1. Clear recommendation (Recommend, Caution, Block)
    2. Reasoning that balances safety, education, and diversity
    3. Suggested content modifications or alternatives
    4. Confidence level in the overall assessment

    Consider the user's context and preferences while maintaining objective analysis standards.

    {{ ctx.output_format }}
  "#
}

// Utility functions for boundary analysis

function AnalyzeContentBoundaries(content: string, classification_type: string) -> string {
  client GPT4Mini
  prompt #"
    You are analyzing content classification boundaries. Examine why the following content might be at the boundary between different classification categories.

    Content: """{{ content }}"""
    Classification Type: {{ classification_type }}

    Identify:
    1. Ambiguous elements that make classification challenging
    2. Context-dependent factors that could change the classification
    3. Edge cases and boundary conditions
    4. Factors that could tip the classification in either direction
    5. Additional context needed for more confident classification

    Provide specific reasoning about what makes this content borderline and what additional information would help.

    Return your analysis as a detailed explanation.
  "#
}

function ValidateClassificationSchema(schema_name: string, test_content: string) -> string {
  client GPT4Mini
  prompt #"
    You are validating a classification schema against test content.

    Schema: {{ schema_name }}
    Test Content: """{{ test_content }}"""

    Evaluate:
    1. Schema completeness - does it capture all relevant aspects?
    2. Schema clarity - are the categories well-defined and distinct?
    3. Schema applicability - does it work for this type of content?
    4. Edge cases - what content might not fit well in this schema?
    5. Improvements - how could the schema be enhanced?

    Provide specific feedback on the schema's effectiveness and suggested improvements.
  "#
}

// Streaming function for real-time analysis
function StreamingContentAnalysis(content: string, user_context: UserContext) -> ComprehensiveClassification {
  client GPT4
  prompt #"
    Provide real-time streaming analysis of content as it's being processed.

    Content (streaming): """{{ content }}"""
    User Context: {{ user_context }}

    As you analyze the content, provide incremental updates on:
    1. Initial safety assessment
    2. Educational value indicators
    3. Viewpoint and bias signals
    4. Overall recommendation formation

    Update your analysis as more content becomes available, explaining how additional context changes your assessment.

    {{ ctx.output_format }}
  "#
}
