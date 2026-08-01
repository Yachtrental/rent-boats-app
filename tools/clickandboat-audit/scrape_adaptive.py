from __future__ import annotations

import csv
import json
import math
import os
import random
import re
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlsplit, urlunsplit, parse_qsl, urlencode

import requests
from bs4 import BeautifulSoup

import scrape as core

HOST = "https://www.clickandboat.com"
BASE_PATH = "/es/alquiler"
LOCATION = "pais-espana/isla-mallorca/ciudad-palma"
FACET_ENDPOINT = HOST + "/api/v6/search/build-facet-url"
OUTPUT = Path(os.getenv("OUTPUT_DIR", "output"))
DETAIL_WORKERS = max(1, min(24, int(os.getenv("WORKERS", "16"))))
PAGE_WORKERS = max(1, min(10, int(os.getenv("PAGE_WORKERS", "6"))))
PRICE_MAX = int(os.getenv("PRICE_MAX", "50000"))
MIN_PRICE_WIDTH = int(os.getenv("MIN_PRICE_WIDTH", "20"))
STRICT_COUNT = os.getenv("STRICT_COUNT", "0") == "1"

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
BOAT_TYPES = [
    "tipo-de-barco-lancha", "tipo-de-barco-neumatica", "tipo-de-barco-moto-de-agua",
    "tipo-de-barco-casa-flotante", "tipo-de-barco-barco-sin-licencia", "tipo-de-barco-yate-de-motor",
    "tipo-de-barco-velero", "tipo-de-barco-catamaran", "tipo-de-barco-goleta", "tipo-de-barco-yate-de-vela",
]

thread_local = threading.local()
log_lock = threading.Lock()


def log(message: str) -> None:
    with log_lock:
        print(message, flush=True)


def session() -> requests.Session:
    if not hasattr(thread_local, "adaptive_session"):
        current = requests.Session()
        current.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
            "Accept-Language": "es-ES,es;q=0.9,en;q=0.7",
        })
        thread_local.adaptive_session = current
    return thread_local.adaptive_session


def request(method: str, url: str, *, json_payload: Any = None, attempts: int = 6) -> requests.Response:
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            response = session().request(
                method, url, json=json_payload, timeout=60, allow_redirects=True,
                headers={"Content-Type": "application/json"} if json_payload is not None else None,
            )
            if response.status_code in (403, 429, 500, 502, 503, 504):
                raise RuntimeError(f"HTTP {response.status_code}")
            response.raise_for_status()
            return response
        except Exception as exc:
            last_error = exc
            if attempt < attempts:
                time.sleep(min(30, 1.6 ** attempt + random.random() * 2))
    raise RuntimeError(f"{method} {url}: {last_error}")


@dataclass(frozen=True)
class Segment:
    segment: str
    order: int
    type: str = "static"


@dataclass
class Partition:
    key: str
    url: str
    segments: list[dict[str, Any]]
    displayed_count: int | None
    capped: bool
    first_page_boat_urls: int
    reason: str
    parent: str = ""
    pages: int = 0
    unique_urls: int = 0
    error: str = ""


url_cache: dict[str, str] = {}
inspect_cache: dict[str, tuple[int | None, bool, int]] = {}


def build_url(extra_segments: list[Segment]) -> str:
    cache_key = json.dumps([asdict(s) for s in extra_segments], sort_keys=True)
    if cache_key in url_cache:
        return url_cache[cache_key]
    segments = [Segment(LOCATION, 40, "location"), *extra_segments]
    payload = {
        "baseUrl": BASE_PATH,
        "segments": [asdict(s) for s in segments],
        "boatTypeCategories": CATEGORIES,
        "boatTypeCategorySegments": CATEGORY_SEGMENTS,
        "locationWhere": None,
    }
    response = request("POST", FACET_ENDPOINT, json_payload=payload)
    data = response.json()
    path = data.get("url") or BASE_PATH
    query = data.get("queryParams") or ""
    result = urljoin(HOST, path + query)
    url_cache[cache_key] = result
    return result


