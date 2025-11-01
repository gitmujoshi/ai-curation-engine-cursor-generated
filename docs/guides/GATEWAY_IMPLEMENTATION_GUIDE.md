# 🛠️ Internet Gateway Implementation Guide

## Overview

This guide walks you through implementing the Device-Level Internet Gateway to integrate with your AI Curation Engine and control all internet access.

## Prerequisites

✅ AI Curation Engine running (localhost:5001)  
✅ Ollama with LLMs installed  
✅ MongoDB for profiles  
✅ Python 3.11+  
✅ Node.js 18+ (optional for UI)  

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Device App (Any App)                                    │
│  └─► HTTP/HTTPS Requests                                 │
│      └─► Gateway Proxy (localhost:8080)                  │
│          └─► AI Curation Engine (localhost:5001)         │
│              └─► Decision: Allow / Block / Modify        │
│                  └─► Device App receives filtered data    │
└─────────────────────────────────────────────────────────┘
```

## Step 1: Create Gateway Service

### 1.1 Directory Structure

```bash
cd AISafety
mkdir -p src/gateway
cd src/gateway
```

### 1.2 Gateway Proxy Implementation

```python
# src/gateway/gateway_proxy.py

import asyncio
import logging
from typing import Optional
from aiohttp import web, ClientSession, TCPConnector
from aiohttp.web import Request, Response
import json

logger = logging.getLogger(__name__)

