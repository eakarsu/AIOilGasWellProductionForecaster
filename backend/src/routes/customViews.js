// Custom Views routes for AIOilGasWellProductionForecaster
// 4 endpoints: production decline curve, well field heatmap, production forecast PDF, well operating rules CRUD

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const pool = require('../models/db');

// IPv6-safe rate limiter using ipKeyGenerator helper from express-rate-limit
let ipKeyGenerator;
try {
  ({ ipKeyGenerator } = require('express-rate-limit'));
} catch (_) {
  ipKeyGenerator = (ip) => ip;
}

const viewsRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 200,
  keyGenerator: (req) => {
    if (req.user) return `user_${req.user.id || req.user.userId || 'u'}`;
    return ipKeyGenerator(req.ip || 'unknown');
  },
  validate: { keyGeneratorIpFallback: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many custom-views requests' }
});

router.use(viewsRateLimiter);

// In-memory operating rules store (works without DB migration)
const operatingRules = [
  { id: 1, well_id: 'W-001', metric: 'wellhead_pressure', threshold_min: 200, threshold_max: 1800, unit: 'psi', action: 'alert_operator', created_at: new Date().toISOString() },
  { id: 2, well_id: 'W-001', metric: 'wellhead_temperature', threshold_min: 60, threshold_max: 180, unit: 'degF', action: 'log_event', created_at: new Date().toISOString() },
  { id: 3, well_id: 'W-002', metric: 'wellhead_pressure', threshold_min: 250, threshold_max: 2000, unit: 'psi', action: 'alert_operator', created_at: new Date().toISOString() },
  { id: 4, well_id: 'W-003', metric: 'casing_pressure', threshold_min: 50, threshold_max: 600, unit: 'psi', action: 'flag_review', created_at: new Date().toISOString() },
];
let nextRuleId = 5;

// =====================================================================
// VIZ 1: GET /decline-curve — production decline curve dataset
// Generates Arps hyperbolic decline curve points for charting
// =====================================================================
router.get('/decline-curve', auth, (req, res) => {
  try {
    const wellId = req.query.well_id || 'W-001';
    const qi = parseFloat(req.query.qi) || 1000; // initial rate bpd
    const di = parseFloat(req.query.di) || 0.08; // initial decline rate (annual)
    const b = parseFloat(req.query.b) || 0.5;    // hyperbolic exponent
    const months = Math.min(120, parseInt(req.query.months) || 60);

    const series = [];
    for (let m = 0; m <= months; m++) {
      const t = m / 12;
      // Arps hyperbolic decline: q(t) = qi / (1 + b*di*t)^(1/b)
      let q;
      if (b === 0) {
        q = qi * Math.exp(-di * t);
      } else {
        q = qi / Math.pow(1 + b * di * t, 1 / b);
      }
      // Add small operational noise
      const noise = 1 + (Math.sin(m * 0.7) * 0.02);
      const actual = m < months * 0.6 ? q * noise : null;
      series.push({
        month: m,
        date: new Date(2024, m, 1).toISOString().slice(0, 7),
        forecast_bpd: Number(q.toFixed(2)),
        actual_bpd: actual !== null ? Number(actual.toFixed(2)) : null,
        cum_production_mbbl: Number(((qi - q) * 30.4 / 1000).toFixed(2))
      });
    }

    res.json({
      ok: true,
      well_id: wellId,
      model: 'arps_hyperbolic',
      params: { qi, di, b, months },
      eur_mbbl: Number((series[series.length - 1].cum_production_mbbl).toFixed(2)),
      series
    });
  } catch (err) {
    console.error('decline-curve error:', err);
    res.status(500).json({ error: err.message || 'Internal error' });
  }
});

// =====================================================================
// VIZ 2: GET /field-heatmap — well field performance heatmap dataset
// Returns a 2D grid of well productivity scores across the field
// =====================================================================
router.get('/field-heatmap', auth, (req, res) => {
  try {
    const rows = Math.min(20, parseInt(req.query.rows) || 8);
    const cols = Math.min(20, parseInt(req.query.cols) || 10);
    const fieldName = req.query.field || 'Permian-A';

    const grid = [];
    const wells = [];
    let wellIndex = 1;
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        // Synthetic productivity score 0-100 based on radial gradient with noise
        const cx = cols / 2;
        const cy = rows / 2;
        const dist = Math.sqrt((c - cx) ** 2 + (r - cy) ** 2);
        const baseScore = Math.max(10, 95 - dist * 6);
        const noise = (Math.sin(r * 1.3 + c * 0.7) * 8);
        const score = Math.max(0, Math.min(100, Number((baseScore + noise).toFixed(1))));
        const wellName = `W-${String(wellIndex).padStart(3, '0')}`;
        row.push({ row: r, col: c, well_id: wellName, score, production_bpd: Number((score * 12).toFixed(0)) });
        wells.push({ well_id: wellName, row: r, col: c, score, production_bpd: Number((score * 12).toFixed(0)) });
        wellIndex++;
      }
      grid.push(row);
    }

    const scores = wells.map(w => w.score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const top5 = [...wells].sort((a, b) => b.score - a.score).slice(0, 5);

    res.json({
      ok: true,
      field: fieldName,
      dimensions: { rows, cols, well_count: wells.length },
      grid,
      stats: {
        avg_score: Number(avg.toFixed(2)),
        max_score: Math.max(...scores),
        min_score: Math.min(...scores),
        top_performers: top5
      }
    });
  } catch (err) {
    console.error('field-heatmap error:', err);
    res.status(500).json({ error: err.message || 'Internal error' });
  }
});

