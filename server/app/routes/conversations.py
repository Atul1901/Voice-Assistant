"""HTTP endpoints for creating and managing conversations."""

import json
from pathlib import Path
from typing import Literal

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from app.services import conversation_service
from app.services.ai_service import AIServiceError, generate_ai_chat_response

router = APIRouter(prefix="/conversations", tags=["conversations"])
PRODUCTS_FILE = Path(__file__).resolve().parents[1] / "data" / "products.json"


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


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)

    @field_validator("message")
    @classmethod
    def message_must_not_be_blank(cls, message: str) -> str:
        message = message.strip()
        if not message:
            raise ValueError("Message cannot be blank")
        return message


class ChatResponse(BaseModel):
    conversation: ConversationResponse
    user_message: MessageResponse
    assistant_message: MessageResponse


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


@router.post("/{conversation_id}/chat", response_model=ChatResponse)
async def chat(conversation_id: str, request: ChatRequest) -> dict:
    """Generate an assistant reply and save the completed exchange."""
    conversation = conversation_service.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    try:
        with PRODUCTS_FILE.open("r", encoding="utf-8") as file:
            products = json.load(file)
        if not isinstance(products, list):
            raise ValueError("Product data must be a JSON list")
    except (OSError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The product catalogue is temporarily unavailable.",
        ) from None

    system_instructions = (
        "You are Retail+, a friendly, concise FMCG retailer assistant. "
        "Use only the product catalogue supplied below to answer questions "
        "about products, prices, stock, pack sizes, and schemes. Never invent "
        "or guess a price, stock level, or offer. If requested information is "
        "missing or unavailable, say so clearly. Ask a concise clarifying "
        "question when the request is ambiguous or essential details are "
        "missing. When the retailer mentions product interest, requested "
        "quantities, or follow-up requirements, acknowledge and accurately "
        "summarize them; do not claim an order was placed. Be conversational "
        "and concise.\n\n"
        "Available product catalogue (prices are in rupees; stock is in the "
        "listed unit):\n"
        f"{json.dumps(products, ensure_ascii=False)}"
    )
    ollama_messages = [{"role": "system", "content": system_instructions}]
    ollama_messages.extend(
        {"role": item["role"], "content": item["content"]}
        for item in conversation["messages"]
        if item.get("role") in ("user", "assistant")
    )
    ollama_messages.append({"role": "user", "content": request.message})

    try:
        assistant_text = await generate_ai_chat_response(ollama_messages)
    except AIServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=str(error),
        ) from None

    updated_conversation = conversation_service.add_exchange(
        conversation_id=conversation_id,
        user_content=request.message,
        assistant_content=assistant_text,
    )
    if updated_conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    return {
        "conversation": updated_conversation,
        "user_message": updated_conversation["messages"][-2],
        "assistant_message": updated_conversation["messages"][-1],
    }
