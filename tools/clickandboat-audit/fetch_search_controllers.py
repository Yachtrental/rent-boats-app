from __future__ import annotations

from pathlib import Path
import requests

OUT = Path("tools/clickandboat-audit/controller-output")
OUT.mkdir(parents=True, exist_ok=True)
BASE = "https://assets.clickandboat.com/frontend-assets/master/sf-assets/controllers/"
FILES = [
    "search-url-builder-Y7Degwp.js",
    "search-facet-form_controller-3HvQhIb.js",
    "search-filters-state_controller-FYzYCmp.js",
    "search-filter-checkbox_controller-K72tHbI.js",
    "search-filter-sailing-type-checkboxes_controller-IlujbJh.js",
    "search-filter-boat-type-checkbox-aggregator_controller-vrcbvQY.js",
    "search-filter-boat-type-button-aggregator_controller-UJzcogS.js",
    "search-autosubmit_controller-19lZgGv.js",
    "search-result-counter_controller-3uTC9sC.js",
]

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 Chrome/124 Safari/537.36",
    "Accept-Language": "es-ES,es;q=0.9",
})

for name in FILES:
    url = BASE + name
    response = session.get(url, timeout=60)
    print(name, response.status_code, len(response.content), flush=True)
    response.raise_for_status()
    (OUT / name).write_bytes(response.content)
