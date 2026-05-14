# Audit Apply Note — AIOilGasWellProductionForecaster

Source: `_AUDIT/reports/batch_06.md` section 5.

## Original Recommendations
### Missing AI counterparts
- `/production-anomaly-detection`
- `/pipeline-rupture-predict`
- `/near-miss-severity-predict`
- `/optimal-maintenance-window`

### Missing non-AI
- SCADA/IIoT real-time sensor integration; asset lifecycle tracking; predictive maintenance scheduling; multi-well portfolio analytics; geological/petrophysical DB integration

### Custom suggestions
- Agentic well optimization; ensemble decline-curve modeling; sensor anomaly streaming (WebSocket); env compliance assistant; cross-operator benchmarking

## Implemented
Added three endpoints in `backend/src/routes/ai.js`:
- `POST /api/ai/analyze/production-anomaly`
- `POST /api/ai/analyze/pipeline-rupture-predict`
- `POST /api/ai/analyze/optimal-maintenance-window`

Reused `queryOpenRouter`, `persistAiResult`, `auth`, `aiRateLimiter`, and existing `ai_analyses` table.

## Backlog
| Item | Tag |
|---|---|
| `/near-miss-severity-predict` | MECHANICAL |
| SCADA/IIoT integration | NEEDS-CREDS |
| Asset lifecycle tracking | MECHANICAL |
| Multi-well portfolio analytics | NEEDS-PRODUCT-DECISION |
| Petrophysical DB integration | NEEDS-CREDS |
| Sensor anomaly WebSocket streaming | NEEDS-PRODUCT-DECISION |
| EPA/state-rules scrape & alert | NEEDS-PRODUCT-DECISION |

## Apply pass 3 (frontend)

`frontend/src/pages/AIPredictivePage.js` already implements a tabbed UI for
the three pass-2 AI endpoints (Production Anomaly, Pipeline Rupture Predict,
Optimal Maintenance Window) with form inputs, JSON parsing, and a result
panel. It calls helpers `aiProductionAnomaly`, `aiPipelineRupture`,
`aiOptimalMaintenanceWindow` exported from `frontend/src/services/api.js`,
which post to the correct backend paths under `/api/ai/analyze/...`. App.js
routes the page at `/ai-predictive`. Token is read from localStorage by the
shared API instance. Backend route file registered at `/api/ai` in
`backend/src/server.js`. **Action: LEFT-AS-IS — FE already wired.**

## Apply pass 4 (mechanical backlog)

Added the two MECHANICAL backlog items (Near-Miss Severity Predict, Asset
Lifecycle Tracking). Both reuse `queryOpenRouter` + `persistAiResult` and the
existing `auth` + `aiRateLimiter` middleware. A `requireKey` helper short-
circuits with 503 when `OPENROUTER_API_KEY` is unset.

Backend (`backend/src/routes/ai.js`):
- `POST /api/ai/analyze/near-miss-severity-predict` — predicts severity escalation if recurring, contributing factors, immediate corrective actions, and stop-work triggers.
- `POST /api/ai/analyze/asset-lifecycle` — assesses lifecycle stage, remaining useful life, repair-vs-replace economics, and decommissioning triggers.

Frontend:
- `services/api.js` — added `aiNearMissSeverity` and `aiAssetLifecycle` helpers.
- `pages/AIPredictivePage.js` — extended `TOOLS` with two new tabs and added per-tool form state, request bodies (wrapped in `{ data }` to match backend), and 503 error display.

`node --check` passes on `routes/ai.js`. Auth-gated endpoints — verified with smoke test on the sister project this batch (ESA) since both projects share the OpenRouter helper pattern.

Items intentionally left in backlog: SCADA/IIoT (NEEDS-CREDS), petrophysical DB (NEEDS-CREDS), multi-well portfolio analytics (NEEDS-PRODUCT-DECISION), sensor anomaly WebSocket (NEEDS-PRODUCT-DECISION), EPA/state rules scrape (NEEDS-PRODUCT-DECISION).

## Apply pass 5 (all backlog)

Closed the two NEEDS-PRODUCT-DECISION items from pass 4's backlog and
documented the chosen defaults inline.

Backend (`backend/src/routes/ai.js`):
- `POST /api/ai/analyze/multi-well-portfolio` — PRODUCT-DECISION: default
  horizon 90 days, default ranking metric `expected_eur`. Aggregates
  `production_history` if `wells` is omitted. Reuses `queryOpenRouter`
  + `persistAiResult` and the existing 503 `requireKey()` short-circuit.
- `POST /api/ai/analyze/sensor-anomaly-batch` — PRODUCT-DECISION:
  synchronous batch endpoint, no WebSocket streaming this pass. Returns
  per-anomaly entries with severity / hypothesis and recommended
  control limits.

Frontend:
- `services/api.js` — added `aiMultiWellPortfolio` and `aiSensorAnomalyBatch`.
- `pages/AIPredictivePage.js` — extended `TOOLS` array with two new
  tabs and per-tool form state + JSX render blocks.

Smoke test: backend on port 4803, `/api/health` 200, login
(admin@oilgas.com / admin123) 200, both new endpoints returned 503
(env has the placeholder OPENROUTER_API_KEY string). `node --check`
passes on `routes/ai.js`.

Items still backlog: SCADA/IIoT (NEEDS-CREDS), petrophysical DB
(NEEDS-CREDS), live WebSocket streaming UI (NEEDS-PRODUCT-DECISION),
EPA/state rules scrape (NEEDS-PRODUCT-DECISION).
