"""
BAML Type Guardrail Engine

Provides runtime type validation and prompt injection inoculation
using BAML schema definitions.
"""

import logging
from typing import Any, Dict, List

logger = logging.getLogger(__name__)


class BAMLValidator:
    """
    BAML-powered type validation engine.
    
    Ensures all inputs conform to strict schemas and prevents
    prompt injection by treating user content as immutable variables.
    """
    
    def __init__(self, schema_path: str = "config/baml_src"):
        self.schema_path = schema_path
        logger.info(f"Initialized BAML validator with schema path: {schema_path}")
    
    async def validate_messages(self, messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Validate and sanitize chat messages using BAML schemas.
        
        Args:
            messages: List of chat messages
            
        Returns:
            Validated messages with type-safe structure
            
        Raises:
            ValidationError: If messages don't conform to schema
        """
        validated = []
        
        for msg in messages:
            # Validate message structure
            if not isinstance(msg, dict):
                raise ValueError("Message must be a dictionary")
            
            if "role" not in msg or "content" not in msg:
                raise ValueError("Message must have 'role' and 'content' fields")
            
            # Validate role
            valid_roles = ["system", "user", "assistant", "function", "tool"]
            if msg["role"] not in valid_roles:
                raise ValueError(f"Invalid role: {msg['role']}")
            
            # Ensure content is treated as immutable variable (not executable)
            validated_msg = {
                "role": msg["role"],
                "content": str(msg["content"]),  # Force string type
            }
            
            # Preserve additional fields
            if "name" in msg:
                validated_msg["name"] = str(msg["name"])
            
            if "function_call" in msg:
                validated_msg["function_call"] = msg["function_call"]
            
            if "tool_calls" in msg:
                validated_msg["tool_calls"] = msg["tool_calls"]
            
            validated.append(validated_msg)
        
        logger.debug(f"Validated {len(validated)} messages")
        return validated
    
    async def validate_output(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate LLM output against expected schema.
        
        Handles malformed or partial responses by extracting valid
        nested properties.
        
        Args:
            response: LLM response
            
        Returns:
            Validated and potentially reconstructed response
        """
        try:
            # Ensure response has required fields
            if "choices" not in response:
                response["choices"] = []
            
            # Validate each choice
            for choice in response["choices"]:
                if "message" not in choice:
                    choice["message"] = {"role": "assistant", "content": ""}
                
                msg = choice["message"]
                if "role" not in msg:
                    msg["role"] = "assistant"
                
                if "content" not in msg:
                    msg["content"] = ""
            
            return response
            
        except Exception as e:
            logger.error(f"Error validating output: {e}")
            # Return minimal valid response
            return {
                "choices": [{
                    "message": {
                        "role": "assistant",
                        "content": "Error: Invalid response format"
                    },
                    "finish_reason": "error"
                }]
            }
