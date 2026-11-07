"""Resolve and merge structured retailer requirements."""

import re
from datetime import date, timedelta


_COMMON_UNITS = {
    "packet", "packets", "pack", "packs", "bar", "bars", "piece", "pieces",
    "unit", "units", "case", "cases", "carton", "cartons", "box", "boxes",
    "bottle", "bottles", "kg", "kgs", "g", "gram", "grams", "ml", "litre",
    "litres", "liter", "liters", "dozen",
}
_INTEREST_PATTERN = re.compile(
    r"\b(need|needs|want|wants|interested|looking for|buy|buying|purchase|"
    r"order|ordering|reorder|price|how much|offer|stock|availability)\b",
    re.IGNORECASE,
)
_CONFIRMATION_PATTERN = re.compile(
    r"\b(i confirm|confirm(?:ed)? (?:the|my)? order|place (?:the|my|an) order|"
    r"go ahead (?:with (?:the )?order|and order)|please place (?:the|my) order)\b",
    re.IGNORECASE,
)
_NO_INTEREST_PATTERN = re.compile(
    r"\b(not interested|no interest|don't (?:need|want|want to buy)|"
    r"do not (?:need|want|want to buy))\b",
    re.IGNORECASE,
)
_NO_CONFIRMATION_PATTERN = re.compile(
    r"\b(don't|do not|didn't|haven't|have not|not)\s+(?:yet\s+)?"
    r"(?:confirm|confirmed|place|placed)\b",
    re.IGNORECASE,
)
_FOLLOW_UP_PATTERN = re.compile(
    r"\b(follow[ -]?up|call me|contact me|remind me|check back|reach out)\b",
    re.IGNORECASE,
)
_NO_FOLLOW_UP_PATTERN = re.compile(
    r"\b(no need to follow[ -]?up|don't follow[ -]?up|do not follow[ -]?up|"
    r"no follow[ -]?up required)\b",
    re.IGNORECASE,
)
_FOLLOW_UP_DATE_PATTERN = re.compile(
    r"\b(today|tomorrow|day after tomorrow|next week|next month|"
    r"monday|tuesday|wednesday|thursday|friday|saturday|sunday|"
    r"\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\b",
    re.IGNORECASE,
)


def _normalize_product_name(name: str) -> str:
    """Compare product labels while ignoring spaces and punctuation."""
    return "".join(character for character in name.casefold() if character.isalnum())


def resolve_products(
    extracted_names: list[str],
    catalogue: list[dict],
) -> list[dict[str, str]]:
    """Map extracted canonical names to product IDs from the catalogue."""
    products_by_name = {
        _normalize_product_name(product["name"]): product
        for product in catalogue
        if isinstance(product.get("name"), str) and product.get("id")
    }

    resolved: list[dict[str, str]] = []
    seen_ids: set[str] = set()
    for extracted_name in extracted_names:
        product = products_by_name.get(_normalize_product_name(extracted_name))
        if product is None or product["id"] in seen_ids:
            continue

        resolved.append(
            {
                "product_name": product["name"],
                "product_id": product["id"],
            }
        )
        seen_ids.add(product["id"])

    return resolved


def _explicitly_mentioned_products(
    messages: list[dict[str, str]],
    catalogue: list[dict],
) -> list[str]:
    """Return catalogue product names explicitly mentioned by the retailer."""
    retailer_messages = [message for message in messages if message.get("role") == "user"]
    mentioned = []
    for product in catalogue:
        name = product.get("name", "")
        brand = product.get("brand", "")
        aliases = [alias for alias in (name, brand) if isinstance(alias, str) and alias]
        for message in retailer_messages:
            content = message.get("content", "")
            for alias in aliases:
                words = re.findall(r"[a-z0-9]+", alias, re.IGNORECASE)
                alias_pattern = r"[\W_]+".join(re.escape(word) for word in words)
                if not re.search(rf"\b{alias_pattern}\b", content, re.IGNORECASE):
                    continue
                rejected_pattern = (
                    rf"\b(?:not interested in|don't want|do not want|don't need|"
                    rf"do not need|not buying|not ordering)\s+(?:to buy\s+)?"
                    rf"(?:the\s+)?{alias_pattern}\b"
                )
                if re.search(rejected_pattern, content, re.IGNORECASE):
                    continue
                mentioned.append(name)
                break
            if name in mentioned:
                break
    return mentioned


def _explicit_quantity(
    messages: list[dict[str, str]],
    catalogue: list[dict],
) -> dict | None:
    """Capture a numeric quantity and unit only when both occur in retailer text."""
    retailer_text = " ".join(
        message.get("content", "")
        for message in messages
        if message.get("role") == "user"
    )
    units = set(_COMMON_UNITS)
    for product in catalogue:
        unit = product.get("unit")
        if isinstance(unit, str) and unit.strip():
            normalized_unit = unit.strip().casefold()
            units.add(normalized_unit)
            if not normalized_unit.endswith("s"):
                units.add(normalized_unit + "s")
    unit_pattern = "|".join(
        re.escape(unit) for unit in sorted(units, key=len, reverse=True)
    )
    quantity_pattern = re.compile(
        rf"\b(?P<quantity>\d+(?:\.\d+)?)\s*(?P<unit>{unit_pattern})\b",
        re.IGNORECASE,
    )
    matches = list(quantity_pattern.finditer(retailer_text))
    if not matches:
        return None
    match = matches[-1]
    quantity = float(match.group("quantity"))
    if quantity.is_integer():
        quantity = int(quantity)
    return {"quantity": quantity, "unit": match.group("unit")}


