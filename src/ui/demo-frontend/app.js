#!/usr/bin/env python3
"""
AI Curation Engine - Complete Demo Application
==============================================

This is the main demo application that showcases all features:
- Child profile management
- Content classification
- Real-time BAML integration
- Parent dashboard
- Safety analytics

Usage:
    python demo-frontend/app.js
"""

import asyncio
import json
import logging
import os
import sys
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Web framework
from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from flask_cors import CORS
import json

# Import our pluggable curation engine and BAML integration
try:
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'tools', 'scripts'))
    from BAML_Integration_Real import RealBAMLContentAnalyzer, ContentCurationPipeline
    from curation_engine_pluggable import CurationEngine, CurationStrategy
    
    # Initialize with hybrid strategy by default
    curation_engine = CurationEngine(strategy=CurationStrategy.HYBRID)
    BAML_AVAILABLE = True
    print("✅ Pluggable Curation Engine imported successfully")
    print("🚀 Using Hybrid Strategy (combines multi-layer + LLM)")
except ImportError as e:
    curation_engine = None
    BAML_AVAILABLE = False
    print(f"⚠️  Curation engine not available: {e}. Using fallback mode.")

# Configure logging with BAML log capture
import logging.handlers

# Ensure logs directory exists
os.makedirs('../logs', exist_ok=True)

# Configure logging formatters
detailed_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
simple_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Configure BAML-specific logging to file
baml_handler = logging.FileHandler('../logs/baml.log')
baml_handler.setFormatter(detailed_formatter)
baml_handler.setLevel(logging.DEBUG)

# Add BAML loggers
baml_loggers = ['baml', 'baml_client', 'baml_py', 'BAML', 'BoundaryML']
for logger_name in baml_loggers:
    baml_logger = logging.getLogger(logger_name)
    baml_logger.addHandler(baml_handler)
    baml_logger.setLevel(logging.DEBUG)
    baml_logger.propagate = False  # Prevent duplicate console output

logger = logging.getLogger(__name__)
logger.info("🔍 BAML logging configured - logs will be saved to ../logs/baml.log")

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'demo-secret-key-change-in-production')
CORS(app)

# Add custom Jinja2 filter for JSON serialization
@app.template_filter('tojsonfilter')
def to_json_filter(obj):
    from markupsafe import Markup
    return Markup(json.dumps(obj))

# Configuration
BACKEND_URL = os.environ.get('BACKEND_URL', 'http://localhost:3001')
API_BASE = f'{BACKEND_URL}/api'

# Global state for demo
demo_state = {
    'current_user': None,
    'demo_mode': True,
    'backend_available': False
}