def parse_display_count(html: str) -> tuple[int | None, bool]:
    text = " ".join(BeautifulSoup(html, "lxml").get_text(" ").split())
    patterns = [
        r"(Más de|\+)?\s*([\d\.\s]+)\s+barcos disponibles",
        r"(Más de|\+)?\s*([\d\.\s]+)\s+barcos",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            value = int(match.group(2).replace(".", "").replace(" ", ""))
            prefix = (match.group(1) or "").lower()
            return value, bool(prefix) or value == 100
    return None, False


def extract_boat_urls(html: str, base_url: str) -> set[str]:
    soup = BeautifulSoup(html, "lxml")
    urls = {
        core.canonical(urljoin(base_url, a.get("href", "")))
        for a in soup.select('a[href*="/es/alquiler-barcos/"]')
    }
    urls |= core.extract_urls_from_scripts(html)
    return {url for url in urls if core.is_boat_url(url)}


def inspect_url(url: str) -> tuple[int | None, bool, int]:
    if url in inspect_cache:
        return inspect_cache[url]
    html = request("GET", url).text
    count, capped = parse_display_count(html)
    first_count = len(extract_boat_urls(html, url))
    inspect_cache[url] = (count, capped, first_count)
    return count, capped, first_count


def price_segment(low: int, high: int | None) -> Segment:
    if high is None:
        return Segment(f"precio-{low}", 90, "range")
    return Segment(f"precio-{low}-{high}", 90, "range")


def year_segment(low: int, high: int | None) -> Segment:
    if high is None:
        return Segment(f"construccion-{low}", 150, "range")
    return Segment(f"construccion-{low}-{high}", 150, "range")


def length_segment(low: int, high: int | None) -> Segment:
    if high is None:
        return Segment(f"eslora-{low}", 110, "range")
    return Segment(f"eslora-{low}-{high}", 110, "range")


def engine_segment(low: int, high: int | None) -> Segment:
    if high is None:
        return Segment(f"motor-{low}", 130, "range")
    return Segment(f"motor-{low}-{high}", 130, "range")


def inspect_partition(key: str, segments: list[Segment], reason: str, parent: str = "") -> Partition:
    url = build_url(segments)
    count, capped, first_count = inspect_url(url)
    log(f"[PLAN] {key}: count={count} capped={capped} first={first_count} {url}")
    return Partition(
        key=key, url=url, segments=[asdict(s) for s in segments], displayed_count=count,
        capped=capped, first_page_boat_urls=first_count, reason=reason, parent=parent,
    )


def build_plan() -> list[Partition]:
    leaves: list[Partition] = []
    seen_urls: set[str] = set()

    # Always include unfiltered and boat-type surfaces as safety nets.
    safety_specs: list[tuple[str, list[Segment], str]] = [("general", [], "safety-general")]
    safety_specs.extend(
        (f"type-{slug}", [Segment(slug, 20, "boatType")], "safety-boat-type")
        for slug in BOAT_TYPES
    )
    for key, segments, reason in safety_specs:
        part = inspect_partition(key, segments, reason)
        if part.url not in seen_urls:
            leaves.append(part)
            seen_urls.add(part.url)

    def add_leaf(part: Partition) -> None:
        if part.url not in seen_urls:
            leaves.append(part)
            seen_urls.add(part.url)

    def split_engine(base_segments: list[Segment], key: str, parent: str) -> None:
        ranges = [(0, 50), (51, 100), (101, 200), (201, 400), (401, 800), (801, None)]
        for low, high in ranges:
            part = inspect_partition(
                f"{key}-power-{low}-{high if high is not None else 'plus'}",
                [*base_segments, engine_segment(low, high)], "engine-fallback", parent,
            )
            if part.displayed_count in (None, 0):
                continue
            if not part.capped:
                add_leaf(part)
                continue
            # Final fallback by boat type for pathological collisions.
            for slug in BOAT_TYPES:
                typed = inspect_partition(
                    f"{part.key}-{slug}", [*base_segments, engine_segment(low, high), Segment(slug, 20, "boatType")],
                    "engine-type-fallback", part.key,
                )
                if typed.displayed_count not in (None, 0):
                    add_leaf(typed)

    def split_length(base_segments: list[Segment], key: str, parent: str) -> None:
        ranges = [(0, 4), (5, 6), (7, 8), (9, 10), (11, 12), (13, 14), (15, None)]
        for low, high in ranges:
            part = inspect_partition(
                f"{key}-length-{low}-{high if high is not None else 'plus'}",
                [*base_segments, length_segment(low, high)], "length-fallback", parent,
            )
            if part.displayed_count in (None, 0):
                continue
            if not part.capped:
                add_leaf(part)
            else:
                split_engine([*base_segments, length_segment(low, high)], part.key, part.key)

    def split_year(base_segments: list[Segment], key: str, parent: str) -> None:
        ranges = [(0, 2005)] + [(year, year) for year in range(2006, 2027)]
        for low, high in ranges:
            part = inspect_partition(
                f"{key}-year-{low}-{high}", [*base_segments, year_segment(low, high)],
                "year-fallback", parent,
            )
            if part.displayed_count in (None, 0):
                continue
            if not part.capped:
                add_leaf(part)
            else:
                split_length([*base_segments, year_segment(low, high)], part.key, part.key)

    def recurse_price(low: int, high: int, parent: str = "") -> None:
        key = f"price-{low}-{high}"
        part = inspect_partition(key, [price_segment(low, high)], "adaptive-price", parent)
        if part.displayed_count in (None, 0):
            return
        width = high - low
        if not part.capped:
            add_leaf(part)
            return
        if width > MIN_PRICE_WIDTH:
            mid = (low + high) // 2
            recurse_price(low, mid, key)
            recurse_price(mid + 1, high, key)
        else:
            split_year([price_segment(low, high)], key, key)

    recurse_price(0, PRICE_MAX)
    high_price = inspect_partition(
        f"price-{PRICE_MAX + 1}-plus", [price_segment(PRICE_MAX + 1, None)],
        "high-price-tail",
    )
    if high_price.displayed_count not in (None, 0):
        if high_price.capped:
            split_year([price_segment(PRICE_MAX + 1, None)], high_price.key, high_price.key)
        else:
            add_leaf(high_price)

    return leaves


def page_url(url: str, page: int) -> str:
    parts = urlsplit(url)
    params = dict(parse_qsl(parts.query))
    if page > 1:
        params["page"] = str(page)
    else:
        params.pop("page", None)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(params), ""))


