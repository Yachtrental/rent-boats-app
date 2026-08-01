from __future__ import annotations

import re
from urllib.parse import urlsplit

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


def strict_is_boat_url(url: str) -> bool:
    """Accept listing detail URLs, not destination landing pages sharing the same prefix."""
    try:
        parts = urlsplit(url)
        prefix = "/es/alquiler-barcos/"
        if not parts.netloc.endswith("clickandboat.com") or not parts.path.startswith(prefix):
            return False
        tail = [segment for segment in parts.path[len(prefix):].split("/") if segment]
        if len(tail) < 3:
            return False
        return bool(re.search(r"-[a-z0-9]{5,}$", tail[-1], re.I))
    except Exception:
        return False


app.parse_display_count = strict_parse_display_count
app.core.is_boat_url = strict_is_boat_url

if __name__ == "__main__":
    raise SystemExit(app.main())
