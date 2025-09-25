/**
 * TypeScript type definitions for BAML-generated types
 * These interfaces match the BAML schema definitions in content_classification.baml
 */

// User context for content analysis
export interface UserContext {
  age_category: string; // "child" | "teen" | "adult"
  jurisdiction: string; // "US" | "EU" | "India" | etc.
  parental_controls: boolean;
  content_preferences: string[];
  sensitivity_level: string; // "low" | "medium" | "high"
}

// Safety classification result
export interface SafetyClassification {
  safety_score: number; // 0.0 to 1.0
  violence_level: number; // 0.0 to 1.0
  adult_content: boolean;
  hate_speech: number; // 0.0 to 1.0
  misinformation_risk: number; // 0.0 to 1.0
  age_appropriateness: string; // "13+", "16+", "18+", etc.
  reasoning: string;
  content_warnings: string[];
}

// Educational value assessment
export interface EducationalValue {
  educational_score: number; // 0.0 to 1.0
  learning_objectives: string[];
  subject_areas: string[];
  cognitive_level: string; // Bloom's taxonomy levels
  reading_level: number; // Grade level
  factual_accuracy: number; // 0.0 to 1.0
  pedagogical_quality: number; // 0.0 to 1.0
  reasoning: string;
}

// Viewpoint and bias analysis
export interface ViewpointAnalysis {
  political_leaning: string; // "left", "center-left", "center", "center-right", "right", "neutral"
  bias_score: number; // 0.0 (neutral) to 1.0 (highly biased)
  perspective_diversity: number; // 0.0 to 1.0
  controversy_level: number; // 0.0 to 1.0
  source_credibility: number; // 0.0 to 1.0
  echo_chamber_risk: number; // 0.0 to 1.0
  reasoning: string;
  balanced_sources: string[];
}

// Comprehensive classification result
export interface ComprehensiveClassification {
  safety: SafetyClassification;
  educational: EducationalValue;
  viewpoint: ViewpointAnalysis;
  overall_recommendation: string;
  confidence_score: number; // 0.0 to 1.0
}

// API request/response types
export interface ClassificationRequest {
  content: string;
  user_context: UserContext;
  classification_type?: "safety" | "educational" | "viewpoint" | "comprehensive";
}

export interface ClassificationResponse {
  request_id: string;
  timestamp: string;
  processing_time_ms: number;
  classification: SafetyClassification | EducationalValue | ViewpointAnalysis | ComprehensiveClassification;
  confidence_score: number;
  model_used: string;
  api_version: string;
}

export interface BoundaryAnalysisRequest {
  content: string;
  classification_type: string;
}

export interface BoundaryAnalysisResponse {
  analysis: string;
  ambiguous_elements: string[];
  context_factors: string[];
  confidence_factors: string[];
}

export interface SchemaValidationRequest {
  schema_name: string;
  test_content: string;
}

export interface SchemaValidationResponse {
  validation_result: string;
  completeness_score: number;
  clarity_score: number;
  applicability_score: number;
  suggestions: string[];
}

// Streaming response types
export interface StreamingClassificationChunk {
  chunk_id: number;
  is_final: boolean;
  partial_classification: Partial<ComprehensiveClassification>;
  reasoning_update?: string;
}

export interface StreamingResponse {
  request_id: string;
  stream_id: string;
  chunks: StreamingClassificationChunk[];
  final_result?: ComprehensiveClassification;
}

// Curation engine specific types
export interface CurationRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    safety_threshold?: number;
    educational_threshold?: number;
    bias_threshold?: number;
    age_restrictions?: string[];
    content_warnings_blocked?: string[];
  };
  actions: {
    allow: boolean;
    warn: boolean;
    block: boolean;
    require_supervision: boolean;
    suggest_alternatives: boolean;
  };
  priority: number;
  enabled: boolean;
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  age_category: string;
  parent_id: string;
  curation_rules: CurationRule[];
  content_preferences: string[];
  blocked_content_types: string[];
  time_restrictions?: {
    daily_limit_hours: number;
    allowed_hours: { start: string; end: string }[];
    restricted_days: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface ParentDashboardData {
  parent_id: string;
  children: ChildProfile[];
  recent_activity: {
    child_id: string;
    content_accessed: string;
    classification_result: ComprehensiveClassification;
    action_taken: string;
    timestamp: string;
  }[];
  analytics: {
    total_content_analyzed: number;
    content_blocked: number;
    content_warned: number;
    content_allowed: number;
    top_categories: { category: string; count: number }[];
    safety_trends: { date: string; average_safety_score: number }[];
  };
}

// API error types
export interface APIError {
  error_code: string;
  error_message: string;
  details?: Record<string, any>;
  timestamp: string;
  request_id?: string;
}

// BAML client configuration
export interface BAMLClientConfig {
  api_keys: {
    openai?: string;
    anthropic?: string;
    google?: string;
  };
  default_model: string;
  timeout_ms: number;
  retry_attempts: number;
  cache_enabled: boolean;
  streaming_enabled: boolean;
}

// Real-time classification events
export interface ClassificationEvent {
  event_type: "classification_started" | "classification_completed" | "classification_failed" | "boundary_detected";
  content_id: string;
  user_id: string;
  timestamp: string;
  data: Record<string, any>;
}

// Batch processing types
export interface BatchClassificationRequest {
  batch_id: string;
  contents: { content_id: string; content: string; user_context: UserContext }[];
  priority: "low" | "medium" | "high";
  callback_url?: string;
}

export interface BatchClassificationResponse {
  batch_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: {
    total: number;
    completed: number;
    failed: number;
  };
  results: {
    content_id: string;
    classification: ComprehensiveClassification;
    processing_time_ms: number;
  }[];
  created_at: string;
  completed_at?: string;
}

// Model performance metrics
export interface ModelMetrics {
  model_name: string;
  accuracy_metrics: {
    safety_accuracy: number;
    educational_accuracy: number;
    viewpoint_accuracy: number;
    overall_accuracy: number;
  };
  performance_metrics: {
    average_response_time_ms: number;
    throughput_per_second: number;
    error_rate: number;
  };
  cost_metrics: {
    cost_per_request: number;
    tokens_per_request: number;
    total_cost: number;
  };
  last_updated: string;
}

// Content analysis cache
export interface CacheEntry {
  content_hash: string;
  classification: ComprehensiveClassification;
  user_context_hash: string;
  created_at: string;
  expires_at: string;
  hit_count: number;
}

// Webhook configuration
export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
  retry_config: {
    max_attempts: number;
    backoff_ms: number;
  };
  headers?: Record<string, string>;
}

// Export utility functions for type guards
export function isSafetyClassification(obj: any): obj is SafetyClassification {
  return obj && typeof obj.safety_score === "number" && typeof obj.reasoning === "string";
}

export function isEducationalValue(obj: any): obj is EducationalValue {
  return obj && typeof obj.educational_score === "number" && Array.isArray(obj.learning_objectives);
}

export function isViewpointAnalysis(obj: any): obj is ViewpointAnalysis {
  return obj && typeof obj.political_leaning === "string" && typeof obj.bias_score === "number";
}

export function isComprehensiveClassification(obj: any): obj is ComprehensiveClassification {
  return (
    obj &&
    isSafetyClassification(obj.safety) &&
    isEducationalValue(obj.educational) &&
    isViewpointAnalysis(obj.viewpoint) &&
    typeof obj.overall_recommendation === "string"
  );
}
