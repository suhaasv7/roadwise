import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=ts.transpileModule(fs.readFileSync(new URL('../src/lib/quiz.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {grade,publicQuestion}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const bank=JSON.parse(fs.readFileSync(new URL('../data/questions.json',import.meta.url)));
test('all imported questions have unique IDs, valid answers, sources and local assets',()=>{
 assert.equal(new Set(bank.map(q=>q.id)).size,bank.length);
 for(const q of bank){assert.ok(q.options.length>=3);assert.ok(q.answer>=0&&q.answer<q.options.length);assert.equal(new Set(q.options).size,q.options.length);assert.ok(q.source_url.startsWith('https://'));if(q.image)assert.ok(fs.existsSync(new URL('../public'+q.image,import.meta.url)));}
});
test('grading counts wrong and skipped answers, never client-provided scores',()=>{
 const qs=bank.slice(0,3);const result=grade(qs,[qs[0].answer,(qs[1].answer+1)%qs[1].options.length,null]);assert.equal(result.score,1);assert.equal(result.answers[2].selected,null);
});
test('grading rejects malformed, extra or out-of-range choices',()=>{
 for(const bad of [null,{},[],[999],['0'],[-1],[.5]])assert.throws(()=>grade(bank.slice(0,1),bad));
});
test('test payload omits answer keys and explanations',()=>{
 const publicQ=publicQuestion(bank[0]);assert.equal('answer' in publicQ,false);assert.equal('explanation' in publicQ,false);
});
