# BoundaryML Integration for AI Curation Engine

This document explains how to integrate BoundaryML's LLM-based content classification into the AI Curation Engine architecture.

## Overview

BoundaryML provides structured data extraction from Large Language Models (LLMs) with automatic JSON error correction and schema coercion. This integration enables precise, consistent, and reliable content analysis for the curation engine.

## Key Features

- **Structured Classification**: JSON schema-enforced content analysis
- **Multi-dimensional Analysis**: Safety, educational value, and viewpoint classification
- **Decision Boundary Analysis**: Model reliability and consistency assessment
- **Adaptive Prompting**: Context-aware prompts based on user profiles
- **Global Compliance**: Jurisdiction-specific regulatory considerations
- **Caching & Performance**: Redis-based result caching for efficiency

## Files

1. **`AI_Curation_Engine_Architecture.md`** - Updated architecture document with BoundaryML integration
2. **`BoundaryML_Integration_Implementation.py`** - Complete Python implementation
3. **`BoundaryML_Integration_README.md`** - This documentation file

## Installation & Setup

### Prerequisites

```bash
pip install boundaryml redis numpy transformers asyncio
```

### Configuration

```python
from BoundaryML_Integration_Implementation import BoundaryMLContentClassifier
import redis

# Initialize Redis for caching (optional)
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# Initialize the classifier
classifier = BoundaryMLContentClassifier(
    api_key="your_boundaryml_api_key",
    model_name="gpt-4",
    redis_client=redis_client,
    cache_ttl=3600  # 1 hour cache
)
```

## Usage Examples

### Basic Content Classification

```python
import asyncio
from datetime import datetime
from BoundaryML_Integration_Implementation import (
    BoundaryMLContentClassifier, Content, UserProfile, 
    AgeCategory, Jurisdiction
)

async def classify_content():
    # Initialize classifier
    classifier = BoundaryMLContentClassifier(api_key="your_api_key")
    
    # Create content object
    content = Content(
        content_id="article_123",
        platform="news_site",
        content_type="text",
        title="Climate Change Education",
        description="Educational content about climate science",
        text_content="Climate change refers to long-term shifts in global temperatures...",
        url="https://example.com/climate-education",
        metadata={"category": "science", "grade_level": "high_school"},
        timestamp=datetime.now()
    )
    
    # Create user profile
    user_profile = UserProfile(
        user_id="student_456",
        age_category=AgeCategory.UNDER_16,
        jurisdiction=Jurisdiction.US,
        preferences={"educational_content": True, "science_topics": True}
    )
    
    # Perform comprehensive classification
    result = await classifier.comprehensive_classify(content, user_profile)
    
    print(f"Safety Score: {result.safety.safety_score}")
    print(f"Educational Value: {result.educational.educational_value}")
    print(f"Age Appropriateness: {result.safety.age_appropriateness}")
    
# Run the example
asyncio.run(classify_content())
```

### Individual Classification Types

```python
async def individual_classifications():
    classifier = BoundaryMLContentClassifier(api_key="your_api_key")
    content_text = "This is educational content about mathematics..."
    
    # Safety classification
    user_profile = UserProfile(
        user_id="user123",
        age_category=AgeCategory.UNDER_13,
        jurisdiction=Jurisdiction.EU,
        preferences={}
    )
    
    safety_result = await classifier.classify_safety(content_text, user_profile)
    print(f"Safety Score: {safety_result.safety_score}")
    print(f"Reasoning: {safety_result.reasoning}")
    
    # Educational classification
    educational_result = await classifier.classify_educational_value(content_text)
    print(f"Educational Value: {educational_result.educational_value}")
    print(f"Subject Areas: {educational_result.subject_areas}")
    
    # Viewpoint classification
    viewpoint_result = await classifier.classify_viewpoint(content_text)
    print(f"Political Leaning: {viewpoint_result.political_leaning}")
    print(f"Bias Score: {viewpoint_result.bias_score}")
```

### Decision Boundary Analysis

```python
async def analyze_boundaries():
    classifier = BoundaryMLContentClassifier(api_key="your_api_key")
    analyzer = BoundaryAnalyzer(classifier)
    
    # Prepare test examples
    test_examples = [
        {
            'id': 'test1',
            'content': 'Educational content about science...',
            'expected_safety': 0.9,
            'expected_educational': 0.8
        },
        # ... more test cases
    ]
    
    # Analyze classification boundaries
    boundary_results = await analyzer.analyze_classification_boundaries(test_examples)
    
    print("Boundary Analysis Results:")
    print(f"Safety Accuracy: {boundary_results['safety_boundaries']['accuracy']}")
    print(f"Educational Accuracy: {boundary_results['educational_boundaries']['accuracy']}")
    print(f"Viewpoint Accuracy: {boundary_results['viewpoint_boundaries']['accuracy']}")
```

