'use strict';
process.env.JWT_SECRET = process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32 ? process.env.JWT_SECRET : 'test-secret-test-secret-test-secret-1234';
delete process.env.OPENROUTER_API_KEY; delete process.env.OPENAI_API_KEY;
const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = require('../src/routes/featurePack');
async function withServer(fn) {
  const app = express(); app.use(express.json()); app.use('/api/feature-pack', router);
  const srv = app.listen(0); await new Promise(r => srv.once('listening', r));
  const base = `http://127.0.0.1:${srv.address().port}/api/feature-pack`;
  const tok = jwt.sign({ id: 7, email: 't@example.com', role: 'analyst', tenantId: 't1' }, process.env.JWT_SECRET);
  const H = { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' };
  try { await fn(base, H); } finally { srv.close(); }
}
test('feature-pack: auth, tasks CRUD/search/export, AI fallback', async () => {
  delete process.env.OPENROUTER_API_KEY; delete process.env.OPENAI_API_KEY;
  const { _test } = router;
  assert.deepEqual(_test.sections([['Done', false], ['Count', 0], ['Note', '']]).map(s => s.value), [false, 0, '']);
  await withServer(async (base, H) => {
    assert.equal((await fetch(`${base}/tasks`)).status, 401);
    const c = await fetch(`${base}/tasks`, { method: 'POST', headers: H, body: JSON.stringify({ title: 'Alpha well task', priority: 'high', category: 'maintenance', estimateHours: 0, done: false }) });
    assert.equal(c.status, 201); const task = await c.json();
    assert.equal(task.done, false); assert.equal(task.estimateHours, 0);
    const bad = await fetch(`${base}/tasks`, { method: 'POST', headers: H, body: JSON.stringify({}) });
    assert.equal(bad.status, 400);
    const list = await (await fetch(`${base}/tasks?q=Alpha`, { headers: H })).json();
    assert.equal(list.total, 1);
    const miss = await (await fetch(`${base}/tasks?q=nope-nothing`, { headers: H })).json();
    assert.equal(miss.total, 0);
    const filt = await (await fetch(`${base}/tasks?priority=high`, { headers: H })).json();
    assert.equal(filt.total, 1);
    const upd = await (await fetch(`${base}/tasks/${task.id}`, { method: 'PUT', headers: H, body: JSON.stringify({ status: 'done', done: true }) })).json();
    assert.equal(upd.status, 'done'); assert.equal(upd.done, true);
    const csv = await (await fetch(`${base}/tasks/export?format=csv`, { headers: H })).text();
    assert.ok(csv.includes('Alpha well task'));
    const js = await (await fetch(`${base}/tasks/export?format=json`, { headers: H })).json();
    assert.equal(js.total, 1);
    const ai = await (await fetch(`${base}/ai/well-task-prioritization`, { method: 'POST', headers: H, body: '{}' })).json();
    assert.equal(ai.aiGenerated, false);
    assert.ok(Array.isArray(ai.sections) && ai.sections.length >= 2 && ai.sections.every(s => 'label' in s && 'value' in s));
  });
});
