const router = require('express').Router();
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { queryOpenRouter } = require('../services/openrouter');
const pool = require('../models/db');

// Ensure ai_analyses table exists
pool.query(`
  CREATE TABLE IF NOT EXISTS ai_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    endpoint VARCHAR(100),
    entity_table VARCHAR(100),
    entity_id INTEGER,
    result TEXT,
    tokens_used INTEGER,
    model VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
  )
`).catch(console.error);

// Helper: persist ai result to ai_analyses table and optionally update entity row
async function persistAiResult({ userId, endpoint, entityTable, entityId, result, tokensUsed, model }) {
  try {
    await pool.query(
      `INSERT INTO ai_analyses (user_id, endpoint, entity_table, entity_id, result, tokens_used, model)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [userId, endpoint, entityTable, entityId || null, result, tokensUsed || 0, model]
    );
    if (entityTable && entityId) {
      await pool.query(
        `ALTER TABLE ${entityTable} ADD COLUMN IF NOT EXISTS ai_analysis TEXT`
      ).catch(() => {}); // ignore if column already exists
      await pool.query(
        `UPDATE ${entityTable} SET ai_analysis=$1 WHERE id=$2`,
        [result, entityId]
      );
    }
  } catch (e) {
    // Non-fatal — log and continue
    console.error('persistAiResult error:', e.message);
  }
}

router.post('/analyze/wellhead', auth, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    const prompt = `Analyze this wellhead data and provide professional insights:
Well: ${data.well_name}, Location: ${data.location}, Type: ${data.well_type}
Pressure: ${data.pressure_psi} PSI, Temperature: ${data.temperature_f}°F
Flow Rate: ${data.flow_rate_bpd} BPD, GOR: ${data.gas_oil_ratio}, Water Cut: ${data.water_cut_pct}%
Status: ${data.status}, Choke Size: ${data.choke_size}

Provide:
1. Wellhead performance assessment
2. Pressure and temperature analysis
3. Flow rate optimization recommendations
4. Potential issues and risks
5. Action items for production optimization`;
    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({ userId: req.user.id, endpoint: '/ai/analyze/wellhead', entityTable: 'wellhead_analytics', entityId: data.id, result: content, tokensUsed, model });
    res.json({ analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/reservoir', auth, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    const prompt = `Analyze this reservoir simulation data:
Reservoir: ${data.reservoir_name}, Field: ${data.field_name}
Depth: ${data.depth_ft} ft, Porosity: ${data.porosity_pct}%, Permeability: ${data.permeability_md} mD
Fluid Type: ${data.fluid_type}, Pressure: ${data.reservoir_pressure_psi} PSI, Temperature: ${data.temperature_f}°F
Oil Saturation: ${data.oil_saturation_pct}%, Gas Saturation: ${data.gas_saturation_pct}%, Water Saturation: ${data.water_saturation_pct}%
Recovery Factor: ${data.recovery_factor_pct}%, Simulation Model: ${data.simulation_model}

Provide:
1. Reservoir characterization assessment
2. Recovery efficiency analysis
3. Enhanced oil recovery recommendations
4. Simulation model evaluation
5. Production optimization strategy`;
    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({ userId: req.user.id, endpoint: '/ai/analyze/reservoir', entityTable: 'reservoir_simulation', entityId: data.id, result: content, tokensUsed, model });
    res.json({ analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/decline-curve', auth, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    const prompt = `Analyze this production decline curve data:
Well: ${data.well_name}, Field: ${data.field_name}
Initial Rate: ${data.initial_rate_bpd} BPD, Current Rate: ${data.current_rate_bpd} BPD
Decline Rate: ${data.decline_rate_pct}%, Decline Type: ${data.decline_type}, B-Factor: ${data.b_factor}
Economic Limit: ${data.economic_limit_bpd} BPD, Estimated Reserves: ${data.estimated_reserves_bbl} BBL
Production Start: ${data.production_start_date}, Time to Abandonment: ${data.time_to_abandonment_months} months

Provide:
1. Decline curve type analysis (exponential, hyperbolic, harmonic)
2. Remaining reserves estimation
3. Economic viability assessment
4. Rate vs. time projection
5. Workover and stimulation recommendations`;
    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({ userId: req.user.id, endpoint: '/ai/analyze/decline-curve', entityTable: 'decline_curves', entityId: data.id, result: content, tokensUsed, model });
    res.json({ analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/equipment', auth, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    const prompt = `Analyze this equipment failure prediction data:
Equipment: ${data.equipment_name}, Type: ${data.equipment_type}, Well: ${data.well_name}
Manufacturer: ${data.manufacturer}, Installed: ${data.install_date}
Last Maintenance: ${data.last_maintenance_date}, Operating Hours: ${data.operating_hours}
Health Score: ${data.health_score}/100, Failure Probability: ${data.failure_probability_pct}%
Vibration Level: ${data.vibration_level}, Temperature: ${data.temperature_f}°F
Status: ${data.status}, Next Maintenance: ${data.next_maintenance_date}

Provide:
1. Equipment health assessment
2. Failure risk analysis
3. Predictive maintenance schedule
4. Root cause analysis of degradation
5. Replacement vs. repair recommendation`;
    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({ userId: req.user.id, endpoint: '/ai/analyze/equipment', entityTable: 'equipment_failure', entityId: data.id, result: content, tokensUsed, model });
    res.json({ analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/environmental', auth, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    const prompt = `Analyze this environmental compliance data:
Well: ${data.well_name}, Site: ${data.site_name}
Emission Type: ${data.emission_type}, Level: ${data.emission_level} ${data.emission_unit}
Regulatory Threshold: ${data.regulatory_threshold}, Compliance Status: ${data.compliance_status}
Last Inspection: ${data.inspection_date}, Inspector: ${data.inspector_name}
Corrective Action: ${data.corrective_action}, Penalty: $${data.penalty_amount}
Next Inspection: ${data.next_inspection_date}

Provide:
1. Compliance status assessment
2. Emission level trend analysis
3. Regulatory risk evaluation
4. Remediation recommendations
5. Best practices for environmental stewardship`;
    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({ userId: req.user.id, endpoint: '/ai/analyze/environmental', entityTable: 'environmental_compliance', entityId: data.id, result: content, tokensUsed, model });
    res.json({ analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/forecast', auth, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    const prompt = `Analyze this production forecasting data:
Well: ${data.well_name}, Field: ${data.field_name}
Current Rate: ${data.current_rate_bpd} BPD, Forecast Period: ${data.forecast_period_months} months
Predicted Rate: ${data.predicted_rate_bpd} BPD, Predicted Cumulative: ${data.predicted_cumulative_bbl} BBL
Confidence: ${data.confidence_pct}%, Forecast Method: ${data.forecast_method}
Oil Price: $${data.oil_price_usd}/BBL, Estimated Revenue: $${data.estimated_revenue_usd}
Risk Factor: ${data.risk_factor}

Provide:
1. Production forecast accuracy assessment
2. Revenue projection analysis
3. Risk-adjusted forecast scenarios
4. Market sensitivity analysis
5. Investment and operational recommendations`;
    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({ userId: req.user.id, endpoint: '/ai/analyze/forecast', entityTable: 'production_forecasting', entityId: data.id, result: content, tokensUsed, model });
    res.json({ analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/performance', auth, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    const prompt = `Analyze this well performance data:
Well: ${data.well_name}, Field: ${data.field_name}
Oil Rate: ${data.oil_rate_bpd} BPD, Gas Rate: ${data.gas_rate_mcfd} MCFD, Water Rate: ${data.water_rate_bpd} BPD
Water Cut: ${data.water_cut_pct}%, GOR: ${data.gas_oil_ratio}
BHP: ${data.bottom_hole_pressure_psi} PSI, Tubing Pressure: ${data.tubing_pressure_psi} PSI
Casing Pressure: ${data.casing_pressure_psi} PSI
Uptime: ${data.uptime_pct}%, Efficiency: ${data.efficiency_pct}%

Provide:
1. Overall well performance rating
2. Production efficiency analysis
3. Water management recommendations
4. Pressure profile assessment
5. Optimization strategies for maximum recovery`;
    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({ userId: req.user.id, endpoint: '/ai/analyze/performance', entityTable: 'well_performance', entityId: data.id, result: content, tokensUsed, model });
    res.json({ analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/drilling', auth, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    const prompt = `Analyze this drilling operations data as a petroleum drilling engineer:
Well: ${data.well_name}, Rig: ${data.rig_name}, Operator: ${data.operator}, Field: ${data.field_name}
Spud Date: ${data.spud_date}, Current Depth: ${data.current_depth_ft} ft, Target Depth: ${data.target_depth_ft} ft
ROP: ${data.rop_ft_hr} ft/hr, WOB: ${data.wob_klb} klb, Torque: ${data.torque_ft_lb} ft-lb, RPM: ${data.rpm}
Mud Weight: ${data.mud_weight_ppg} ppg, Mud Type: ${data.mud_type}
Bit Type: ${data.bit_type}, Bit Size: ${data.bit_size_in} in, Status: ${data.status}

Provide:
1. Drilling performance assessment and ROP optimization
2. Bit selection and wear analysis
3. Mud weight and wellbore stability evaluation
4. Torque and drag analysis
5. Recommendations for improved drilling efficiency`;
    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({ userId: req.user.id, endpoint: '/ai/analyze/drilling', entityTable: 'drilling_operations', entityId: data.id, result: content, tokensUsed, model });
    res.json({ analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/cost', auth, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    const prompt = `Analyze this oil & gas project cost economics data:
Well: ${data.well_name}, Field: ${data.field_name}
CAPEX: $${data.capex_usd}, Monthly OPEX: $${data.opex_monthly_usd}
Drilling Cost: $${data.drilling_cost_usd}, Completion Cost: $${data.completion_cost_usd}
NPV: $${data.npv_usd}, IRR: ${data.irr_pct}%, Payback: ${data.payback_months} months
Breakeven Price: $${data.breakeven_price_usd}/BBL, Oil Price: $${data.oil_price_usd}/BBL
Production Rate: ${data.production_rate_bpd} BPD, Operating Margin: ${data.operating_margin_pct}%
Project Status: ${data.project_status}

Provide:
1. Investment return analysis (NPV/IRR assessment)
2. Cost breakdown and optimization opportunities
3. Breakeven and sensitivity analysis
4. Revenue forecast under different price scenarios
5. Capital allocation recommendations`;
    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({ userId: req.user.id, endpoint: '/ai/analyze/cost', entityTable: 'cost_analysis', entityId: data.id, result: content, tokensUsed, model });
    res.json({ analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/pipeline', auth, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    const prompt = `Analyze this pipeline monitoring data:
Pipeline: ${data.pipeline_name}, Segment: ${data.segment_id}
Route: ${data.origin} to ${data.destination}, Length: ${data.length_miles} miles
Diameter: ${data.diameter_in} in, Material: ${data.material}
Max Pressure: ${data.max_pressure_psi} PSI, Current Pressure: ${data.current_pressure_psi} PSI
Flow Rate: ${data.flow_rate_bpd} BPD, Fluid: ${data.fluid_type}
Wall Thickness: ${data.wall_thickness_in} in, Corrosion Rate: ${data.corrosion_rate_mpy} mpy
Last Inspection: ${data.last_inspection_date}, Status: ${data.integrity_status}

Provide:
1. Pipeline integrity assessment
2. Corrosion risk analysis and remaining life estimate
3. Pressure and flow optimization
4. Leak detection and prevention strategy
5. Maintenance and inspection recommendations`;
    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({ userId: req.user.id, endpoint: '/ai/analyze/pipeline', entityTable: 'pipeline_monitoring', entityId: data.id, result: content, tokensUsed, model });
    res.json({ analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/water', auth, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    const prompt = `Analyze this water management data for oil & gas operations:
Well: ${data.well_name}, Field: ${data.field_name}
Produced Water: ${data.produced_water_bpd} BPD, Injected Water: ${data.injected_water_bpd} BPD
Disposal Method: ${data.disposal_method}, Treatment: ${data.treatment_type}
TDS: ${data.tds_ppm} ppm, pH: ${data.ph_level}, Oil in Water: ${data.oil_in_water_ppm} ppm
Disposal Well: ${data.disposal_well_name}, Injection Pressure: ${data.injection_pressure_psi} PSI
Source: ${data.water_source}, Recycled: ${data.recycled_pct}%, Cost: $${data.cost_per_bbl_usd}/BBL
Status: ${data.status}

Provide:
1. Water production analysis and trends
2. Treatment efficiency assessment
3. Disposal compliance and capacity evaluation
4. Water recycling and reuse opportunities
5. Cost reduction strategies for water handling`;
    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({ userId: req.user.id, endpoint: '/ai/analyze/water', entityTable: 'water_management', entityId: data.id, result: content, tokensUsed, model });
    res.json({ analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/safety', auth, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    const prompt = `Analyze this safety incident data for oil & gas operations:
Incident: ${data.incident_title}, Site: ${data.site_name}, Well: ${data.well_name}
Date: ${data.incident_date}, Type: ${data.incident_type}, Severity: ${data.severity}
Description: ${data.description}
Root Cause: ${data.root_cause}
Corrective Action: ${data.corrective_action}
Injuries: ${data.injuries_count}, Days Lost: ${data.days_lost}
Reported By: ${data.reported_by}, Investigation: ${data.investigation_status}
OSHA Recordable: ${data.osha_recordable}

Provide:
1. Incident severity and impact assessment
2. Root cause analysis deep dive
3. Corrective action adequacy review
4. Preventive measures and safety improvements
5. OSHA compliance and reporting recommendations`;
    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({ userId: req.user.id, endpoint: '/ai/analyze/safety', entityTable: 'safety_incidents', entityId: data.id, result: content, tokensUsed, model });
    res.json({ analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/gaslift', auth, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    const prompt = `Analyze this gas lift optimization data:
Well: ${data.well_name}, Field: ${data.field_name}
Injection Rate: ${data.injection_rate_mcfd} MCFD, Injection Pressure: ${data.injection_pressure_psi} PSI
Oil Rate Before: ${data.oil_rate_before_bpd} BPD, Oil Rate After: ${data.oil_rate_after_bpd} BPD
Gas Source: ${data.gas_source}, Valves: ${data.valve_count}, Deepest Valve: ${data.deepest_valve_depth_ft} ft
Casing Pressure: ${data.casing_pressure_psi} PSI, Tubing Pressure: ${data.tubing_pressure_psi} PSI
GLR: ${data.glr_scf_bbl} SCF/BBL, Status: ${data.optimization_status}
Gas Cost: $${data.cost_per_mcf_usd}/MCF, Incremental Revenue: $${data.incremental_revenue_usd}

Provide:
1. Gas lift performance evaluation
2. Injection rate optimization analysis
3. Valve spacing and design assessment
4. Economic analysis of gas lift operations
5. Recommendations for improved lift efficiency`;
    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({ userId: req.user.id, endpoint: '/ai/analyze/gaslift', entityTable: 'gas_lift_optimization', entityId: data.id, result: content, tokensUsed, model });
    res.json({ analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// /ai/analyze/production-anomaly — flag sudden flow/pressure changes
router.post('/analyze/production-anomaly', auth, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body || {};
    const prompt = `Analyze this production-history series for anomalies (sudden flow drops, pressure spikes, water-cut shifts).
Well: ${data?.well_name || 'unknown'}
Series (recent first, JSON): ${JSON.stringify(data?.series || []).slice(0, 4500)}
Baseline metrics: ${JSON.stringify(data?.baseline || {})}

Return a structured report:
1. Anomaly detection summary
2. List of anomalies with timestamp, severity (low/medium/high/critical), root cause hypothesis
3. Recommended diagnostic actions
4. Watchlist signals to monitor
5. Confidence level`;
    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({ userId: req.user.id, endpoint: '/ai/analyze/production-anomaly', entityTable: 'production_history', entityId: data?.id, result: content, tokensUsed, model });
    res.json({ analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// /ai/analyze/pipeline-rupture-predict — pressure-drop pattern analysis
router.post('/analyze/pipeline-rupture-predict', auth, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body || {};
    const prompt = `Analyze pipeline telemetry for rupture or leak risk.
Pipeline ID: ${data?.pipeline_id || 'unknown'}
Length (mi): ${data?.length_mi || 'n/a'}
Recent pressure profile: ${JSON.stringify(data?.pressure_profile || []).slice(0, 4500)}
Flow telemetry: ${JSON.stringify(data?.flow_telemetry || []).slice(0, 4500)}
Recent maintenance: ${JSON.stringify(data?.maintenance_history || [])}

Return a structured report:
1. Rupture/leak risk score (0-100)
2. Most likely failure modes
3. High-risk pipeline segments (if positions provided)
4. Recommended ILI / hydrotest actions
5. Time-to-action urgency
6. Confidence level`;
    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({ userId: req.user.id, endpoint: '/ai/analyze/pipeline-rupture-predict', entityTable: 'pipeline_monitoring', entityId: data?.id, result: content, tokensUsed, model });
    res.json({ analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// /ai/analyze/optimal-maintenance-window — uptime vs reliability tradeoff
router.post('/analyze/optimal-maintenance-window', auth, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body || {};
    const prompt = `Determine the optimal maintenance window for this equipment.
Equipment: ${data?.equipment_name || 'unknown'} (type: ${data?.equipment_type || 'unknown'})
Production impact (BPD lost per day down): ${data?.production_impact_bpd || 'n/a'}
Current health score: ${data?.health_score || 'n/a'}
Failure history (recent): ${JSON.stringify(data?.failure_history || []).slice(0, 3000)}
Spare-part lead times (days): ${JSON.stringify(data?.spare_part_lead_times || {})}
Calendar constraints: ${JSON.stringify(data?.calendar_constraints || {})}

Return a structured plan:
1. Recommended maintenance window (date range)
2. Justification with downtime cost vs. reliability tradeoff
3. Estimated production impact
4. Alternative windows ranked
5. Pre-maintenance preparation checklist
6. Confidence level`;
    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({ userId: req.user.id, endpoint: '/ai/analyze/optimal-maintenance-window', entityTable: 'equipment_failure', entityId: data?.id, result: content, tokensUsed, model });
    res.json({ analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Helper: returns 503 when no API key configured
function requireKey(res) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || key === 'your_openrouter_api_key_here') {
    res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured' });
    return false;
  }
  return true;
}

// /ai/analyze/near-miss-severity-predict — predict severity of near-miss safety events
router.post('/analyze/near-miss-severity-predict', auth, aiRateLimiter, async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const { data } = req.body || {};
    const prompt = `As a HSE expert, predict the severity escalation risk of this near-miss safety event in oil & gas operations.
Site: ${data?.site_name || 'unknown'}
Well: ${data?.well_name || 'unknown'}
Date: ${data?.event_date || 'n/a'}
Description: ${data?.description || 'n/a'}
Activity: ${data?.activity || 'n/a'}
Hazard category: ${data?.hazard_category || 'n/a'}
Reported energy source(s): ${data?.energy_sources || 'n/a'}
Witness count: ${data?.witness_count || 0}
Recent similar events (count, last 90d): ${data?.recent_similar_count || 0}
Recent OSHA recordables on site (12mo): ${data?.osha_recordables_12mo || 0}
Crew experience (avg years): ${data?.crew_experience_yrs || 'n/a'}

Return a structured report:
1. Predicted severity if recurring (low/medium/high/critical) with rationale
2. Likely escalation pathways
3. Top 3 contributing systemic factors
4. Recommended immediate corrective actions
5. Recommended preventive controls (Hierarchy of Controls)
6. Stop-work trigger criteria
7. Confidence level (low/medium/high)`;
    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({ userId: req.user?.id, endpoint: '/ai/analyze/near-miss-severity-predict', entityTable: 'safety_incidents', entityId: data?.id, result: content, tokensUsed, model });
    res.json({ analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// /ai/analyze/asset-lifecycle — assess remaining useful life and lifecycle stage
router.post('/analyze/asset-lifecycle', auth, aiRateLimiter, async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const { data } = req.body || {};
    const prompt = `As a reliability engineer, assess the lifecycle position and remaining useful life of this oil & gas asset.
Asset: ${data?.asset_name || 'unknown'} (type: ${data?.asset_type || 'unknown'})
Manufacturer: ${data?.manufacturer || 'n/a'}, Model: ${data?.model || 'n/a'}
Install date: ${data?.install_date || 'n/a'}
Design life (years): ${data?.design_life_years || 'n/a'}
Operating hours: ${data?.operating_hours || 'n/a'}
Cumulative throughput: ${data?.cumulative_throughput || 'n/a'}
Health score (0-100): ${data?.health_score || 'n/a'}
Maintenance history (recent): ${JSON.stringify(data?.maintenance_history || []).slice(0, 3000)}
Failure history (recent): ${JSON.stringify(data?.failure_history || []).slice(0, 2000)}
Replacement cost (USD): ${data?.replacement_cost_usd || 'n/a'}
Annual OPEX (USD): ${data?.annual_opex_usd || 'n/a'}

Return a structured plan:
1. Lifecycle stage (commissioning / early-life / mature / late-life / end-of-life) with rationale
2. Estimated remaining useful life (years) and confidence band
3. Repair-vs-replace economic recommendation
4. Top failure modes to monitor for end-of-life signals
5. Recommended monitoring KPIs and inspection cadence
6. Decommissioning planning triggers
7. Confidence level`;
    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({ userId: req.user?.id, endpoint: '/ai/analyze/asset-lifecycle', entityTable: 'equipment_failure', entityId: data?.id, result: content, tokensUsed, model });
    res.json({ analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// /ai/analyze/multi-well-portfolio — portfolio-level analytics across wells
// PRODUCT-DECISION: Default analytics horizon = 90 days, default ranking metric
// = expected EUR contribution. Caller may override via body { horizon_days,
// ranking_metric }. We don't open WebSockets in this pass — portfolio rolls up
// caller-provided well summaries (or aggregated production_history rows).
router.post('/analyze/multi-well-portfolio', auth, aiRateLimiter, async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const { wells, horizon_days, ranking_metric } = req.body || {};
    const horizon = Number.isFinite(horizon_days) && horizon_days > 0 ? horizon_days : 90;
    const metric = ranking_metric || 'expected_eur';

    let wellSummaries = wells;
    if (!Array.isArray(wellSummaries) || wellSummaries.length === 0) {
      // Aggregate from production_history if present
      const r = await pool.query(
        `SELECT well_name,
                COUNT(*)            AS samples,
                AVG(oil_production_bpd) AS avg_oil_bpd,
                AVG(gas_production_mcfd) AS avg_gas_mcfd,
                AVG(water_cut_pct)  AS avg_water_cut_pct,
                MAX(production_date) AS last_date
         FROM production_history
         WHERE production_date >= NOW() - ($1 || ' days')::interval
         GROUP BY well_name
         ORDER BY avg_oil_bpd DESC NULLS LAST
         LIMIT 50`,
        [String(horizon)]
      ).catch(() => ({ rows: [] }));
      wellSummaries = r.rows;
    }

    const prompt = `As a portfolio reservoir / production engineer, analyze this multi-well portfolio over the past ${horizon} days. Rank wells by "${metric}", flag underperformers vs. peers, propose intervention priorities, and provide a portfolio-level outlook.

Wells: ${JSON.stringify(wellSummaries || []).slice(0, 8000)}

Return a structured report:
1. Portfolio-level KPIs (avg oil, gas, water cut, total samples)
2. Top quartile / bottom quartile wells by ${metric}
3. Underperformers with hypothesized root cause
4. Recommended interventions ranked by NPV/impact
5. Capital allocation suggestions
6. Risks to watch (decline, water breakthrough, GOR changes)
7. Confidence level`;

    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({
      userId: req.user?.id,
      endpoint: '/ai/analyze/multi-well-portfolio',
      entityTable: null, entityId: null,
      result: content, tokensUsed, model,
    });
    res.json({ horizon_days: horizon, ranking_metric: metric, well_count: (wellSummaries || []).length, analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// /ai/analyze/sensor-anomaly-batch — batch of sensor readings -> anomaly report
// PRODUCT-DECISION: Real-time WebSocket streaming was originally listed as a
// product-decision/risky item. Apply pass 5 ships a synchronous batch endpoint:
// the caller posts a window of sensor readings and receives a single anomaly
// report. Streaming UI / push notifications remain a future product decision.
router.post('/analyze/sensor-anomaly-batch', auth, aiRateLimiter, async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const { sensor_id, readings, baseline, window_minutes } = req.body || {};
    const wmin = Number.isFinite(window_minutes) && window_minutes > 0 ? window_minutes : 60;

    const prompt = `As an industrial-IoT analytics engineer, scan this batch of oil & gas sensor readings (window ~${wmin} min) for anomalies. Identify out-of-spec spikes, drift, sensor faults, and cross-sensor inconsistencies.

Sensor ID: ${sensor_id || 'unknown'}
Baseline (typical ranges): ${JSON.stringify(baseline || {})}
Readings: ${JSON.stringify(readings || []).slice(0, 8000)}

Return a structured report:
1. Anomaly count by severity (low/medium/high/critical)
2. Per-anomaly entry { timestamp, signal, value, expected_range, severity, hypothesis }
3. Sensor-fault probability vs. real-process-event probability
4. Recommended diagnostic actions
5. Suggested control limits / alarm thresholds
6. Confidence level`;
    const { content, tokensUsed, model } = await queryOpenRouter(prompt);
    await persistAiResult({
      userId: req.user?.id,
      endpoint: '/ai/analyze/sensor-anomaly-batch',
      entityTable: null, entityId: null,
      result: content, tokensUsed, model,
    });
    res.json({ sensor_id: sensor_id || null, window_minutes: wmin, sample_size: Array.isArray(readings) ? readings.length : 0, analysis: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const OPERATION_AI_RESOURCES = {
  'work-orders': { table: 'work_orders', title: 'Work Order' },
  assets: { table: 'asset_registry', title: 'Asset Registry Record' },
  maintenance: { table: 'maintenance_schedules', title: 'Maintenance Schedule' },
  inspections: { table: 'inspection_logs', title: 'Inspection Log' },
  permits: { table: 'compliance_permits', title: 'Compliance Permit' },
  'crews-vendors': { table: 'crew_vendors', title: 'Crew or Vendor Record' },
  inventory: { table: 'inventory_parts', title: 'Inventory Part' },
  documents: { table: 'documents', title: 'Document Record' },
  notifications: { table: 'notification_center', title: 'Notification' },
  settings: { table: 'app_settings', title: 'Application Setting' },
  wells: { table: 'well_master', title: 'Well Master Record' },
  targets: { table: 'production_targets', title: 'Production Target' },
  handovers: { table: 'shift_handovers', title: 'Shift Handover' },
  approvals: { table: 'approval_workflows', title: 'Approval Workflow' },
  integrations: { table: 'integration_endpoints', title: 'Integration Endpoint' },
  reports: { table: 'operational_reports', title: 'Operational Report' },
  'audit-trail': { table: 'audit_trail', title: 'Audit Trail Event' },
};

const OPERATION_AI_ACTIONS = {
  summary: 'Prepare an executive summary of this record and explain why it matters operationally.',
  next_actions: 'Recommend the next operational actions, owners, sequencing, and verification steps.',
  risk: 'Assess operational, safety, compliance, financial, and schedule risk. Provide severity and rationale.',
  prioritization: 'Prioritize this work and explain urgency, dependencies, and recommended owner.',
  completion_notes: 'Draft professional completion notes and closeout criteria for this work.',
  lifecycle: 'Assess lifecycle risk, remaining useful life indicators, and replacement timing.',
  replacement: 'Recommend a replacement or refurbishment plan with operational rationale.',
  maintenance_strategy: 'Recommend a maintenance strategy based on condition, criticality, and operational exposure.',
  optimize_schedule: 'Optimize the schedule and explain downtime, crew, parts, and reliability tradeoffs.',
  draft_work_order: 'Draft a field-ready work order plan from this record, including scope, parts, safety checks, and acceptance criteria.',
  corrective_action: 'Draft corrective actions with owner, due date logic, evidence required, and closure criteria.',
  renewal_checklist: 'Create a permit renewal checklist with evidence, owner, timing, and regulatory risk.',
  evidence_request: 'Identify evidence gaps and draft a practical evidence request.',
  vendor_fit: 'Assess whether this crew or vendor is a good fit for assignment and identify constraints.',
  reorder: 'Recommend reorder quantity, urgency, alternatives, and operational impact of stockout.',
  criticality: 'Score criticality and explain production, safety, compliance, and downtime impact.',
  supplier_risk: 'Assess supplier risk and recommend mitigation or alternate sourcing.',
  document_review: 'Review document status, expiration risk, ownership, and required updates.',
  escalation: 'Recommend escalation path, timing, recipients, and acknowledgement expectations.',
  config_review: 'Review configuration quality, control implications, and change-management steps.',
  data_quality: 'Assess data quality and identify missing, inconsistent, or high-risk master-data fields.',
  target_variance: 'Review whether the target is realistic and identify miss risk and recovery levers.',
  handover_brief: 'Create a professional shift handover brief with open issues, safety concerns, and next-shift priorities.',
  decision_brief: 'Prepare a decision brief with recommendation, benefits, risks, and approval conditions.',
  troubleshooting: 'Recommend troubleshooting steps, likely root causes, retry plan, and escalation triggers.',
  report_brief: 'Assess report usefulness, delivery risk, audience, cadence, and improvement actions.',
  audit_review: 'Review the audit event for control risk, governance implications, and follow-up actions.',
};

router.post('/operations/:resource/:id/:action', auth, aiRateLimiter, async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const resource = OPERATION_AI_RESOURCES[req.params.resource];
    const actionInstruction = OPERATION_AI_ACTIONS[req.params.action];
    if (!resource || !actionInstruction) {
      return res.status(404).json({ error: 'Unsupported operation AI action' });
    }

    const result = await pool.query(`SELECT * FROM ${resource.table} WHERE id=$1`, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Record not found' });
    const record = result.rows[0];

    const prompt = `You are assisting an oil and gas operations team with a non-AI workflow record.

Record type: ${resource.title}
Requested action: ${actionInstruction}
Record data:
${JSON.stringify(record, null, 2)}

Return a polished professional report, not JSON.
Do not use markdown code fences.
Use clear sections with short headings and concise bullets.
Include practical recommendations that a field supervisor or operations manager can act on.
Do not claim you changed system data. If a related record should be created or updated, present it as a draft recommendation requiring user confirmation.`;

    const { content, tokensUsed, model } = await queryOpenRouter(
      prompt,
      'You are a senior oil and gas operations advisor. Return professional prose only. Never return raw JSON, code fences, or machine-readable schemas unless explicitly asked.'
    );
    await persistAiResult({
      userId: req.user.id,
      endpoint: `/ai/operations/${req.params.resource}/${req.params.action}`,
      entityTable: resource.table,
      entityId: record.id,
      result: content,
      tokensUsed,
      model,
    });
    res.json({ analysis: content, action: req.params.action, resource: req.params.resource, model });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
