from __future__ import annotations

import json
import os
import random
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any
from urllib.parse import parse_qsl, urlencode, urljoin, urlsplit, urlunsplit

from bs4 import BeautifulSoup

import scrape as core
import scrape_adaptive_v2 as strict

app = strict.app
OUTPUT = Path(os.getenv("OUTPUT_DIR", "all-results-output"))
PAGE_WORKERS = max(1, min(12, int(os.getenv("PAGE_WORKERS", "8"))))

BOAT_TYPES = [
    "Lancha", "Neumática", "Moto de agua", "Jet Ski", "Casa flotante",
    "Barco sin licencia", "Yate de motor", "Velero", "Catamarán", "Goleta", "Yate de vela",
]
RENTAL_MODES = [
    "Patrón obligatorio", "Patrón opcional", "Patrón ofrecido", "Sin patrón", "Sin licencia", "Con patrón",
]


def page_url(url: str, page: int) -> str:
    parts = urlsplit(url)
    params = dict(parse_qsl(parts.query))
    if page > 1:
        params["page"] = str(page)
    else:
        params.pop("page", None)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(params), ""))


def build_price_bins() -> list[tuple[int, int | None]]:
    bins: list[tuple[int, int | None]] = [(0, 199)]
    bins.extend((low, low + 99) for low in range(200, 2001, 100))
    bins.extend((low, low + 499) for low in range(2100, 10001, 500))
    bins.extend([(10100, 14999), (15000, 24999), (25000, 49999), (50000, None)])
    return bins


def partition_specs() -> list[dict[str, Any]]:
    specs: list[dict[str, Any]] = []

    def add(key: str, segments: list[Any], kind: str) -> None:
        specs.append({"key": key, "url": app.build_url(segments), "kind": kind})

    add("general", [], "general")
    for slug in app.BOAT_TYPES:
        add(f"type-{slug}", [app.Segment(slug, 20, "boatType")], "boat-type")
    for low, high in build_price_bins():
        add(
            f"price-{low}-{high if high is not None else 'plus'}",
            [app.price_segment(low, high)],
            "price",
        )
    add("year-pre-1990", [app.year_segment(0, 1989)], "year")
    for year in range(1990, 2027):
        add(f"year-{year}", [app.year_segment(year, year)], "year")
    for length in range(0, 21):
        add(f"length-{length}-{length}", [app.length_segment(length, length)], "length")
    add("length-21-plus", [app.length_segment(21, None)], "length")
    power_ranges = [(0, 15), (16, 50), (51, 100), (101, 150), (151, 200), (201, 300), (301, 500), (501, 800), (801, 1200), (1201, None)]
    for low, high in power_ranges:
        add(f"power-{low}-{high if high is not None else 'plus'}", [app.engine_segment(low, high)], "power")
    add("instant", [app.Segment("reserva-instantanea-1", 170, "static")], "static")
    add("super-owner", [app.Segment("super-propietario-1", 160, "static")], "static")
    add("best-rating", [app.Segment("mejor-valorados-1", 140, "static")], "static")

    unique: dict[str, dict[str, Any]] = {}
    for spec in specs:
        unique.setdefault(spec["url"], spec)
    return list(unique.values())


def parse_tracking(card: Any) -> dict[str, Any]:
    raw = card.get("data-tracking-payload-value", "")
    try:
        return json.loads(raw)
    except Exception:
        return {}


def activity_product_id(card_html: str) -> str:
    patterns = [
        r"activities/product_(\d+)",
        r"product[_-]id(?:-value)?[=:\"' ]+(\d+)",
        r'"product_id"\s*:\s*"?(\d+)"?',
    ]
    for pattern in patterns:
        match = re.search(pattern, card_html, re.I)
        if match:
            return match.group(1)
    return ""


