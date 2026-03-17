from __future__ import annotations

import re
import unicodedata
from typing import Optional

STATE_ALIAS_MAP = {
    "cdmx": "Ciudad de Mexico",
    "ciudad de mexico": "Ciudad de Mexico",
    "distrito federal": "Ciudad de Mexico",
    "df": "Ciudad de Mexico",
    "d f": "Ciudad de Mexico",
    "edomex": "Estado de Mexico",
    "edo mex": "Estado de Mexico",
    "estado de mexico": "Estado de Mexico",
}

CITY_ALIAS_MAP = {
    "cdmx": "Ciudad de Mexico",
    "ciudad de mexico": "Ciudad de Mexico",
    "mexico city": "Ciudad de Mexico",
    "cd de mexico": "Ciudad de Mexico",
    "distrito federal": "Ciudad de Mexico",
    "df": "Ciudad de Mexico",
    "d f": "Ciudad de Mexico",
}

CITY_TO_STATE_MAP = {
    "Ciudad de Mexico": "Ciudad de Mexico",
    "Cancun": "Quintana Roo",
    "Playa del Carmen": "Quintana Roo",
    "Chetumal": "Quintana Roo",
    "Tulum": "Quintana Roo",
}


def _clean_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    cleaned = " ".join(value.strip().split())
    return cleaned or None


def _normalize_key(value: str) -> str:
    ascii_value = unicodedata.normalize("NFD", value)
    ascii_value = "".join(ch for ch in ascii_value if unicodedata.category(ch) != "Mn")
    ascii_value = ascii_value.lower()
    ascii_value = re.sub(r"[^a-z0-9\s]", " ", ascii_value)
    return " ".join(ascii_value.split())


def normalize_mexico_state(value: Optional[str]) -> Optional[str]:
    text = _clean_text(value)
    if not text:
        return None

    key = _normalize_key(text)
    return STATE_ALIAS_MAP.get(key, text)


def normalize_mexico_city(value: Optional[str]) -> Optional[str]:
    text = _clean_text(value)
    if not text:
        return None

    key = _normalize_key(text)
    return CITY_ALIAS_MAP.get(key, text)


def infer_state_from_city(city: Optional[str]) -> Optional[str]:
    canonical_city = normalize_mexico_city(city)
    if not canonical_city:
        return None
    return CITY_TO_STATE_MAP.get(canonical_city)


def normalize_mexico_location(state: Optional[str], city: Optional[str]) -> tuple[Optional[str], Optional[str]]:
    canonical_city = normalize_mexico_city(city)
    inferred_state = infer_state_from_city(canonical_city)
    canonical_state = inferred_state or normalize_mexico_state(state)
    return canonical_state, canonical_city
