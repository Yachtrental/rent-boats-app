from __future__ import annotations

import json
import os
import random
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import asdict
from pathlib import Path
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import scrape as core
import scrape_adaptive_v2 as strict

app = strict.app
OUTPUT = Path(os.getenv("OUTPUT_DIR", "grid-output"))
PAGE_WORKERS = max(1, min(12, int(os.getenv("PAGE_WORKERS", "8"))))
DETAIL_WORKERS = max(1, min(24, int(os.getenv("WORKERS", "18"))))


def page_url(url: str, page: int) -> str:
    parts = urlsplit(url)
    params = dict(parse_qsl(parts.query))
    if page > 1:
        params["page"] = str(page)
    else:
        params.pop("page", None)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(params), ""))


def build_bins() -> list[tuple[int, int | None]]:
    bins: list[tuple[int, int | None]] = [(0, 199)]
    bins.extend((low, low + 99) for low in range(200, 2001, 100))
    bins.extend((low, low + 499) for low in range(2100, 10001, 500))
    bins.extend([(10100, 14999), (15000, 24999), (25000, 49999), (50000, None)])
    return bins


def partition_specs() -> list[dict[str, Any]]:
    specs: list[dict[str, Any]] = []
    general_url = app.build_url([])
    specs.append({"key": "general", "url": general_url, "kind": "safety"})
    for slug in app.BOAT_TYPES:
        url = app.build_url([app.Segment(slug, 20, "boatType")])
        specs.append({"key": f"type-{slug}", "url": url, "kind": "safety-type"})
    for low, high in build_bins():
        segment = app.price_segment(low, high)
        url = app.build_url([segment])
        specs.append({
            "key": f"price-{low}-{high if high is not None else 'plus'}",
            "url": url,
            "kind": "price-grid",
            "price_from": low,
            "price_to": high,
        })
    unique: dict[str, dict[str, Any]] = {}
    for spec in specs:
        unique.setdefault(spec["url"], spec)
    return list(unique.values())


def collect_partition(spec: dict[str, Any]) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    rows: dict[str, dict[str, Any]] = {}
    no_new = 0
    first_count = None
    capped = False
    error = ""
    pages = 0
    try:
        for page in range(1, 101):
            html = app.request("GET", page_url(spec["url"], page)).text
            if page == 1:
                first_count, capped = app.parse_display_count(html)
            parsed = core.parse_listing_page(html, page)
            before = len(rows)
            for row in parsed:
                row["source_partition"] = spec["key"]
                row["source_partition_url"] = spec["url"]
                rows[row["url"]] = row
            added = len(rows) - before
            pages = page
            no_new = no_new + 1 if added == 0 else 0
            if page == 1 or page % 10 == 0:
                app.log(f"[GRID {spec['key']} p{page}] +{added} total={len(rows)} expected={first_count}")
            if no_new >= 4:
                break
            if first_count and not capped and len(rows) >= first_count:
                break
            time.sleep(0.05 + random.random() * 0.08)
    except Exception as exc:
        error = str(exc)
        app.log(f"[GRID ERROR] {spec['key']}: {error}")
    result = {
        **spec,
        "displayed_count": first_count,
        "capped": capped,
        "pages": pages,
        "unique_urls": len(rows),
        "error": error,
    }
    return result, list(rows.values())


def repair_detail(row: dict[str, Any]) -> dict[str, Any]:
    result = core.parse_detail(row)
    title = result.get("title", "")
    match = re.search(r"·\s*(.+?)\s+—\s+(.+?)\s+\((?:19|20)\d{2}\)\s*$", title)
    if match:
        if not result.get("manufacturer") or len(str(result.get("manufacturer"))) > 100:
            result["manufacturer"] = core.clean(match.group(1))
        if not result.get("model") or len(str(result.get("model"))) > 100:
            result["model"] = core.clean(match.group(2))
    owner_id = str(result.get("owner_platform_id") or "").strip()
    if owner_id:
        result["owner_key"] = f"id:{owner_id}"
    else:
        import hashlib
        seed = "|".join([
            core.norm(result.get("owner", "")),
            core.norm(result.get("owner_joined", "")),
            "pro" if result.get("professional") else "private",
        ])
        result["owner_key"] = "profile:" + hashlib.sha1(seed.encode("utf-8")).hexdigest()[:16]
    return result


def main() -> int:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    started = time.time()
    general_url = app.build_url([])
    expected, _ = app.parse_display_count(app.request("GET", general_url).text)
    specs = partition_specs()
    app.log(f"GRID: {len(specs)} particiones | objetivo {expected}")

    union: dict[str, dict[str, Any]] = {}
    memberships: dict[str, set[str]] = {}
    partition_rows: list[dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=PAGE_WORKERS) as executor:
        futures = {executor.submit(collect_partition, spec): spec["key"] for spec in specs}
        for future in as_completed(futures):
            part, rows = future.result()
            partition_rows.append(part)
            for row in rows:
                union.setdefault(row["url"], row)
                memberships.setdefault(row["url"], set()).add(part["key"])
            app.log(f"[GRID UNION] {part['key']}: {len(union)}")

    listings = []
    for url, row in union.items():
        row["source_partitions"] = " | ".join(sorted(memberships[url]))
        row["source_partition_count"] = len(memberships[url])
        listings.append(row)
    listings.sort(key=lambda row: row["url"])
    core.write_csv(OUTPUT / "particiones.csv", partition_rows, [
        "key", "url", "kind", "price_from", "price_to", "displayed_count",
        "capped", "pages", "unique_urls", "error",
    ])
    core.write_csv(OUTPUT / "listado_urls.csv", listings, [
        "url", "listing_page", "source_partitions", "source_partition_count",
        "card_text", "card_rating", "card_reviews", "card_price_from_eur",
        "card_people", "card_hp", "card_length_m", "card_year",
        "card_super_owner", "card_instant_booking",
    ])
    (OUTPUT / "listado_urls.json").write_text(json.dumps(listings, ensure_ascii=False, indent=2), encoding="utf-8")
    app.log(f"GRID URLs: {len(listings)} / {expected}")

    boats: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=DETAIL_WORKERS) as executor:
        futures = {executor.submit(repair_detail, row): row for row in listings}
        for index, future in enumerate(as_completed(futures), start=1):
            base = futures[future]
            try:
                boats.append(future.result())
            except Exception as exc:
                errors.append({"url": base["url"], "source_partitions": base.get("source_partitions", ""), "error": str(exc)})
            if index % 100 == 0 or index == len(futures):
                app.log(f"[GRID DETAIL] {index}/{len(futures)} ok={len(boats)} errors={len(errors)}")

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
        "partition_count": len(specs),
        "partitions_with_errors": sum(1 for p in partition_rows if p["error"]),
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
        "strategy": "fixed-price-grid-plus-safety-partitions",
    }
    (OUTPUT / "resumen.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    app.log(json.dumps(summary, ensure_ascii=False, indent=2))
    return 3 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