# Sample demo data
DEMO_DATA = {
    'users': [
        {
            'id': 'demo_parent',
            'email': 'parent@demo.com',
            'firstName': 'Sarah',
            'lastName': 'Johnson',
            'role': 'parent'
        }
    ],
    'children': [
        {
            'id': 'child_1',
            'name': 'Emma',
            'nickname': 'Em',
            'age': 8,
            'safetyLevel': 'strict',
            'allowedCategories': ['educational', 'entertainment', 'games'],
            'blockedCategories': ['violence', 'scary', 'mature'],
            'dailyTimeLimit': 90,
            'sessionTimeLimit': 20,
            'parentId': 'demo_parent'
        },
        {
            'id': 'child_2', 
            'name': 'Alex',
            'nickname': 'Al',
            'age': 14,
            'safetyLevel': 'moderate',
            'allowedCategories': ['educational', 'entertainment', 'games', 'social'],
            'blockedCategories': ['violence', 'mature'],
            'dailyTimeLimit': 180,
            'sessionTimeLimit': 45,
            'parentId': 'demo_parent'
        },
        {
            'id': 'adult_1',
            'name': 'Michael',
            'nickname': 'Mike',
            'age': 25,
            'safetyLevel': 'minimal',
            'allowedCategories': ['educational', 'entertainment', 'games', 'social', 'news', 'technology', 'business'],
            'blockedCategories': ['extreme_violence', 'illegal'],
            'dailyTimeLimit': 480,
            'sessionTimeLimit': 120,
            'parentId': 'demo_parent',
            'profileType': 'adult',
            'preferences': {
                'contentMaturity': 'mature',
                'adultContent': 'allowed',
                'politicalContent': 'allowed',
                'controversialTopics': 'allowed'
            }
        }
    ],
    'sample_content': {
        'educational': {
            'title': 'Learning About Space',
            'content': '''Space exploration has led to many amazing discoveries. The International Space Station orbits Earth every 90 minutes. Astronauts conduct experiments in microgravity that help us understand physics, biology, and materials science. Future missions to Mars will require new technologies for life support and transportation.'''
        },
        'social': {
            'title': 'Friend\'s Social Post',
            'content': '''Just had the best day at the beach with friends! 🏖️ The weather was perfect and we played volleyball for hours. Can't wait for summer vacation to start! Who else is excited for school to end? #BeachDay #Friends #Summer'''
        },
        'concerning': {
            'title': 'Concerning Content',
            'content': '''This content contains discussions about violence and inappropriate themes that would not be suitable for younger audiences. It includes descriptions of fighting, aggressive behavior, and mature themes that require parental guidance.'''
        },
        'news': {
            'title': 'Technology News',
            'content': '''Scientists have developed a new artificial intelligence system that can help doctors diagnose diseases more accurately. The AI analyzes medical images and can detect problems that human doctors might miss. This technology could improve healthcare outcomes for millions of people worldwide.'''
        },
        'business': {
            'title': 'Market Analysis',
            'content': '''The technology sector experienced significant volatility this quarter, with artificial intelligence companies leading both gains and losses. Investment strategies are shifting toward sustainable tech solutions, while cryptocurrency markets remain highly speculative. Economic indicators suggest a complex landscape for venture capital funding in emerging technologies.'''
        },
        'mature': {
            'title': 'Adult Discussion Topic',
            'content': '''This discussion covers complex social and political issues including healthcare policy reform, economic inequality, and international relations. The content explores multiple perspectives on controversial topics and assumes adult-level understanding of systemic societal challenges and their interconnected nature.'''
        },
        'extreme_left': {
            'title': 'Extreme Left-Wing Propaganda',
            'content': '''The capitalist system is fundamentally evil and must be completely dismantled through revolutionary action. All private property should be seized and redistributed immediately. The wealthy elite are parasites who exploit workers and deserve no mercy. Traditional institutions like family, religion, and national borders are tools of oppression that must be abolished. Only through violent overthrow of the current system can true equality be achieved. Anyone who disagrees is either brainwashed or complicit in maintaining systemic oppression.'''
        },
        'extreme_right': {
            'title': 'Extreme Right-Wing Propaganda',
            'content': '''Our nation is under attack from foreign invaders and domestic traitors who seek to destroy our traditional values and way of life. Only through strong authoritarian leadership can we restore order and purity to our society. Certain groups are inherently inferior and pose an existential threat to our civilization. Democracy has failed and must be replaced with absolute rule by our rightful leaders. Violence against enemies of the state is not only justified but necessary for survival. Anyone who opposes our movement is an enemy of the people.'''
        },
        'conspiracy': {
            'title': 'Conspiracy Theory Content',
            'content': '''A secret global cabal of elites controls all governments, media, and financial institutions to manipulate world events for their sinister agenda. They use mind control technologies, engineered diseases, and staged events to maintain power over the masses. Mainstream science and medicine are lies designed to keep people sick and dependent. Only those who reject official narratives and embrace alternative truths can see through their deception. The end times are near, and only the awakened will survive what is coming.'''
        },
        'extreme_adult': {
            'title': 'Extreme Adult Content',
            'content': '''This content contains explicit sexual descriptions, graphic violence, substance abuse themes, and disturbing psychological material. It includes detailed depictions of intimate encounters, violent scenarios involving weapons and bodily harm, extensive drug use and addiction narratives, and deeply disturbing psychological manipulation. The material contains strong profanity, hate speech targeting multiple groups, and glorification of dangerous criminal behavior. This content is designed for mature audiences only and contains triggering material that could be harmful to vulnerable individuals.'''
        },
        'center_left': {
            'title': 'Center-Left Political Discussion',
            'content': '''Progressive taxation and expanded social programs can help reduce income inequality while maintaining economic growth. Universal healthcare coverage, funded through a combination of taxes and public-private partnerships, would improve outcomes while controlling costs. Climate change requires coordinated government action including carbon pricing and green energy investments. Education funding should be increased to ensure equal opportunities for all students. Labor unions play an important role in protecting worker rights, though they should work collaboratively with employers. Immigration enriches our society and economy, though it should be managed through fair and humane policies.'''
        },
        'center_right': {
            'title': 'Center-Right Political Discussion',
            'content': '''Free market competition drives innovation and economic prosperity better than government intervention. Lower taxes on businesses and individuals stimulate investment and job creation. Private sector solutions are often more efficient than government programs for delivering services. School choice and competition improve educational outcomes for students. Strong law enforcement and secure borders are essential for national security and public safety. Traditional values and institutions provide important social stability. Fiscal responsibility requires limiting government spending and reducing national debt. Regulatory reform should eliminate unnecessary bureaucratic barriers to business growth.'''
        }
    }
}

# API Helper Functions
def check_backend_health():
    """Check if backend is available."""
    try:
        response = requests.get(f'{API_BASE}/health', timeout=5)
        demo_state['backend_available'] = response.status_code == 200
        return demo_state['backend_available']
    except:
        demo_state['backend_available'] = False
        return False

def make_api_request(method, endpoint, data=None, token=None):
    """Make API request to backend with error handling."""
    try:
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        url = f'{API_BASE}{endpoint}'
        
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, timeout=10)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=30)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data, headers=headers, timeout=10)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers, timeout=10)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
        
        if response.status_code < 400:
            return {'success': True, 'data': response.json()}
        else:
            return {'success': False, 'error': response.text}
            
    except Exception as e:
        logger.error(f"API request failed: {e}")
        return {'success': False, 'error': str(e)}

# Note: DemoBAMLIntegration class removed - using pluggable curation engine directly
    

# Initialize real BAML integration (no fallbacks)
if BAML_AVAILABLE:
    print("🚀 Using real BAML ContentCurationPipeline")
else:
    print("⚠️  BAML not available - Using mock classification")

# Routes

@app.route('/')
def index():
    """Main dashboard page."""
    # Check backend health
    check_backend_health()
    
    # Use demo data for now
    demo_state['current_user'] = DEMO_DATA['users'][0]
    
    return render_template('dashboard.html', 
                         user=demo_state['current_user'],
                         children=DEMO_DATA['children'],
                         backend_available=demo_state['backend_available'],
                         demo_mode=True)

@app.route('/child-setup')
def child_setup():
    """Child profile setup page."""
    return render_template('child_setup.html')

@app.route('/content-test')
def content_test():
    """Content testing page."""
    return render_template('content_test.html',
                         children=DEMO_DATA['children'],
                         sample_content=DEMO_DATA['sample_content'])

