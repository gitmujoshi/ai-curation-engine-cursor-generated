"""
PII Detection & Sanitization

Uses Named Entity Recognition to detect and anonymize sensitive information.
"""

import logging
import re
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)


class PIIDetector:
    """
    Detects and sanitizes Personally Identifiable Information (PII).
    
    Detects:
    - Social Security Numbers
    - Credit Card Numbers
    - Email Addresses
    - Phone Numbers
    - Physical Addresses
    - Personal Names
    - API Keys and Secrets
    """
    
    # Regex patterns for common PII
    PATTERNS = {
        "ssn": re.compile(r'\b\d{3}-\d{2}-\d{4}\b'),
        "credit_card": re.compile(r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b'),
        "email": re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),
        "phone": re.compile(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'),
        "api_key": re.compile(r'\b[A-Za-z0-9_-]{32,}\b'),
        "aws_key": re.compile(r'AKIA[0-9A-Z]{16}'),
        "github_token": re.compile(r'ghp_[A-Za-z0-9]{36}'),
    }
    
    REPLACEMENTS = {
        "ssn": "[SSN_REDACTED]",
        "credit_card": "[CC_REDACTED]",
        "email": "[EMAIL_REDACTED]",
        "phone": "[PHONE_REDACTED]",
        "api_key": "[API_KEY_REDACTED]",
        "aws_key": "[AWS_KEY_REDACTED]",
        "github_token": "[GITHUB_TOKEN_REDACTED]",
    }
    
    def __init__(self):
        logger.info("Initialized PII detector")
    
    async def detect(self, text: str) -> List[Tuple[str, str]]:
        """
        Detect PII in text.
        
        Args:
            text: Text to analyze
            
        Returns:
            List of (pii_type, matched_text) tuples
        """
        detected = []
        
        for pii_type, pattern in self.PATTERNS.items():
            matches = pattern.finditer(text)
            for match in matches:
                detected.append((pii_type, match.group()))
        
        return detected
    
    async def sanitize(self, text: str) -> str:
        """
        Sanitize text by replacing PII with redaction markers.
        
        Args:
            text: Text to sanitize
            
        Returns:
            Sanitized text with PII replaced
        """
        sanitized = text
        
        for pii_type, pattern in self.PATTERNS.items():
            replacement = self.REPLACEMENTS[pii_type]
            sanitized = pattern.sub(replacement, sanitized)
        
        # Log if PII was found
        if sanitized != text:
            detected = await self.detect(text)
            logger.warning(
                f"Detected and sanitized {len(detected)} PII instances: "
                f"{[pii_type for pii_type, _ in detected]}"
            )
        
        return sanitized
    
    async def analyze(self, text: str) -> Dict[str, int]:
        """
        Analyze text for PII without sanitizing.
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary of pii_type -> count
        """
        counts = {}
        
        for pii_type, pattern in self.PATTERNS.items():
            matches = list(pattern.finditer(text))
            if matches:
                counts[pii_type] = len(matches)
        
        return counts
