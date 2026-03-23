"""AI service for field extraction using LiteLLM with OpenRouter."""
import os
import json
from typing import Any
from pydantic import BaseModel, Field
import litellm


class MutualNDAFields(BaseModel):
    """Structured output schema for Mutual NDA field extraction."""
    party1Name: str | None = Field(None, description="Legal name of first party")
    party1Email: str | None = Field(None, description="Email address of first party")
    party2Name: str | None = Field(None, description="Legal name of second party")
    party2Email: str | None = Field(None, description="Email address of second party")
    purpose: str | None = Field(None, description="Purpose of the NDA agreement")
    effectiveDate: str | None = Field(None, description="Effective date in YYYY-MM-DD format")
    mndaTerm: str | None = Field(None, description="MNDA term, e.g., '1 year from the Effective Date'")
    confidentialityTerm: str | None = Field(None, description="Confidentiality term, e.g., '2 years from the date of disclosure'")
    governingLaw: str | None = Field(None, description="Governing law state, e.g., 'Delaware'")
    jurisdiction: str | None = Field(None, description="Legal jurisdiction, e.g., 'San Francisco County, California'")


class FieldConfidence(BaseModel):
    """Confidence score for an extracted field."""
    value: str | None
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence score from 0 to 1")


# Configure LiteLLM with OpenRouter
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY environment variable not set")

# Disable SSL verification if specified
if os.getenv("OPENROUTER_SSL_VERIFY", "").lower() == "false":
    litellm.ssl_verify = False


SYSTEM_PROMPT = """You are an AI assistant helping users create a Mutual Non-Disclosure Agreement (NDA).

Your task is to extract the following 10 fields from the user's conversation:
1. party1Name: Legal name of the first party
2. party1Email: Email address of the first party
3. party2Name: Legal name of the second party
4. party2Email: Email address of the second party
5. purpose: Purpose of the NDA agreement
6. effectiveDate: Effective date (format: YYYY-MM-DD)
7. mndaTerm: Duration of the agreement (e.g., "1 year from the Effective Date", "2 years from the Effective Date", "3 years from the Effective Date", "5 years from the Effective Date")
8. confidentialityTerm: How long information must remain confidential (e.g., "2 years from the date of disclosure", "3 years from the date of disclosure", "5 years from the date of disclosure", "7 years from the date of disclosure")
9. governingLaw: Governing law state (e.g., "Delaware", "California", "New York", "Texas", "Florida", "Illinois", "Washington", "Massachusetts")
10. jurisdiction: Legal jurisdiction (e.g., "San Francisco County, California")

Extract as many fields as possible from the conversation. If a field is not mentioned, leave it as null.
For dates, always use YYYY-MM-DD format. Convert relative dates like "tomorrow" or "next Monday" to actual dates.
For terms, use the exact format shown in the examples above.
"""


def extract_fields_from_conversation(messages: list[dict[str, str]]) -> tuple[dict[str, Any], dict[str, float]]:
    """
    Extract NDA fields from conversation history using LiteLLM with structured outputs.

    Args:
        messages: List of conversation messages with 'role' and 'content'

    Returns:
        Tuple of (extracted_fields, confidence_scores)
    """
    try:
        # Build messages for LiteLLM
        llm_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        llm_messages.extend(messages)

        # Call LiteLLM with structured output (response_format)
        response = litellm.completion(
            model="openrouter/openai/gpt-oss-120b",
            messages=llm_messages,
            api_key=OPENROUTER_API_KEY,
            response_format=MutualNDAFields,
            timeout=30.0,
        )

        # Extract the structured output
        content = response.choices[0].message.content

        # Parse JSON response into MutualNDAFields
        if isinstance(content, str):
            fields_data = json.loads(content)
        else:
            fields_data = content

        fields = MutualNDAFields(**fields_data)

        # Convert to dict, filtering out None values
        extracted_fields = {k: v for k, v in fields.model_dump().items() if v is not None}

        # Calculate confidence scores
        # For now, use simple heuristics:
        # - If field is extracted, confidence is high (0.9)
        # - Missing fields have 0.0 confidence
        # In production, you'd want the model to return confidence scores
        confidence_scores = {}
        for field_name in MutualNDAFields.model_fields.keys():
            if field_name in extracted_fields and extracted_fields[field_name]:
                # Check if value looks uncertain (e.g., contains "?", "maybe", "possibly")
                value = str(extracted_fields[field_name]).lower()
                if any(word in value for word in ["?", "maybe", "possibly", "not sure", "unclear"]):
                    confidence_scores[field_name] = 0.6
                else:
                    confidence_scores[field_name] = 0.9
            else:
                confidence_scores[field_name] = 0.0

        return extracted_fields, confidence_scores

    except Exception as e:
        # Log error and return empty results
        print(f"Error in extract_fields_from_conversation: {e}")
        return {}, {}


