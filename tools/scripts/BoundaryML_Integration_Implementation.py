"""
BoundaryML Integration Implementation for AI Curation Engine
===========================================================

This module demonstrates the practical integration of BoundaryML's LLM-based 
classification capabilities into the AI Curation Engine architecture.

Features:
- Structured content classification with schema enforcement
- Decision boundary analysis for model reliability
- Adaptive prompt engineering based on user context
- Multi-modal content processing pipeline
- Real-time classification with caching optimization
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import hashlib

# External dependencies
try:
    from boundaryml import BoundaryMLClient, ClassificationSchema
    import redis
    import numpy as np
    from transformers import pipeline
except ImportError as e:
    logging.warning(f"Optional dependency not found: {e}")

# Configuration and schemas
class AgeCategory(Enum):
    UNDER_13 = "under_13"
    UNDER_16 = "under_16" 
    UNDER_18 = "under_18"
    ADULT = "adult"

class Jurisdiction(Enum):
    EU = "EU"
    US = "US"
    INDIA = "IN"
    CHINA = "CN"

@dataclass
class UserProfile:
    """User profile for content classification context"""
    user_id: str
    age_category: AgeCategory
    jurisdiction: Jurisdiction
    preferences: Dict[str, Any]
    parental_controls: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class Content:
    """Content model for classification"""
    content_id: str
    platform: str
    content_type: str  # 'text', 'image', 'video', 'audio', 'mixed'
    title: str
    description: str
    text_content: str
    url: str
    metadata: Dict[str, Any]
    timestamp: datetime

@dataclass
class SafetyClassification:
    """Safety classification results from BoundaryML"""
    safety_score: float
    violence_level: float
    adult_content: bool
    hate_speech: float
    misinformation_risk: float
    age_appropriateness: str
    reasoning: str
    confidence: float

@dataclass
class EducationalClassification:
    """Educational value classification results"""
    educational_value: float
    learning_objectives: List[str]
    subject_areas: List[str]
    cognitive_level: str
    reading_level: float
    factual_accuracy: float
    confidence: float

@dataclass
class ViewpointClassification:
    """Viewpoint and bias classification results"""
    political_leaning: str
    bias_score: float
    perspective_diversity: float
    controversy_level: float
    source_credibility: float
    echo_chamber_risk: float
    confidence: float

@dataclass
class ComprehensiveClassification:
    """Combined classification results"""
    content_id: str
    safety: SafetyClassification
    educational: EducationalClassification
    viewpoint: ViewpointClassification
    overall_confidence: float
    processing_time: float
    model_version: str
    timestamp: datetime

class BoundaryMLContentClassifier:
    """
    Main classifier using BoundaryML for structured LLM-based content analysis
    """
    
    def __init__(self, 
                 api_key: str, 
                 model_name: str = "gpt-4",
                 redis_client: Optional[redis.Redis] = None,
                 cache_ttl: int = 3600):
        self.client = BoundaryMLClient(api_key=api_key)
        self.model_name = model_name
        self.redis_client = redis_client
        self.cache_ttl = cache_ttl
        self.prompt_engine = AdaptivePromptEngine()
        
        # Initialize logging
        self.logger = logging.getLogger(__name__)
        
        # Classification schemas
        self.schemas = {
            'safety': self._get_safety_schema(),
            'educational': self._get_educational_schema(),
            'viewpoint': self._get_viewpoint_schema()
        }
    
    def _get_safety_schema(self) -> Dict[str, Any]:
        """Get JSON schema for safety classification"""
        return {
            "type": "object",
            "properties": {
                "safety_score": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 1,
                    "description": "Overall safety score for the content"
                },
                "violence_level": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 1,
                    "description": "Level of violent content"
                },
                "adult_content": {
                    "type": "boolean",
                    "description": "Whether content contains adult themes"
                },
                "hate_speech": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 1,
                    "description": "Probability of hate speech"
                },
                "misinformation_risk": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 1,
                    "description": "Risk of containing misinformation"
                },
                "age_appropriateness": {
                    "type": "string",
                    "enum": ["0+", "7+", "13+", "16+", "18+"],
                    "description": "Minimum appropriate age"
                },
                "reasoning": {
                    "type": "string",
                    "description": "Explanation for the safety classification"
                },
                "confidence": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 1,
                    "description": "Confidence in classification"
                }
            },
            "required": ["safety_score", "age_appropriateness", "reasoning", "confidence"]
        }
    
    def _get_educational_schema(self) -> Dict[str, Any]:
        """Get JSON schema for educational classification"""
        return {
            "type": "object",
            "properties": {
                "educational_value": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 1,
                    "description": "Educational value score"
                },
                "learning_objectives": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Identified learning objectives"
                },
                "subject_areas": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": ["mathematics", "science", "literature", "history", 
                               "technology", "arts", "social_studies", "other"]
                    },
                    "description": "Subject areas covered"
                },
                "cognitive_level": {
                    "type": "string",
                    "enum": ["remember", "understand", "apply", "analyze", "evaluate", "create"],
                    "description": "Bloom's taxonomy cognitive level"
                },
                "reading_level": {
                    "type": "number",
                    "minimum": 1,
                    "maximum": 20,
                    "description": "Grade level reading difficulty"
                },
                "factual_accuracy": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 1,
                    "description": "Confidence in factual accuracy"
                },
                "confidence": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 1,
                    "description": "Confidence in classification"
                }
            },
            "required": ["educational_value", "cognitive_level", "reading_level", "confidence"]
        }
    
    def _get_viewpoint_schema(self) -> Dict[str, Any]:
        """Get JSON schema for viewpoint classification"""
        return {
            "type": "object",
            "properties": {
                "political_leaning": {
                    "type": "string",
                    "enum": ["left", "center-left", "center", "center-right", "right", "neutral", "mixed"],
                    "description": "Political perspective"
                },
                "bias_score": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 1,
                    "description": "Level of bias detected"
                },
                "perspective_diversity": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 1,
                    "description": "Degree of perspective diversity"
                },
                "controversy_level": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 1,
                    "description": "Level of controversial content"
                },
                "source_credibility": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 1,
                    "description": "Credibility of the content source"
                },
                "echo_chamber_risk": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 1,
                    "description": "Risk of reinforcing echo chambers"
                },
                "confidence": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 1,
                    "description": "Confidence in classification"
                }
            },
            "required": ["political_leaning", "bias_score", "source_credibility", "confidence"]
        }
    
    def _generate_cache_key(self, content: str, classification_type: str, user_context: Dict[str, Any]) -> str:
        """Generate cache key for classification results"""
        content_hash = hashlib.md5(content.encode()).hexdigest()
        context_hash = hashlib.md5(json.dumps(user_context, sort_keys=True).encode()).hexdigest()
        return f"classification:{classification_type}:{content_hash}:{context_hash}"
    
    async def _get_cached_result(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get cached classification result"""
        if not self.redis_client:
            return None
        
        try:
            cached = await self.redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception as e:
            self.logger.warning(f"Cache retrieval failed: {e}")
        
        return None
    
    async def _cache_result(self, cache_key: str, result: Dict[str, Any]) -> None:
        """Cache classification result"""
        if not self.redis_client:
            return
        
        try:
            await self.redis_client.setex(
                cache_key, 
                self.cache_ttl, 
                json.dumps(result, default=str)
            )
        except Exception as e:
            self.logger.warning(f"Cache storage failed: {e}")
    
    async def classify_safety(self, content: str, user_profile: UserProfile) -> SafetyClassification:
        """Classify content safety using BoundaryML with schema enforcement"""
        
        cache_key = self._generate_cache_key(content, "safety", user_profile.to_dict())
        cached_result = await self._get_cached_result(cache_key)
        
        if cached_result:
            return SafetyClassification(**cached_result)
        
        prompt = self.prompt_engine.generate_safety_prompt(content, user_profile)
        
        try:
            start_time = datetime.now()
            
            result = await self.client.classify_with_schema(
                content=prompt,
                schema=self.schemas['safety'],
                model=self.model_name
            )
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Validate and create SafetyClassification object
            safety_classification = SafetyClassification(
                safety_score=result['safety_score'],
                violence_level=result.get('violence_level', 0),
                adult_content=result.get('adult_content', False),
                hate_speech=result.get('hate_speech', 0),
                misinformation_risk=result.get('misinformation_risk', 0),
                age_appropriateness=result['age_appropriateness'],
                reasoning=result['reasoning'],
                confidence=result['confidence']
            )
            
            # Cache the result
            await self._cache_result(cache_key, asdict(safety_classification))
            
            return safety_classification
            
        except Exception as e:
            self.logger.error(f"Safety classification failed: {e}")
            # Return conservative fallback
            return SafetyClassification(
                safety_score=0.0,
                violence_level=1.0,
                adult_content=True,
                hate_speech=1.0,
                misinformation_risk=1.0,
                age_appropriateness="18+",
                reasoning="Classification failed - applying conservative safety defaults",
                confidence=0.0
            )
    
    async def classify_educational_value(self, content: str) -> EducationalClassification:
        """Assess educational value using structured LLM analysis"""
        
        cache_key = self._generate_cache_key(content, "educational", {})
        cached_result = await self._get_cached_result(cache_key)
        
        if cached_result:
            return EducationalClassification(**cached_result)
        
        prompt = self.prompt_engine.generate_educational_prompt(content)
        
        try:
            result = await self.client.classify_with_schema(
                content=prompt,
                schema=self.schemas['educational'],
                model=self.model_name
            )
            
            educational_classification = EducationalClassification(
                educational_value=result['educational_value'],
                learning_objectives=result.get('learning_objectives', []),
                subject_areas=result.get('subject_areas', []),
                cognitive_level=result['cognitive_level'],
                reading_level=result['reading_level'],
                factual_accuracy=result.get('factual_accuracy', 0.5),
                confidence=result['confidence']
            )
            
            await self._cache_result(cache_key, asdict(educational_classification))
            return educational_classification
            
        except Exception as e:
            self.logger.error(f"Educational classification failed: {e}")
            return EducationalClassification(
                educational_value=0.0,
                learning_objectives=[],
                subject_areas=[],
                cognitive_level="remember",
                reading_level=12.0,
                factual_accuracy=0.5,
                confidence=0.0
            )
    
    async def classify_viewpoint(self, content: str) -> ViewpointClassification:
        """Analyze viewpoint and bias using LLM classification"""
        
        cache_key = self._generate_cache_key(content, "viewpoint", {})
        cached_result = await self._get_cached_result(cache_key)
        
        if cached_result:
            return ViewpointClassification(**cached_result)
        
        prompt = self.prompt_engine.generate_viewpoint_prompt(content)
        
        try:
            result = await self.client.classify_with_schema(
                content=prompt,
                schema=self.schemas['viewpoint'],
                model=self.model_name
            )
            
            viewpoint_classification = ViewpointClassification(
                political_leaning=result['political_leaning'],
                bias_score=result['bias_score'],
                perspective_diversity=result.get('perspective_diversity', 0.5),
                controversy_level=result.get('controversy_level', 0.0),
                source_credibility=result['source_credibility'],
                echo_chamber_risk=result.get('echo_chamber_risk', 0.0),
                confidence=result['confidence']
            )
            
            await self._cache_result(cache_key, asdict(viewpoint_classification))
            return viewpoint_classification
            
        except Exception as e:
            self.logger.error(f"Viewpoint classification failed: {e}")
            return ViewpointClassification(
                political_leaning="neutral",
                bias_score=0.5,
                perspective_diversity=0.5,
                controversy_level=0.0,
                source_credibility=0.5,
                echo_chamber_risk=0.0,
                confidence=0.0
            )
    
    async def comprehensive_classify(self, content: Content, user_profile: UserProfile) -> ComprehensiveClassification:
        """Perform comprehensive content classification"""
        
        start_time = datetime.now()
        
        # Extract text content for analysis
        text_content = self._extract_text_content(content)
        
        # Run classifications in parallel
        safety_result, educational_result, viewpoint_result = await asyncio.gather(
            self.classify_safety(text_content, user_profile),
            self.classify_educational_value(text_content),
            self.classify_viewpoint(text_content),
            return_exceptions=True
        )
        
        # Handle any exceptions in parallel execution
        if isinstance(safety_result, Exception):
            self.logger.error(f"Safety classification error: {safety_result}")
            safety_result = self._get_fallback_safety_classification()
        
        if isinstance(educational_result, Exception):
            self.logger.error(f"Educational classification error: {educational_result}")
            educational_result = self._get_fallback_educational_classification()
        
        if isinstance(viewpoint_result, Exception):
            self.logger.error(f"Viewpoint classification error: {viewpoint_result}")
            viewpoint_result = self._get_fallback_viewpoint_classification()
        
        # Calculate overall confidence
        overall_confidence = (
            safety_result.confidence + 
            educational_result.confidence + 
            viewpoint_result.confidence
        ) / 3
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return ComprehensiveClassification(
            content_id=content.content_id,
            safety=safety_result,
            educational=educational_result,
            viewpoint=viewpoint_result,
            overall_confidence=overall_confidence,
            processing_time=processing_time,
            model_version=self.model_name,
            timestamp=datetime.now()
        )
    
    def _extract_text_content(self, content: Content) -> str:
        """Extract text content from various content types"""
        # For now, return the text_content field
        # In a full implementation, this would handle:
        # - Image OCR extraction
        # - Video transcription
        # - Audio speech-to-text
        # - Document parsing
        return content.text_content or content.description or content.title
    
    def _get_fallback_safety_classification(self) -> SafetyClassification:
        """Get conservative fallback safety classification"""
        return SafetyClassification(
            safety_score=0.0,
            violence_level=1.0,
            adult_content=True,
            hate_speech=1.0,
            misinformation_risk=1.0,
            age_appropriateness="18+",
            reasoning="Fallback conservative classification due to processing error",
            confidence=0.0
        )
    
    def _get_fallback_educational_classification(self) -> EducationalClassification:
        """Get fallback educational classification"""
        return EducationalClassification(
            educational_value=0.0,
            learning_objectives=[],
            subject_areas=[],
            cognitive_level="remember",
            reading_level=12.0,
            factual_accuracy=0.5,
            confidence=0.0
        )
    
    def _get_fallback_viewpoint_classification(self) -> ViewpointClassification:
        """Get fallback viewpoint classification"""
        return ViewpointClassification(
            political_leaning="neutral",
            bias_score=0.5,
            perspective_diversity=0.5,
            controversy_level=0.0,
            source_credibility=0.5,
            echo_chamber_risk=0.0,
            confidence=0.0
        )