// =====================================================================
// NON-VIZ 1: GET /forecast-pdf — production forecast PDF (text/plain PDF-like report)
// Returns a downloadable PDF-style text report (avoids heavy PDF deps; uses simple PDF format)
// =====================================================================
router.get('/forecast-pdf', auth, (req, res) => {
  try {
    const wellId = req.query.well_id || 'W-001';
    const horizon = Math.min(60, parseInt(req.query.horizon_months) || 24);
    const format = (req.query.format || 'pdf').toLowerCase();

    const qi = 1000;
    const di = 0.08;
    const b = 0.5;
    const lines = [];
    lines.push('PRODUCTION FORECAST REPORT');
    lines.push('=========================================');
    lines.push(`Well ID: ${wellId}`);
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push(`Horizon: ${horizon} months`);
    lines.push(`Model: Arps Hyperbolic Decline (qi=${qi}, di=${di}, b=${b})`);
    lines.push('');
    lines.push('Month | Date     | Forecast (bpd) | Cumulative (Mbbl)');
    lines.push('------|----------|----------------|--------------------');

    let cum = 0;
    for (let m = 0; m <= horizon; m++) {
      const t = m / 12;
      const q = qi / Math.pow(1 + b * di * t, 1 / b);
      cum += q * 30.4;
      const date = new Date(2024, m, 1).toISOString().slice(0, 7);
      lines.push(`${String(m).padStart(5)} | ${date}  | ${String(q.toFixed(1)).padStart(14)} | ${String((cum / 1000).toFixed(2)).padStart(18)}`);
    }

    lines.push('');
    lines.push(`Estimated Ultimate Recovery (EUR): ${(cum / 1000).toFixed(2)} Mbbl`);
    lines.push('');
    lines.push('Risk Factors: Equipment wear, reservoir depletion, water cut increase');
    lines.push('Recommendations: Monitor wellhead pressure, schedule preventive maintenance');
    lines.push('=========================================');
    lines.push('Report End');

    const body = lines.join('\n');

    if (format === 'json') {
      return res.json({ ok: true, well_id: wellId, horizon_months: horizon, eur_mbbl: Number((cum / 1000).toFixed(2)), report: body });
    }

    // Build a minimal valid PDF (text content stream)
    // Use a single-page Helvetica text PDF
    const escapeStr = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    const textCommands = body.split('\n').map((ln, i) =>
      `BT /F1 9 Tf 50 ${780 - i * 11} Td (${escapeStr(ln)}) Tj ET`
    ).join('\n');

    const objects = [];
    objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
    objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
    objects.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj');
    const content = textCommands;
    objects.push(`4 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj`);
    objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');

    let pdf = '%PDF-1.4\n';
    const offsets = [];
    for (const obj of objects) {
      offsets.push(pdf.length);
      pdf += obj + '\n';
    }
    const xrefPos = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const off of offsets) {
      pdf += String(off).padStart(10, '0') + ' 00000 n \n';
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="forecast_${wellId}.pdf"`);
    res.send(Buffer.from(pdf, 'binary'));
  } catch (err) {
    console.error('forecast-pdf error:', err);
    res.status(500).json({ error: err.message || 'Internal error' });
  }
});

// =====================================================================
// NON-VIZ 2: /operating-rules — Well operating rules editor (CRUD)
// Pressure / temperature thresholds per well
// =====================================================================

// LIST + CREATE + UPDATE + DELETE on a single endpoint via method dispatch
router.get('/operating-rules', auth, (req, res) => {
  res.json({ ok: true, count: operatingRules.length, items: operatingRules });
});

router.post('/operating-rules', auth, (req, res) => {
  try {
    const { well_id, metric, threshold_min, threshold_max, unit, action, id } = req.body || {};
    if (!well_id || !metric) {
      return res.status(400).json({ error: 'well_id and metric are required' });
    }

    // UPDATE if id provided and exists
    if (id) {
      const idx = operatingRules.findIndex(r => r.id === Number(id));
      if (idx >= 0) {
        operatingRules[idx] = {
          ...operatingRules[idx],
          well_id,
          metric,
          threshold_min: threshold_min !== undefined ? Number(threshold_min) : operatingRules[idx].threshold_min,
          threshold_max: threshold_max !== undefined ? Number(threshold_max) : operatingRules[idx].threshold_max,
          unit: unit || operatingRules[idx].unit,
          action: action || operatingRules[idx].action,
          updated_at: new Date().toISOString()
        };
        return res.json({ ok: true, action: 'updated', item: operatingRules[idx] });
      }
    }

    // CREATE
    const newRule = {
      id: nextRuleId++,
      well_id,
      metric,
      threshold_min: threshold_min !== undefined ? Number(threshold_min) : null,
      threshold_max: threshold_max !== undefined ? Number(threshold_max) : null,
      unit: unit || (metric.includes('pressure') ? 'psi' : metric.includes('temperature') ? 'degF' : 'unit'),
      action: action || 'alert_operator',
      created_at: new Date().toISOString()
    };
    operatingRules.push(newRule);
    res.status(201).json({ ok: true, action: 'created', item: newRule });
  } catch (err) {
    console.error('operating-rules POST error:', err);
    res.status(500).json({ error: err.message || 'Internal error' });
  }
});

router.delete('/operating-rules/:id', auth, (req, res) => {
  try {
    const id = Number(req.params.id);
    const idx = operatingRules.findIndex(r => r.id === id);
    if (idx < 0) return res.status(404).json({ error: 'Rule not found' });
    const removed = operatingRules.splice(idx, 1)[0];
    res.json({ ok: true, action: 'deleted', item: removed });
  } catch (err) {
    console.error('operating-rules DELETE error:', err);
    res.status(500).json({ error: err.message || 'Internal error' });
  }
});

module.exports = router;