def collect_partition(partition: Partition) -> tuple[Partition, list[dict[str, Any]]]:
    rows: dict[str, dict[str, Any]] = {}
    no_new = 0
    max_pages = 100 if partition.reason.startswith("safety") else 20
    try:
        for page in range(1, max_pages + 1):
            url = page_url(partition.url, page)
            html = request("GET", url).text
            parsed = core.parse_listing_page(html, page)
            before = len(rows)
            for row in parsed:
                row["source_partition"] = partition.key
                row["source_partition_url"] = partition.url
                rows[row["url"]] = row
            added = len(rows) - before
            no_new = no_new + 1 if added == 0 else 0
            partition.pages = page
            partition.unique_urls = len(rows)
            if page == 1 or page % 5 == 0:
                log(f"[PAGE] {partition.key} p{page}: +{added} total={len(rows)}")
            if no_new >= 4:
                break
            if partition.displayed_count and not partition.capped and len(rows) >= partition.displayed_count:
                break
            time.sleep(0.08 + random.random() * 0.12)
    except Exception as exc:
        partition.error = str(exc)
        log(f"[PAGE ERROR] {partition.key}: {exc}")
    return partition, list(rows.values())


def repair_detail(row: dict[str, Any]) -> dict[str, Any]:
    result = core.parse_detail(row)
    title = result.get("title", "")
    match = re.search(r"·\s*(.+?)\s+—\s+(.+?)\s+\((?:19|20)\d{2}\)\s*$", title)
    if match:
        if not result.get("manufacturer") or len(str(result.get("manufacturer"))) > 100:
            result["manufacturer"] = core.clean(match.group(1))
        if not result.get("model") or len(str(result.get("model"))) > 100:
            result["model"] = core.clean(match.group(2))
    # Rebuild grouping key without port, so the same profile across multiple marinas stays together.
    owner_id = str(result.get("owner_platform_id") or "").strip()
    if owner_id:
        result["owner_key"] = f"id:{owner_id}"
    else:
        seed = "|".join([
            core.norm(result.get("owner", "")), core.norm(result.get("owner_joined", "")),
            "pro" if result.get("professional") else "private",
        ])
        import hashlib
        result["owner_key"] = "profile:" + hashlib.sha1(seed.encode("utf-8")).hexdigest()[:16]
    return result


