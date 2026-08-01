from __future__ import annotations

import json
import re
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = "https://www.clickandboat.com/es/alquiler"
LOCATION = "pais-espana/isla-mallorca/ciudad-palma"
BASE = f"{ROOT}/{LOCATION}"
OUT = Path("tools/clickandboat-audit/filter-test-output")
OUT.mkdir(parents=True, exist_ok=True)
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
    "Accept-Language": "es-ES,es;q=0.9",
}

SEGMENTS = {
    "baseline": [],
    "price_0_200": ["precio-0-200"],
    "price_201_400": ["precio-201-400"],
    "year_2006_2010": ["construccion-2006-2010"],
    "year_2024_2026": ["construccion-2024-2026"],
    "length_0_5": ["eslora-0-5"],
    "length_12_15": ["eslora-12-15"],
    "power_0_50": ["motor-0-50"],
    "power_401_plus": ["motor-401-400"],
    "instant": ["reserva-instantanea-1"],
    "super_owner": ["super-propietario-1"],
    "best_rating": ["mejor-valorados-1"],
    "free_cancellation": ["cancelacion-gratuita-1"],
    "price_year": ["precio-0-300", "construccion-2020-2026"],
}

session = requests.Session()
session.headers.update(HEADERS)
rows = []
for name, segments in SEGMENTS.items():
    url = "/".join([ROOT, *segments, LOCATION])
    response = session.get(url, timeout=60, allow_redirects=True)
    soup = BeautifulSoup(response.text, "lxml")
    text = " ".join(soup.get_text(" ").split())
    match = re.search(r"([\d\.\s]+)\s+barcos disponibles", text, re.I)
    count = int(match.group(1).replace(".", "").replace(" ", "")) if match else None
    boat_urls = sorted({
        requests.compat.urljoin(response.url, a.get("href"))
        for a in soup.select('a[href*="/es/alquiler-barcos/"]')
    })
    form = soup.find("form", attrs={"data-controller": re.compile("search-facet-form")})
    active_segments = []
    if form:
        for element in form.find_all(attrs={"data-facet-segment": True}):
            checked = element.has_attr("checked") or bool(element.get("value"))
            if checked:
                active_segments.append(element.get("data-facet-segment"))
    row = {
        "name": name,
        "requested_url": url,
        "final_url": response.url,
        "status": response.status_code,
        "count": count,
        "boat_urls_first_page": len(boat_urls),
        "boat_url_sample": boat_urls[:5],
        "active_segments": active_segments,
        "title": soup.title.get_text(" ", strip=True) if soup.title else "",
    }
    rows.append(row)
    print(name, response.status_code, count, len(boat_urls), response.url, row["title"], flush=True)

(OUT / "filter-tests.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
