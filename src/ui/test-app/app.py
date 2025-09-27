#!/usr/bin/env python3
"""
AI Curation Engine Test Application
==================================

A comprehensive test application to demonstrate and test the AI Curation Engine
with BAML integration using local Llama models.

Features:
- Web interface for content testing
- Real-time classification results
- Support for local Llama models via Ollama
- Interactive dashboard with metrics
- Sample content library for testing
"""

import asyncio
import json
import os
import sys
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Web framework
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS

# Import our BAML integration
try:
    from BAML_Integration_Implementation import BAMLContentAnalyzer, ContentCurationPipeline, UserContext
    BAML_AVAILABLE = True
except ImportError:
    BAML_AVAILABLE = False
    print("⚠️  BAML not available. Install dependencies and generate client.")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Global variables
analyzer = None
pipeline = None

# Sample test content for demonstration
SAMPLE_CONTENT = {
    "educational": {
        "title": "Introduction to Machine Learning",
        "content": """
        Machine learning is a subset of artificial intelligence that enables computers to learn 
        and make decisions from data without being explicitly programmed. It involves algorithms 
        that can identify patterns, make predictions, and improve their performance over time.
        
        Key concepts include:
        1. Supervised Learning: Learning from labeled examples
        2. Unsupervised Learning: Finding patterns in unlabeled data
        3. Reinforcement Learning: Learning through trial and error
        
        Applications include image recognition, natural language processing, and recommendation systems.
        """
    },
    "news": {
        "title": "Climate Change Research Update",
        "content": """
        Recent studies show that global temperature increases are accelerating due to human activities.
        Scientists at leading universities have published research indicating that immediate action
        is necessary to prevent catastrophic climate effects.
        
        The research suggests that renewable energy adoption and carbon reduction policies
        could significantly impact future climate scenarios. International cooperation
        will be essential for implementing effective solutions.
        """
    },
    "social": {
        "title": "Social Media Discussion",
        "content": """
        Just saw the most amazing sunset today! The colors were absolutely incredible - 
        bright orange and pink streaking across the sky. Sometimes you just have to stop 
        and appreciate the beauty around us.
        
        Does anyone else love watching sunsets? What's your favorite time of day to 
        enjoy nature? Would love to hear your thoughts! #sunset #nature #beautiful
        """
    },
    "controversial": {
        "title": "Political Opinion Piece",
        "content": """
        The recent policy changes have sparked intense debate among citizens and experts.
        While some argue these measures are necessary for economic growth, critics claim
        they could lead to increased inequality and social division.
        
        Supporters point to potential job creation and improved business conditions.
        Opponents worry about environmental impacts and effects on vulnerable populations.
        The debate continues as society weighs competing priorities and values.
        """
    },
    "technical": {
        "title": "Python Programming Tutorial",
        "content": """
        Here's a simple Python function to calculate the factorial of a number:
        
        def factorial(n):
            if n == 0 or n == 1:
                return 1
            else:
                return n * factorial(n - 1)
        
        # Example usage
        result = factorial(5)  # Returns 120
        print(f"5! = {result}")
        
        This recursive approach is elegant but can cause stack overflow for large numbers.
        Consider using iterative methods for better performance with large inputs.
        """
    }
}

