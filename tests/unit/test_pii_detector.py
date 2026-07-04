"""
Unit tests for PII Detector
"""

import pytest
from src.guardrails.pii_detector import PIIDetector


@pytest.fixture
def detector():
    return PIIDetector()


@pytest.mark.asyncio
async def test_detect_ssn(detector):
    """Test SSN detection."""
    text = "My SSN is 123-45-6789"
    
    detected = await detector.detect(text)
    
    assert len(detected) == 1
    assert detected[0][0] == "ssn"


@pytest.mark.asyncio
async def test_detect_email(detector):
    """Test email detection."""
    text = "Contact me at test@example.com"
    
    detected = await detector.detect(text)
    
    assert len(detected) == 1
    assert detected[0][0] == "email"


@pytest.mark.asyncio
async def test_detect_credit_card(detector):
    """Test credit card detection."""
    text = "My card is 1234-5678-9012-3456"
    
    detected = await detector.detect(text)
    
    assert len(detected) == 1
    assert detected[0][0] == "credit_card"


@pytest.mark.asyncio
async def test_sanitize_multiple_pii(detector):
    """Test sanitization of multiple PII types."""
    text = "Email: test@example.com, SSN: 123-45-6789"
    
    sanitized = await detector.sanitize(text)
    
    assert "test@example.com" not in sanitized
    assert "123-45-6789" not in sanitized
    assert "[EMAIL_REDACTED]" in sanitized
    assert "[SSN_REDACTED]" in sanitized


@pytest.mark.asyncio
async def test_analyze_counts(detector):
    """Test PII analysis with counts."""
    text = "Emails: test1@example.com, test2@example.com"
    
    counts = await detector.analyze(text)
    
    assert counts["email"] == 2


@pytest.mark.asyncio
async def test_no_false_positives(detector):
    """Test that normal text doesn't trigger false positives."""
    text = "This is a normal message with no PII."
    
    detected = await detector.detect(text)
    
    assert len(detected) == 0
