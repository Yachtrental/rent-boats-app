from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urlencode

import requests
from bs4 import BeautifulSoup

BASE = "https://www.clickandboat.com/es/alquiler/pais-espana/isla-mallorca/ciudad-palma"
OUT = Path("tools/clickandboat-audit/filter-test-output")
OUT.mkdir(parents=True, exist_ok=True)
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
    "Accept-Language": "es-ES,es;q=0.9",
}
TESTS = {
    "baseline": {},
    "price_0_200": {"priceFrom": 0, "priceTo": 200},
    "price_201_400": {"priceFrom": 201, "priceTo": 400},
    "year_2006_2010": {"minBuildYear": 2006, "maxBuildYear": 2010},
    "year_2024_2026": {"minBuildYear": 2024, "maxBuildYear": 2026},
    "length_0_5": {"lengthFrom": 0, "lengthTo": 5},
    "length_12_15": {"lengthFrom": 12, "lengthTo": 15},
    "power_0_50": {"enginePowerFrom": 0, "enginePowerTo": 50},
    "power_401_plus": {"enginePowerFrom": 401},
    "instant": {"instantBooking": 1},
    "super_owner": {"superOwner": 1},
    "best_rating": {"bestRating": 1},
}

session = requests.Session()
session.headers.update(HEADERS)
rows = []
for name, params in TESTS.items():
    url = BASE + ("?" + urlencode(params) if params else "")
    response = session.get(url, timeout=60, allow_redirects=True)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "lxml")
    text = " ".join(soup.get_text(" ").split())
    import re
    match = re.search(r"([\d\.\s]+)\s+barcos disponibles", text, re.I)
    count = int(match.group(1).replace(".", "").replace(" ", "")) if match else None
    boat_urls = sorted({
        requests.compat.urljoin(response.url, a.get("href"))
        for a in soup.select('a[href*="/es/alquiler-barcos/"]')
    })
    selected = {}
    for field in ["priceFrom", "priceTo", "minBuildYear", "maxBuildYear", "lengthFrom", "lengthTo", "enginePowerFrom", "enginePowerTo", "instantBooking", "superOwner", "bestRating"]:
        element = soup.find(attrs={"name": field})
        if element:
            selected[field] = {
                "value": element.get("value", ""),
                "checked": element.has_attr("checked"),
            }
    rows.append({
        "name": name,
        "requested_url": url,
        "final_url": response.url,
        "status": response.status_code,
        "count": count,
        "boat_urls_first_page": len(boat_urls),
        "boat_url_sample": boat_urls[:5],
        "selected": selected,
    })
    print(name, count, len(boat_urls), response.url, selected, flush=True)

(OUT / "filter-tests.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