def generate_followup_message(
    extracted_fields: dict[str, Any],
    confidence_scores: dict[str, float],
    all_field_names: list[str]
) -> str:
    """
    Generate appropriate followup message based on extraction results.

    Args:
        extracted_fields: Currently extracted fields
        confidence_scores: Confidence score per field
        all_field_names: All required field names

    Returns:
        Followup message string
    """
    # Check for uncertain fields (confidence < 0.8 and value exists)
    uncertain_fields = [
        (name, extracted_fields.get(name))
        for name, score in confidence_scores.items()
        if 0.0 < score < 0.8 and name in extracted_fields
    ]

    if uncertain_fields:
        field_name, field_value = uncertain_fields[0]
        readable_name = field_name.replace("party1", "Party 1 ").replace("party2", "Party 2 ")
        return f"Just to confirm, is '{field_value}' correct for {readable_name}?"

    # Check for missing fields
    missing_fields = [name for name in all_field_names if name not in extracted_fields or not extracted_fields.get(name)]

    if missing_fields:
        field_name = missing_fields[0]
        readable_name = field_name.replace("party1", "Party 1 ").replace("party2", "Party 2 ")

        # Provide helpful prompts for specific fields
        if "Email" in field_name:
            return f"What is the email address for {readable_name.replace('Email', '')}?"
        elif field_name == "effectiveDate":
            return "What is the effective date for this agreement? (e.g., 2026-03-25)"
        elif field_name == "mndaTerm":
            return "How long should this agreement last? (e.g., 1 year, 2 years, 3 years, or 5 years from the Effective Date)"
        elif field_name == "confidentialityTerm":
            return "How long should the confidential information remain protected? (e.g., 2 years, 3 years, 5 years, or 7 years from the date of disclosure)"
        elif field_name == "governingLaw":
            return "Which state's law should govern this agreement? (e.g., Delaware, California, New York)"
        elif field_name == "jurisdiction":
            return "Where should legal disputes be resolved? (e.g., San Francisco County, California)"
        else:
            return f"What is the {readable_name}?"

    # All fields complete
    return "Great! I've extracted all the information needed for your Mutual NDA. Please review the preview and download your document when ready."


def get_greeting() -> str:
    """
    Generate a dynamic greeting for the chat interface.

    Returns:
        Greeting message string
    """
    import random
    from datetime import datetime

    greetings = [
        "Hi! I'm here to help you create a Mutual NDA. Tell me about the two parties and the purpose of your agreement.",
        "Hello! Let's draft your Mutual NDA together. Who are the parties involved and what's the purpose?",
        "Welcome! I'll help you generate a professional Mutual NDA. Please describe the agreement you need.",
    ]

    # Add time-based variation
    hour = datetime.now().hour
    if hour < 12:
        time_greeting = "Good morning! "
    elif hour < 18:
        time_greeting = "Good afternoon! "
    else:
        time_greeting = "Good evening! "

    base_greeting = random.choice(greetings)
    return time_greeting + base_greeting
