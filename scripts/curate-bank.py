from pathlib import Path
import json,re
p=Path(__file__).resolve().parents[1]
raw=json.loads((p/'data/questions.raw.json').read_text())
# Review excludes outdated penalties, state-specific numerical limits and ambiguous/unsafe keys.
rules='1 3 5 7 9 15 17 19 21 25 27 29 31 33 35 37 41 43 45 49 51 55 57 59 61 65 69 75 79 85 89 91 93 95 97 99 103 105 107 111 113 115 117 119 123 125 127 141 143 147 151 155 160 162 164 165 166 168 169 171 180 190 199 200 205 213 214 216 217 219 222 223 225 228 230 231 234 236 237 238 240 241 244 246 247 250 251 252 259 261 262 266 267 270 271 274 275 279 280 281 282 283 284 285 286 287 289 290 294 297 299 300 302 303 304 305 306 307 308 310 311 313 316 318 321 322 324 326 327 330 332 335 336 338 339 340 341 344 345 348 349 351 353 354 357 364 366 369 372 373 375 376 377 378 379 381 382 383 387 389 395 398 399 406 408 411 414 415 418 424 428 432'
keep=set(map(int,rules.split()))
result=[]
for q in raw:
 n=int(q['id'].split('-')[1])
 if q['category']!='signs' and n not in keep:continue
 q['prompt']=q['prompt'].replace('_x000D_','').replace('causinginjury','causing injury').replace('nearestpolice','nearest police')
 if q['options'][q['answer']].lower() in ['both','both of the above','all of the above']:
  combined='; '.join(o for i,o in enumerate(q['options']) if i!=q['answer'])
  q['explanation']='The correct answer includes both of these: '+combined+'.'
 q['topic']=('Road signs' if q['category']=='signs' else 'Safe driving')
 result.append(q)
(p/'data/questions.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('Reviewed bank:',len(result),'questions;',sum(q['category']=='signs' for q in result),'signs;',sum(q['category']=='rules' for q in result),'rules')