def main() -> int:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    started = time.time()

    general_url = build_url([])
    general_html = request("GET", general_url).text
    expected, _ = parse_display_count(general_html)
    log(f"Objetivo público detectado: {expected}")

    plan = build_plan()
    core.write_csv(OUTPUT / "plan_particiones.csv", [asdict(p) for p in plan], [
        "key", "url", "segments", "displayed_count", "capped", "first_page_boat_urls",
        "reason", "parent", "pages", "unique_urls", "error",
    ])
    (OUTPUT / "plan_particiones.json").write_text(
        json.dumps([asdict(p) for p in plan], ensure_ascii=False, indent=2), encoding="utf-8"
    )
    log(f"Particiones hoja: {len(plan)}")

    union: dict[str, dict[str, Any]] = {}
    memberships: dict[str, set[str]] = {}
    completed_parts: list[Partition] = []
    with ThreadPoolExecutor(max_workers=PAGE_WORKERS) as executor:
        futures = {executor.submit(collect_partition, part): part.key for part in plan}
        for future in as_completed(futures):
            part, rows = future.result()
            completed_parts.append(part)
            for row in rows:
                union.setdefault(row["url"], row)
                memberships.setdefault(row["url"], set()).add(part.key)
            log(f"[UNION] {part.key}: union={len(union)}")

    listings = []
    for url, row in union.items():
        row["source_partitions"] = " | ".join(sorted(memberships[url]))
        row["source_partition_count"] = len(memberships[url])
        listings.append(row)
    listings.sort(key=lambda row: row["url"])

    core.write_csv(OUTPUT / "particiones.csv", [asdict(p) for p in completed_parts], [
        "key", "url", "segments", "displayed_count", "capped", "first_page_boat_urls",
        "reason", "parent", "pages", "unique_urls", "error",
    ])
    core.write_csv(OUTPUT / "listado_urls.csv", listings, [
        "url", "listing_page", "source_partitions", "source_partition_count",
        "card_text", "card_rating", "card_reviews", "card_price_from_eur", "card_people",
        "card_hp", "card_length_m", "card_year", "card_super_owner", "card_instant_booking",
    ])
    (OUTPUT / "listado_urls.json").write_text(json.dumps(listings, ensure_ascii=False, indent=2), encoding="utf-8")
    log(f"URLs únicas antes de detalle: {len(listings)} / {expected}")

    boats: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=DETAIL_WORKERS) as executor:
        futures = {executor.submit(repair_detail, row): row for row in listings}
        for index, future in enumerate(as_completed(futures), start=1):
            base = futures[future]
            try:
                boats.append(future.result())
            except Exception as exc:
                errors.append({
                    "url": base["url"], "source_partitions": base.get("source_partitions", ""),
                    "error": str(exc),
                })
            if index % 100 == 0 or index == len(futures):
                log(f"[DETAIL] {index}/{len(futures)} ok={len(boats)} errors={len(errors)}")

    boats.sort(key=lambda row: (row.get("owner_key", ""), row.get("title", ""), row["url"]))
    owners = core.build_owners(boats)

    core.write_csv(OUTPUT / "barcos.csv", boats, [
        "owner_key", "owner_platform_id", "owner", "owner_joined", "professional", "super_owner",
        "owner_rating", "owner_reviews", "response_time", "response_rate", "languages",
        "title", "manufacturer", "model", "year", "people", "hp", "length_m", "cabins", "beds",
        "bathrooms", "port", "location", "price_day_from_eur", "deposit_eur", "fuel_included",
        "license_required", "rating", "reviews", "card_instant_booking", "listing_page",
        "source_partitions", "source_partition_count", "url", "scraped_at",
    ])
    core.write_csv(OUTPUT / "armadores.csv", owners, [
        "priority", "score", "owner_key", "owner_platform_id", "owner", "owner_joined",
        "professional", "super_owner", "boat_count", "owner_rating", "owner_reviews", "response_time",
        "response_rate", "languages", "ports", "boat_titles", "boat_urls", "public_contact_search",
    ])
    core.write_csv(OUTPUT / "errores.csv", errors, ["url", "source_partitions", "error"])

    summary = {
        "target_url": general_url,
        "expected_count_public_counter": expected,
        "partition_leaves": len(plan),
        "partitions_with_errors": sum(1 for p in completed_parts if p.error),
        "unique_boat_listing_urls": len(listings),
        "boat_details_ok": len(boats),
        "boat_details_failed": len(errors),
        "owners_total": len(owners),
        "professional_owners": sum(1 for owner in owners if owner["professional"]),
        "owners_with_multiple_boats": sum(1 for owner in owners if owner["boat_count"] > 1),
        "counter_minus_unique_boat_urls": expected - len(listings) if expected else None,
        "coverage_vs_public_counter_pct": round(len(listings) / expected * 100, 2) if expected else None,
        "duration_seconds": round(time.time() - started, 1),
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "note": "The public counter can include promoted activities or non-boat cards; unique_boat_listing_urls counts only /alquiler-barcos/ URLs.",
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