def parse_card(card: Any, page_number: int, position: int, partition: dict[str, Any]) -> dict[str, Any] | None:
    href = core.canonical(urljoin("https://www.clickandboat.com", card.get("href", "")))
    if "/es/alquiler-barcos/" in href:
        result_type = "barco"
    elif "/es/activities/" in href:
        result_type = "experiencia"
    else:
        return None

    text = core.clean(card.get_text(" ", strip=True))
    tracking = parse_tracking(card)
    card_html = str(card)
    activity_id = str(card.get("data-search-tracking-seen-counter-activity-id-value") or "")
    product_id = str(card.get("data-search-tracking-seen-counter-product-id-value") or "")
    if result_type == "experiencia" and not product_id:
        product_id = activity_product_id(card_html)

    title_node = card.select_one("h3")
    title = core.clean(title_node.get_text(" ", strip=True)) if title_node else ""
    if not title:
        image = card.select_one("img[alt]")
        title = core.clean(image.get("alt", "")) if image else ""

    location = ""
    candidate_locations = card.select("div.text-neutral-800")
    for node in candidate_locations:
        value = core.clean(node.get_text(" ", strip=True))
        if value and not re.fullmatch(r"[0-5][\.,]\d", value):
            location = value
            break

    rating = core.number(core.first(text, r"\b([0-5][\.,]\d)\s*\("))
    reviews = core.number(core.first(text, r"\b[0-5][\.,]\d\s*\((\d+)\)"))
    price = core.number(core.first(text, r"A partir de\s+([\d\.\s]+)\s*€"))
    people = core.number(core.first(text, r"(\d+)\s+personas?"))
    group_size = core.number(core.first(text, r"Para grupos de hasta\s+(\d+)\s+personas?"))
    duration = core.first(text, r"((?:\d+\s+horas?(?:\s+\d+\s+minutos?)?|\d+\s+minutos?))\s+·")
    year = core.number(core.first(text, r"\(((?:19|20)\d{2})\)"))
    hp = core.number(core.first(text, r"(\d+)\s*CV"))
    length_m = core.number(core.first(text, r"(\d+(?:[\.,]\d+)?)\s*m\b"))
    boat_type = next((value for value in BOAT_TYPES if value in text), "")
    rental_mode = next((value for value in RENTAL_MODES if value in text), "")

    return {
        "result_type": result_type,
        "result_id": activity_id or product_id,
        "activity_id": activity_id,
        "product_id": product_id,
        "url": href,
        "title": title,
        "location": location,
        "rating": rating,
        "reviews": reviews,
        "price_from_eur": price,
        "people": people,
        "group_size": group_size,
        "duration": duration,
        "year": year,
        "hp": hp,
        "length_m": length_m,
        "boat_type": boat_type,
        "rental_mode": rental_mode,
        "super_owner": "Súper propietario" in text,
        "instant_booking": "Reserva instantánea" in text,
        "fuel_included": "Combustible incluido" in text or "Carburante incluido" in text,
        "flexible_cancellation": "Cancelación flexible" in text,
        "listing_page": page_number,
        "position": tracking.get("position", position),
        "source_partition": partition["key"],
        "source_partition_url": partition["url"],
        "card_text": text,
    }


def parse_result_cards(html: str, page_number: int, partition: dict[str, Any]) -> list[dict[str, Any]]:
    soup = BeautifulSoup(html, "lxml")
    rows: list[dict[str, Any]] = []
    for position, card in enumerate(soup.select('[data-testid="item-card"]')):
        parsed = parse_card(card, page_number, position, partition)
        if parsed:
            rows.append(parsed)
    return rows


