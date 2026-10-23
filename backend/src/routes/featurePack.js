'use strict';
// Feature pack: authenticated tasks + search/filter + CSV/JSON export +
// domain AI over the caller's own tasks. In-memory store (no DB migration).
// Provider is called only when OPENROUTER_API_KEY or OPENAI_API_KEY is set;
// otherwise a deterministic fallback is returned with aiGenerated:false.
// Labelled sections preserve false / 0 / empty values (never dropped).
const express = require('express');
const { randomUUID } = require('crypto');
const auth = require('../middleware/auth');

const router = express.Router();
const tasks = new Map(); // id -> task

function ownerOf(req) { return String((req.user && (req.user.id ?? req.user.userId ?? req.user.email)) ?? 'unknown'); }
function ownTasks(req) { const o = ownerOf(req); return [...tasks.values()].filter(t => t.ownerId === o); }

function filterTasks(list, q = {}) {
  let out = [...list];
  const search = (q.q ?? q.search ?? '').toString().trim().toLowerCase();
  if (search) out = out.filter(t => [t.title, t.description, t.status, t.priority, t.category].filter(v => v !== undefined && v !== null).join(' ').toLowerCase().includes(search));
  if (q.status !== undefined && q.status !== '') out = out.filter(t => String(t.status) === String(q.status));
  if (q.priority !== undefined && q.priority !== '') out = out.filter(t => String(t.priority) === String(q.priority));
  if (q.category !== undefined && q.category !== '') out = out.filter(t => String(t.category ?? '') === String(q.category));
  return out;
}

function esc(v) { if (v === null || v === undefined) return ''; const s = String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
function toCsv(rows) {
  const cols = ['id','title','description','status','priority','category','estimateHours','done','ownerId','createdAt','updatedAt'];
  return [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n') + '\n';
}

// Labelled sections: every section is always emitted, even when its value is
// false, 0 or empty, so callers can render headings without losing data.
function sections(pairs) { return pairs.map(([label, value]) => ({ label, value: value === undefined ? '' : value })); }

async function maybeProvider(prompt) {
  const key = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const isOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);
    const url = isOpenRouter ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
    const model = process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL || (isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini');
    const r = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }) });
    if (!r.ok) return null;
    const j = await r.json();
    const text = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
    return typeof text === 'string' && text ? text : null;
  } catch { return null; }
}

async function aiRespond(res, feature, prompt, fallbackSections) {
  const text = await maybeProvider(prompt);
  if (text) return res.json({ feature, aiGenerated: true, provider: process.env.OPENROUTER_API_KEY ? 'openrouter' : 'openai', sections: sections([['Summary', text]]), text });
  return res.json({ feature, aiGenerated: false, provider: null, note: 'Deterministic fallback — no AI provider key configured.', sections: fallbackSections });
}

router.use(auth);

router.get('/tasks', (req, res) => { const items = filterTasks(ownTasks(req), req.query); res.json({ total: items.length, items }); });

router.post('/tasks', (req, res) => {
  const b = req.body || {};
  if (!b.title || !String(b.title).trim()) return res.status(400).json({ error: 'title is required' });
  const now = new Date().toISOString();
  const task = { id: randomUUID(), title: String(b.title), description: b.description ?? '', status: b.status ?? 'open', priority: b.priority ?? 'medium', category: b.category ?? '', estimateHours: b.estimateHours ?? 0, done: b.done ?? false, ownerId: ownerOf(req), createdAt: now, updatedAt: now };
  tasks.set(task.id, task);
  res.status(201).json(task);
});

router.put('/tasks/:id', (req, res) => {
  const t = tasks.get(req.params.id);
  if (!t || t.ownerId !== ownerOf(req)) return res.status(404).json({ error: 'Task not found' });
  const b = req.body || {};
  for (const k of ['title','description','status','priority','category','estimateHours','done']) if (Object.prototype.hasOwnProperty.call(b, k)) t[k] = b[k];
  t.updatedAt = new Date().toISOString();
  res.json(t);
});
router.patch('/tasks/:id', (req, res) => {
  const t = tasks.get(req.params.id);
  if (!t || t.ownerId !== ownerOf(req)) return res.status(404).json({ error: 'Task not found' });
  const b = req.body || {};
  for (const k of ['title','description','status','priority','category','estimateHours','done']) if (Object.prototype.hasOwnProperty.call(b, k)) t[k] = b[k];
  t.updatedAt = new Date().toISOString();
  res.json(t);
});

router.get('/tasks/export', (req, res) => {
  const items = filterTasks(ownTasks(req), req.query);
  const fmt = String(req.query.format || 'json').toLowerCase();
  if (fmt === 'csv') { res.setHeader('Content-Type', 'text/csv'); res.setHeader('Content-Disposition', 'attachment; filename="tasks.csv"'); return res.send(toCsv(items)); }
  if (fmt === 'json') { res.setHeader('Content-Disposition', 'attachment; filename="tasks.json"'); return res.json({ total: items.length, items }); }
  return res.status(400).json({ error: 'format must be csv or json' });
});

router.post('/ai/well-task-prioritization', async (req, res) => {
  const items = ownTasks(req);
  const prompt = `Well task prioritization over these tasks: ` + JSON.stringify(items);
  await aiRespond(res, 'well-task-prioritization', prompt, sections([['Open tasks', items.filter(t=>t.status!=='done').length],['High priority open', items.filter(t=>t.priority==='high'&&t.status!=='done').map(t=>t.title)],['Total estimate hours', items.reduce((s,t)=>s+(Number(t.estimateHours)||0),0)],['Any done', items.some(t=>t.done===true)]]));
});

router.post('/ai/production-risk-summary', async (req, res) => {
  const items = ownTasks(req);
  const prompt = `Production risk summary over these tasks: ` + JSON.stringify(items);
  await aiRespond(res, 'production-risk-summary', prompt, sections([['Blocked tasks', items.filter(t=>t.status==='blocked').map(t=>t.title)],['Blocked count', items.filter(t=>t.status==='blocked').length],['Categories', [...new Set(items.map(t=>t.category??''))]]]));
});

router.post('/ai/maintenance-checklist', async (req, res) => {
  const items = ownTasks(req);
  const prompt = `Maintenance checklist over these tasks: ` + JSON.stringify(items);
  await aiRespond(res, 'maintenance-checklist', prompt, sections([['Maintenance tasks', items.filter(t=>String(t.category).toLowerCase().includes('maintenance')).map(t=>t.title)],['Checklist count', items.filter(t=>String(t.category).toLowerCase().includes('maintenance')).length],['All tasks done', items.length>0 && items.every(t=>t.done===true)]]));
});

module.exports = router;
module.exports._test = { tasks, filterTasks, toCsv, sections };
