from __future__ import annotations

import re

from bs4 import BeautifulSoup

import scrape_adaptive as app


def strict_parse_display_count(html: str) -> tuple[int | None, bool]:
    """Read only the exact search-result counter, never editorial boat counts."""
    text = " ".join(BeautifulSoup(html, "lxml").get_text(" ").split())
    match = re.search(
        r"(Más de|\+)?\s*([\d\.\s]+)\s+barcos disponibles",
        text,
        re.I,
    )
    if not match:
        return None, False
    value = int(match.group(2).replace(".", "").replace(" ", ""))
    prefix = (match.group(1) or "").lower()
    return value, bool(prefix) or value == 100


app.parse_display_count = strict_parse_display_count

if __name__ == "__main__":
    raise SystemExit(app.main())
