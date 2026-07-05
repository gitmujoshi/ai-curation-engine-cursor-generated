"""
Authentication & Authorization

Validates API keys and extracts tenant information.
"""

import hashlib
import logging
from typing import Optional

from fastapi import Header, HTTPException, status

from src.gateway.config import settings

logger = logging.getLogger(__name__)

# In production, this would query Redis/Database
# For now, we'll use a simple in-memory store
VALID_API_KEYS = {
    "pmtr_live_test_key_12345": {
        "tenant_id": "tenant_test_001",
        "name": "Test Organization",
        "tier": "enterprise"
    }
}


async def verify_api_key(
    x_perimeter_api_key: Optional[str] = Header(None, alias=settings.API_KEY_HEADER)
) -> str:
    """
    Verify API key and return tenant ID.
    
    Args:
        x_perimeter_api_key: API key from request header
        
    Returns:
        tenant_id: Unique identifier for the tenant
        
    Raises:
        HTTPException: If API key is invalid or missing
    """
    if not x_perimeter_api_key:
        logger.warning("Missing API key in request")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Validate API key format
    if not x_perimeter_api_key.startswith("pmtr_"):
        logger.warning(f"Invalid API key format: {x_perimeter_api_key[:10]}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key format"
        )
    
    # Check if key exists (in production, check Redis cache first, then DB)
    key_data = VALID_API_KEYS.get(x_perimeter_api_key)
    
    if not key_data:
        logger.warning(f"Invalid API key: {x_perimeter_api_key[:10]}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    tenant_id = key_data["tenant_id"]
    logger.info(f"Authenticated request for tenant: {tenant_id}")
    
    return tenant_id


def hash_api_key(api_key: str) -> str:
    """
    Create SHA-256 hash of API key for secure storage.
    
    Args:
        api_key: Plain text API key
        
    Returns:
        Hexadecimal hash string
    """
    return hashlib.sha256(api_key.encode()).hexdigest()
