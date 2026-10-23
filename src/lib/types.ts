export type Mode = 'mixed' | 'signs' | 'rules' | 'mistakes';
export type Question = { id:string; category:'signs'|'rules'; topic:string; prompt:string; options:string[]; answer:number; image:string|null; explanation:string; source_url:string; source_ref:string; imported_at:string };
export type PublicQuestion = Omit<Question, 'answer'|'explanation'|'source_url'|'source_ref'|'imported_at'>;
export type GradedAnswer = { question: Question; selected:number|null; correct:boolean };
export type Attempt = { id:string; mode:Mode; status:'in_progress'|'completed'; question_ids:string[]; answers:GradedAnswer[]|null; score:number|null; total:number; started_at:string; completed_at:string|null; duration_seconds:number|null };
export type Sign = {id:string; label:string; image:string; group:string; source_url:string};
