from __future__ import annotations

import csv, json, os, random, re, threading, time, unicodedata
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any
from urllib.parse import quote_plus, urljoin, urlsplit

import requests
from bs4 import BeautifulSoup

GRID_DIR=Path(os.getenv('GRID_DIR','/tmp/grid'))
ACTIVITY_DIR=Path(os.getenv('ACTIVITY_DIR','/tmp/activity'))
OUTPUT=Path(os.getenv('OUTPUT_DIR','owner-contact-output'))
WORKERS=max(1,min(10,int(os.getenv('WORKERS','5'))))
TIMEOUT=int(os.getenv('REQUEST_TIMEOUT','25'))
HEADERS={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36','Accept-Language':'es-ES,es;q=0.9,en;q=0.7'}
EXCLUDED=('clickandboat.com','samboat.com','nautal.com','getmyboat.com','boatsetter.com','booking.com','tripadvisor.','viator.com','airbnb.')
DIRECTORIES=('empresite','einforma','infocif','paginasamarillas','cylex','todosbiz','iberinform','nicelocal','firmania')
SOCIAL=('instagram.com','facebook.com','linkedin.com','twitter.com','x.com')
GENERIC={'jose','juan','xavi','javier','carlos','maria','miguel','antonio','pedro','pablo','alex','david','daniel','francisco','manuel','adrian','rafael','sergio','marc','jaime','jorge','fernando','alberto','victor','sebastian'}
NAUTICAL=('charter','yacht','boat','barco','alquiler','rent','rental','nautica','sailing','catamaran','velero','lancha','excursion','cruise','marina','skipper','patron','embarcacion','experience','experiencia')
lock=threading.Lock(); local=threading.local(); page_cache={}; search_cache={}


def clean(v:Any)->str:return re.sub(r'\s+',' ',str(v or '').replace('\xa0',' ')).strip()
def norm(v:Any)->str:
 s=unicodedata.normalize('NFD',clean(v).lower());s=''.join(c for c in s if unicodedata.category(c)!='Mn');return re.sub(r'[^a-z0-9]+',' ',s).strip()
def toks(v:Any,n:int=3)->list[str]:
 stop={'mallorca','palma','espana','barco','barcos','lancha','velero','catamaran','yate','motor','alquiler','charter','puerto','marina','club','port','desde','para','con','sin','the','and','de','del','la','el','los','las'}
 return [x for x in norm(v).split() if len(x)>=n and x not in stop and not x.isdigit()]
def dom(url:str)->str:
 h=urlsplit(url).netloc.lower().split(':')[0];return h[4:] if h.startswith('www.') else h
def ses()->requests.Session:
 if not hasattr(local,'s'):local.s=requests.Session();local.s.headers.update(HEADERS)
 return local.s
def get(url:str,tries:int=3)->requests.Response:
 last=None
 for i in range(tries):
  try:
   time.sleep(.12+random.random()*.25);r=ses().get(url,timeout=TIMEOUT,allow_redirects=True)
   if r.status_code in (403,429,500,502,503,504):raise RuntimeError(f'HTTP {r.status_code}')
   r.raise_for_status();return r
  except Exception as e:last=e;time.sleep((i+1)*.8+random.random())
 raise RuntimeError(f'{url}: {last}')
def phone(v:str)->str:
 d=re.sub(r'\D','',clean(v));
 if len(d)==9 and d[0] in '6789':return '+34 '+d[:3]+' '+d[3:6]+' '+d[6:]
 if len(d)==11 and d.startswith('34'):return '+34 '+d[2:5]+' '+d[5:8]+' '+d[8:]
 return ('+' if clean(v).startswith('+') else '')+d if 8<=len(d)<=15 else ''
def email(v:str)->str:
 v=clean(v).strip('.,;:()[]<>\"\'').lower()
 if not re.fullmatch(r'[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}',v):return ''
 return '' if any(x in v for x in ('example.','sentry.','wixpress','cloudflare','domain.com','schema.org')) else v


def read_owners()->list[dict[str,Any]]:
 boats=list(csv.DictReader(open(GRID_DIR/'armadores.csv',encoding='utf-8-sig')))
 owners=[];known=set()
 for r in boats:
  n=norm(r.get('owner'));known.add(n)
  owners.append({'source_owner_key':r.get('owner_key',''),'owner':r.get('owner',''),'owner_joined':r.get('owner_joined',''),'priority':r.get('priority','C'),'score':r.get('score','0'),'professional':r.get('professional',''),'super_owner':r.get('super_owner',''),'boat_count':r.get('boat_count','0'),'owner_rating':r.get('owner_rating',''),'owner_reviews':r.get('owner_reviews',''),'ports':r.get('ports',''),'boat_titles':r.get('boat_titles',''),'first_boat_url':(r.get('boat_urls','').split(' | ')[0] if r.get('boat_urls') else ''),'owner_origin':'boat_listing'})
 acts=list(csv.DictReader(open(ACTIVITY_DIR/'experiencias_organizadores.csv',encoding='utf-8-sig')))
 groups={}
 for r in acts:
  n=norm(r.get('organizer'))
  if not n or n in known:continue
  key=n+'|'+clean(r.get('organizer_rating'))
  g=groups.setdefault(key,{'source_owner_key':'activity:'+key,'owner':r.get('organizer',''),'owner_joined':'','priority':'C','score':'20','professional':'True','super_owner':'','boat_count':'0','owner_rating':r.get('organizer_rating',''),'owner_reviews':r.get('organizer_reviews',''),'ports':set(),'boat_titles':[],'first_boat_url':'','owner_origin':'activity_only','activity_count':0})
  if r.get('start_location'):g['ports'].add(r['start_location'])
  if r.get('title') and len(g['boat_titles'])<4:g['boat_titles'].append(r['title'])
  g['activity_count']+=1
 for g in groups.values():
  g['ports']=' | '.join(sorted(g['ports']));g['boat_titles']=' | '.join(g['boat_titles']);owners.append(g)
 # One verified boat recovered outside the original price grid.
 owners.append({'source_owner_key':'profile:sebastian|febrero 2026|pro','owner':'Sebastián','owner_joined':'febrero 2026','priority':'C','score':'42','professional':'True','super_owner':'False','boat_count':'1','owner_rating':'','owner_reviews':'','ports':'Can Picafort','boat_titles':'Menorquin Yatchs 120 (2003)','first_boat_url':'https://www.clickandboat.com/es/alquiler-barcos/can-picafort/lancha/menorquin-yatchs-120-j2rv2er','owner_origin':'boat_listing','activity_count':2})
 return owners


def queries(r:dict[str,Any])->list[str]:
 name=clean(r['owner']);port=clean((r.get('ports') or 'Mallorca').split('|')[0]);boat=clean((r.get('boat_titles') or '').split('|')[0])[:90]
 q=[f'"{name}" charter "{port}" Mallorca contacto',f'"{name}" alquiler barcos Mallorca teléfono email']
 if boat:q.append(f'"{boat}" charter Mallorca contacto')
 if r.get('owner_origin')=='activity_only':q.append(f'"{name}" excursiones barco Mallorca contacto')
 return q[:3]
def bing(q:str)->list[dict[str,str]]:
 k=norm(q)
 with lock:
  if k in search_cache:return search_cache[k]
 out=[]
 try:
  u='https://www.bing.com/search?q='+quote_plus(q)+'&format=rss&count=10&setlang=es';root=ET.fromstring(get(u,2).content)
  for it in root.findall('.//item'):
   link=clean(it.findtext('link'));title=clean(it.findtext('title'));desc=clean(BeautifulSoup(it.findtext('description') or '','lxml').get_text(' '))
   if link:out.append({'url':link,'title':title,'snippet':desc,'query':q})
 except Exception:pass
 with lock:search_cache[k]=out
 return out
def search_score(x:dict[str,str],r:dict[str,Any])->tuple[int,str]:
 d=dom(x['url']);text=norm(x['title']+' '+x['snippet']+' '+d);name=norm(r['owner']);nt=toks(r['owner'],2);pt=toks((r.get('ports') or '').split('|')[0],4);bt=toks(r.get('boat_titles',''),4)[:18];s=0;why=[]
 if any(e in d for e in EXCLUDED):s-=60
 if any(e in d for e in DIRECTORIES):s-=12;why.append('directorio')
 if name and name in text:s+=22 if name not in GENERIC and len(name)>=5 else 8;why.append('nombre')
 else:s+=min(12,sum(t in text for t in nt)*5)
 ph=sum(t in text for t in pt);bh=sum(t in text for t in set(bt));s+=min(18,ph*7)+min(32,bh*9)
 if ph:why.append('puerto');
 if bh:why.append('flota')
 nh=sum(t in text for t in NAUTICAL);s+=min(14,nh*2)
 if any(t in text for t in ('mallorca','balear','palma','andratx','soller','alcudia','pollensa','cala dor')):s+=7
 if set(toks(d,3))&set(nt):s+=16;why.append('dominio')
 return s,' | '.join(why)


def flatten_json(o:Any):
 if isinstance(o,dict):
  yield o
  for v in o.values():yield from flatten_json(v)
 elif isinstance(o,list):
  for v in o:yield from flatten_json(v)
def address(v:Any)->str:
 if isinstance(v,str):return clean(v)
 if isinstance(v,dict):return ', '.join(clean(v.get(k)) for k in ('streetAddress','postalCode','addressLocality','addressRegion','addressCountry') if clean(v.get(k)))
 return ''
def extract(url:str)->dict[str,Any]:
 with lock:
  if url in page_cache:return page_cache[url]
 out={'url':url,'final_url':url,'title':'','text':'','names':set(),'emails':set(),'phones':set(),'addresses':set(),'socials':set(),'contacts':set(),'error':''}
 try:
  r=get(url);out['final_url']=r.url;s=BeautifulSoup(r.text,'lxml');out['title']=clean(s.title.get_text(' ')) if s.title else '';out['text']=clean(s.get_text(' '))[:250000]
  for n in s.select('script[type="application/ld+json"]'):
   try:o=json.loads(n.string or n.get_text())
   except Exception:continue
   for z in flatten_json(o):
    typ=z.get('@type',[]);typ=[typ] if isinstance(typ,str) else typ
    if set(typ)&{'Organization','LocalBusiness','Corporation','TravelAgency','ProfessionalService','SportsActivityLocation'}:
     if clean(z.get('name')):out['names'].add(clean(z['name']))
     if email(str(z.get('email',''))):out['emails'].add(email(str(z['email'])))
     if phone(str(z.get('telephone',''))):out['phones'].add(phone(str(z['telephone'])))
     if address(z.get('address')):out['addresses'].add(address(z['address']))
     sa=z.get('sameAs',[]);sa=[sa] if isinstance(sa,str) else sa
     out['socials'].update(clean(v) for v in sa if clean(v))
  for a in s.select('a[href]'):
   h=clean(a.get('href'));absu=urljoin(r.url,h);low=h.lower();txt=norm(a.get_text(' '));path=urlsplit(absu).path.lower()
   if low.startswith('mailto:') and email(h.split(':',1)[1].split('?',1)[0]):out['emails'].add(email(h.split(':',1)[1].split('?',1)[0]))
   if low.startswith('tel:') and phone(h.split(':',1)[1].split('?',1)[0]):out['phones'].add(phone(h.split(':',1)[1].split('?',1)[0]))
   if any(x in dom(absu) for x in SOCIAL) or 'wa.me' in dom(absu) or 'whatsapp' in dom(absu):out['socials'].add(absu)
   if dom(absu)==dom(r.url) and any(x in path or x in txt for x in ('contact','contacto','empresa','about','legal','aviso')):out['contacts'].add(absu)
  for e in re.findall(r'([A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,})',r.text,re.I):
   if email(e):out['emails'].add(email(e))
  for p in re.findall(r'(?:\+34|0034)?[\s().-]*(?:[6789]\d[\s().-]*){8}',out['text']):
   if phone(p):out['phones'].add(phone(p))
 except Exception as e:out['error']=str(e)
 with lock:page_cache[url]=out
 return out
def merge(p:dict[str,Any])->dict[str,Any]:
 allp=[p]
 for u in list(p.get('contacts',[]))[:2]:allp.append(extract(u))
 for k in ('names','emails','phones','addresses','socials'):
  p[k]=set().union(*(x.get(k,set()) for x in allp))
 p['sources']=[x.get('final_url') or x.get('url') for x in allp if not x.get('error')];p['alltext']=' '.join(x.get('text','') for x in allp)[:450000];return p
def match_score(p:dict[str,Any],r:dict[str,Any],base:int)->tuple[int,str,bool]:
 text=norm(p.get('title','')+' '+p.get('alltext',p.get('text',''))+' '+dom(p.get('final_url','')));name=norm(r['owner']);nt=toks(r['owner'],2);pt=toks((r.get('ports') or '').split('|')[0],4);bt=toks(r.get('boat_titles',''),4)[:20];s=max(-10,min(30,base//2));why=[]
 if name and name in text:s+=24 if name not in GENERIC and len(name)>=5 else 8;why.append('nombre web')
 else:s+=min(12,sum(t in text for t in nt)*5)
 ph=sum(t in text for t in pt);bh=sum(t in text for t in set(bt));nh=sum(t in text for t in NAUTICAL);s+=min(20,ph*8)+min(36,bh*10)+min(15,nh*2)
 if ph:why.append('puerto');
 if bh:why.append('flota/modelo')
 if set(toks(dom(p.get('final_url','')),3))&set(nt):s+=15;why.append('dominio')
 if p['names']:s+=5;why.append('empresa estructurada')
 if p['emails'] or p['phones']:s+=4;why.append('contacto publicado')
 return min(100,s),' | '.join(why),(nh>=2 or bool(p['names']))
def social(items:set[str],kind:str)->str:
 for u in items:
  d=dom(u)
  if kind in d or (kind=='whatsapp' and ('wa.me' in d or 'whatsapp' in d)):return u
 return ''


def enrich(r:dict[str,Any])->tuple[dict[str,Any],list[dict[str,Any]]]:
 cand={}
 for q in queries(r):
  for x in bing(q):
   sc,why=search_score(x,r);x={**x,'search_score':sc,'search_reasons':why}
   if x['url'] not in cand or sc>cand[x['url']]['search_score']:cand[x['url']]=x
  if cand and max(x['search_score'] for x in cand.values())>=48:break
 ranked=sorted(cand.values(),key=lambda x:-x['search_score']);details=[];best=None;bs=-999;br='';biz=False
 for x in ranked[:5]:
  if any(e in dom(x['url']) for e in EXCLUDED):continue
  p=merge(extract(x['url']));ms,why,is_biz=match_score(p,r,x['search_score'])
  details.append({'source_owner_key':r['source_owner_key'],'owner':r['owner'],'candidate_url':x['url'],'candidate_final_url':p.get('final_url',''),'candidate_domain':dom(p.get('final_url','')),'search_query':x['query'],'search_title':x['title'],'search_snippet':x['snippet'],'search_score':x['search_score'],'match_score':ms,'match_reasons':why,'business_names':' | '.join(sorted(p['names'])),'emails':' | '.join(sorted(p['emails'])),'phones':' | '.join(sorted(p['phones'])),'addresses':' | '.join(sorted(p['addresses'])),'socials':' | '.join(sorted(p['socials'])),'source_urls':' | '.join(p.get('sources',[])),'error':p.get('error','')})
  if ms>bs:best,bs,br,biz=p,ms,why,is_biz
  if ms>=75 and is_biz and (p['emails'] or p['phones']):break
 verified=best is not None and biz and bs>=45;conf='alta' if bs>=65 else 'media' if bs>=45 else 'baja' if best else 'no localizado'
 vals=lambda k:sorted(best.get(k,set())) if best else []
 website=(best.get('final_url') if verified and best else '');emails=vals('emails');phones=vals('phones');addresses=vals('addresses');names=vals('names');socials=best.get('socials',set()) if best else set();sources=best.get('sources',[]) if best else []
 status='contacto verificado' if verified and (emails or phones) else 'empresa/web verificada' if verified else 'candidato para revisión' if best else 'no localizado'
 result={**r,'matched_business_name':(names[0] if names else best.get('title','') if verified and best else ''),'verification_status':status,'contact_confidence':conf,'contact_confidence_score':bs if best else 0,'public_website':website,'public_email':emails[0] if verified and emails else '','public_phone':phones[0] if verified and phones else '','public_whatsapp':social(socials,'whatsapp') if verified else '','business_address':addresses[0] if verified and addresses else '','base_port_public':(r.get('ports') or '').split('|')[0].strip(),'instagram':social(socials,'instagram') if verified else '','facebook':social(socials,'facebook') if verified else '','linkedin':social(socials,'linkedin') if verified else '','primary_source_url':sources[0] if sources else '','additional_source_urls':' | '.join(sources[1:]),'search_queries':' | '.join(queries(r)),'match_reasons':br,'candidate_count':len(ranked),'checked_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'privacy_scope':'Solo datos publicados en contexto comercial; no se infieren datos privados.'}
 return result,details

def write(path:Path,rows:list[dict[str,Any]],headers:list[str]):
 with path.open('w',encoding='utf-8-sig',newline='') as f:w=csv.DictWriter(f,fieldnames=headers,extrasaction='ignore');w.writeheader();w.writerows(rows)
def main()->int:
 OUTPUT.mkdir(parents=True,exist_ok=True);start=time.time();owners=read_owners();owners.sort(key=lambda r:({'A':0,'B':1,'C':2}.get(r.get('priority','C'),3),-int(float(r.get('score') or 0))));log=f'Owners {len(owners)}';print(log,flush=True)
 results=[];cands=[];errors=[]
 with ThreadPoolExecutor(max_workers=WORKERS) as ex:
  fut={ex.submit(enrich,r):r for r in owners}
  for i,f in enumerate(as_completed(fut),1):
   try:a,b=f.result();results.append(a);cands.extend(b)
   except Exception as e:errors.append({'source_owner_key':fut[f].get('source_owner_key'),'owner':fut[f].get('owner'),'error':str(e)})
   if i%25==0 or i==len(fut):print(f'[CONTACTS] {i}/{len(fut)} verified={sum(x["verification_status"] in ("contacto verificado","empresa/web verificada") for x in results)} contact={sum(bool(x["public_email"] or x["public_phone"]) for x in results)} errors={len(errors)}',flush=True)
 results.sort(key=lambda r:({'A':0,'B':1,'C':2}.get(r.get('priority','C'),3),-int(float(r.get('score') or 0)),r.get('owner','')));cands.sort(key=lambda r:(r['source_owner_key'],-int(r['match_score'])))
 headers=list(owners[0].keys())+['matched_business_name','verification_status','contact_confidence','contact_confidence_score','public_website','public_email','public_phone','public_whatsapp','business_address','base_port_public','instagram','facebook','linkedin','primary_source_url','additional_source_urls','search_queries','match_reasons','candidate_count','checked_at','privacy_scope']
 write(OUTPUT/'contactos_publicos_armadores.csv',results,headers);write(OUTPUT/'candidatos_fuentes.csv',cands,list(cands[0].keys()) if cands else ['source_owner_key','owner']);write(OUTPUT/'errores.csv',errors,['source_owner_key','owner','error'])
 summary={'owners_total':len(owners),'owners_processed':len(results),'errors':len(errors),'verified_business_or_website':sum(r['verification_status'] in ('contacto verificado','empresa/web verificada') for r in results),'owners_with_email':sum(bool(r['public_email']) for r in results),'owners_with_phone':sum(bool(r['public_phone']) for r in results),'owners_with_website':sum(bool(r['public_website']) for r in results),'owners_with_address':sum(bool(r['business_address']) for r in results),'high_confidence':sum(r['contact_confidence']=='alta' for r in results),'medium_confidence':sum(r['contact_confidence']=='media' for r in results),'duration_seconds':round(time.time()-start,1),'generated_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'method':'Bing RSS discovery + public website/JSON-LD extraction + owner/port/fleet scoring','privacy_scope':'Only public business contact data; no inferred private details.'}
 (OUTPUT/'resumen.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(summary,ensure_ascii=False,indent=2),flush=True);return 3 if errors else 0
if __name__=='__main__':raise SystemExit(main())
