from __future__ import annotations

import csv
import hashlib
import json
import os
import random
import re
import sys
import threading
import time
import unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlsplit, urlunsplit, parse_qsl, urlencode

import requests
from bs4 import BeautifulSoup

TARGET_URL = os.getenv(
    "TARGET_URL",
    "https://www.clickandboat.com/es/alquiler/pais-espana/isla-mallorca/ciudad-palma",
)
OUTPUT = Path(os.getenv("OUTPUT_DIR", "output"))
MAX_PAGES = int(os.getenv("MAX_PAGES", "320"))
WORKERS = max(1, min(24, int(os.getenv("WORKERS", "10"))))
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "45"))
STRICT_COUNT = os.getenv("STRICT_COUNT", "1") != "0"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.7",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Cache-Control": "no-cache",
}

thread_local = threading.local()
print_lock = threading.Lock()


def log(message: str) -> None:
    with print_lock:
        print(message, flush=True)


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").replace("\xa0", " ")).strip()


def norm(value: str) -> str:
    value = unicodedata.normalize("NFD", clean(value).lower())
    value = "".join(ch for ch in value if unicodedata.category(ch) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def number(value: Any) -> float | int | None:
    if value is None or value == "":
        return None
    text = clean(value).replace(".", "").replace(",", ".")
    match = re.search(r"-?\d+(?:\.\d+)?", text)
    if not match:
        return None
    result = float(match.group(0))
    return int(result) if result.is_integer() else result


def first(text: str, pattern: str, flags: int = re.I | re.S) -> str:
    match = re.search(pattern, text, flags)
    return clean(match.group(1)) if match else ""


def session() -> requests.Session:
    if not hasattr(thread_local, "session"):
        current = requests.Session()
        current.headers.update(HEADERS)
        thread_local.session = current
    return thread_local.session


def fetch(url: str, attempts: int = 6) -> str:
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            response = session().get(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
            if response.status_code in (403, 429, 500, 502, 503, 504):
                raise RuntimeError(f"HTTP {response.status_code}")
            response.raise_for_status()
            html = response.text
            if len(html) < 3000:
                raise RuntimeError(f"respuesta demasiado corta: {len(html)} bytes")
            return html
        except Exception as exc:
            last_error = exc
            if attempt < attempts:
                delay = min(30, 1.5 ** attempt + random.random() * 2)
                time.sleep(delay)
    raise RuntimeError(f"No se pudo descargar {url}: {last_error}")


def canonical(url: str) -> str:
    parts = urlsplit(url)
    query = [(k, v) for k, v in parse_qsl(parts.query) if k not in {"utm_source", "utm_medium", "utm_campaign"}]
    return urlunsplit((parts.scheme or "https", parts.netloc, parts.path.rstrip("/"), urlencode(query), ""))


def is_boat_url(url: str) -> bool:
    try:
        parts = urlsplit(url)
        return parts.netloc.endswith("clickandboat.com") and parts.path.startswith("/es/alquiler-barcos/")
    except Exception:
        return False


def listing_page_url(page: int) -> str:
    parts = urlsplit(TARGET_URL)
    params = dict(parse_qsl(parts.query))
    if page > 1:
        params["page"] = str(page)
    else:
        params.pop("page", None)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(params), ""))


def extract_expected_count(html: str) -> int | None:
    text = clean(BeautifulSoup(html, "lxml").get_text(" "))
    value = first(text, r"([\d\.\s]+)\s+barcos disponibles")
    parsed = number(value)
    return int(parsed) if parsed is not None else None


def card_context(anchor: Any) -> str:
    node = anchor
    best = clean(anchor.get_text(" ", strip=True))
    for _ in range(7):
        node = getattr(node, "parent", None)
        if node is None:
            break
        text = clean(node.get_text(" ", strip=True))
        if len(text) > len(best) and len(text) <= 1800:
            best = text
        if "A partir de" in text and ("personas" in text or "cabinas" in text):
            return text
    return best


def extract_urls_from_scripts(html: str) -> set[str]:
    found: set[str] = set()
    patterns = [
        r'https?:\\?/\\?/www\.clickandboat\.com\\?/es\\?/alquiler-barcos\\?/[^"\'<>\\ ]+',
        r'"(/es/alquiler-barcos/[^"<>?#]+)"',
        r"'(/es/alquiler-barcos/[^'<>?#]+)'",
    ]
    for pattern in patterns:
        for raw in re.findall(pattern, html):
            value = raw.replace("\\/", "/")
            url = canonical(urljoin("https://www.clickandboat.com", value))
            if is_boat_url(url):
                found.add(url)
    return found


