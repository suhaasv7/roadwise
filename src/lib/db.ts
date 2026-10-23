import 'server-only';
import type { Question, Attempt } from './types';
const url=process.env.SUPABASE_URL;
const key=process.env.SUPABASE_PUBLISHABLE_KEY;
export async function rest<T>(path:string, init:RequestInit={}, session?:string):Promise<T> {
 if (!url||!key) throw new Error('The database is not configured.');
 const headers:Record<string,string>={apikey:key,'Content-Type':'application/json',Prefer:'return=representation'};
 if(session){
  if(!process.env.LAWN_WRITE_SECRET)throw new Error('Saving is not configured.');
  headers['x-lawn-secret']=process.env.LAWN_WRITE_SECRET;headers['x-roadwise-session']=session;
 }
 const r=await fetch(`${url}/rest/v1/${path}`,{...init,headers,cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(!r.ok){console.error('Roadwise database request failed',r.status,path.split('?')[0]);throw new Error('The database is temporarily unavailable. Please try again.');}
 return r.json();
}
export const bank=()=>rest<Question[]>('roadwise_questions?select=*&order=id');
export const attempts=(session:string)=>rest<Attempt[]>('roadwise_attempts?select=id,mode,status,question_ids,answers,score,total,started_at,completed_at,duration_seconds&order=started_at.desc&limit=100',{},session);
export const getAttempt=async(id:string,session:string)=>(await rest<Attempt[]>(`roadwise_attempts?id=eq.${id}&select=id,mode,status,question_ids,answers,score,total,started_at,completed_at,duration_seconds`,{},session))[0];
