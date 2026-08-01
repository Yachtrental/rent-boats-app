from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

HOST = "https://www.clickandboat.com"
ENDPOINT = HOST + "/api/v6/search/build-facet-url"
LOCATION = "pais-espana/isla-mallorca/ciudad-palma"
OUT = Path("tools/clickandboat-audit/facet-test-output")
OUT.mkdir(parents=True, exist_ok=True)

CATEGORIES = {
    "power-boats": [
        "tipo-de-barco-lancha", "tipo-de-barco-neumatica", "tipo-de-barco-moto-de-agua",
        "tipo-de-barco-casa-flotante", "tipo-de-barco-barco-sin-licencia", "tipo-de-barco-yate-de-motor",
    ],
    "sailing-boats": [
        "tipo-de-barco-velero", "tipo-de-barco-catamaran", "tipo-de-barco-goleta", "tipo-de-barco-yate-de-vela",
    ],
}
CATEGORY_SEGMENTS = {"power-boats": "tipo-barcos-a-motor", "sailing-boats": "tipo-veleros"}

TESTS = {
    "price_0_200": [("precio-0-200", 90, "range")],
    "price_201_400": [("precio-201-400", 90, "range")],
    "year_2006_2010": [("construccion-2006-2010", 150, "range")],
    "year_2024_2025": [("construccion-2024-2025", 150, "range")],
    "length_0_5": [("eslora-0-5", 110, "range")],
    "power_0_50": [("motor-0-50", 130, "range")],
    "instant": [("reserva-instantanea-1", 170, "static")],
    "super_owner": [("super-propietario-1", 160, "static")],
    "best_rating": [("mejor-valorados-1", 140, "static")],
    "price_year": [("precio-0-300", 90, "range"), ("construccion-2020-2025", 150, "range")],
}

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 Chrome/124 Safari/537.36",
    "Accept-Language": "es-ES,es;q=0.9",
    "Content-Type": "application/json",
})

rows = []
for name, filters in TESTS.items():
    segments = [{"segment": LOCATION, "order": 40, "type": "location"}]
    segments.extend({"segment": segment, "order": order, "type": kind} for segment, order, kind in filters)
    payload = {
        "baseUrl": "/es/alquiler",
        "segments": segments,
        "boatTypeCategories": CATEGORIES,
        "boatTypeCategorySegments": CATEGORY_SEGMENTS,
        "locationWhere": None,
    }
    built = session.post(ENDPOINT, json=payload, timeout=60)
    response_json = None
    try:
        response_json = built.json()
    except Exception:
        response_json = {"raw": built.text[:1000]}
    built_path = response_json.get("url", "") if isinstance(response_json, dict) else ""
    query = response_json.get("queryParams", "") if isinstance(response_json, dict) else ""
    result_url = urljoin(HOST, built_path + query) if built_path else ""
    result_status = None
    result_count = None
    first_page_boats = 0
    title = ""
    if result_url:
        page = session.get(result_url, timeout=60)
        result_status = page.status_code
        soup = BeautifulSoup(page.text, "lxml")
        text = " ".join(soup.get_text(" ").split())
        match = re.search(r"([\d\.\s]+)\s+barcos disponibles", text, re.I)
        result_count = int(match.group(1).replace(".", "").replace(" ", "")) if match else None
        first_page_boats = len({urljoin(result_url, a.get("href")) for a in soup.select('a[href*="/es/alquiler-barcos/"]')})
        title = soup.title.get_text(" ", strip=True) if soup.title else ""
    row = {
        "name": name,
        "builder_status": built.status_code,
        "builder_response": response_json,
        "result_url": result_url,
        "result_status": result_status,
        "result_count": result_count,
        "first_page_boats": first_page_boats,
        "title": title,
    }
    rows.append(row)
    print(json.dumps(row, ensure_ascii=False), flush=True)

(OUT / "facet-tests.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
