import { bank, attempts, rest, getAttempt } from '@/lib/db';
import { session, sameOrigin } from '@/lib/session';
import { publicQuestion, grade } from '@/lib/quiz';
import type { Attempt, Mode } from '@/lib/types';
import { randomInt } from 'node:crypto';
const validId=(id:unknown):id is string=>typeof id==='string'&&/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(id);
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:'Invalid request origin.'},{status:403});
 try{
  const body=await request.json();
  const mode=body.mode as Mode;const count=body.count;
  if(!['mixed','signs','rules','mistakes'].includes(mode)||![10,20,40].includes(count))return Response.json({error:'Choose a test type and 10, 20 or 40 questions.'},{status:400});
  const user=(await session(true))!;
  let questions=await bank();
  if(mode==='mistakes'){
   const history=await attempts(user);const latest=new Map<string,boolean>();
   for(const a of history)for(const answer of a.answers||[])if(!latest.has(answer.question.id))latest.set(answer.question.id,answer.correct);
   questions=questions.filter(q=>latest.get(q.id)===false);
  } else if(mode!=='mixed')questions=questions.filter(q=>q.category===mode);
  if(!questions.length)return Response.json({error:'No questions to review yet. Complete a test first.'},{status:400});
  for(let i=questions.length-1;i>0;i--){const j=randomInt(i+1);[questions[i],questions[j]]=[questions[j],questions[i]];}
  questions=questions.slice(0,count);
  const rows=await rest<Attempt[]>('roadwise_attempts?select=id,mode,status,question_ids,answers,score,total,started_at,completed_at,duration_seconds',{method:'POST',body:JSON.stringify({session_id:user,mode,total:questions.length,question_ids:questions.map(q=>q.id)})},user);
  return Response.json({attempt:rows[0],questions:questions.map(publicQuestion)});
 }catch(e){console.error(e);return Response.json({error:'Could not start your test. Please try again.'},{status:503});}
}
export async function PUT(request:Request){
 if(!sameOrigin(request))return Response.json({error:'Invalid request origin.'},{status:403});
 try{
  const user=await session();if(!user)return Response.json({error:'Your test session has expired.'},{status:401});
  const body=await request.json();if(!validId(body.id))return Response.json({error:'Invalid test.'},{status:400});
  const attempt=await getAttempt(body.id,user);if(!attempt)return Response.json({error:'Test not found.'},{status:404});
  if(attempt.status==='completed')return Response.json(attempt);
  const all=await bank();const questions=attempt.question_ids.map(id=>all.find(q=>q.id===id)!);
  if(questions.some(q=>!q))return Response.json({error:'This question bank has changed. Please start a new test.'},{status:409});
  let result;try{result=grade(questions,body.choices);}catch{return Response.json({error:'Invalid answers.'},{status:400});}
  const completed_at=new Date().toISOString();
  const duration_seconds=Math.max(0,Math.floor((Date.now()-Date.parse(attempt.started_at))/1000));
  const rows=await rest<Attempt[]>(`roadwise_attempts?id=eq.${attempt.id}&status=eq.in_progress`,{method:'PATCH',body:JSON.stringify({...result,status:'completed',completed_at,duration_seconds})},user);
  return Response.json(rows[0]||await getAttempt(body.id,user));
 }catch(e){console.error(e);return Response.json({error:'Could not save your result. Your answers are still here; try again.'},{status:503});}
}