class TestApp:
    """Main test application class."""
    
    def __init__(self):
        self.test_results = []
        self.stats = {
            "total_tests": 0,
            "safety_scores": [],
            "educational_scores": [],
            "processing_times": []
        }
    
    async def initialize_baml(self):
        """Initialize BAML components."""
        global analyzer, pipeline
        
        if not BAML_AVAILABLE:
            logger.warning("BAML not available. Some features will be disabled.")
            return False
        
        try:
            analyzer = BAMLContentAnalyzer()
            pipeline = ContentCurationPipeline()
            logger.info("✅ BAML components initialized successfully")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to initialize BAML: {e}")
            return False
    
    async def test_content(self, content: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Test content classification."""
        start_time = datetime.now()
        
        try:
            if pipeline is None:
                # Fallback mock classification for testing
                result = self._mock_classification(content, user_context)
            else:
                # Real BAML classification
                user_ctx = UserContext(
                    age_category=user_context.get("age_category", "adult"),
                    jurisdiction=user_context.get("jurisdiction", "US"),
                    parental_controls=user_context.get("parental_controls", False),
                    content_preferences=user_context.get("content_preferences", []),
                    sensitivity_level=user_context.get("sensitivity_level", "medium")
                )
                result = await pipeline.curate_content(content, user_ctx)
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            result["processing_time"] = processing_time
            
            # Update statistics
            self._update_stats(result)
            
            # Store result
            self.test_results.append({
                "timestamp": datetime.now().isoformat(),
                "content_preview": content[:100] + "..." if len(content) > 100 else content,
                "user_context": user_context,
                "result": result
            })
            
            return result
            
        except Exception as e:
            logger.error(f"Error in content testing: {e}")
            return {
                "error": str(e),
                "processing_time": (datetime.now() - start_time).total_seconds()
            }
    
    def _mock_classification(self, content: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Mock classification for testing when BAML is not available."""
        import random
        
        # Simple heuristics for demo
        content_lower = content.lower()
        
        # Safety analysis
        violence_keywords = ["violence", "fight", "attack", "kill", "hurt"]
        adult_keywords = ["adult", "sexual", "mature", "explicit"]
        hate_keywords = ["hate", "discrimination", "racist", "offensive"]
        
        violence_score = min(0.9, sum(0.2 for word in violence_keywords if word in content_lower))
        adult_content = any(word in content_lower for word in adult_keywords)
        hate_score = min(0.8, sum(0.15 for word in hate_keywords if word in content_lower))
        
        safety_score = max(0.1, 1.0 - (violence_score + hate_score))
        
        # Educational analysis
        educational_keywords = ["learn", "education", "study", "research", "science", "tutorial"]
        educational_score = min(0.95, sum(0.15 for word in educational_keywords if word in content_lower) + 0.3)
        
        # Viewpoint analysis
        political_keywords = ["policy", "government", "political", "election", "debate"]
        has_political = any(word in content_lower for word in political_keywords)
        
        return {
            "content_id": f"test_{random.randint(1000, 9999)}",
            "timestamp": datetime.now().isoformat(),
            "processing_time_seconds": round(random.uniform(0.5, 2.0), 2),
            "user_context": user_context,
            "classification": {
                "safety": {
                    "score": round(safety_score, 2),
                    "age_appropriate": "18+" if adult_content else "13+" if violence_score > 0.3 else "all",
                    "warnings": ["violence"] if violence_score > 0.3 else [],
                    "reasoning": f"Content analysis based on keyword detection and heuristics"
                },
                "educational": {
                    "score": round(educational_score, 2),
                    "learning_objectives": ["understanding concepts"] if educational_score > 0.5 else [],
                    "subject_areas": ["general"] if educational_score > 0.5 else [],
                    "cognitive_level": "understand" if educational_score > 0.7 else "remember"
                },
                "viewpoint": {
                    "political_leaning": "neutral" if not has_political else "mixed",
                    "bias_score": round(random.uniform(0.1, 0.4), 2),
                    "credibility": round(random.uniform(0.6, 0.9), 2),
                    "balanced_sources": ["example.com", "factcheck.org"] if has_political else []
                }
            },
            "recommendation": {
                "action": "allow" if safety_score > 0.7 else "caution" if safety_score > 0.4 else "block",
                "confidence": round(random.uniform(0.7, 0.95), 2),
                "reasoning": f"Based on safety score of {safety_score:.2f} and content analysis"
            },
            "metadata": {
                "content_length": len(content),
                "baml_available": BAML_AVAILABLE,
                "model_providers": ["mock"] if not BAML_AVAILABLE else ["llama", "ollama"]
            }
        }
    
    def _update_stats(self, result: Dict[str, Any]):
        """Update application statistics."""
        self.stats["total_tests"] += 1
        
        if "classification" in result:
            safety_score = result["classification"]["safety"]["score"]
            educational_score = result["classification"]["educational"]["score"]
            
            self.stats["safety_scores"].append(safety_score)
            self.stats["educational_scores"].append(educational_score)
        
        if "processing_time" in result:
            self.stats["processing_times"].append(result["processing_time"])
    
    def get_stats(self) -> Dict[str, Any]:
        """Get application statistics."""
        if not self.stats["safety_scores"]:
            return self.stats
        
        return {
            "total_tests": self.stats["total_tests"],
            "average_safety_score": round(sum(self.stats["safety_scores"]) / len(self.stats["safety_scores"]), 2),
            "average_educational_score": round(sum(self.stats["educational_scores"]) / len(self.stats["educational_scores"]), 2),
            "average_processing_time": round(sum(self.stats["processing_times"]) / len(self.stats["processing_times"]), 2),
            "recent_results": self.test_results[-10:]  # Last 10 results
        }

# Initialize test app
test_app = TestApp()

# Flask routes
@app.route('/')
def index():
    """Main dashboard page."""
    return render_template('index.html', 
                         baml_available=BAML_AVAILABLE,
                         sample_content=SAMPLE_CONTENT)

@app.route('/api/test', methods=['POST'])
def test_content():
    """Test content classification endpoint."""
    data = request.json
    content = data.get('content', '')
    user_context = data.get('user_context', {})
    
    if not content.strip():
        return jsonify({"error": "Content cannot be empty"}), 400
    
    # Run async test
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        result = loop.run_until_complete(test_app.test_content(content, user_context))
        return jsonify(result)
    finally:
        loop.close()

@app.route('/api/stats')
def get_stats():
    """Get application statistics."""
    return jsonify(test_app.get_stats())

@app.route('/api/sample/<category>')
def get_sample_content(category):
    """Get sample content by category."""
    if category in SAMPLE_CONTENT:
        return jsonify(SAMPLE_CONTENT[category])
    return jsonify({"error": "Category not found"}), 404

@app.route('/api/health')
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "baml_available": BAML_AVAILABLE,
        "analyzer_ready": analyzer is not None,
        "pipeline_ready": pipeline is not None,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/static/<path:filename>')
def static_files(filename):
    """Serve static files."""
    return send_from_directory('static', filename)

def create_templates():
    """Create HTML templates for the web interface."""
    templates_dir = Path(__file__).parent / "templates"
    static_dir = Path(__file__).parent / "static"
    templates_dir.mkdir(exist_ok=True)
    static_dir.mkdir(exist_ok=True)
    
    # Main HTML template
    html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Curation Engine Test App</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .result-card { margin: 10px 0; }
        .score-badge { font-size: 0.9em; margin: 2px; }
        .processing-time { color: #666; font-size: 0.8em; }
        .content-preview { background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .stats-container { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .recommendation-allow { background-color: #d4edda; }
        .recommendation-caution { background-color: #fff3cd; }
        .recommendation-block { background-color: #f8d7da; }
        .loading { display: none; }
    </style>
</head>
<body>
    <div class="container mt-4">
        <div class="row">
            <div class="col-12">
                <h1><i class="fas fa-shield-alt"></i> AI Curation Engine Test App</h1>
                <p class="lead">Test content classification with BAML integration</p>
                
                <!-- Status Banner -->
                <div class="alert {% if baml_available %}alert-success{% else %}alert-warning{% endif %}" role="alert">
                    <i class="fas fa-{% if baml_available %}check-circle{% else %}exclamation-triangle{% endif %}"></i>
                    {% if baml_available %}
                        BAML Integration: <strong>Available</strong> - Real AI classification enabled
                    {% else %}
                        BAML Integration: <strong>Mock Mode</strong> - Install BAML for real AI classification
                    {% endif %}
                </div>
            </div>
        </div>
        
        <div class="row">
            <!-- Input Section -->
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-edit"></i> Content Testing</h5>
                    </div>
                    <div class="card-body">
                        <!-- User Context -->
                        <div class="mb-3">
                            <label class="form-label">User Context</label>
                            <div class="row">
                                <div class="col-md-6">
                                    <select id="ageCategory" class="form-select form-select-sm">
                                        <option value="child">Child (under 13)</option>
                                        <option value="teen">Teen (13-17)</option>
                                        <option value="adult" selected>Adult (18+)</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <select id="jurisdiction" class="form-select form-select-sm">
                                        <option value="US" selected>United States</option>
                                        <option value="EU">European Union</option>
                                        <option value="India">India</option>
                                        <option value="China">China</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Sample Content Buttons -->
                        <div class="mb-3">
                            <label class="form-label">Quick Test Samples</label>
                            <div class="btn-group-vertical d-grid gap-1">
                                {% for category, sample in sample_content.items() %}
                                <button class="btn btn-outline-primary btn-sm" onclick="loadSample('{{ category }}')">
                                    {{ sample.title }}
                                </button>
                                {% endfor %}
                            </div>
                        </div>
                        
                        <!-- Content Input -->
                        <div class="mb-3">
                            <label for="contentInput" class="form-label">Content to Analyze</label>
                            <textarea id="contentInput" class="form-control" rows="8" 
                                    placeholder="Enter content to analyze for safety, educational value, and bias..."></textarea>
                        </div>
                        
                        <!-- Submit Button -->
                        <button id="analyzeBtn" class="btn btn-primary" onclick="analyzeContent()">
                            <i class="fas fa-search"></i> Analyze Content
                        </button>
                        <div id="loading" class="loading">
                            <div class="spinner-border spinner-border-sm" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            Analyzing...
                        </div>
                    </div>
                </div>
                
                <!-- Statistics -->
                <div id="statsContainer" class="stats-container mt-3" style="display: none;">
                    <h6><i class="fas fa-chart-bar"></i> Session Statistics</h6>
                    <div id="statsContent"></div>
                </div>
            </div>
            
            <!-- Results Section -->
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-chart-line"></i> Classification Results</h5>
                    </div>
                    <div class="card-body">
                        <div id="resultsContainer">
                            <p class="text-muted text-center">Results will appear here after analysis</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Global variables
        const sampleContent = {{ sample_content | tojsonfilter }};
        
        // Load sample content
        function loadSample(category) {
            if (sampleContent[category]) {
                document.getElementById('contentInput').value = sampleContent[category].content;
            }
        }
        
        // Analyze content
        async function analyzeContent() {
            const content = document.getElementById('contentInput').value.trim();
            if (!content) {
                alert('Please enter content to analyze');
                return;
            }
            
            const userContext = {
                age_category: document.getElementById('ageCategory').value,
                jurisdiction: document.getElementById('jurisdiction').value,
                parental_controls: document.getElementById('ageCategory').value !== 'adult',
                content_preferences: ['educational', 'safe'],
                sensitivity_level: 'medium'
            };
            
            // Show loading
            document.getElementById('analyzeBtn').disabled = true;
            document.getElementById('loading').style.display = 'inline-block';
            
            try {
                const response = await fetch('/api/test', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: content,
                        user_context: userContext
                    })
                });
                
                const result = await response.json();
                displayResults(result);
                updateStats();
                
            } catch (error) {
                console.error('Error:', error);
                alert('Error analyzing content: ' + error.message);
            } finally {
                // Hide loading
                document.getElementById('analyzeBtn').disabled = false;
                document.getElementById('loading').style.display = 'none';
            }
        }
        
        // Display results
        function displayResults(result) {
            const container = document.getElementById('resultsContainer');
            
            if (result.error) {
                container.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-triangle"></i> Error: ${result.error}
                    </div>
                `;
                return;
            }
            
            const classification = result.classification || {};
            const recommendation = result.recommendation || {};
            
            const recommendationClass = 
                recommendation.action === 'allow' ? 'recommendation-allow' :
                recommendation.action === 'caution' ? 'recommendation-caution' :
                'recommendation-block';
            
            container.innerHTML = `
                <div class="result-card">
                    <!-- Overall Recommendation -->
                    <div class="alert ${recommendationClass}" role="alert">
                        <h6><i class="fas fa-thumbs-${recommendation.action === 'allow' ? 'up' : recommendation.action === 'caution' ? 'sideways' : 'down'}"></i> 
                        Recommendation: ${recommendation.action?.toUpperCase() || 'Unknown'}</h6>
                        <p class="mb-1">${recommendation.reasoning || 'No reasoning provided'}</p>
                        <small>Confidence: ${(recommendation.confidence * 100).toFixed(1)}%</small>
                    </div>
                    
                    <!-- Safety Analysis -->
                    <div class="mb-3">
                        <h6><i class="fas fa-shield-alt"></i> Safety Analysis</h6>
                        <div class="d-flex flex-wrap">
                            <span class="badge bg-${classification.safety?.score > 0.7 ? 'success' : classification.safety?.score > 0.4 ? 'warning' : 'danger'} score-badge">
                                Safety: ${(classification.safety?.score * 100).toFixed(1)}%
                            </span>
                            <span class="badge bg-secondary score-badge">Age: ${classification.safety?.age_appropriate || 'Unknown'}</span>
                        </div>
                        ${classification.safety?.warnings?.length > 0 ? `
                            <div class="mt-2">
                                <small><strong>Warnings:</strong> ${classification.safety.warnings.join(', ')}</small>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Educational Analysis -->
                    <div class="mb-3">
                        <h6><i class="fas fa-graduation-cap"></i> Educational Value</h6>
                        <div class="d-flex flex-wrap">
                            <span class="badge bg-${classification.educational?.score > 0.7 ? 'success' : classification.educational?.score > 0.4 ? 'warning' : 'secondary'} score-badge">
                                Educational: ${(classification.educational?.score * 100).toFixed(1)}%
                            </span>
                            <span class="badge bg-info score-badge">Level: ${classification.educational?.cognitive_level || 'Unknown'}</span>
                        </div>
                    </div>
                    
                    <!-- Viewpoint Analysis -->
                    <div class="mb-3">
                        <h6><i class="fas fa-balance-scale"></i> Viewpoint Analysis</h6>
                        <div class="d-flex flex-wrap">
                            <span class="badge bg-secondary score-badge">Leaning: ${classification.viewpoint?.political_leaning || 'Unknown'}</span>
                            <span class="badge bg-${classification.viewpoint?.bias_score < 0.3 ? 'success' : classification.viewpoint?.bias_score < 0.6 ? 'warning' : 'danger'} score-badge">
                                Bias: ${(classification.viewpoint?.bias_score * 100).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                    
                    <!-- Processing Info -->
                    <div class="processing-time">
                        <i class="fas fa-clock"></i> Processed in ${result.processing_time_seconds || result.processing_time || 0}s
                        | Model: ${result.metadata?.model_providers?.join(', ') || 'Unknown'}
                    </div>
                </div>
            `;
        }
        
        // Update statistics
        async function updateStats() {
            try {
                const response = await fetch('/api/stats');
                const stats = await response.json();
                
                const container = document.getElementById('statsContainer');
                const content = document.getElementById('statsContent');
                
                if (stats.total_tests > 0) {
                    container.style.display = 'block';
                    content.innerHTML = `
                        <div class="row text-center">
                            <div class="col">
                                <strong>${stats.total_tests}</strong><br>
                                <small>Total Tests</small>
                            </div>
                            <div class="col">
                                <strong>${(stats.average_safety_score * 100).toFixed(1)}%</strong><br>
                                <small>Avg Safety</small>
                            </div>
                            <div class="col">
                                <strong>${(stats.average_educational_score * 100).toFixed(1)}%</strong><br>
                                <small>Avg Educational</small>
                            </div>
                            <div class="col">
                                <strong>${stats.average_processing_time.toFixed(2)}s</strong><br>
                                <small>Avg Time</small>
                            </div>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error updating stats:', error);
            }
        }
        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            updateStats();
        });
    </script>
</body>
</html>
    """
    
    # Write template file
    with open(templates_dir / "index.html", "w") as f:
        f.write(html_template)
    
    print("✅ Templates created successfully")

async def main():
    """Main application entry point."""
    print("🚀 Starting AI Curation Engine Test App...")
    
    # Create templates
    create_templates()
    
    # Initialize BAML
    baml_ready = await test_app.initialize_baml()
    
    print(f"📊 BAML Status: {'✅ Ready' if baml_ready else '⚠️  Mock Mode'}")
    print("🌐 Starting web server...")
    print("📱 Open http://localhost:5000 in your browser")
    
    # Run Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    # Run the async main function
    asyncio.run(main())
