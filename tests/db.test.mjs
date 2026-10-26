import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

test('attempt requests use the session header without a Lawn secret', async () => {
 const originalEnv = { ...process.env };
 const originalFetch = globalThis.fetch;
 try {
  process.env.SUPABASE_URL = 'https://database.example';
  process.env.SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key';
  delete process.env.LAWN_WRITE_SECRET;
  const requests = [];
  globalThis.fetch = async (url, init) => {
   requests.push({ url, init });
   return Response.json([{ id: 'attempt-id' }]);
  };
  const source = ts.transpileModule(
   fs.readFileSync(new URL('../src/lib/db.ts', import.meta.url), 'utf8').replace("import 'server-only';", ''),
   { compilerOptions: { module: ts.ModuleKind.ESNext } }
  ).outputText;
  const { rest, attempts } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  assert.deepEqual(await rest('roadwise_attempts', {
   method: 'POST', body: JSON.stringify({ session_id: 'session-id' })
  }, 'session-id'), [{ id: 'attempt-id' }]);
  await attempts('session-id');
  assert.equal(requests.length, 2);
  assert.equal(requests[0].init.method, 'POST');
  for (const { url, init } of requests) {
   assert.ok(url.startsWith('https://database.example/rest/v1/roadwise_attempts'));
   assert.equal(init.headers.apikey, 'test-publishable-key');
   assert.equal(init.headers['x-roadwise-session'], 'session-id');
   assert.equal('x-lawn-secret' in init.headers, false);
  }
 } finally {
  globalThis.fetch = originalFetch;
  for (const key of ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'LAWN_WRITE_SECRET']) {
   if (originalEnv[key] === undefined) delete process.env[key];
   else process.env[key] = originalEnv[key];
  }
 }
});