def _ground_extraction(
    extracted: dict,
    messages: list[dict[str, str]],
    catalogue: list[dict],
    reference_date: date,
) -> dict:
    """Keep model-extracted values only when they are grounded in retailer text."""
    retailer_messages = [message for message in messages if message.get("role") == "user"]
    retailer_text = " ".join(message.get("content", "") for message in retailer_messages)
    grounded = dict(extracted)

    # Product IDs and names always come from the catalogue and retailer's text.
    grounded["interested_products"] = _explicitly_mentioned_products(messages, catalogue)

    quantity = _explicit_quantity(messages, catalogue)
    grounded["requested_quantity"] = quantity["quantity"] if quantity else None
    grounded["requested_unit"] = quantity["unit"] if quantity else None

    if _NO_CONFIRMATION_PATTERN.search(retailer_text):
        grounded["purchase_intent"] = (
            "interested" if _INTEREST_PATTERN.search(retailer_text) else "not specified"
        )
    elif _CONFIRMATION_PATTERN.search(retailer_text):
        grounded["purchase_intent"] = "confirmed"
    elif _NO_INTEREST_PATTERN.search(retailer_text):
        grounded["purchase_intent"] = "not specified"
    elif _INTEREST_PATTERN.search(retailer_text):
        grounded["purchase_intent"] = "interested"
    else:
        grounded["purchase_intent"] = "not specified"

    if _NO_FOLLOW_UP_PATTERN.search(retailer_text):
        grounded["follow_up_required"] = False
        grounded["follow_up_date"] = None
        grounded["follow_up_notes"] = None
    elif _FOLLOW_UP_PATTERN.search(retailer_text):
        grounded["follow_up_required"] = True
        date_text = retailer_text.casefold()
        if "day after tomorrow" in date_text:
            grounded["follow_up_date"] = (reference_date + timedelta(days=2)).isoformat()
        elif "tomorrow" in date_text:
            grounded["follow_up_date"] = (reference_date + timedelta(days=1)).isoformat()
        elif re.search(r"\btoday\b", date_text):
            grounded["follow_up_date"] = reference_date.isoformat()
        elif not _FOLLOW_UP_DATE_PATTERN.search(retailer_text):
            grounded["follow_up_date"] = None
    else:
        grounded["follow_up_required"] = None
        grounded["follow_up_date"] = None
        grounded["follow_up_notes"] = None

    grounded["additional_requirements"] = [
        item
        for item in grounded.get("additional_requirements", [])
        if isinstance(item, str)
        and not re.match(r"^requested_(quantity|unit)\s*:", item.strip(), re.IGNORECASE)
    ]
    return grounded


def merge_requirements(
    existing: dict,
    extracted: dict,
    catalogue: list[dict],
    conversation_messages: list[dict[str, str]],
    reference_date: date | None = None,
) -> dict:
    """Add newly extracted details without clearing previously known details."""
    merged = {
        "interested_products": list(existing.get("interested_products", [])),
        "requested_quantity": existing.get("requested_quantity"),
        "purchase_intent": existing.get("purchase_intent", "not specified"),
        "follow_up_required": existing.get("follow_up_required", False),
        "follow_up_date": existing.get("follow_up_date"),
        "follow_up_notes": existing.get("follow_up_notes"),
        "additional_requirements": list(existing.get("additional_requirements", [])),
    }

    known_product_ids = {
        item.get("product_id")
        for item in merged["interested_products"]
        if isinstance(item, dict)
    }
    explicitly_mentioned = _explicitly_mentioned_products(conversation_messages, catalogue)
    model_products = extracted.get("interested_products", [])
    valid_names = {
        _normalize_product_name(name)
        for name in explicitly_mentioned
    }
    grounded_names = [
        name for name in model_products
        if _normalize_product_name(name) in valid_names
    ]
    grounded_names.extend(explicitly_mentioned)
    newly_resolved = resolve_products(grounded_names, catalogue)

    extracted = _ground_extraction(
        extracted,
        conversation_messages,
        catalogue,
        reference_date or date.today(),
    )
    merged["interested_products"].extend(
        item for item in newly_resolved if item["product_id"] not in known_product_ids
    )

    quantity = extracted.get("requested_quantity")
    unit = extracted.get("requested_unit")
    if isinstance(quantity, (int, float)) and quantity > 0 and isinstance(unit, str) and unit.strip():
        if isinstance(quantity, float) and quantity.is_integer():
            quantity = int(quantity)
        merged["requested_quantity"] = {
            "quantity": quantity,
            "unit": unit.strip(),
        }

    new_intent = extracted.get("purchase_intent", "not specified")
    if new_intent == "confirmed" or (
        new_intent == "interested" and merged["purchase_intent"] != "confirmed"
    ):
        merged["purchase_intent"] = new_intent

    follow_up_required = extracted.get("follow_up_required")
    if isinstance(follow_up_required, bool):
        merged["follow_up_required"] = follow_up_required
        if not follow_up_required:
            merged["follow_up_date"] = None
            merged["follow_up_notes"] = None

    if extracted.get("follow_up_date"):
        merged["follow_up_date"] = extracted["follow_up_date"]
        merged["follow_up_required"] = True
    if extracted.get("follow_up_notes"):
        merged["follow_up_notes"] = extracted["follow_up_notes"].strip()

    known_requirements = {
        requirement.casefold()
        for requirement in merged["additional_requirements"]
        if isinstance(requirement, str)
    }
    for requirement in extracted.get("additional_requirements", []):
        if not isinstance(requirement, str):
            continue
        requirement = re.sub(r"\s+", " ", requirement).strip()
        if requirement and requirement.casefold() not in known_requirements:
            merged["additional_requirements"].append(requirement)
            known_requirements.add(requirement.casefold())

    return merged
