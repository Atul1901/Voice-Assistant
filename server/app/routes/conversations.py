"""HTTP endpoints for creating and managing conversations."""

from typing import Literal

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from app.services import conversation_service

router = APIRouter(prefix="/conversations", tags=["conversations"])


class MessageCreate(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1)

    @field_validator("content")
    @classmethod
    def content_must_not_be_blank(cls, content: str) -> str:
        content = content.strip()
        if not content:
            raise ValueError("Message content cannot be blank")
        return content


class MessageResponse(BaseModel):
    id: str
    role: Literal["user", "assistant"]
    content: str
    timestamp: str


class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str
    messages: list[MessageResponse]


@router.get("", response_model=list[ConversationResponse])
def list_conversations() -> list[dict]:
    return conversation_service.list_conversations()


@router.post(
    "",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_conversation() -> dict:
    return conversation_service.create_conversation()


@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: str) -> dict:
    conversation = conversation_service.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
    return conversation


@router.post(
    "/{conversation_id}/messages",
    response_model=ConversationResponse,
)
def add_message(conversation_id: str, message: MessageCreate) -> dict:
    conversation = conversation_service.add_message(
        conversation_id=conversation_id,
        role=message.role,
        content=message.content,
    )
    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
    return conversation
