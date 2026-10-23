import { attempts } from '@/lib/db';
import { session } from '@/lib/session';
export async function GET(){
 try {const id=await session();return Response.json(id?await attempts(id):[],{headers:{'Cache-Control':'private, no-store'}});}
 catch{return Response.json({error:'Could not load saved results. Please try again.'},{status:503});}
}