class AdaptivePromptEngine:
    """
    Generates context-aware prompts for content classification based on user profile
    """
    
    def __init__(self):
        self.prompt_templates = self._initialize_templates()
    
    def _initialize_templates(self) -> Dict[str, Dict[str, str]]:
        """Initialize prompt templates for different contexts"""
        return {
            'safety_analysis': {
                'child_focused': """
                Analyze this content specifically for child safety (age category: {age_category}):
                
                Content: "{content}"
                
                Critical safety factors for children:
                1. Age-inappropriate themes or concepts
                2. Scary or disturbing imagery/descriptions  
                3. Complex emotional content beyond developmental stage
                4. Educational vs entertainment value
                5. Potential negative behavioral modeling
                6. Language complexity and readability
                
                Consider the child's cognitive development and emotional readiness.
                Provide specific reasoning for your safety assessment.
                """,
                
                'teen_focused': """
                Evaluate this content for teenage users (age category: {age_category}):
                
                Content: "{content}"
                
                Teen-specific considerations:
                1. Identity development impact
                2. Peer influence and social pressure themes
                3. Risk-taking behavior promotion
                4. Mental health implications
                5. Academic and career relevance
                6. Social media and digital literacy
                
                Balance autonomy with protective guidance.
                Consider both risks and developmental benefits.
                """,
                
                'adult_focused': """
                Assess this content for adult users with focus on:
                
                Content: "{content}"
                
                Adult safety considerations:
                1. Misinformation and conspiracy theories
                2. Extremist content and radicalization risk
                3. Financial scams and fraud
                4. Privacy and security implications  
                5. Echo chamber reinforcement
                6. Factual accuracy and source credibility
                
                Emphasize informed choice and critical thinking.
                """
            },
            
            'educational_analysis': """
            Evaluate the educational value of this content:
            
            Content: "{content}"
            
            Analyze:
            1. Learning objectives and outcomes
            2. Subject matter expertise and accuracy
            3. Cognitive complexity (Bloom's taxonomy level)
            4. Reading level and accessibility
            5. Factual accuracy and evidence quality
            6. Pedagogical effectiveness and engagement
            7. Curriculum alignment potential
            
            Provide detailed educational assessment with specific evidence.
            """,
            
            'viewpoint_analysis': """
            Analyze the viewpoint and potential bias in this content:
            
            Content: "{content}"
            
            Examine:
            1. Political perspective and ideological position
            2. Bias indicators and loaded language
            3. Perspective diversity and balance
            4. Controversial elements and sensitive topics
            5. Source credibility indicators
            6. Echo chamber reinforcement potential
            7. Factual claims vs. opinion statements
            
            Provide balanced viewpoint analysis with specific examples.
            """
        }
    
    def generate_safety_prompt(self, content: str, user_profile: UserProfile) -> str:
        """Generate safety analysis prompt based on user age category"""
        
        age_category = user_profile.age_category
        
        # Select appropriate template based on age
        if age_category in [AgeCategory.UNDER_13, AgeCategory.UNDER_16]:
            template_key = 'child_focused'
        elif age_category == AgeCategory.UNDER_18:
            template_key = 'teen_focused'
        else:
            template_key = 'adult_focused'
        
        base_prompt = self.prompt_templates['safety_analysis'][template_key]
        
        # Add jurisdiction-specific considerations
        jurisdiction_addendum = self._get_jurisdiction_addendum(user_profile.jurisdiction)
        
        return base_prompt.format(
            age_category=age_category.value,
            content=content[:2000]  # Truncate for API limits
        ) + jurisdiction_addendum
    
    def generate_educational_prompt(self, content: str) -> str:
        """Generate educational value analysis prompt"""
        return self.prompt_templates['educational_analysis'].format(
            content=content[:2000]
        )
    
    def generate_viewpoint_prompt(self, content: str) -> str:
        """Generate viewpoint analysis prompt"""
        return self.prompt_templates['viewpoint_analysis'].format(
            content=content[:2000]
        )
    
    def _get_jurisdiction_addendum(self, jurisdiction: Jurisdiction) -> str:
        """Add jurisdiction-specific regulatory considerations"""
        addenda = {
            Jurisdiction.EU: "\n\nEU Regulatory Context: Apply GDPR privacy principles and DSA risk assessment frameworks. Consider data minimization and systemic risk factors.",
            
            Jurisdiction.US: "\n\nUS Regulatory Context: Consider COPPA compliance for under-13 users and state-level social media restrictions. Focus on verifiable parental consent requirements.",
            
            Jurisdiction.INDIA: "\n\nIndia Regulatory Context: Apply DPDPA stringent consent requirements for under-18 users. Prohibit targeted advertising and behavioral monitoring for minors.",
            
            Jurisdiction.CHINA: "\n\nChina Regulatory Context: Enforce Minor Mode restrictions and content supervision standards. Apply real-name authentication requirements."
        }
        return addenda.get(jurisdiction, '')


