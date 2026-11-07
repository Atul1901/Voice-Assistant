"""Local Ollama-backed text generation for the retailer assistant."""

import os
from datetime import date
from pathlib import Path
from typing import Literal

import httpx
from dotenv import load_dotenv
from pydantic import BaseModel, ConfigDict, Field

# Load the server's .env file explicitly so startup works from any directory.
SERVER_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(SERVER_ENV_FILE)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")


class ExtractedRequirements(BaseModel):
    """Only the structured fields the retailer assistant is allowed to capture."""

    model_config = ConfigDict(extra="forbid")

    interested_products: list[str] = Field(default_factory=list)
    requested_quantity: float | None = Field(default=None, gt=0)
    requested_unit: str | None = None
    purchase_intent: Literal["interested", "confirmed", "not specified"] = "not specified"
    follow_up_required: bool | None = None
    follow_up_date: date | None = None
    follow_up_notes: str | None = None
    additional_requirements: list[str] = Field(default_factory=list)


class AIServiceError(Exception):
    """A safe error that the API can return without exposing configuration."""

    def __init__(self, message: str, status_code: int) -> None:
        super().__init__(message)
        self.status_code = status_code


async def generate_ai_response(message: str) -> str:
    """Send one message to Ollama's local chat API and return its reply."""
    return await generate_ai_chat_response(
        [{"role": "user", "content": message}]
    )


async def generate_ai_chat_response(
    messages: list[dict[str, str]],
    response_format: dict | None = None,
) -> str:
    """Send chat messages to Ollama and return its reply."""
    if not OLLAMA_BASE_URL or not OLLAMA_MODEL:
        raise AIServiceError(
            "The local AI service is not configured. Check its settings in server/.env.",
            status_code=503,
        )

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            request_body = {
                "model": OLLAMA_MODEL,
                "messages": messages,
                "stream": False,
                "options": {"num_predict": 160 if response_format is None else 192},
            }
            if response_format is not None:
                request_body["format"] = response_format
                request_body["options"]["temperature"] = 0

            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json=request_body,
            )
            response.raise_for_status()
            result = response.json()
    except httpx.TimeoutException:
        raise AIServiceError(
            "The local AI service took too long to respond. Please try again.",
            status_code=504,
        ) from None
    except httpx.ConnectError:
        raise AIServiceError(
            "Cannot connect to the local AI service. Check that Ollama is running.",
            status_code=503,
        ) from None
    except httpx.HTTPStatusError:
        # Ollama can include details such as a missing model in its error body.
        # Keep that body out of API responses.
        raise AIServiceError(
            "The local AI service could not process the request. Check that the configured model is available.",
            status_code=502,
        ) from None
    except httpx.RequestError:
        raise AIServiceError(
            "The local AI service is temporarily unavailable. Please try again.",
            status_code=503,
        ) from None
    except ValueError:
        raise AIServiceError(
            "The local AI service returned an invalid response. Please try again.",
            status_code=502,
        ) from None

    if (
        not isinstance(result, dict)
        or result.get("error")
        or not isinstance(result.get("message"), dict)
    ):
        raise AIServiceError(
            "The local AI service returned an unexpected response.",
            status_code=502,
        )

    generated_text = result["message"].get("content")
    if not isinstance(generated_text, str) or not generated_text.strip():
        raise AIServiceError(
            "The local AI service returned an empty response. Please try again.",
            status_code=502,
        )

    return generated_text.strip()


async def extract_requirements(
    conversation_messages: list[dict[str, str]],
    products: list[dict],
    reference_date: date,
) -> ExtractedRequirements:
    """Extract explicitly stated retailer requirements from conversation history."""
    product_names = [product.get("name", "") for product in products]
    system_prompt = (
        "Extract retailer business requirements from the conversation and return "
        "only data supported by the retailer's messages. Use assistant messages "
        "only to understand context; do not treat assistant claims as retailer "
        "requirements. Never invent a product, quantity, unit, date, purchase "
        "confirmation, or follow-up. For interested_products, return only exact "
        "canonical product names from this catalogue: "
        f"{product_names!r}. If a product is ambiguous or not in the catalogue, "
        "omit it. Capture quantity and unit only when stated or clearly established "
        "by the conversation. Set purchase_intent to 'confirmed' only when the "
        "retailer explicitly confirms an order or purchase; use 'interested' for "
        "clear interest without confirmation; otherwise use 'not specified'. "
        "Set follow_up_required to true or false only when stated, otherwise null. "
        "Resolve relative follow-up dates against this local calendar date: "
        f"{reference_date.isoformat()}. Return follow_up_date as YYYY-MM-DD, or "
        "null when no date is clearly stated. Keep follow_up_notes null unless "
        "there are follow-up details beyond the date. Put quantity and its unit "
        "in requested_quantity and requested_unit, never in "
        "additional_requirements. additional_requirements must contain only "
        "other explicit retailer requirements."
    )
    messages = [
        {"role": "system", "content": system_prompt},
        *conversation_messages,
    ]
    response_text = await generate_ai_chat_response(
        messages,
        response_format=ExtractedRequirements.model_json_schema(),
    )
    return ExtractedRequirements.model_validate_json(response_text)
