import 'server-only';
import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';
export async function session(create=false) {
 const jar=await cookies();const existing=jar.get('roadwise-session')?.value;
 if(existing && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(existing)) return existing;
 if(!create)return null;
 const id=randomUUID();jar.set('roadwise-session',id,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',maxAge:60*60*24*365,path:'/'});return id;
}
export function sameOrigin(request:Request){
 const origin=request.headers.get('origin');
 if(!origin)return true;
 try {const parsed=new URL(origin);return ['http:','https:'].includes(parsed.protocol) && parsed.host===request.headers.get('host');}
 catch{return false;}
}