class BoundaryAnalyzer:
    """
    Analyzes decision boundaries and classification reliability for the BoundaryML classifier
    """
    
    def __init__(self, classifier: BoundaryMLContentClassifier):
        self.classifier = classifier
        self.logger = logging.getLogger(__name__)
    
    async def analyze_classification_boundaries(self, 
                                              test_examples: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze decision boundaries for content classification reliability"""
        
        self.logger.info(f"Starting boundary analysis with {len(test_examples)} examples")
        
        boundary_results = {
            'safety_boundaries': await self._analyze_safety_boundaries(test_examples),
            'educational_boundaries': await self._analyze_educational_boundaries(test_examples),
            'viewpoint_boundaries': await self._analyze_viewpoint_boundaries(test_examples),
            'cross_boundary_consistency': await self._analyze_cross_boundary_consistency(test_examples)
        }
        
        return boundary_results
    
    async def _analyze_safety_boundaries(self, examples: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze safety classification decision boundaries"""
        
        # Create test cases with varying safety levels
        safety_test_cases = self._create_safety_boundary_tests(examples)
        
        results = []
        for test_case in safety_test_cases:
            try:
                classification = await self.classifier.classify_safety(
                    test_case['content'], 
                    test_case['user_profile']
                )
                
                results.append({
                    'test_case_id': test_case['id'],
                    'expected_safety_score': test_case['expected_safety'],
                    'actual_safety_score': classification.safety_score,
                    'confidence': classification.confidence,
                    'reasoning': classification.reasoning
                })
                
            except Exception as e:
                self.logger.error(f"Safety boundary test failed for case {test_case['id']}: {e}")
        
        return self._calculate_boundary_metrics(results, 'safety')
    
    async def _analyze_educational_boundaries(self, examples: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze educational value classification boundaries"""
        
        educational_test_cases = self._create_educational_boundary_tests(examples)
        
        results = []
        for test_case in educational_test_cases:
            try:
                classification = await self.classifier.classify_educational_value(test_case['content'])
                
                results.append({
                    'test_case_id': test_case['id'],
                    'expected_educational_value': test_case['expected_educational'],
                    'actual_educational_value': classification.educational_value,
                    'confidence': classification.confidence
                })
                
            except Exception as e:
                self.logger.error(f"Educational boundary test failed for case {test_case['id']}: {e}")
        
        return self._calculate_boundary_metrics(results, 'educational')
    
    async def _analyze_viewpoint_boundaries(self, examples: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze viewpoint classification boundaries"""
        
        viewpoint_test_cases = self._create_viewpoint_boundary_tests(examples)
        
        results = []
        for test_case in viewpoint_test_cases:
            try:
                classification = await self.classifier.classify_viewpoint(test_case['content'])
                
                results.append({
                    'test_case_id': test_case['id'],
                    'expected_bias_score': test_case['expected_bias'],
                    'actual_bias_score': classification.bias_score,
                    'expected_political_leaning': test_case['expected_leaning'],
                    'actual_political_leaning': classification.political_leaning,
                    'confidence': classification.confidence
                })
                
            except Exception as e:
                self.logger.error(f"Viewpoint boundary test failed for case {test_case['id']}: {e}")
        
        return self._calculate_boundary_metrics(results, 'viewpoint')
    
    async def _analyze_cross_boundary_consistency(self, examples: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze consistency across different classification types"""
        
        consistency_results = []
        
        for example in examples[:50]:  # Limit for performance
            try:
                user_profile = UserProfile(
                    user_id="test_user",
                    age_category=AgeCategory.ADULT,
                    jurisdiction=Jurisdiction.US,
                    preferences={}
                )
                
                content_obj = Content(
                    content_id=example['id'],
                    platform="test",
                    content_type="text",
                    title=example.get('title', ''),
                    description=example.get('description', ''),
                    text_content=example['content'],
                    url="",
                    metadata={},
                    timestamp=datetime.now()
                )
                
                comprehensive = await self.classifier.comprehensive_classify(content_obj, user_profile)
                
                consistency_results.append({
                    'content_id': example['id'],
                    'safety_confidence': comprehensive.safety.confidence,
                    'educational_confidence': comprehensive.educational.confidence,
                    'viewpoint_confidence': comprehensive.viewpoint.confidence,
                    'overall_confidence': comprehensive.overall_confidence,
                    'processing_time': comprehensive.processing_time
                })
                
            except Exception as e:
                self.logger.error(f"Cross-boundary consistency test failed for {example['id']}: {e}")
        
        return self._calculate_consistency_metrics(consistency_results)
    
    def _create_safety_boundary_tests(self, examples: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create boundary test cases for safety classification"""
        # This would create test cases with known safety boundaries
        # For demonstration, returning a subset of examples with expected values
        return [
            {
                'id': f"safety_test_{i}",
                'content': example['content'],
                'expected_safety': example.get('expected_safety', 0.5),
                'user_profile': UserProfile(
                    user_id="test_user",
                    age_category=AgeCategory.ADULT,
                    jurisdiction=Jurisdiction.US,
                    preferences={}
                )
            }
            for i, example in enumerate(examples[:20])
        ]
    
    def _create_educational_boundary_tests(self, examples: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create boundary test cases for educational classification"""
        return [
            {
                'id': f"educational_test_{i}",
                'content': example['content'],
                'expected_educational': example.get('expected_educational', 0.5)
            }
            for i, example in enumerate(examples[:20])
        ]
    
    def _create_viewpoint_boundary_tests(self, examples: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create boundary test cases for viewpoint classification"""
        return [
            {
                'id': f"viewpoint_test_{i}",
                'content': example['content'],
                'expected_bias': example.get('expected_bias', 0.5),
                'expected_leaning': example.get('expected_leaning', 'neutral')
            }
            for i, example in enumerate(examples[:20])
        ]
    
    def _calculate_boundary_metrics(self, results: List[Dict[str, Any]], classification_type: str) -> Dict[str, Any]:
        """Calculate boundary analysis metrics"""
        if not results:
            return {'error': 'No results to analyze'}
        
        # Calculate accuracy, confidence distribution, error patterns
        if classification_type == 'safety':
            accuracy = self._calculate_regression_accuracy(results, 'expected_safety_score', 'actual_safety_score')
        elif classification_type == 'educational':
            accuracy = self._calculate_regression_accuracy(results, 'expected_educational_value', 'actual_educational_value')
        else:  # viewpoint
            accuracy = self._calculate_classification_accuracy(results, 'expected_political_leaning', 'actual_political_leaning')
        
        confidences = [r['confidence'] for r in results]
        avg_confidence = sum(confidences) / len(confidences)
        confidence_std = np.std(confidences) if len(confidences) > 1 else 0
        
        return {
            'accuracy': accuracy,
            'average_confidence': avg_confidence,
            'confidence_std_dev': float(confidence_std),
            'total_tests': len(results),
            'boundary_stability': self._assess_boundary_stability(results)
        }
    
    def _calculate_regression_accuracy(self, results: List[Dict[str, Any]], expected_key: str, actual_key: str) -> float:
        """Calculate accuracy for regression-type predictions"""
        if not results:
            return 0.0
        
        total_error = sum(abs(r[expected_key] - r[actual_key]) for r in results)
        mae = total_error / len(results)  # Mean Absolute Error
        return max(0.0, 1.0 - mae)  # Convert to accuracy score
    
    def _calculate_classification_accuracy(self, results: List[Dict[str, Any]], expected_key: str, actual_key: str) -> float:
        """Calculate accuracy for classification predictions"""
        if not results:
            return 0.0
        
        correct = sum(1 for r in results if r[expected_key] == r[actual_key])
        return correct / len(results)
    
    def _assess_boundary_stability(self, results: List[Dict[str, Any]]) -> float:
        """Assess stability of decision boundaries"""
        # Simple stability metric based on confidence variance
        confidences = [r['confidence'] for r in results]
        if len(confidences) < 2:
            return 0.0
        
        variance = np.var(confidences)
        # Higher variance = less stable, convert to stability score
        return max(0.0, 1.0 - variance)
    
    def _calculate_consistency_metrics(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate cross-boundary consistency metrics"""
        if not results:
            return {'error': 'No consistency results to analyze'}
        
        # Analyze confidence correlations across classification types
        safety_confidences = [r['safety_confidence'] for r in results]
        educational_confidences = [r['educational_confidence'] for r in results]
        viewpoint_confidences = [r['viewpoint_confidence'] for r in results]
        overall_confidences = [r['overall_confidence'] for r in results]
        processing_times = [r['processing_time'] for r in results]
        
        return {
            'average_safety_confidence': sum(safety_confidences) / len(safety_confidences),
            'average_educational_confidence': sum(educational_confidences) / len(educational_confidences),
            'average_viewpoint_confidence': sum(viewpoint_confidences) / len(viewpoint_confidences),
            'average_overall_confidence': sum(overall_confidences) / len(overall_confidences),
            'average_processing_time': sum(processing_times) / len(processing_times),
            'confidence_correlation': self._calculate_confidence_correlation(
                safety_confidences, educational_confidences, viewpoint_confidences
            )
        }
    
    def _calculate_confidence_correlation(self, safety: List[float], educational: List[float], viewpoint: List[float]) -> Dict[str, float]:
        """Calculate correlation between confidence scores across classification types"""
        try:
            corr_safety_edu = np.corrcoef(safety, educational)[0, 1]
            corr_safety_view = np.corrcoef(safety, viewpoint)[0, 1]
            corr_edu_view = np.corrcoef(educational, viewpoint)[0, 1]
            
            return {
                'safety_educational': float(corr_safety_edu) if not np.isnan(corr_safety_edu) else 0.0,
                'safety_viewpoint': float(corr_safety_view) if not np.isnan(corr_safety_view) else 0.0,
                'educational_viewpoint': float(corr_edu_view) if not np.isnan(corr_edu_view) else 0.0
            }
        except Exception as e:
            logging.warning(f"Correlation calculation failed: {e}")
            return {'safety_educational': 0.0, 'safety_viewpoint': 0.0, 'educational_viewpoint': 0.0}


# Example usage and testing
async def main():
    """Example usage of BoundaryML integration"""
    
    # Initialize the classifier
    classifier = BoundaryMLContentClassifier(
        api_key="your_boundaryml_api_key",
        model_name="gpt-4"
    )
    
    # Example content
    example_content = Content(
        content_id="example_1",
        platform="twitter",
        content_type="text",
        title="Educational Technology Article",
        description="An article about AI in education",
        text_content="Artificial intelligence is transforming education by personalizing learning experiences and providing intelligent tutoring systems.",
        url="https://example.com/ai-education",
        metadata={"author": "Dr. Smith", "published": "2024-01-15"},
        timestamp=datetime.now()
    )
    
    # Example user profile
    user_profile = UserProfile(
        user_id="user_123",
        age_category=AgeCategory.UNDER_16,
        jurisdiction=Jurisdiction.US,
        preferences={"educational_content": True, "strict_safety": True}
    )
    
    try:
        # Perform comprehensive classification
        result = await classifier.comprehensive_classify(example_content, user_profile)
        
        print("=== BoundaryML Classification Results ===")
        print(f"Content ID: {result.content_id}")
        print(f"Overall Confidence: {result.overall_confidence:.3f}")
        print(f"Processing Time: {result.processing_time:.3f}s")
        print()
        
        print("Safety Classification:")
        print(f"  Safety Score: {result.safety.safety_score:.3f}")
        print(f"  Age Appropriateness: {result.safety.age_appropriateness}")
        print(f"  Reasoning: {result.safety.reasoning}")
        print()
        
        print("Educational Classification:")
        print(f"  Educational Value: {result.educational.educational_value:.3f}")
        print(f"  Reading Level: {result.educational.reading_level}")
        print(f"  Cognitive Level: {result.educational.cognitive_level}")
        print()
        
        print("Viewpoint Classification:")
        print(f"  Political Leaning: {result.viewpoint.political_leaning}")
        print(f"  Bias Score: {result.viewpoint.bias_score:.3f}")
        print(f"  Source Credibility: {result.viewpoint.source_credibility:.3f}")
        
    except Exception as e:
        print(f"Classification failed: {e}")


if __name__ == "__main__":
    # Run the example
    asyncio.run(main())
