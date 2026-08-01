from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

URL = "https://www.clickandboat.com/es/alquiler/pais-espana/isla-mallorca/ciudad-palma"
OUT = Path("tools/clickandboat-audit/probe-output")
OUT.mkdir(parents=True, exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.7",
}

session = requests.Session()
session.headers.update(headers)
response = session.get(URL, timeout=60)
response.raise_for_status()
html = response.text
(OUT / "page.html").write_text(html, encoding="utf-8")
soup = BeautifulSoup(html, "lxml")

scripts = []
for index, tag in enumerate(soup.find_all("script")):
    item = {
        "index": index,
        "src": urljoin(URL, tag.get("src", "")) if tag.get("src") else "",
        "type": tag.get("type", ""),
        "id": tag.get("id", ""),
        "length": len(tag.string or tag.get_text() or ""),
    }
    scripts.append(item)
    if not item["src"] and item["length"]:
        (OUT / f"inline-{index}.txt").write_text(tag.string or tag.get_text(), encoding="utf-8")

links = []
for a in soup.find_all("a", href=True):
    href = urljoin(URL, a["href"])
    text = " ".join(a.get_text(" ", strip=True).split())
    if any(token in href.lower() for token in ["tipo-de-", "page=", "sort", "price", "fecha", "date", "filter"]):
        links.append({"text": text, "href": href})

forms = []
for form in soup.find_all("form"):
    inputs = []
    for control in form.find_all(["input", "select", "button"]):
        inputs.append({
            "tag": control.name,
            "name": control.get("name", ""),
            "type": control.get("type", ""),
            "value": control.get("value", ""),
            "id": control.get("id", ""),
        })
    forms.append({
        "action": urljoin(URL, form.get("action", "")),
        "method": form.get("method", "get"),
        "inputs": inputs,
    })

patterns = {
    "absolute_urls": r'https?://[^"\'<>\\\s]+',
    "api_paths": r'["\']((?:/|https?://)[^"\']*(?:api|graphql|search|boats|listings|algolia|elastic)[^"\']*)["\']',
    "json_keys": r'["\']([A-Za-z0-9_]*(?:api|search|boat|listing|result|filter|pagination|page)[A-Za-z0-9_]*)["\']\s*:',
}
regex_hits = {}
for name, pattern in patterns.items():
    values = re.findall(pattern, html, re.I)
    flattened = []
    for value in values:
        if isinstance(value, tuple):
            value = next((part for part in value if part), "")
        value = str(value).replace("\\/", "/")
        if value and value not in flattened:
            flattened.append(value)
    regex_hits[name] = flattened[:3000]

# Download first-party JS bundles and scan them for network/search clues.
bundle_report = []
for script in scripts:
    src = script["src"]
    if not src or "clickandboat" not in src:
        continue
    try:
        js = session.get(src, timeout=60)
        js.raise_for_status()
        content = js.text
        filename = f"bundle-{script['index']}.js"
        (OUT / filename).write_text(content, encoding="utf-8")
        candidates = []
        for pattern in [
            r'https?://[^"\'`\\\s]+',
            r'["\'`](/[^"\'`]*(?:api|graphql|search|boat|listing|availability|filter)[^"\'`]*)["\'`]',
            r'["\'`]([A-Za-z0-9_./:-]*(?:algolia|meilisearch|elasticsearch|apollo|graphql)[A-Za-z0-9_./:-]*)["\'`]',
        ]:
            for value in re.findall(pattern, content, re.I):
                if isinstance(value, tuple):
                    value = next((part for part in value if part), "")
                value = str(value).replace("\\/", "/")
                if value and value not in candidates:
                    candidates.append(value)
        bundle_report.append({
            "src": src,
            "status": js.status_code,
            "bytes": len(content),
            "candidates": candidates[:1000],
        })
    except Exception as exc:
        bundle_report.append({"src": src, "error": str(exc), "candidates": []})

report = {
    "url": URL,
    "status": response.status_code,
    "html_bytes": len(html),
    "scripts": scripts,
    "links": links,
    "forms": forms,
    "regex_hits": regex_hits,
    "bundles": bundle_report,
}
(OUT / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

summary_lines = [
    f"HTML bytes: {len(html)}",
    f"Scripts: {len(scripts)}",
    f"Filtered links: {len(links)}",
    f"Forms: {len(forms)}",
    f"Bundles scanned: {len(bundle_report)}",
]
for bundle in bundle_report:
    summary_lines.append(f"{bundle.get('src')} -> {len(bundle.get('candidates', []))} candidates")
(OUT / "summary.txt").write_text("\n".join(summary_lines), encoding="utf-8")
print("\n".join(summary_lines))
