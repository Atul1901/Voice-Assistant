"""Read and write conversations in the local JSON data file."""

import json
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4


DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "conversations.json"


def _read_conversations() -> list[dict]:
    """Load all conversations from disk."""
    with DATA_FILE.open("r", encoding="utf-8") as file:
        conversations = json.load(file)

    if not isinstance(conversations, list):
        raise ValueError("Conversation data must be a JSON list")

    return conversations


def _write_conversations(conversations: list[dict]) -> None:
    """Write to a temporary file first so readers do not see partial JSON."""
    temporary_file = DATA_FILE.with_suffix(".tmp")
    with temporary_file.open("w", encoding="utf-8") as file:
        json.dump(conversations, file, ensure_ascii=False, indent=2)
        file.write("\n")

    temporary_file.replace(DATA_FILE)


def list_conversations() -> list[dict]:
    """Return all conversations, newest activity first."""
    conversations = _read_conversations()
    return sorted(
        conversations,
        key=lambda conversation: conversation["updated_at"],
        reverse=True,
    )


def create_conversation() -> dict:
    """Create and persist an empty conversation."""
    conversations = _read_conversations()
    now = datetime.now(timezone.utc).isoformat()
    conversation = {
        "id": str(uuid4()),
        "title": "New conversation",
        "created_at": now,
        "updated_at": now,
        "messages": [],
    }
    conversations.append(conversation)
    _write_conversations(conversations)
    return conversation


def get_conversation(conversation_id: str) -> dict | None:
    """Find one conversation by ID, or return None when it does not exist."""
    return next(
        (
            conversation
            for conversation in _read_conversations()
            if conversation["id"] == conversation_id
        ),
        None,
    )


def add_message(
    conversation_id: str,
    role: str,
    content: str,
) -> dict | None:
    """Append a message and update the conversation's activity timestamp."""
    conversations = _read_conversations()
    conversation = next(
        (
            item
            for item in conversations
            if item["id"] == conversation_id
        ),
        None,
    )
    if conversation is None:
        return None

    now = datetime.now(timezone.utc).isoformat()
    conversation["messages"].append(
        {
            "id": str(uuid4()),
            "role": role,
            "content": content,
            "timestamp": now,
        }
    )
    conversation["updated_at"] = now

    if role == "user" and conversation["title"] == "New conversation":
        title = " ".join(content.split())
        conversation["title"] = title[:60] + ("..." if len(title) > 60 else "")

    _write_conversations(conversations)
    return conversation


def add_exchange(
    conversation_id: str,
    user_content: str,
    assistant_content: str,
) -> dict | None:
    """Save a user message and its assistant reply in one JSON write."""
    conversations = _read_conversations()
    conversation = next(
        (item for item in conversations if item["id"] == conversation_id),
        None,
    )
    if conversation is None:
        return None

    now = datetime.now(timezone.utc).isoformat()
    user_message = {
        "id": str(uuid4()),
        "role": "user",
        "content": user_content,
        "timestamp": now,
    }
    assistant_message = {
        "id": str(uuid4()),
        "role": "assistant",
        "content": assistant_content,
        "timestamp": now,
    }
    conversation["messages"].extend([user_message, assistant_message])
    conversation["updated_at"] = now

    if conversation["title"] == "New conversation":
        title = " ".join(user_content.split())
        conversation["title"] = title[:60] + ("..." if len(title) > 60 else "")

    _write_conversations(conversations)
    return conversation
