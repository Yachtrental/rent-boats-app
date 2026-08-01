from __future__ import annotations

import json
import os
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup

import scrape as core
import scrape_all_search_results as base
import scrape_all_search_results_v2  # applies nested-card fix

app = base.app
OUTPUT = Path(os.getenv("OUTPUT_DIR", "activity-owner-output"))
DETAIL_WORKERS = max(1, min(32, int(os.getenv("WORKERS", "24"))))
PAGE_WORKERS = max(1, min(12, int(os.getenv("PAGE_WORKERS", "8"))))


def discover_activities() -> list[dict[str, Any]]:
    specs = base.partition_specs()
    union: dict[str, dict[str, Any]] = {}
    memberships: dict[str, set[str]] = {}
    with ThreadPoolExecutor(max_workers=PAGE_WORKERS) as executor:
        futures = {executor.submit(base.collect_partition, spec): spec["key"] for spec in specs}
        for future in as_completed(futures):
            part, rows = future.result()
            for row in rows:
                if row.get("result_type") != "experiencia":
                    continue
                current = union.get(row["url"])
                if current is None or len(row.get("card_text", "")) > len(current.get("card_text", "")):
                    union[row["url"]] = row
                memberships.setdefault(row["url"], set()).add(part["key"])
            app.log(f"[ACTIVITY DISCOVERY] {part['key']}: {len(union)}")
    results=[]
    for url,row in union.items():
        row["source_partitions"]=" | ".join(sorted(memberships[url]))
        row["source_partition_count"]=len(memberships[url])
        results.append(row)
    return sorted(results,key=lambda r:(r.get("product_id", ""),r["url"]))


def clean_owner(value: str) -> str:
    value=core.clean(value)
    for marker in [" Barco verificado", " · Súper propietario", " Súper propietario", " Itinerario"]:
        if marker in value:
            value=value.split(marker,1)[0]
    return core.clean(value)


def parse_activity_detail(base_row: dict[str, Any]) -> dict[str, Any]:
    html=app.request("GET",base_row["url"]).text
    soup=BeautifulSoup(html,"lxml")
    text=core.clean(soup.get_text(" "))
    organizer=core.first(
        text,
        r"Organizad[ao]\s+por\s+(.+?)(?:\s+Barco verificado|\s+·\s+Súper propietario|\s+Itinerario|\s+Ubicación de inicio:)",
    )
    if not organizer:
        organizer=core.first(text,r"Organizad[ao]\s+por\s+([^·#]{2,100})")
    organizer=clean_owner(organizer)

    organizer_block=""
    if organizer:
        organizer_block=core.first(
            text,
            rf"Organizad[ao]\s+por\s+{re.escape(organizer)}(.+?)(?:Itinerario|Detalles a saber|Más experiencias)",
        )
    owner_rating=core.number(core.first(organizer_block,r"\b([0-5][\.,]\d)\b"))
    owner_reviews=core.number(core.first(organizer_block,r"(\d+)\s+reseñas"))
    if owner_reviews is None:
        owner_reviews=core.number(core.first(organizer_block,r"\((\d+)\s+opiniones?\)"))

    start_location=core.first(text,r"Ubicación de inicio:\s*(.+?)\s+Vuelta a:")
    return_location=core.first(text,r"Vuelta a:\s*(.+?)(?:\s+\d[\.,]\d/5|\s+Detalles a saber|\s+Reseñas)")

    owner_id=core.first(html,r'"owner"\s*:\s*\{[^{}]{0,1200}?"id"\s*:\s*"?(\d+)"?')
    if not owner_id:
        owner_id=core.first(html,r'"ownerId"\s*:\s*"?(\d+)"?')
    if not owner_id:
        owner_id=core.first(html,r'data-owner-id(?:-value)?=["\'](\d+)["\']')

    boat_links=[]
    for anchor in soup.select('a[href*="/es/alquiler-barcos/"]'):
        href=core.canonical(__import__('urllib.parse').parse.urljoin("https://www.clickandboat.com",anchor.get("href", "")))
        if core.is_boat_url(href): boat_links.append(href)
    boat_links=sorted(set(boat_links))

    return {
        **base_row,
        "organizer":organizer,
        "organizer_owner_id":owner_id,
        "organizer_rating":owner_rating,
        "organizer_reviews":owner_reviews,
        "start_location":start_location,
        "return_location":return_location,
        "linked_boat_urls":" | ".join(boat_links),
        "linked_boat_url_count":len(boat_links),
        "detail_scraped_at":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),
    }


def main() -> int:
    OUTPUT.mkdir(parents=True,exist_ok=True)
    started=time.time()
    activities=discover_activities()
    app.log(f"ACTIVITIES DISCOVERED: {len(activities)}")
    enriched=[]; errors=[]
    with ThreadPoolExecutor(max_workers=DETAIL_WORKERS) as executor:
        futures={executor.submit(parse_activity_detail,row):row for row in activities}
        for index,future in enumerate(as_completed(futures),start=1):
            row=futures[future]
            try:
                enriched.append(future.result())
            except Exception as exc:
                errors.append({"activity_id":row.get("activity_id", ""),"product_id":row.get("product_id", ""),"url":row["url"],"error":str(exc)})
            if index%100==0 or index==len(futures):
                app.log(f"[ACTIVITY DETAIL] {index}/{len(futures)} ok={len(enriched)} errors={len(errors)}")
    enriched.sort(key=lambda r:(core.norm(r.get("organizer", "")),r.get("product_id", ""),r["url"]))
    headers=[
        "activity_id","product_id","url","title","organizer","organizer_owner_id",
        "organizer_rating","organizer_reviews","start_location","return_location",
        "linked_boat_urls","linked_boat_url_count","location","rating","reviews","price_from_eur",
        "group_size","duration","source_partitions","source_partition_count","detail_scraped_at",
    ]
    core.write_csv(OUTPUT/"experiencias_organizadores.csv",enriched,headers)
    core.write_csv(OUTPUT/"errores.csv",errors,["activity_id","product_id","url","error"])
    organizer_count=len({core.norm(r.get("organizer", "")) for r in enriched if r.get("organizer")})
    summary={
        "activities_discovered":len(activities),
        "activity_details_ok":len(enriched),
        "activity_details_failed":len(errors),
        "activities_with_organizer":sum(1 for r in enriched if r.get("organizer")),
        "activities_with_owner_id":sum(1 for r in enriched if r.get("organizer_owner_id")),
        "activities_with_direct_boat_link":sum(1 for r in enriched if r.get("linked_boat_url_count")),
        "unique_organizer_names":organizer_count,
        "duration_seconds":round(time.time()-started,1),
        "generated_at":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),
    }
    (OUTPUT/"resumen.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding="utf-8")
    app.log(json.dumps(summary,ensure_ascii=False,indent=2))
    return 3 if errors else 0


if __name__=="__main__":
    sys.exit(main())
