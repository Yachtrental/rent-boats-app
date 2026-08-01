from __future__ import annotations

import json
import os
import random
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import scrape as core
import scrape_adaptive_v2 as strict

app = strict.app
OUTPUT = Path(os.getenv("OUTPUT_DIR", "facet-discovery-output"))
WORKERS = max(1, min(12, int(os.getenv("PAGE_WORKERS", "8"))))


def page_url(url: str, page: int) -> str:
    parts = urlsplit(url)
    params = dict(parse_qsl(parts.query))
    if page > 1:
        params["page"] = str(page)
    else:
        params.pop("page", None)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(params), ""))


def specs() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    rows.append({"key": "general", "url": app.build_url([]), "facet": "safety"})
    for year in range(1990, 2027):
        segment = app.year_segment(year, year)
        rows.append({"key": f"year-{year}", "url": app.build_url([segment]), "facet": "year"})
    rows.append({"key": "year-pre-1990", "url": app.build_url([app.year_segment(0, 1989)]), "facet": "year"})

    length_ranges = [(0, 4)] + [(n, n) for n in range(5, 21)] + [(21, None)]
    for low, high in length_ranges:
        segment = app.length_segment(low, high)
        rows.append({"key": f"length-{low}-{high if high is not None else 'plus'}", "url": app.build_url([segment]), "facet": "length"})

    power_ranges = [(0, 15), (16, 50), (51, 100), (101, 150), (151, 200), (201, 300), (301, 500), (501, 800), (801, 1200), (1201, None)]
    for low, high in power_ranges:
        segment = app.engine_segment(low, high)
        rows.append({"key": f"power-{low}-{high if high is not None else 'plus'}", "url": app.build_url([segment]), "facet": "power"})

    static = [
        ("instant", app.Segment("reserva-instantanea-1", 170, "static")),
        ("super-owner", app.Segment("super-propietario-1", 160, "static")),
        ("best-rating", app.Segment("mejor-valorados-1", 140, "static")),
    ]
    for key, segment in static:
        rows.append({"key": key, "url": app.build_url([segment]), "facet": "static"})

    unique = {}
    for row in rows:
        unique.setdefault(row["url"], row)
    return list(unique.values())


def collect(spec: dict[str, Any]):
    found = {}
    no_new = 0
    pages = 0
    error = ""
    try:
        for page in range(1, 101):
            html = app.request("GET", page_url(spec["url"], page)).text
            rows = core.parse_listing_page(html, page)
            before = len(found)
            for row in rows:
                row["source_partition"] = spec["key"]
                row["source_partition_url"] = spec["url"]
                found[row["url"]] = row
            added = len(found) - before
            no_new = no_new + 1 if added == 0 else 0
            pages = page
            if no_new >= 4:
                break
            time.sleep(0.04 + random.random() * 0.06)
    except Exception as exc:
        error = str(exc)
    return {**spec, "pages": pages, "unique_urls": len(found), "error": error}, list(found.values())


def main() -> int:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    started = time.time()
    partitions = specs()
    union = {}
    memberships = {}
    part_rows = []
    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futures = {executor.submit(collect, spec): spec["key"] for spec in partitions}
        for future in as_completed(futures):
            part, rows = future.result()
            part_rows.append(part)
            for row in rows:
                union.setdefault(row["url"], row)
                memberships.setdefault(row["url"], set()).add(part["key"])
            app.log(f"[FACET UNION] {part['key']}: {len(union)}")

    listings = []
    for url, row in union.items():
        row["source_partitions"] = " | ".join(sorted(memberships[url]))
        row["source_partition_count"] = len(memberships[url])
        listings.append(row)
    listings.sort(key=lambda row: row["url"])
    core.write_csv(OUTPUT / "particiones.csv", part_rows, ["key", "url", "facet", "pages", "unique_urls", "error"])
    core.write_csv(OUTPUT / "listado_urls.csv", listings, [
        "url", "listing_page", "source_partitions", "source_partition_count", "card_text",
        "card_rating", "card_reviews", "card_price_from_eur", "card_people", "card_hp",
        "card_length_m", "card_year", "card_super_owner", "card_instant_booking",
    ])
    summary = {
        "partition_count": len(partitions),
        "unique_boat_listing_urls": len(listings),
        "partitions_with_errors": sum(1 for p in part_rows if p["error"]),
        "duration_seconds": round(time.time() - started, 1),
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "strategy": "year-length-power-url-recovery",
    }
    (OUTPUT / "resumen.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    app.log(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