## Classification Schemas

### Safety Classification

- **safety_score**: Overall safety (0-1)
- **violence_level**: Level of violent content (0-1)
- **adult_content**: Contains adult themes (boolean)
- **hate_speech**: Hate speech probability (0-1)
- **misinformation_risk**: Misinformation risk (0-1)
- **age_appropriateness**: Minimum age ("0+", "7+", "13+", "16+", "18+")
- **reasoning**: Explanation for classification
- **confidence**: Classification confidence (0-1)

### Educational Classification

- **educational_value**: Educational value score (0-1)
- **learning_objectives**: Identified learning objectives (array)
- **subject_areas**: Subject areas covered (array)
- **cognitive_level**: Bloom's taxonomy level (string)
- **reading_level**: Grade level difficulty (1-20)
- **factual_accuracy**: Accuracy confidence (0-1)
- **confidence**: Classification confidence (0-1)

### Viewpoint Classification

- **political_leaning**: Political perspective (enum)
- **bias_score**: Bias level (0-1)
- **perspective_diversity**: Viewpoint diversity (0-1)
- **controversy_level**: Controversial content level (0-1)
- **source_credibility**: Source credibility (0-1)
- **echo_chamber_risk**: Echo chamber risk (0-1)
- **confidence**: Classification confidence (0-1)

## API Integration

### REST Endpoints

The architecture includes the following BoundaryML-specific endpoints:

```
POST /api/v1/classification/safety
POST /api/v1/classification/educational
POST /api/v1/classification/viewpoint
POST /api/v1/classification/comprehensive
GET  /api/v1/classification/boundaries/analyze
POST /api/v1/classification/schema/validate
GET  /api/v1/classification/models/available
```

### Example API Request

```bash
curl -X POST "https://api.curation-engine.com/v1/classification/comprehensive" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{
    "content": {
      "content_id": "article_123",
      "platform": "news_site",
      "content_type": "text",
      "title": "Educational Article",
      "text_content": "This is the article content...",
      "metadata": {}
    },
    "user_profile": {
      "user_id": "user_456",
      "age_category": "under_16",
      "jurisdiction": "US",
      "preferences": {}
    }
  }'
```

## Performance Considerations

### Caching Strategy

- Results are cached in Redis with configurable TTL
- Cache keys include content hash and user context
- Reduces API calls and improves response times

### Parallel Processing

- Safety, educational, and viewpoint classifications run in parallel
- Comprehensive classification combines results efficiently
- Error handling ensures graceful degradation

### Rate Limiting

- Implement rate limiting for BoundaryML API calls
- Use exponential backoff for retry logic
- Monitor API usage and costs

## Global Compliance

The system adapts prompts and analysis based on jurisdiction:

- **EU**: GDPR privacy principles, DSA risk assessment
- **US**: COPPA compliance, state-level restrictions
- **India**: DPDPA consent requirements, advertising restrictions
- **China**: Minor Mode restrictions, content supervision

## Error Handling

The implementation includes comprehensive error handling:

- **Fallback Classifications**: Conservative defaults on API failures
- **Exception Logging**: Detailed error logging for debugging
- **Graceful Degradation**: System continues operating with reduced functionality
- **Retry Logic**: Automatic retry with exponential backoff

## Monitoring & Analytics

Track key metrics:

- Classification accuracy and confidence scores
- Processing times and API response rates
- Cache hit rates and performance improvements
- Error rates and boundary analysis results

## Integration with Curation Engine

The BoundaryML classifier integrates with the broader curation engine:

1. **Content Ingestion**: Multi-modal content extraction and preprocessing
2. **Classification Pipeline**: Structured analysis using BoundaryML
3. **Curation Algorithms**: Results feed into user-selected algorithms
4. **Transparency**: Explainable decisions with confidence metrics
5. **Compliance**: Jurisdiction-specific rule enforcement

## Next Steps

1. **Deploy Classification Service**: Set up BoundaryML classifier in production
2. **Integrate with Platforms**: Connect to content platforms via standardized APIs
3. **Algorithm Marketplace**: Enable third-party curation algorithms
4. **User Interface**: Build user-facing algorithm selection and configuration
5. **Monitoring Dashboard**: Real-time classification performance monitoring

For questions or support, refer to the main architecture document or contact the development team.
