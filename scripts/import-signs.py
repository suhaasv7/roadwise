from pathlib import Path
from html.parser import HTMLParser
from html import unescape
import re,json,subprocess,concurrent.futures,random
from urllib.parse import urljoin
root=Path(__file__).resolve().parents[1]
class Images(HTMLParser):
 def __init__(self):super().__init__();self.items=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='img' and re.search(r'/(?:m\d+\.jpg|i-\d+\.gif|cs\d+\.jpg)$',a.get('src',''),re.I):self.items.append(a)
p=Images();p.feed((root/'data/signs.html').read_text())
items=[]
fix={'m1':'Straight ahead prohibited','m9':'Bullock carts and hand carts prohibited','m26':'Goods vehicles prohibited','m37':'Give way','cs37':'Unguarded railway crossing ahead (200 m)','cs38':'Unguarded railway crossing ahead (50–100 m)','cs39':'Guarded railway crossing ahead (200 m)','cs40':'Guarded railway crossing ahead (50–100 m)'}
for a in p.items:
 filename=a['src'].split('/')[-1];key=filename.split('.')[0]
 label=fix.get(key,unescape(a['alt'])).replace('Prohibitedor','Prohibited or').replace('Road Wideness Ahead','Road widens ahead')
 items.append({'id':f'maharashtra-{key}','label':label,'image':f'/signs/{filename}','group':{'m':'Mandatory','i':'Informatory','c':'Cautionary'}[key[0]],'asset_url':urljoin('https://transport.maharashtra.gov.in/1308/Road-Signs',a['src']),'source_url':'https://transport.maharashtra.gov.in/1308/Road-Signs'})
def download(a):
 f=root/'public'/a['image'].lstrip('/')
 if not f.exists():subprocess.run(['curl','-fsSL','--retry','2','--max-time','30',a['asset_url'],'-o',str(f)],check=True,capture_output=True)
 return f.name
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
 for _ in pool.map(download,items):pass
(root/'data/signs.json').write_text(json.dumps(items,indent=2)+'\n')
questions=json.loads((root/'data/questions.json').read_text());questions=[q for q in questions if q['category']=='rules']
for a in items:
 rng=random.Random(a['id']); distractors=sorted(set(x['label'] for x in items if x['group']==a['group'] and x['label']!=a['label']))
 options=rng.sample(distractors,3)+[a['label']];rng.shuffle(options)
 questions.append({'id':a['id'],'category':'signs','topic':a['group']+' signs','prompt':'What does this road sign mean?','options':options,'answer':options.index(a['label']),'image':a['image'],'explanation':f"This is the {a['label'].lower()} sign, in the {a['group'].lower()} category of the Maharashtra Transport sign catalogue.",'source_url':a['source_url'],'source_ref':a['id'],'imported_at':'2026-10-23'})
(root/'data/questions.json').write_text(json.dumps(questions,ensure_ascii=False,indent=2)+'\n')
print('Downloaded',len(items),'signs. Total bank',len(questions))
