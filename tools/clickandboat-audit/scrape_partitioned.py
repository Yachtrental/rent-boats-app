from __future__ import annotations

import json
import os
import random
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import scrape as core

OUTPUT = Path(os.getenv("OUTPUT_DIR", "output"))
WORKERS = max(1, min(24, int(os.getenv("WORKERS", "16"))))
PARTITION_WORKERS = max(1, min(6, int(os.getenv("PARTITION_WORKERS", "4"))))
MAX_PAGES_PER_PARTITION = int(os.getenv("MAX_PAGES_PER_PARTITION", "150"))
STRICT_COUNT = os.getenv("STRICT_COUNT", "1") != "0"

BASE = "https://www.clickandboat.com/es/alquiler"
PLACE = "pais-espana/isla-mallorca/ciudad-palma"

PARTITIONS = [
    ("general", f"{BASE}/{PLACE}"),
    ("con_patron", f"{BASE}/tipo-de-alquiler-con-patron/{PLACE}"),
    ("sin_patron", f"{BASE}/tipo-de-alquiler-sin-patron/{PLACE}"),
    ("lancha", f"{BASE}/tipo-de-barco-lancha/{PLACE}"),
    ("lancha_con_patron", f"{BASE}/tipo-de-barco-lancha/tipo-de-alquiler-con-patron/{PLACE}"),
    ("lancha_sin_patron", f"{BASE}/tipo-de-barco-lancha/tipo-de-alquiler-sin-patron/{PLACE}"),
    ("neumatica", f"{BASE}/tipo-de-barco-neumatica/{PLACE}"),
    ("moto_de_agua", f"{BASE}/tipo-de-barco-moto-de-agua/{PLACE}"),
    ("casa_flotante", f"{BASE}/tipo-de-barco-casa-flotante/{PLACE}"),
    ("sin_licencia", f"{BASE}/tipo-de-barco-barco-sin-licencia/{PLACE}"),
    ("yate_motor", f"{BASE}/tipo-de-barco-yate-de-motor/{PLACE}"),
    ("veleros", f"{BASE}/tipo-de-barco-velero/{PLACE}"),
    ("catamaran", f"{BASE}/tipo-de-barco-catamaran/{PLACE}"),
    ("goleta", f"{BASE}/tipo-de-barco-goleta/{PLACE}"),
    ("yate_vela", f"{BASE}/tipo-de-barco-yate-de-vela/{PLACE}"),
]


def page_url(target: str, page: int) -> str:
    parts = urlsplit(target)
    params = dict(parse_qsl(parts.query))
    if page > 1:
        params["page"] = str(page)
    else:
        params.pop("page", None)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(params), ""))


def collect_partition(name: str, target: str) -> dict:
    found = {}
    expected = None
    no_new = 0
    pages = 0
    error = ""
    try:
        for page in range(1, MAX_PAGES_PER_PARTITION + 1):
            html = core.fetch(page_url(target, page))
            if expected is None:
                expected = core.extract_expected_count(html)
            rows = core.parse_listing_page(html, page)
            before = len(found)
            for row in rows:
                row["source_partition"] = name
                row["source_partition_url"] = target
                found[row["url"]] = row
            added = len(found) - before
            pages = page
            no_new = no_new + 1 if added == 0 else 0
            core.log(f"[{name} p{page}] +{added} | {len(found)} / {expected or '?'}")
            if expected and len(found) >= expected:
                break
            if no_new >= 6:
                break
            time.sleep(0.08 + random.random() * 0.12)
    except Exception as exc:
        error = str(exc)
        core.log(f"[{name}] ERROR: {error}")
    return {
        "name": name,
        "url": target,
        "expected": expected,
        "pages": pages,
        "count": len(found),
        "error": error,
        "rows": list(found.values()),
    }


def repair_detail(row: dict) -> dict:
    result = core.parse_detail(row)
    title = result.get("title", "")
    match = re.search(r"·\s*(.+?)\s+—\s+(.+?)\s+\((?:19|20)\d{2}\)\s*$", title)
    if match:
        if not result.get("manufacturer") or len(str(result.get("manufacturer"))) > 100:
            result["manufacturer"] = core.clean(match.group(1))
        if not result.get("model") or len(str(result.get("model"))) > 100:
            result["model"] = core.clean(match.group(2))
    return result


def main() -> int:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    started = time.time()

    results = []
    with ThreadPoolExecutor(max_workers=PARTITION_WORKERS) as executor:
        futures = {executor.submit(collect_partition, name, url): name for name, url in PARTITIONS}
        for future in as_completed(futures):
            results.append(future.result())

    results.sort(key=lambda item: [name for name, _ in PARTITIONS].index(item["name"]))
    union = {}
    memberships = {}
    for result in results:
        for row in result["rows"]:
            union.setdefault(row["url"], row)
            memberships.setdefault(row["url"], set()).add(result["name"])

    listings = []
    for url, row in union.items():
        row["source_partitions"] = " | ".join(sorted(memberships[url]))
        row["source_partition_count"] = len(memberships[url])
        listings.append(row)
    listings.sort(key=lambda row: (row.get("listing_page", 0), row["url"]))

    global_result = next((item for item in results if item["name"] == "general"), None)
    expected = global_result.get("expected") if global_result else None

    core.write_csv(OUTPUT / "particiones.csv", [
        {key: value for key, value in item.items() if key != "rows"} for item in results
    ], ["name", "url", "expected", "pages", "count", "error"])
    core.write_csv(OUTPUT / "listado_urls.csv", listings, [
        "url", "listing_page", "source_partitions", "source_partition_count",
        "card_text", "card_rating", "card_reviews", "card_price_from_eur",
        "card_people", "card_hp", "card_length_m", "card_year",
        "card_super_owner", "card_instant_booking",
    ])
    (OUTPUT / "listado_urls.json").write_text(
        json.dumps(listings, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    core.log(f"UNIÓN: {len(listings)} URLs / objetivo {expected or '?'}")
    boats = []
    errors = []
    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futures = {executor.submit(repair_detail, row): row for row in listings}
        for index, future in enumerate(as_completed(futures), start=1):
            base = futures[future]
            try:
                boats.append(future.result())
            except Exception as exc:
                errors.append({
                    "url": base["url"],
                    "listing_page": base.get("listing_page"),
                    "source_partitions": base.get("source_partitions", ""),
                    "error": str(exc),
                })
            if index % 100 == 0 or index == len(futures):
                core.log(f"[Fichas] {index}/{len(futures)} | OK {len(boats)} | errores {len(errors)}")

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
    core.write_csv(OUTPUT / "errores.csv", errors, [
        "url", "listing_page", "source_partitions", "error"
    ])

    summary = {
        "target_url": f"{BASE}/{PLACE}",
        "expected_count": expected,
        "partition_count": len(PARTITIONS),
        "partitions_ok": sum(1 for item in results if not item["error"]),
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
    (OUTPUT / "resumen.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    core.log(json.dumps(summary, ensure_ascii=False, indent=2))

    if STRICT_COUNT and expected and len(listings) < expected:
        return 2
    if errors:
        return 3
    return 0


if __name__ == "__main__":
    sys.exit(main())