class GatewayProxy:
    """Main gateway proxy that intercepts and filters content"""
    
    def __init__(self, curation_api_url: str = "http://localhost:5001"):
        self.curation_api = curation_api_url
        self.session = ClientSession(
            connector=TCPConnector(limit=100)
        )
        
    async def handle_request(self, request: Request) -> Response:
        """
        Main request handler - intercepts and filters all requests
        """
        try:
            # 1. Extract user information
            user_id = self.extract_user(request)
            if not user_id:
                return self.unauthorized_response()
            
            # 2. Get request details
            url = request.url
            method = request.method
            headers = dict(request.headers)
            
            # Log request
            logger.info(f"Request: {method} {url} from user {user_id}")
            
            # 3. Get user profile
            profile = await self.get_profile(user_id)
            if not profile:
                return self.no_profile_response(user_id)
            
            # 4. Check content with AI engine
            decision = await self.check_content(
                url=url,
                method=method,
                headers=headers,
                user_id=user_id,
                profile=profile
            )
            
            # 5. Execute decision
            if decision.get("action") == "allow":
                return await self.forward_request(request, decision)
            elif decision.get("action") == "block":
                return self.block_response(decision.get("reason"))
            elif decision.get("action") == "modify":
                return await self.modified_response(request, decision)
            else:
                return self.block_response("Unknown decision")
                
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            return self.error_response(str(e))
    
    async def check_content(self, url, method, headers, user_id, profile):
        """
        Check content with AI Curation Engine
        """
        try:
            # Build request to curation engine
            check_request = {
                "url": str(url),
                "method": method,
                "headers": headers,
                "user_id": user_id,
                "profile": profile
            }
            
            # Call AI Curation Engine
            async with self.session.post(
                f"{self.curation_api}/api/check-content",
                json=check_request,
                timeout=30
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    # Fallback: block if API fails
                    logger.warning(f"API returned {response.status}")
                    return {
                        "action": "block",
                        "reason": "Unable to verify content safety"
                    }
                    
        except Exception as e:
            logger.error(f"Error calling curation API: {e}")
            # Fail-closed: block if uncertain
            return {
                "action": "block",
                "reason": "Safety check unavailable"
            }
    
    async def get_profile(self, user_id: str):
        """Get user profile from database"""
        try:
            async with self.session.get(
                f"{self.curation_api}/api/profile/{user_id}",
                timeout=5
            ) as response:
                if response.status == 200:
                    return await response.json()
                return None
        except Exception as e:
            logger.error(f"Error getting profile: {e}")
            return None
    
    def extract_user(self, request: Request) -> Optional[str]:
        """
        Extract user ID from request
        Options:
        - HTTP header: X-User-ID
        - Session cookie
        - JWT token
        """
        # Try header first
        user_id = request.headers.get("X-User-ID")
        if user_id:
            return user_id
        
        # Try cookie
        user_id = request.cookies.get("user_id")
        if user_id:
            return user_id
        
        # For demo: use default
        return "default_user"
    
    async def forward_request(self, request: Request, decision: dict) -> Response:
        """
        Forward allowed request to destination
        """
        try:
            # Forward to original destination
            async with self.session.request(
                method=request.method,
                url=str(request.url).replace(request.host, ""),
                headers=dict(request.headers),
                data=await request.read(),
                allow_redirects=False
            ) as resp:
                body = await resp.read()
                
                return Response(
                    body=body,
                    status=resp.status,
                    headers=dict(resp.headers)
                )
                
        except Exception as e:
            logger.error(f"Error forwarding request: {e}")
            return self.error_response(str(e))
    
    def block_response(self, reason: str) -> Response:
        """Generate block page"""
        block_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Content Blocked</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding: 50px;
                    background: #f5f5f5;
                }}
                .container {{
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    max-width: 600px;
                    margin: 0 auto;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }}
                h1 {{ color: #e74c3c; }}
                .reason {{ color: #7f8c8d; margin: 20px 0; }}
                button {{
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🛡️ Content Blocked</h1>
                <p class="reason"><strong>Reason:</strong> {reason}</p>
                <p>This content does not meet your safety policy.</p>
                <button onclick="history.back()">Go Back</button>
            </div>
        </body>
        </html>
        """
        
        return Response(
            text=block_html,
            content_type="text/html",
            status=403
        )
    
    def unauthorized_response(self) -> Response:
        """User not authenticated"""
        return Response(
            text="User not identified",
            status=401
        )
    
    def no_profile_response(self, user_id: str) -> Response:
        """No profile configured for user"""
        return Response(
            text=f"No profile configured for user {user_id}",
            status=403
        )
    
    def error_response(self, message: str) -> Response:
        """Internal error"""
        return Response(
            text=f"Internal error: {message}",
            status=500
        )

# Create web application
async def create_app():
    """Create aiohttp web application"""
    app = web.Application()
    gateway = GatewayProxy()
    
    # Add route for all requests
    app.router.add_route('*', '/{path:.*}', gateway.handle_request)
    
    return app

# Run gateway
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    async def run():
        app = await create_app()
        runner = web.AppRunner(app)
        await runner.setup()
        site = web.TCPSite(runner, 'localhost', 8080)
        await site.start()
        
        print("🌐 Gateway running on http://localhost:8080")
        print("📝 Configure your apps to use this proxy")
        
        # Keep running
        await asyncio.Event().wait()
    
    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        print("\n👋 Gateway stopped")
```

## Step 2: Extend AI Curation Engine API

### 2.1 Add Gateway Endpoints

```python
# Add to src/ui/demo-frontend/app.js

@app.route('/api/check-content', methods=['POST'])
def check_content():
    """
    Check content for gateway requests
    """
    try:
        data = request.json
        
        user_id = data.get('user_id')
        url = data.get('url')
        profile = data.get('profile', {})
        
        # Get actual profile from database if needed
        if not profile or profile == {}:
            profile_data = get_profile_from_db(user_id)
            if not profile_data:
                return jsonify({
                    "action": "block",
                    "reason": "No profile found"
                }), 403
            profile = profile_data
        
        # Extract content from URL (simplified)
        # In production, fetch and analyze actual content
        content_preview = f"URL: {url}"
        
        # Use your existing curation engine
        if BAML_AVAILABLE and curation_engine:
            # Analyze content
            result = curation_engine.curate_content(
                content=content_preview,
                child_profile={
                    "age": profile.get('age', 13),
                    "vulnerabilities": profile.get('vulnerabilities', [])
                }
            )
            
            # Make decision
            if result.get('recommendation') == 'allow':
                return jsonify({
                    "action": "allow",
                    "reason": "Content approved",
                    "confidence": result.get('confidence', 0.5)
                }), 200
            else:
                return jsonify({
                    "action": "block",
                    "reason": result.get('summary_reasoning', 'Not safe'),
                    "confidence": result.get('confidence', 0.5)
                }), 200
        else:
            # Fallback: basic filtering
            return jsonify({
                "action": "allow",
                "reason": "Using basic filtering",
                "confidence": 0.3
            }), 200
            
    except Exception as e:
        return jsonify({
            "action": "block",
            "reason": f"Error: {str(e)}"
        }), 500
```

## Step 3: Create Profile Management

### 3.1 Profile Manager

```python
# src/gateway/profile_manager.py

from pymongo import MongoClient
from typing import Optional, Dict, Any
import json

class ProfileManager:
    """Manages user profiles for the gateway"""
    
    def __init__(self, db_url="mongodb://localhost:27017"):
        self.client = MongoClient(db_url)
        self.db = self.client.curation_engine
        self.profiles = self.db.gateway_profiles
    
    def create_profile(self, user_id: str, profile_data: Dict[str, Any]) -> bool:
        """Create or update user profile"""
        try:
            self.profiles.update_one(
                {"user_id": user_id},
                {"$set": profile_data},
                upsert=True
            )
            return True
        except Exception as e:
            print(f"Error creating profile: {e}")
            return False
    
    def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile"""
        try:
            profile = self.profiles.find_one({"user_id": user_id})
            if profile:
                profile.pop('_id', None)  # Remove MongoDB ID
                return profile
            return None
        except Exception as e:
            print(f"Error getting profile: {e}")
            return None
    
    def update_policy(self, user_id: str, policy_updates: Dict[str, Any]) -> bool:
        """Update content policy for user"""
        try:
            self.profiles.update_one(
                {"user_id": user_id},
                {"$set": {"content_policies": policy_updates}}
            )
            return True
        except Exception as e:
            print(f"Error updating policy: {e}")
            return False

# Example profile
EXAMPLE_PROFILE = {
    "user_id": "teen_001",
    "age": 14,
    "safety_level": "moderate",
    "content_policies": {
        "allowed_categories": ["educational", "news", "social"],
        "blocked_categories": ["adult", "gambling", "extreme"],
        "min_safety_score": 70
    },
    "time_limits": {
        "daily_minutes": 180,
        "bedtime": "22:00"
    }
}
```

## Step 4: Quick Start Script

```bash
# src/gateway/start_gateway.sh

#!/bin/bash

echo "🚀 Starting Internet Gateway..."

# Check prerequisites
python3 -c "import aiohttp" 2>/dev/null || pip3 install aiohttp

# Start gateway
cd "$(dirname "$0")"
python3 gateway_proxy.py
```

## Step 5: Configuration

### 5.1 Device Proxy Configuration

**For macOS/Linux**:
```bash
# Set HTTP proxy
export http_proxy=http://localhost:8080
export https_proxy=http://localhost:8080

# Start apps with proxy
HTTP_PROXY=http://localhost:8080 python my_app.py
```

**For Browser**:
1. Chrome: Settings → Advanced → System → Open proxy settings
2. Firefox: Settings → General → Network Settings → Manual proxy
3. Set HTTP/HTTPS proxy to `localhost:8080`

## Step 6: Testing

### 6.1 Test Gateway

```python
# test_gateway.py

import requests

# Set proxy
proxies = {
    'http': 'http://localhost:8080',
    'https': 'http://localhost:8080'
}

# Test request
response = requests.get(
    'https://example.com',
    proxies=proxies,
    headers={'X-User-ID': 'teen_001'}
)

print(f"Status: {response.status_code}")
print(f"Content: {response.text[:200]}")
```

## Next Steps

1. **Deploy Gateway**: Start gateway service
2. **Create Profiles**: Add user profiles
3. **Configure Devices**: Point apps to gateway
4. **Monitor**: Check logs and decisions
5. **Iterate**: Refine policies

---

**📚 Full Architecture**: `docs/architecture/DEVICE_LEVEL_INTERNET_GATEWAY.md`

