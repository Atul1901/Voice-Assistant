"""Local Ollama-backed text generation for the retailer assistant."""

import os
from pathlib import Path

import httpx
from dotenv import load_dotenv

# Load the server's .env file explicitly so startup works from any directory.
SERVER_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(SERVER_ENV_FILE)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")


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


async def generate_ai_chat_response(messages: list[dict[str, str]]) -> str:
    """Send a system prompt and chat history to Ollama and return its reply."""
    if not OLLAMA_BASE_URL or not OLLAMA_MODEL:
        raise AIServiceError(
            "The local AI service is not configured. Check its settings in server/.env.",
            status_code=503,
        )

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "messages": messages,
                    "stream": False,
                    "options": {"num_predict": 160},
                },
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
