"""Temporary endpoint for checking the local AI integration."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.services.ai_service import AIServiceError, generate_ai_response

router = APIRouter(prefix="/ai", tags=["ai"])


class AITestRequest(BaseModel):
    message: str = Field(min_length=1)

    @field_validator("message")
    @classmethod
    def message_must_not_be_blank(cls, message: str) -> str:
        message = message.strip()
        if not message:
            raise ValueError("Message cannot be blank")
        return message


class AITestResponse(BaseModel):
    response: str


@router.post("/test", response_model=AITestResponse)
async def test_ai(request: AITestRequest) -> AITestResponse:
    """Return a generated response for a test message."""
    try:
        result = await generate_ai_response(request.message)
    except AIServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=str(error),
        ) from None

    return AITestResponse(response=result)
