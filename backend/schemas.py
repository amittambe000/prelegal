"""Pydantic schemas for request/response validation."""
from datetime import datetime
from typing import Any
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """User signup request."""
    email: EmailStr
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    """User signin request."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User response."""
    id: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentCreate(BaseModel):
    """Document creation request."""
    title: str = Field(min_length=1, max_length=255)
    form_data: dict[str, Any]


class DocumentUpdate(BaseModel):
    """Document update request."""
    title: str | None = Field(None, min_length=1, max_length=255)
    form_data: dict[str, Any] | None = None


class DocumentResponse(BaseModel):
    """Document response."""
    id: str
    document_type: str
    title: str
    form_data: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str


class ChatMessage(BaseModel):
    """Chat message."""
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    """Chat message request."""
    message: str
    conversation_history: list[ChatMessage] = []


class FieldConfidence(BaseModel):
    """Field value with confidence score."""
    value: str | None
    confidence: float


class ChatResponse(BaseModel):
    """Chat message response with extracted fields."""
    message: str
    extracted_fields: dict[str, FieldConfidence]
    is_complete: bool


class GreetingResponse(BaseModel):
    """Greeting response."""
    greeting: str
