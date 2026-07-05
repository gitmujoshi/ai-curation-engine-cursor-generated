"""
Unit tests for BAML Validator
"""

import pytest
from src.baml_engine.validator import BAMLValidator


@pytest.fixture
def validator():
    return BAMLValidator()


@pytest.mark.asyncio
async def test_validate_messages_valid(validator):
    """Test validation of valid messages."""
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"},
        {"role": "assistant", "content": "Hi there!"}
    ]
    
    result = await validator.validate_messages(messages)
    
    assert len(result) == 3
    assert result[0]["role"] == "system"
    assert result[1]["role"] == "user"
    assert result[2]["role"] == "assistant"


@pytest.mark.asyncio
async def test_validate_messages_invalid_role(validator):
    """Test validation fails for invalid role."""
    messages = [
        {"role": "invalid_role", "content": "Test"}
    ]
    
    with pytest.raises(ValueError, match="Invalid role"):
        await validator.validate_messages(messages)


@pytest.mark.asyncio
async def test_validate_messages_missing_content(validator):
    """Test validation fails for missing content."""
    messages = [
        {"role": "user"}
    ]
    
    with pytest.raises(ValueError, match="must have 'role' and 'content'"):
        await validator.validate_messages(messages)


@pytest.mark.asyncio
async def test_validate_output_valid(validator):
    """Test output validation with valid response."""
    response = {
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": "Test response"
                },
                "finish_reason": "stop"
            }
        ]
    }
    
    result = await validator.validate_output(response)
    
    assert "choices" in result
    assert len(result["choices"]) == 1
    assert result["choices"][0]["message"]["role"] == "assistant"


@pytest.mark.asyncio
async def test_validate_output_malformed(validator):
    """Test output validation handles malformed responses."""
    response = {}
    
    result = await validator.validate_output(response)
    
    # Should add default structure
    assert "choices" in result
    assert len(result["choices"]) >= 0
