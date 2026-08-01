from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path

import scrape as core
import scrape_all_search_results as base
import scrape_all_search_results_v2  # nested boat links

OUTPUT=Path(os.getenv('OUTPUT_DIR','tail-output'))
START_PAGE=int(os.getenv('START_PAGE','115'))
END_PAGE=int(os.getenv('END_PAGE','150'))


def main()->int:
    OUTPUT.mkdir(parents=True,exist_ok=True)
    url=base.app.build_url([])
    rows={}
    page_stats=[]
    for page in range(START_PAGE,END_PAGE+1):
        html=base.app.request('GET',base.page_url(url,page)).text
        parsed=base.parse_result_cards(html,page,{'key':'general-tail','url':url,'kind':'general-tail'})
        for row in parsed: rows[row['url']]=row
        page_stats.append({'page':page,'cards':len(parsed),'unique_accumulated':len(rows)})
        base.app.log(f'[TAIL p{page}] cards={len(parsed)} unique={len(rows)}')
        if not parsed and page>=START_PAGE+5: break
        time.sleep(.08)
    result=list(rows.values())
    headers=[
        'result_type','result_id','activity_id','product_id','url','title','location','rating','reviews',
        'price_from_eur','people','group_size','duration','year','hp','length_m','boat_type','rental_mode',
        'super_owner','instant_booking','fuel_included','flexible_cancellation','listing_page','position','card_text'
    ]
    core.write_csv(OUTPUT/'resultados_cola.csv',result,headers)
    core.write_csv(OUTPUT/'paginas.csv',page_stats,['page','cards','unique_accumulated'])
    summary={'start_page':START_PAGE,'end_page_requested':END_PAGE,'pages_processed':len(page_stats),
             'unique_tail_results':len(result),'boat_pages':sum(r['result_type']=='barco' for r in result),
             'activity_pages':sum(r['result_type']=='experiencia' for r in result),
             'generated_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
    (OUTPUT/'resumen.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2))
    return 0

if __name__=='__main__': sys.exit(main())