def parse_listing_page(html: str, page_number: int) -> list[dict[str, Any]]:
    soup = BeautifulSoup(html, "lxml")
    result: dict[str, dict[str, Any]] = {}
    for anchor in soup.select('a[href*="/es/alquiler-barcos/"]'):
        href = canonical(urljoin(TARGET_URL, anchor.get("href", "")))
        if not is_boat_url(href):
            continue
        text = card_context(anchor)
        result[href] = {
            "url": href,
            "listing_page": page_number,
            "card_text": text,
            "card_rating": number(first(text, r"\b([0-5][\.,]\d)\s*\(")),
            "card_reviews": number(first(text, r"\b[0-5][\.,]\d\s*\((\d+)\)")),
            "card_price_from_eur": number(first(text, r"A partir de\s+([\d\.\s]+)\s*€")),
            "card_people": number(first(text, r"(\d+)\s+personas?")),
            "card_hp": number(first(text, r"(\d+)\s*CV")),
            "card_length_m": number(first(text, r"(\d+(?:[\.,]\d+)?)\s*m\b")),
            "card_year": number(first(text, r"\(((?:19|20)\d{2})\)")),
            "card_super_owner": "Súper propietario" in text,
            "card_instant_booking": "Reserva instantánea" in text,
        }
    for href in extract_urls_from_scripts(html):
        result.setdefault(href, {
            "url": href,
            "listing_page": page_number,
            "card_text": "",
            "card_rating": None,
            "card_reviews": None,
            "card_price_from_eur": None,
            "card_people": None,
            "card_hp": None,
            "card_length_m": None,
            "card_year": None,
            "card_super_owner": False,
            "card_instant_booking": False,
        })
    return list(result.values())


def discover_listings() -> tuple[list[dict[str, Any]], int | None, int]:
    all_rows: dict[str, dict[str, Any]] = {}
    expected: int | None = None
    no_new = 0
    processed = 0

    for page in range(1, MAX_PAGES + 1):
        url = listing_page_url(page)
        html = fetch(url)
        if expected is None:
            expected = extract_expected_count(html)
            log(f"Contador detectado: {expected}")
        rows = parse_listing_page(html, page)
        before = len(all_rows)
        for row in rows:
            all_rows[row["url"]] = row
        added = len(all_rows) - before
        processed = page
        no_new = no_new + 1 if added == 0 else 0
        log(f"[Listado {page}] +{added} | únicas {len(all_rows)} / {expected or '?'}")

        if expected and len(all_rows) >= expected:
            break
        if no_new >= 8:
            break
        time.sleep(0.35 + random.random() * 0.45)

    return sorted(all_rows.values(), key=lambda row: (row["listing_page"], row["url"])), expected, processed


def profile_identity(text: str, owner: str) -> tuple[str, str, Any, Any, str, str, str]:
    block = first(text, rf"Propuesto por\s+{re.escape(owner)}(.+?)(?:Localización|Condiciones|Contacto|$)") if owner else ""
    joined = first(block, r"Se unió en\s+(.+?)(?:·|Propietario)")
    owner_rating = number(first(block, r"\b([0-5][\.,]\d)\b"))
    owner_reviews = number(first(block, r"\((\d+)\s+opiniones?\)"))
    languages = first(block, r"Idioma\(s\) hablado\(s\):\s*(.+?)\s+Tiempo de respuesta")
    response_time = first(block, r"Tiempo de respuesta:\s*(.+?)\s+Tasa de respuesta")
    response_rate = first(block, r"Tasa de respuesta:\s*(.+?)(?:Contactar|Localización|$)")
    owner_id = first(text, r'"owner"\s*:\s*\{[^{}]{0,600}?"id"\s*:\s*"?(\d+)"?')
    if not owner_id:
        owner_id = first(text, r'"ownerId"\s*:\s*"?(\d+)"?')
    return owner_id, joined, owner_rating, owner_reviews, languages, response_time, response_rate


