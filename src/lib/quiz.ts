import type { Question, GradedAnswer } from './types.ts';
export function grade(questions:Question[], choices:unknown): {score:number; answers:GradedAnswer[]} {
 if (!Array.isArray(choices) || choices.length !== questions.length) throw new Error('Answer count does not match the test.');
 const answers=questions.map((question,i)=>{
  const selected=choices[i];
  if (selected !== null && (!Number.isInteger(selected)||selected<0||selected>=question.options.length)) throw new Error('Invalid answer.');
  return {question,selected,correct:selected===question.answer};
 });
 return {score:answers.filter(a=>a.correct).length,answers};
}
export function publicQuestion(q:Question) {
 const {id,category,topic,prompt,options,image}=q;
 return {id,category,topic,prompt,options,image};
}
