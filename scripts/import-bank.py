"""One-time import of the official Parivahan English learner question bank.
Requires PyMuPDF. Runtime never contacts the source website.
"""
from pathlib import Path
import fitz,json,re
ROOT=Path(__file__).resolve().parents[1]
PDF=ROOT/'data/question-bank.pdf'
SOURCE='https://parivahan.gov.in/sites/default/files/DownloadForm/STALL_QB_ENGLISH_NEW.pdf'
questions=[]; rejected=[]
for page_number,page in enumerate(fitz.open(PDF)):
 for table in page.find_tables().tables:
  for row,geometry in zip(table.extract(),table.rows):
   if not row[0] or not row[0].strip().isdigit():continue
   clean=lambda s:re.sub(r'\s+',' ',s or '').strip()
   n=int(row[0]); question=clean(row[1]);options=[clean(x) for x in row[2:5]]
   if not (row[5] or '').strip().isdigit() or len(set(options))!=3 or not all(options):
    rejected.append(n);continue
   answer=int(row[5])-1
   if answer not in range(3): rejected.append(n);continue
   is_sign='sign' in question.lower() and ('represent' in question.lower() or 'indicate' in question.lower())
   image=None
   if is_sign:
    cell=geometry.cells[6]
    if not cell:rejected.append(n);continue
    r=fitz.Rect(cell);r.x0+=3;r.x1-=3;r.y0+=3;r.y1-=3
    image=f'/signs/q{n}.png'
    page.get_pixmap(matrix=fitz.Matrix(3,3),clip=r).save(ROOT/'public'/image.lstrip('/'))
   questions.append({'id':f'parivahan-{n:03}','category':'signs' if is_sign else 'rules','prompt':question,'options':options,'answer':answer,'image':image,'explanation':f'The published Parivahan question bank identifies “{options[answer]}” as the correct answer.','source_url':SOURCE,'source_ref':f'Question {n}, PDF page {page_number+1}','imported_at':'2026-10-23'})
(ROOT/'data/questions.raw.json').write_text(json.dumps(questions,ensure_ascii=False,indent=2)+'\n')
print('Extracted',len(questions),'sign questions',sum(q['category']=='signs' for q in questions),'rejected',rejected)
for q in questions:
 if q['category']=='rules':print(q['id'],q['prompt'],'=>',q['options'][q['answer']])