def collect_partition(spec: dict[str, Any]) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    rows: dict[str, dict[str, Any]] = {}
    no_new = 0
    displayed_count = None
    capped = False
    pages = 0
    error = ""
    try:
        for page in range(1, 121):
            html = app.request("GET", page_url(spec["url"], page)).text
            if page == 1:
                displayed_count, capped = app.parse_display_count(html)
            parsed = parse_result_cards(html, page, spec)
            before = len(rows)
            for row in parsed:
                rows[row["url"]] = row
            added = len(rows) - before
            pages = page
            no_new = no_new + 1 if added == 0 else 0
            if page == 1 or page % 10 == 0:
                app.log(f"[ALL {spec['key']} p{page}] +{added} total={len(rows)} counter={displayed_count}")
            if no_new >= 4:
                break
            if displayed_count and not capped and len(rows) >= displayed_count:
                break
            time.sleep(0.05 + random.random() * 0.08)
    except Exception as exc:
        error = str(exc)
        app.log(f"[ALL ERROR] {spec['key']}: {error}")
    return {
        **spec,
        "displayed_count": displayed_count,
        "capped": capped,
        "pages": pages,
        "unique_results": len(rows),
        "error": error,
    }, list(rows.values())


def main() -> int:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    started = time.time()
    general_url = app.build_url([])
    expected, _ = app.parse_display_count(app.request("GET", general_url).text)
    specs = partition_specs()
    app.log(f"ALL RESULTS: {len(specs)} particiones | contador {expected}")

    union: dict[str, dict[str, Any]] = {}
    memberships: dict[str, set[str]] = {}
    partition_rows: list[dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=PAGE_WORKERS) as executor:
        futures = {executor.submit(collect_partition, spec): spec["key"] for spec in specs}
        for future in as_completed(futures):
            part, rows = future.result()
            partition_rows.append(part)
            for row in rows:
                current = union.get(row["url"])
                if current is None or len(row.get("card_text", "")) > len(current.get("card_text", "")):
                    union[row["url"]] = row
                memberships.setdefault(row["url"], set()).add(part["key"])
            app.log(f"[ALL UNION] {part['key']}: {len(union)}")

    results: list[dict[str, Any]] = []
    for url, row in union.items():
        row["source_partitions"] = " | ".join(sorted(memberships[url]))
        row["source_partition_count"] = len(memberships[url])
        results.append(row)
    results.sort(key=lambda row: (row["result_type"], row.get("product_id", ""), row["url"]))

    boats = [row for row in results if row["result_type"] == "barco"]
    activities = [row for row in results if row["result_type"] == "experiencia"]
    linked_activities = sum(1 for row in activities if row.get("product_id"))

    headers = [
        "result_type", "result_id", "activity_id", "product_id", "url", "title", "location",
        "rating", "reviews", "price_from_eur", "people", "group_size", "duration", "year", "hp",
        "length_m", "boat_type", "rental_mode", "super_owner", "instant_booking", "fuel_included",
        "flexible_cancellation", "listing_page", "position", "source_partitions",
        "source_partition_count", "card_text",
    ]
    core.write_csv(OUTPUT / "resultados_busqueda.csv", results, headers)
    core.write_csv(OUTPUT / "barcos_cards.csv", boats, headers)
    core.write_csv(OUTPUT / "experiencias.csv", activities, headers)
    core.write_csv(OUTPUT / "particiones.csv", partition_rows, [
        "key", "url", "kind", "displayed_count", "capped", "pages", "unique_results", "error",
    ])
    (OUTPUT / "resultados_busqueda.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")

    summary = {
        "target_url": general_url,
        "public_counter": expected,
        "partition_count": len(specs),
        "partitions_with_errors": sum(1 for row in partition_rows if row.get("error")),
        "unique_search_results": len(results),
        "unique_boat_pages": len(boats),
        "unique_activity_pages": len(activities),
        "activities_with_underlying_product_id": linked_activities,
        "activities_without_underlying_product_id": len(activities) - linked_activities,
        "gap_vs_public_counter": expected - len(results) if expected else None,
        "coverage_pct": round(len(results) / expected * 100, 2) if expected else None,
        "duration_seconds": round(time.time() - started, 1),
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "strategy": "all-item-cards-boats-and-activities",
    }
    (OUTPUT / "resumen.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    app.log(json.dumps(summary, ensure_ascii=False, indent=2))
    return 3 if summary["partitions_with_errors"] else 0


if __name__ == "__main__":
    sys.exit(main())
