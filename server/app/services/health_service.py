"""Health status logic, separate from HTTP handling."""


def get_health_status() -> dict[str, str]:
    return {"status": "healthy", "service": "retailer-ai-assistant-api"}