@app.route('/api/classify', methods=['POST'])
def classify_content():
    """Classify content endpoint."""
    data = request.json
    content = data.get('content', '')
    child_id = data.get('childId')
    
    if not content.strip():
        return jsonify({'error': 'Content cannot be empty'}), 400
    
    # Find child profile
    child_profile = None
    if child_id:
        child_profile = next((c for c in DEMO_DATA['children'] if c['id'] == child_id), None)
    
    # Classify content using pluggable curation engine
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        if curation_engine:
            # Use pluggable curation engine
            if child_profile:
                # Determine age category
                age = child_profile['age']
                if age < 13:
                    age_category = 'UNDER_13'
                elif age < 16:
                    age_category = 'UNDER_16'
                elif age < 18:
                    age_category = 'UNDER_18'
                else:
                    age_category = 'ADULT'
                
                # Determine parental controls based on profile type and age
                is_adult_profile = child_profile.get('profileType') == 'adult' or age >= 18
                parental_controls = not is_adult_profile
                
                # Import UserContext and enums here to avoid import issues
                from BAML_Integration_Real import UserContext, AgeCategory, Jurisdiction, ParentalControls, SensitivityLevel
                
                # Map age category to enum
                age_category_enum = getattr(AgeCategory, age_category, AgeCategory.ADULT)
                
                # Map parental controls - convert boolean to appropriate enum
                if parental_controls:
                    # Child profile with parental controls
                    safety_level = child_profile.get('safetyLevel', 'moderate').upper()
                    parental_controls_enum = getattr(ParentalControls, safety_level, ParentalControls.MODERATE)
                else:
                    # Adult profile without parental controls
                    parental_controls_enum = ParentalControls.NONE
                
                # Map sensitivity level from child profile to enum
                sensitivity_map = {
                    'strict': SensitivityLevel.HIGH,
                    'moderate': SensitivityLevel.MEDIUM,
                    'relaxed': SensitivityLevel.LOW,
                    'minimal': SensitivityLevel.LOW
                }
                sensitivity_level = child_profile.get('safetyLevel', 'moderate').lower()
                sensitivity_enum = sensitivity_map.get(sensitivity_level, SensitivityLevel.MEDIUM)
                
                user_context = UserContext(
                    age_category=age_category_enum,
                    jurisdiction=Jurisdiction.US,
                    parental_controls=parental_controls_enum,
                    content_preferences=child_profile.get('allowedCategories', []),
                    sensitivity_level=sensitivity_enum
                )
            else:
                from BAML_Integration_Real import UserContext, AgeCategory, Jurisdiction, ParentalControls, SensitivityLevel
                user_context = UserContext(
                    age_category=AgeCategory.ADULT,
                    jurisdiction=Jurisdiction.US,
                    parental_controls=ParentalControls.NONE,
                    content_preferences=[],
                    sensitivity_level=SensitivityLevel.MEDIUM
                )
            
            # Use the pluggable curation engine
            curation_result = loop.run_until_complete(curation_engine.curate_content(content, user_context))
            
            # Extract comprehensive analysis from BAML metadata if available
            full_analysis = curation_result.metadata.get('full_analysis', {}) if curation_result.metadata else {}
            
            # Extract educational analysis - only use fields that actually exist in BAML
            educational_data = full_analysis.get('educational', {})
            if educational_data:
                educational_result = {
                    'score': educational_data.get('score'),
                    'learning_objectives': educational_data.get('learning_objectives', []),
                    'subject_areas': educational_data.get('subject_areas', []),
                    'cognitive_level': educational_data.get('cognitive_level')
                    # Note: reasoning, reading_level, factual_accuracy not provided by current BAML implementation
                }
            else:
                educational_result = {'error': 'No educational analysis available from BAML'}
            
            # Extract viewpoint analysis - only use fields that actually exist in BAML
            viewpoint_data = full_analysis.get('viewpoint', {})
            if viewpoint_data:
                viewpoint_result = {
                    'political_leaning': viewpoint_data.get('political_leaning'),
                    'bias_score': viewpoint_data.get('bias_score'),
                    'reasoning': viewpoint_data.get('reasoning'),
                    'source_credibility': viewpoint_data.get('credibility')
                    # Note: perspective_diversity, controversy_level not provided by current BAML implementation
                }
            else:
                viewpoint_result = {'error': 'No viewpoint analysis available from BAML'}
            
            # Extract safety analysis - only use fields that actually exist in BAML
            safety_data = full_analysis.get('safety', {})
            if safety_data:
                safety_result = {
                    'safety_score': safety_data.get('score'),
                    'reasoning': safety_data.get('reasoning'),
                    'content_warnings': safety_data.get('warnings', []),
                    'age_appropriate': safety_data.get('age_appropriate')
                }
            else:
                safety_result = {'error': 'No safety analysis available from BAML'}
            
            # Convert CurationResult to expected format
            classification = {
                'safety': safety_result,
                'recommendation': curation_result.action,
                'overall_confidence': curation_result.confidence,
                'summary_reasoning': full_analysis.get('summary', curation_result.reason)
            }
            
            # Add strategy information to metadata
            strategy_info = curation_engine.get_strategy_info()
            
            # Always use pluggable curation engine (no fallbacks)
            result = {
                'safety': classification['safety'],
                'educational': educational_result,
                'viewpoint': viewpoint_result,
                'recommendation': classification.get('recommendation', 'allow'),
                'confidence': classification.get('overall_confidence', 0.8),
                'processing_time': curation_result.processing_time_ms / 1000.0,  # Convert to seconds
                'model': f"{strategy_info['strategy_name']} ({curation_result.strategy_used})",
                'strategy_info': strategy_info,
                'curation_metadata': curation_result.metadata
            }
        
        # Add metadata
        result['timestamp'] = datetime.now().isoformat()
        result['child_id'] = child_id
        result['content_length'] = len(content)
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Classification error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        loop.close()

@app.route('/api/children', methods=['GET'])
def get_children():
    """Get children profiles."""
    return jsonify(DEMO_DATA['children'])

@app.route('/api/children', methods=['POST'])
def create_child():
    """Create new child profile."""
    child_data = request.json
    child_data['id'] = f"child_{len(DEMO_DATA['children']) + 1}"
    child_data['parentId'] = 'demo_parent'
    
    DEMO_DATA['children'].append(child_data)
    return jsonify(child_data), 201