def parse_detail(base: dict[str, Any]) -> dict[str, Any]:
    html = fetch(base["url"])
    soup = BeautifulSoup(html, "lxml")
    text = clean(soup.get_text(" "))
    h1 = clean(soup.h1.get_text(" ", strip=True)) if soup.h1 else ""

    owner = first(text, r"Propuesto por\s+(.+?)\s+Se unió")
    if not owner:
        owner = first(text, r"(?:Lancha|Velero|Catamarán|Neumática|Yate|Barco sin licencia) de\s+([\wÀ-ÿ' -]+?)\s+(?:\d+ personas|Con patrón|Sin patrón)")
    owner_id, joined, owner_rating, owner_reviews, languages, response_time, response_rate = profile_identity(text, owner)

    manufacturer = first(text, r"Fabricante:\s*(.+?)\s+Modelo:")
    model = first(text, r"Modelo:\s*(.+?)\s+Potencia del motor:")
    if not model:
        model = first(text, r"Modelo:\s*(.+?)\s+Eslora:")
    port = first(text, r"(?:Profesional|Particular)\s+(.+?)\s+(?:Barco verificado|Compartir)")
    location = first(text, r"Ubicación\s+[^:]+:\s*(.+?)\s+Características")

    title_year = number(first(h1, r"\(((?:19|20)\d{2})\)"))
    detail_year = number(first(text, r"Año:\s*((?:19|20)\d{2})"))
    rating = number(first(text, r"^.*?\b([0-5][\.,]\d)\s*\(\d+ opiniones?\)", re.I | re.S))
    reviews = number(first(text, r"^.*?\b[0-5][\.,]\d\s*\((\d+) opiniones?\)", re.I | re.S))

    prices = [int(v.replace(".", "")) for v in re.findall(r"([\d\.]+)\s*€\s*/\s*día", text) if v.replace(".", "").isdigit()]
    price_day = min(prices) if prices else base.get("card_price_from_eur")

    professional = "Propietario profesional" in text or re.search(r"\bProfesional\b", text[:3500]) is not None
    super_owner = "Súper propietario" in text

    owner_key_seed = "|".join([
        owner_id or "",
        norm(owner),
        norm(joined),
        norm(port or location),
        "pro" if professional else "private",
    ])
    owner_key = hashlib.sha1(owner_key_seed.encode("utf-8")).hexdigest()[:16]

    return {
        **base,
        "title": h1,
        "owner": owner,
        "owner_platform_id": owner_id,
        "owner_key": owner_key,
        "owner_joined": joined,
        "professional": professional,
        "super_owner": super_owner,
        "owner_rating": owner_rating,
        "owner_reviews": owner_reviews,
        "languages": languages,
        "response_time": response_time,
        "response_rate": response_rate,
        "port": port,
        "location": location,
        "manufacturer": manufacturer,
        "model": model,
        "year": detail_year or title_year or base.get("card_year"),
        "people": number(first(text, r"Capacidad a bordo:\s*(\d+) personas")) or base.get("card_people"),
        "hp": number(first(text, r"Potencia del motor:\s*([\d\.,]+)\s*CV")) or base.get("card_hp"),
        "length_m": number(first(text, r"Eslora:\s*([\d\.,]+)\s*m")) or base.get("card_length_m"),
        "cabins": number(first(text, r"Número de cabinas:\s*(\d+)")),
        "beds": number(first(text, r"Número de camas:\s*(\d+)")),
        "bathrooms": number(first(text, r"Número de baños:\s*(\d+)")),
        "deposit_eur": number(first(text, r"Fianza:\s*([\d\.\s]+)\s*€")),
        "fuel_included": bool(re.search(r"Carburante incluido en el precio:\s*Sí", text, re.I)),
        "license_required": bool(re.search(r"Licencia náutica requerida:\s*Sí", text, re.I)),
        "price_day_from_eur": price_day,
        "rating": rating or base.get("card_rating"),
        "reviews": reviews or base.get("card_reviews"),
        "card_instant_booking": base.get("card_instant_booking"),
        "listing_page": base.get("listing_page"),
        "url": base.get("url"),
        "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


def write_csv(path: Path, rows: list[dict[str, Any]], headers: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def owner_score(owner: dict[str, Any]) -> int:
    score = 0
    score += 30 if owner["professional"] else 0
    score += 15 if owner["super_owner"] else 0
    score += min(owner["boat_count"] * 7, 35)
    score += min(int((owner.get("owner_reviews") or 0) ** 0.5), 15)
    score += 5 if (owner.get("owner_rating") or 0) >= 4.7 else 0
    return score


def build_owners(boats: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[str, dict[str, Any]] = {}
    for boat in boats:
        key = boat.get("owner_key") or f"unknown:{boat['url']}"
        if key not in grouped:
            grouped[key] = {
                "owner_key": key,
                "owner_platform_id": boat.get("owner_platform_id", ""),
                "owner": boat.get("owner", ""),
                "owner_joined": boat.get("owner_joined", ""),
                "professional": bool(boat.get("professional")),
                "super_owner": bool(boat.get("super_owner")),
                "owner_rating": boat.get("owner_rating"),
                "owner_reviews": boat.get("owner_reviews"),
                "response_time": boat.get("response_time", ""),
                "response_rate": boat.get("response_rate", ""),
                "languages": boat.get("languages", ""),
                "ports": set(),
                "boat_urls": [],
                "boat_titles": [],
                "boat_count": 0,
            }
        owner = grouped[key]
        owner["boat_count"] += 1
        owner["professional"] = owner["professional"] or bool(boat.get("professional"))
        owner["super_owner"] = owner["super_owner"] or bool(boat.get("super_owner"))
        if boat.get("port") or boat.get("location"):
            owner["ports"].add(boat.get("port") or boat.get("location"))
        owner["boat_urls"].append(boat["url"])
        owner["boat_titles"].append(boat.get("title") or boat.get("model") or boat["url"])

    rows = []
    for owner in grouped.values():
        owner["ports"] = " | ".join(sorted(owner["ports"]))
        owner["boat_urls"] = " | ".join(owner["boat_urls"])
        owner["boat_titles"] = " | ".join(owner["boat_titles"])
        owner["score"] = owner_score(owner)
        owner["priority"] = "A" if owner["score"] >= 65 else "B" if owner["score"] >= 45 else "C"
        owner["public_contact_search"] = f'"{owner["owner"]}" alquiler barcos Palma Mallorca contacto' if owner["owner"] else ""
        rows.append(owner)
    return sorted(rows, key=lambda row: (-row["score"], -row["boat_count"], row["owner"]))


def main() -> int:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    started = time.time()

    listings, expected, pages = discover_listings()
    write_csv(OUTPUT / "listado_urls.csv", listings, [
        "url", "listing_page", "card_text", "card_rating", "card_reviews",
        "card_price_from_eur", "card_people", "card_hp", "card_length_m",
        "card_year", "card_super_owner", "card_instant_booking",
    ])
    (OUTPUT / "listado_urls.json").write_text(json.dumps(listings, ensure_ascii=False, indent=2), encoding="utf-8")

    boats: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []
    log(f"Procesando {len(listings)} fichas con {WORKERS} workers")
    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futures = {executor.submit(parse_detail, row): row for row in listings}
        for index, future in enumerate(as_completed(futures), start=1):
            base = futures[future]
            try:
                boats.append(future.result())
            except Exception as exc:
                errors.append({"url": base["url"], "listing_page": base["listing_page"], "error": str(exc)})
            if index % 50 == 0 or index == len(futures):
                log(f"[Fichas] {index}/{len(futures)} | OK {len(boats)} | errores {len(errors)}")

    boats.sort(key=lambda row: (row.get("owner_key", ""), row.get("title", ""), row["url"]))
    owners = build_owners(boats)

    boat_headers = [
        "owner_key", "owner_platform_id", "owner", "owner_joined", "professional", "super_owner",
        "owner_rating", "owner_reviews", "response_time", "response_rate", "languages",
        "title", "manufacturer", "model", "year", "people", "hp", "length_m", "cabins", "beds",
        "bathrooms", "port", "location", "price_day_from_eur", "deposit_eur", "fuel_included",
        "license_required", "rating", "reviews", "card_instant_booking", "listing_page", "url", "scraped_at",
    ]
    owner_headers = [
        "priority", "score", "owner_key", "owner_platform_id", "owner", "owner_joined",
        "professional", "super_owner", "boat_count", "owner_rating", "owner_reviews", "response_time",
        "response_rate", "languages", "ports", "boat_titles", "boat_urls", "public_contact_search",
    ]
    write_csv(OUTPUT / "barcos.csv", boats, boat_headers)
    write_csv(OUTPUT / "armadores.csv", owners, owner_headers)
    write_csv(OUTPUT / "errores.csv", errors, ["url", "listing_page", "error"])

    summary = {
        "target_url": TARGET_URL,
        "expected_count": expected,
        "pages_processed": pages,
        "unique_listing_urls": len(listings),
        "boat_details_ok": len(boats),
        "boat_details_failed": len(errors),
        "owners_total": len(owners),
        "professional_owners": sum(1 for owner in owners if owner["professional"]),
        "owners_with_multiple_boats": sum(1 for owner in owners if owner["boat_count"] > 1),
        "count_gap": expected - len(listings) if expected else None,
        "duration_seconds": round(time.time() - started, 1),
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    (OUTPUT / "resumen.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    log(json.dumps(summary, ensure_ascii=False, indent=2))

    if STRICT_COUNT and expected and len(listings) < expected:
        return 2
    if errors:
        return 3
    return 0


if __name__ == "__main__":
    sys.exit(main())
