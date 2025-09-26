#!/usr/bin/env python3
"""
Ollama Proxy Server for BAML Integration

This proxy intercepts BAML's requests to Ollama and converts 'system' messages 
to 'user' messages, since Llama 3.2 doesn't respond to system messages.

Run this proxy on port 11435, then configure BAML to use http://localhost:11435/v1
instead of http://localhost:11434/v1
"""

import asyncio
import json
import aiohttp
from aiohttp import web
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ollama backend URL
OLLAMA_URL = "http://localhost:11434"

async def proxy_handler(request):
    """Proxy requests to Ollama, converting system messages to user messages"""
    
    # Get the path and query parameters
    path = request.path_qs
    method = request.method
    
    logger.info(f"📨 {method} {path}")
    
    # Build the target URL
    target_url = f"{OLLAMA_URL}{path}"
    
    # Get the request body
    if request.content_length:
        body = await request.read()
        try:
            data = json.loads(body)
            
            # Convert system messages to user messages for chat completions
            if path.startswith('/v1/chat/completions') and 'messages' in data:
                logger.info(f"🔍 Found {len(data['messages'])} messages")
                modified = False
                for i, message in enumerate(data['messages']):
                    if message.get('role') == 'system':
                        logger.info(f"🔄 Converting system message {i} to user message")
                        message['role'] = 'user'
                        modified = True
                
                if modified:
                    body = json.dumps(data).encode('utf-8')
                    logger.info(f"✅ Message conversion complete")
                    
        except json.JSONDecodeError as e:
            logger.warning(f"⚠️ Failed to parse JSON body: {e}")
            # Not JSON, pass through as-is
            pass
    else:
        body = None
    
    # Forward the request to Ollama
    headers = dict(request.headers)
    # Remove hop-by-hop headers that could cause issues
    headers.pop('host', None)
    headers.pop('connection', None)
    headers.pop('content-length', None)  # Let aiohttp handle this
    
    try:
        logger.info(f"🔄 Forwarding to {target_url}")
        async with aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30)  # Shorter timeout for debugging
        ) as session:
            async with session.request(
                method=method,
                url=target_url,
                data=body,
                headers=headers
            ) as response:
                # Get response data
                response_body = await response.read()
                logger.info(f"✅ Got response: {response.status}, {len(response_body)} bytes")
                
                # Create response
                resp = web.Response(
                    body=response_body,
                    status=response.status,
                    headers=response.headers
                )
                
                return resp
                
    except Exception as e:
        logger.error(f"❌ Proxy error: {e}")
        return web.Response(
            text=f"Proxy error: {str(e)}",
            status=500
        )

async def health_check(request):
    """Health check endpoint"""
    return web.Response(text="Ollama Proxy OK", status=200)

def create_app():
    """Create the proxy application"""
    app = web.Application()
    app.router.add_route('GET', '/health', health_check)
    app.router.add_route('*', '/{path:.*}', proxy_handler)
    return app

async def main():
    """Start the proxy server"""
    app = create_app()
    
    # Start the server
    runner = web.AppRunner(app)
    await runner.setup()
    
    site = web.TCPSite(runner, 'localhost', 11435)
    await site.start()
    
    logger.info("🚀 Ollama Proxy started on http://localhost:11435")
    logger.info("🔄 Converting system messages to user messages for BAML")
    logger.info("📡 Forwarding to Ollama at http://localhost:11434")
    
    # Keep the server running
    try:
        await asyncio.Future()  # Run forever
    except KeyboardInterrupt:
        logger.info("🛑 Shutting down proxy server")
    finally:
        await runner.cleanup()

if __name__ == '__main__':
    asyncio.run(main())