@app.route('/api/sample-content/<category>')
def get_sample_content(category):
    """Get sample content by category."""
    if category in DEMO_DATA['sample_content']:
        return jsonify(DEMO_DATA['sample_content'][category])
    return jsonify({'error': 'Category not found'}), 404

@app.route('/health')
@app.route('/api/health')
def health_check():
    """Health check endpoint."""
    backend_health = check_backend_health()
    
    # Get current strategy info
    strategy_info = {}
    if curation_engine:
        strategy_info = curation_engine.get_strategy_info()
    
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'demo_frontend': 'running',
            'backend': 'connected' if backend_health else 'disconnected',
            'baml': 'available' if BAML_AVAILABLE else 'mock',
            'database': 'demo_mode'
        },
        'curation_engine': strategy_info,
        'demo_mode': demo_state['demo_mode']
    })

@app.route('/api/strategy', methods=['GET', 'POST'])
def curation_strategy():
    """Get or set the curation strategy."""
    if not curation_engine:
        return jsonify({'error': 'Curation engine not available'}), 503
    
    if request.method == 'GET':
        return jsonify({
            'current_strategy': curation_engine.get_strategy_info(),
            'available_strategies': [strategy.value for strategy in CurationStrategy]
        })
    
    elif request.method == 'POST':
        data = request.json
        new_strategy = data.get('strategy')
        
        if not new_strategy:
            return jsonify({'error': 'Strategy not specified'}), 400
        
        try:
            old_strategy = curation_engine.strategy_type.value
            curation_engine.switch_strategy(new_strategy)
            
            return jsonify({
                'message': f'Strategy switched from {old_strategy} to {new_strategy}',
                'old_strategy': old_strategy,
                'new_strategy': curation_engine.get_strategy_info()
            })
        except ValueError as e:
            return jsonify({'error': f'Invalid strategy: {e}'}), 400

# Template creation
def create_templates():
    """Create HTML templates for the demo."""
    templates_dir = Path(__file__).parent / "templates"
    templates_dir.mkdir(exist_ok=True)
    
    # Dashboard template
    dashboard_html = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Curation Engine - Parent Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        .child-card { 
            transition: transform 0.2s; 
            cursor: pointer;
        }
        .child-card:hover { 
            transform: translateY(-5px); 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .safety-badge { font-size: 0.8em; }
        .demo-banner { 
            background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .feature-card {
            border: none;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        .feature-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
    </style>
</head>
<body class="bg-light">
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="#">
                <i class="fas fa-shield-alt me-2"></i>AI Curation Engine
            </a>
            <div class="navbar-nav ms-auto">
                <span class="navbar-text">
                    <i class="fas fa-user me-1"></i>{{ user.firstName }} {{ user.lastName }}
                </span>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <!-- Demo Banner -->
        <div class="demo-banner">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h4><i class="fas fa-rocket me-2"></i>AI Curation Engine Demo</h4>
                    <p class="mb-0">Experience comprehensive family digital safety with AI-powered content curation</p>
                </div>
                <div class="col-md-4 text-end">
                    <span class="badge bg-success fs-6">
                        <i class="fas fa-check-circle me-1"></i>Demo Mode
                    </span>
                </div>
            </div>
        </div>

        <!-- Quick Stats -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card feature-card text-center">
                    <div class="card-body">
                        <i class="fas fa-child fa-2x text-primary mb-2"></i>
                        <h4>{{ children|length }}</h4>
                        <small class="text-muted">Children Profiles</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card feature-card text-center">
                    <div class="card-body">
                        <i class="fas fa-shield-check fa-2x text-success mb-2"></i>
                        <h4>96.8%</h4>
                        <small class="text-muted">Safety Score</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card feature-card text-center">
                    <div class="card-body">
                        <i class="fas fa-clock fa-2x text-warning mb-2"></i>
                        <h4>2.5h</h4>
                        <small class="text-muted">Avg Screen Time</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card feature-card text-center">
                    <div class="card-body">
                        <i class="fas fa-brain fa-2x text-info mb-2"></i>
                        <h4>AI</h4>
                        <small class="text-muted">BAML Powered</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- Children Profiles -->
        <div class="row">
            <div class="col-12">
                <h3><i class="fas fa-users me-2"></i>Children Profiles</h3>
                <p class="text-muted">Manage your children's digital safety settings</p>
            </div>
        </div>

        <div class="row">
            {% for child in children %}
            <div class="col-md-6 mb-4">
                <div class="card child-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5 class="card-title">{{ child.name }}</h5>
                                <p class="text-muted mb-1">{{ child.age }} years old</p>
                                {% if child.nickname %}
                                <small class="text-muted">"{{ child.nickname }}"</small>
                                {% endif %}
                            </div>
                            <span class="badge 
                                {% if child.safetyLevel == 'strict' %}bg-danger{% endif %}
                                {% if child.safetyLevel == 'moderate' %}bg-warning{% endif %}
                                {% if child.safetyLevel == 'lenient' %}bg-info{% endif %}
                                safety-badge">
                                {{ child.safetyLevel|title }} Protection
                            </span>
                        </div>
                        
                        <div class="mb-3">
                            <small class="text-muted">Allowed Content:</small>
                            <div class="mt-1">
                                {% for category in child.allowedCategories %}
                                <span class="badge bg-success me-1">{{ category|title }}</span>
                                {% endfor %}
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <small class="text-muted">Daily Screen Time:</small>
                            <div class="progress mt-1" style="height: 8px;">
                                <div class="progress-bar bg-primary" style="width: {{ (child.dailyTimeLimit / 480 * 100)|round }}%"></div>
                            </div>
                            <small class="text-muted">{{ (child.dailyTimeLimit / 60)|round(1) }}h limit</small>
                        </div>
                        
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-outline-primary btn-sm">
                                <i class="fas fa-edit me-1"></i>Edit Profile
                            </button>
                            <button class="btn btn-outline-info btn-sm">
                                <i class="fas fa-chart-line me-1"></i>Analytics
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {% endfor %}
            
            <!-- Add Child Card -->
            <div class="col-md-6 mb-4">
                <div class="card child-card h-100 border-2 border-dashed">
                    <div class="card-body d-flex flex-column justify-content-center align-items-center text-center">
                        <i class="fas fa-plus-circle fa-3x text-primary mb-3"></i>
                        <h5>Add New Child</h5>
                        <p class="text-muted">Create a profile for another child</p>
                        <a href="/child-setup" class="btn btn-primary">
                            <i class="fas fa-plus me-1"></i>Create Profile
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Demo Features -->
        <div class="row mt-5">
            <div class="col-12">
                <h3><i class="fas fa-star me-2"></i>Demo Features</h3>
                <p class="text-muted">Explore the AI Curation Engine capabilities</p>
            </div>
        </div>

        <div class="row">
            <div class="col-md-4 mb-4">
                <div class="card feature-card h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-search fa-3x text-primary mb-3"></i>
                        <h5>Content Testing</h5>
                        <p class="text-muted">Test content classification with real BAML AI</p>
                        <a href="/content-test" class="btn btn-primary">Test Content</a>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4 mb-4">
                <div class="card feature-card h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-user-plus fa-3x text-success mb-3"></i>
                        <h5>Profile Setup</h5>
                        <p class="text-muted">6-step wizard for comprehensive child profiles</p>
                        <a href="/child-setup" class="btn btn-success">Setup Profile</a>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4 mb-4">
                <div class="card feature-card h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-cogs fa-3x text-warning mb-3"></i>
                        <h5>Rules Engine</h5>
                        <p class="text-muted">Create and manage content curation rules</p>
                        <button class="btn btn-warning" onclick="alert('Rules management coming soon!')">Manage Rules</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- System Status -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h6><i class="fas fa-info-circle me-2"></i>System Status</h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-3">
                                <strong>Backend:</strong>
                                {% if backend_available %}
                                <span class="badge bg-success">Connected</span>
                                {% else %}
                                <span class="badge bg-warning">Demo Mode</span>
                                {% endif %}
                            </div>
                            <div class="col-md-3">
                                <strong>BAML AI:</strong>
                                <span class="badge bg-info">Available</span>
                            </div>
                            <div class="col-md-3">
                                <strong>Database:</strong>
                                <span class="badge bg-secondary">Demo Data</span>
                            </div>
                            <div class="col-md-3">
                                <strong>Classification:</strong>
                                <span class="badge bg-success">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Add click handlers for child cards
        document.querySelectorAll('.child-card').forEach(card => {
            card.addEventListener('click', function() {
                // Add interaction feedback
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });
    </script>
</body>
</html>
    '''
    
    with open(templates_dir / "dashboard.html", "w") as f:
        f.write(dashboard_html)
    
    # Content test template
    content_test_html = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Content Classification Test - AI Curation Engine</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        .result-card { margin: 10px 0; }
        .score-badge { font-size: 0.9em; margin: 2px; }
        .loading { display: none; }
        .recommendation-allow { background-color: #d4edda; border-color: #c3e6cb; }
        .recommendation-caution { background-color: #fff3cd; border-color: #ffeaa7; }
        .recommendation-block { background-color: #f8d7da; border-color: #f5c6cb; }
    </style>
</head>
<body class="bg-light">
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="/">
                <i class="fas fa-shield-alt me-2"></i>AI Curation Engine
            </a>
            <div class="navbar-nav ms-auto">
                <a class="nav-link" href="/">
                    <i class="fas fa-home me-1"></i>Dashboard
                </a>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <div class="row">
            <div class="col-12">
                <h2><i class="fas fa-search me-2"></i>Content Classification Test</h2>
                <p class="text-muted">Test the AI-powered content classification system with real BAML integration</p>
            </div>
        </div>

        <!-- Strategy Control Panel -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card border-primary">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0"><i class="fas fa-cogs me-2"></i>Curation Engine Strategy Control</h5>
                    </div>
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-3">
                                <label class="form-label fw-bold">Active Strategy:</label>
                                <select class="form-select" id="strategySelect">
                                    <option value="hybrid">🔄 Hybrid (Smart)</option>
                                    <option value="multi_layer">🏭 Multi-Layer (Fast)</option>
                                    <option value="llm_only">🧠 LLM-Only (Detailed)</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Strategy Description:</label>
                                <div id="strategyInfo" class="alert alert-info py-2 mb-0">
                                    <small>Loading strategy information...</small>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label fw-bold">Performance:</label>
                                <div id="performanceMetrics" class="text-muted">
                                    <small>No recent classifications</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <!-- Input Section -->
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-edit me-2"></i>Content Input</h5>
                    </div>
                    <div class="card-body">
                        <!-- Child Selection -->
                        <div class="mb-3">
                            <label class="form-label">Test for Child Profile</label>
                            <select id="childSelect" class="form-select">
                                <option value="">No specific child (adult view)</option>
                                {% for child in children %}
                                <option value="{{ child.id }}">{{ child.name }} ({{ child.age }} years old)</option>
                                {% endfor %}
                            </select>
                        </div>

                        <!-- Sample Content Buttons -->
                        <div class="mb-3">
                            <label class="form-label">Quick Test Samples</label>
                            <div class="d-grid gap-2">
                                {% for category, content in sample_content.items() %}
                                <button class="btn btn-outline-primary sample-btn" onclick="loadSample('{{ category }}', this)">
                                    <i class="fas fa-file-text me-2"></i>{{ content.title }}
                                </button>
                                {% endfor %}
                            </div>
                        </div>

                        <!-- Content Input -->
                        <div class="mb-3">
                            <label for="contentInput" class="form-label">Content to Analyze</label>
                            <textarea id="contentInput" class="form-control" rows="8" 
                                    placeholder="Enter text content to analyze for safety, educational value, and appropriateness..."></textarea>
                        </div>

                        <!-- Analyze Button -->
                        <button id="analyzeBtn" class="btn btn-primary btn-lg w-100" onclick="analyzeContent()">
                            <i class="fas fa-brain me-2"></i>Analyze with AI
                        </button>
                        
                        <div id="loading" class="loading text-center mt-2">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Analyzing...</span>
                            </div>
                            <p class="mt-2">AI analyzing content...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Results Section -->
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-chart-line me-2"></i>Classification Results</h5>
                    </div>
                    <div class="card-body">
                        <div id="resultsContainer">
                            <div class="text-center text-muted">
                                <i class="fas fa-chart-bar fa-3x mb-3"></i>
                                <p>Results will appear here after content analysis</p>
                                <small>The AI will analyze safety, educational value, and viewpoint</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        const sampleContent = {{ sample_content | tojsonfilter }};

        function loadSample(category, buttonElement) {
            if (sampleContent[category]) {
                // Load the sample content
                document.getElementById('contentInput').value = sampleContent[category].content;
                
                // Clear previous results
                clearResults();
                
                // Update button highlighting
                updateSampleButtonHighlight(buttonElement);
                
                // Show feedback that sample was loaded
                showSampleLoadedFeedback(category);
            }
        }
        
        function clearResults() {
            const resultsContainer = document.getElementById('resultsContainer');
            if (resultsContainer) {
                resultsContainer.innerHTML = `
                    <div class="text-center text-muted py-4">
                        <i class="fas fa-search fa-2x mb-3"></i>
                        <p>Results will appear here after content analysis</p>
                        <small>Select a sample above or enter your own content, then click "Analyze with AI"</small>
                    </div>
                `;
            }
        }
        
        function updateSampleButtonHighlight(activeButton) {
            // Remove active class from all sample buttons
            document.querySelectorAll('.sample-btn').forEach(btn => {
                btn.classList.remove('btn-primary', 'active');
                btn.classList.add('btn-outline-primary');
            });
            
            // Add active class to the clicked button
            if (activeButton) {
                activeButton.classList.remove('btn-outline-primary');
                activeButton.classList.add('btn-primary', 'active');
            }
        }
        
        function showSampleLoadedFeedback(category) {
            const categoryName = sampleContent[category]?.title || category;
            
            // Show a brief toast notification
            const toast = document.createElement('div');
            toast.className = 'toast position-fixed top-0 end-0 m-3';
            toast.style.zIndex = '9999';
            toast.innerHTML = `
                <div class="toast-header bg-info text-white">
                    <i class="fas fa-file-text me-2"></i>
                    <strong class="me-auto">Sample Loaded</strong>
                </div>
                <div class="toast-body">
                    Loaded: ${categoryName}
                </div>
            `;
            document.body.appendChild(toast);
            
            // Auto-remove toast after 2 seconds
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 2000);
        }

        // Performance tracking
        let performanceHistory = [];
        
        // Strategy management functions
        async function loadCurrentStrategy() {
            try {
                const response = await fetch('/api/strategy');
                const data = await response.json();
                
                if (data.current_strategy) {
                    const strategySelect = document.getElementById('strategySelect');
                    const strategyInfo = document.getElementById('strategyInfo');
                    
                    strategySelect.value = data.current_strategy.strategy_type;
                    
                    const descriptions = {
                        'hybrid': 'Intelligently switches between fast filters and LLM reasoning based on content complexity',
                        'multi_layer': 'Uses fast rule-based filters → specialized AI → LLM only for edge cases (production-optimized)',
                        'llm_only': 'Full LLM analysis with comprehensive reasoning (best for AI demos and complex content)'
                    };
                    
                    const colors = {
                        'hybrid': 'alert-primary',
                        'multi_layer': 'alert-success', 
                        'llm_only': 'alert-warning'
                    };
                    
                    strategyInfo.className = `alert py-2 mb-0 ${colors[data.current_strategy.strategy_type]}`;
                    strategyInfo.innerHTML = `<small><strong>${data.current_strategy.strategy_name}:</strong> ${descriptions[data.current_strategy.strategy_type]}</small>`;
                    
                    updatePerformanceDisplay();
                }
            } catch (error) {
                console.error('Failed to load current strategy:', error);
                document.getElementById('strategyInfo').innerHTML = '<small class="text-danger">Error loading strategy info</small>';
            }
        }
        
        function updatePerformanceDisplay() {
            const performanceDiv = document.getElementById('performanceMetrics');
            
            if (performanceHistory.length === 0) {
                performanceDiv.innerHTML = '<small class="text-muted">No classifications yet</small>';
                return;
            }
            
            const recent = performanceHistory.slice(-5);
            const avgTime = recent.reduce((sum, p) => sum + p.time, 0) / recent.length;
            const totalClassifications = performanceHistory.length;
            
            performanceDiv.innerHTML = `
                <small>
                    <div><strong>${totalClassifications}</strong> classifications</div>
                    <div>Avg: <strong>${avgTime.toFixed(1)}s</strong></div>
                    <div class="text-success">Last: <strong>${recent[recent.length - 1]?.time.toFixed(1)}s</strong></div>
                </small>
            `;
        }
        
        async function switchStrategy() {
            const newStrategy = document.getElementById('strategySelect').value;
            const strategyInfo = document.getElementById('strategyInfo');
            const performanceDiv = document.getElementById('performanceMetrics');
            
            strategyInfo.innerHTML = '<small class="text-warning"><i class="fas fa-spinner fa-spin me-1"></i>Switching strategy...</small>';
            performanceDiv.innerHTML = '<small class="text-muted">Strategy switching...</small>';
            
            try {
                const response = await fetch('/api/strategy', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ strategy: newStrategy })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Clear performance history when switching strategies
                    performanceHistory = [];
                    
                    // Show success notification
                    const toast = document.createElement('div');
                    toast.className = 'toast position-fixed top-0 end-0 m-3';
                    toast.innerHTML = `
                        <div class="toast-header bg-success text-white">
                            <i class="fas fa-check-circle me-2"></i>
                            <strong class="me-auto">Strategy Switched</strong>
                        </div>
                        <div class="toast-body">
                            Switched from ${data.old_strategy} to ${newStrategy}
                        </div>
                    `;
                    document.body.appendChild(toast);
                    
                    // Auto-remove toast after 3 seconds
                    setTimeout(() => {
                        if (toast.parentNode) {
                            toast.parentNode.removeChild(toast);
                        }
                    }, 3000);
                    
                    // Reload strategy info
                    await loadCurrentStrategy();
                    
                    console.log('Strategy switched:', data.message);
                } else {
                    strategyInfo.innerHTML = '<small class="text-danger">Error switching strategy</small>';
                    console.error('Strategy switch failed:', data.error);
                }
            } catch (error) {
                strategyInfo.innerHTML = '<small class="text-danger">Error switching strategy</small>';
                console.error('Strategy switch error:', error);
            }
        }

        async function analyzeContent() {
            const content = document.getElementById('contentInput').value.trim();
            if (!content) {
                alert('Please enter content to analyze');
                return;
            }

            const childId = document.getElementById('childSelect').value;

            // Show loading
            document.getElementById('analyzeBtn').disabled = true;
            document.getElementById('loading').style.display = 'block';
            
            // Track start time for performance monitoring
            const startTime = Date.now();

            try {
                const response = await fetch('/api/classify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content, childId })
                });

                const result = await response.json();
                
                // Track performance
                const endTime = Date.now();
                const processingTime = (endTime - startTime) / 1000;
                performanceHistory.push({
                    time: processingTime,
                    strategy: result.strategy_info?.strategy_type || 'unknown',
                    recommendation: result.recommendation
                });
                
                // Update performance display
                updatePerformanceDisplay();
                
                displayResults(result);

            } catch (error) {
                console.error('Error:', error);
                displayError(error.message);
            } finally {
                document.getElementById('analyzeBtn').disabled = false;
                document.getElementById('loading').style.display = 'none';
            }
        }

        function displayResults(result) {
            const container = document.getElementById('resultsContainer');
            
            if (result.error) {
                displayError(result.error);
                return;
            }

            const safety = result.safety || {};
            const educational = result.educational || {};
            const viewpoint = result.viewpoint || {};

            const recommendationClass = 
                result.recommendation === 'allow' ? 'recommendation-allow' :
                result.recommendation === 'caution' ? 'recommendation-caution' : 'recommendation-block';

            container.innerHTML = `
                <!-- Strategy & Performance Info -->
                <div class="alert alert-dark mb-3">
                    <div class="row">
                        <div class="col-md-8">
                            <h6><i class="fas fa-cogs me-2"></i>Strategy Used: ${result.model || 'Unknown'}</h6>
                            <small>
                                Processing Time: <strong>${result.processing_time?.toFixed(2) || 'N/A'}s</strong> |
                                Confidence: <strong>${(result.confidence * 100)?.toFixed(1) || 'N/A'}%</strong>
                                ${result.curation_metadata?.baml_used ? ' | <span class="badge bg-success">BAML AI</span>' : ' | <span class="badge bg-secondary">Mock</span>'}
                            </small>
                        </div>
                        <div class="col-md-4 text-end">
                            <small class="text-muted">
                                Strategy: <strong>${result.strategy_info?.strategy_type || 'Unknown'}</strong><br>
                                ${result.curation_metadata?.engine_strategy ? `Engine: ${result.curation_metadata.engine_strategy}` : ''}
                            </small>
                        </div>
                    </div>
                </div>
                
                <!-- Overall Recommendation -->
                <div class="alert ${recommendationClass} mb-3">
                    <h6><i class="fas fa-thumbs-${result.recommendation === 'allow' ? 'up' : result.recommendation === 'caution' ? 'sideways' : 'down'} me-2"></i>
                    Recommendation: ${result.recommendation.toUpperCase()}</h6>
                    <p class="mb-1">${safety.reasoning || 'AI analysis completed'}</p>
                    <small>Confidence: ${(result.confidence * 100).toFixed(1)}%</small>
                </div>

                <!-- Safety Analysis -->
                <div class="mb-3">
                    <h6><i class="fas fa-shield-alt me-2"></i>Safety Analysis</h6>
                    <div class="row">
                        <div class="col-6">
                            <div class="text-center">
                                <div class="h4 mb-1 ${safety.safety_score > 0.7 ? 'text-success' : safety.safety_score > 0.4 ? 'text-warning' : 'text-danger'}">
                                    ${(safety.safety_score * 100).toFixed(1)}%
                                </div>
                                <small class="text-muted">Safety Score</small>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-center">
                                <div class="h6 mb-1">${safety.age_appropriate || 'All ages'}</div>
                                <small class="text-muted">Age Rating</small>
                            </div>
                        </div>
                    </div>
                    ${safety.warnings && safety.warnings.length > 0 ? `
                    <div class="mt-2">
                        <small><strong>Warnings:</strong></small>
                        <div class="mt-1">
                            ${safety.warnings.map(w => `<span class="badge bg-warning me-1">${w}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>

                <!-- Educational Analysis -->
                <div class="mb-3">
                    <h6><i class="fas fa-graduation-cap me-2"></i>Educational Value</h6>
                    <div class="row">
                        <div class="col-6">
                            <div class="text-center">
                                <div class="h4 mb-1 ${educational.score > 0.7 ? 'text-success' : educational.score > 0.4 ? 'text-warning' : 'text-secondary'}">
                                    ${(educational.score * 100).toFixed(1)}%
                                </div>
                                <small class="text-muted">Educational Score</small>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-center">
                                <div class="h6 mb-1">${educational.cognitive_level || 'Basic'}</div>
                                <small class="text-muted">Cognitive Level</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Viewpoint Analysis -->
                <div class="mb-3">
                    <h6><i class="fas fa-balance-scale me-2"></i>Viewpoint Analysis</h6>
                    <div class="row">
                        <div class="col-6">
                            <div class="text-center">
                                <div class="h6 mb-1">${viewpoint.political_leaning || 'Neutral'}</div>
                                <small class="text-muted">Political Leaning</small>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-center">
                                <div class="h4 mb-1 ${viewpoint.bias_score < 0.3 ? 'text-success' : viewpoint.bias_score < 0.6 ? 'text-warning' : 'text-danger'}">
                                    ${(viewpoint.bias_score * 100).toFixed(1)}%
                                </div>
                                <small class="text-muted">Bias Score</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Processing Info -->
                <div class="text-center mt-3 pt-2 border-top">
                    <small class="text-muted">
                        <i class="fas fa-clock me-1"></i>Processed in ${result.processing_time}s
                        <span class="mx-2">•</span>
                        <i class="fas fa-robot me-1"></i>Model: ${result.model}
                    </small>
                </div>
            `;
        }

        function displayError(error) {
            const container = document.getElementById('resultsContainer');
            container.innerHTML = `
                <div class="alert alert-danger">
                    <h6><i class="fas fa-exclamation-triangle me-2"></i>Analysis Error</h6>
                    <p class="mb-0">${error}</p>
                </div>
            `;
        }
        
        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            // Load current strategy on page load
            loadCurrentStrategy();
            
            // Add strategy change listener
            document.getElementById('strategySelect').addEventListener('change', switchStrategy);
            
            // Clear results when user manually edits content
            const contentInput = document.getElementById('contentInput');
            if (contentInput) {
                contentInput.addEventListener('input', function() {
                    // Clear button highlighting when user types manually
                    updateSampleButtonHighlight(null);
                    
                    // Only clear results if there are existing results
                    const resultsContainer = document.getElementById('resultsContainer');
                    if (resultsContainer && resultsContainer.innerHTML.includes('alert')) {
                        clearResults();
                    }
                });
            }
            
            console.log('Page initialized with pluggable curation engine');
        });
    </script>
</body>
</html>
    '''
    
    with open(templates_dir / "content_test.html", "w") as f:
        f.write(content_test_html)
    
    # Child setup template (simplified)
    child_setup_html = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Child Profile Setup - AI Curation Engine</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="/">
                <i class="fas fa-shield-alt me-2"></i>AI Curation Engine
            </a>
            <div class="navbar-nav ms-auto">
                <a class="nav-link" href="/">
                    <i class="fas fa-home me-1"></i>Dashboard
                </a>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h4><i class="fas fa-user-plus me-2"></i>Child Profile Setup</h4>
                        <p class="mb-0 text-muted">Create a comprehensive safety profile for your child</p>
                    </div>
                    <div class="card-body">
                        <div class="text-center">
                            <i class="fas fa-tools fa-4x text-primary mb-3"></i>
                            <h5>Enhanced Profile Setup</h5>
                            <p class="text-muted">
                                The enhanced 6-step child profile setup wizard is available in the React components.
                                This demo focuses on content classification capabilities.
                            </p>
                            <div class="alert alert-info">
                                <strong>Features Available in Full Implementation:</strong>
                                <ul class="list-unstyled mt-2">
                                    <li><i class="fas fa-check text-success me-2"></i>6-step guided setup wizard</li>
                                    <li><i class="fas fa-check text-success me-2"></i>Age-appropriate safety levels</li>
                                    <li><i class="fas fa-check text-success me-2"></i>Visual content category selection</li>
                                    <li><i class="fas fa-check text-success me-2"></i>Time management controls</li>
                                    <li><i class="fas fa-check text-success me-2"></i>Advanced parental controls</li>
                                </ul>
                            </div>
                            <a href="/" class="btn btn-primary">
                                <i class="fas fa-arrow-left me-2"></i>Back to Dashboard
                            </a>
                            <a href="/content-test" class="btn btn-success">
                                <i class="fas fa-search me-2"></i>Test Content Classification
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
    '''
    
    with open(templates_dir / "child_setup.html", "w") as f:
        f.write(child_setup_html)
    
    print("✅ Templates created successfully")

# Initialize templates on startup
create_templates()

# Start the demo application
if __name__ == '__main__':
    print("🚀 Starting AI Curation Engine Demo...")
    print("📱 Demo Interface: http://localhost:5000")
    print("🔍 Content Testing: http://localhost:5000/content-test")
    print("👨‍👩‍👧‍👦 Child Setup: http://localhost:5000/child-setup")
    print("")
    
    # Check backend availability
    backend_health = check_backend_health()
    if backend_health:
        print("✅ Backend connected - Full functionality available")
    else:
        print("⚠️  Backend not available - Running in demo mode")
    
    if BAML_AVAILABLE:
        print("✅ BAML integration available - Real AI classification")
    else:
        print("⚠️  BAML not available - Using mock classification")
    
    print("")
    print("🎯 Demo Features:")
    print("   • Parent dashboard with child profiles")
    print("   • Real-time content classification")
    print("   • BAML AI integration")
    print("   • Safety analytics")
    print("   • Child profile management")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
