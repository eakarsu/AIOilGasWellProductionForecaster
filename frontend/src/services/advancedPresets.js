const buildPrompt = (feature, focus, context, output) =>
  `${focus}\n\nFeature: ${feature}\nContext: ${context}\n\nReturn a professional operations report with an executive summary, key findings, risk level, recommended actions, owners, expected impact, assumptions, and follow-up questions. ${output}`;

const presets = {
  'Agentic well optimization': [
    ['Optimize wells', 'Optimize the producing wells and rank the next operational actions.', 'Wells show falling oil rate, rising water cut, intermittent pressure instability, and uneven gas-lift response across the pad.', 'Include gas-lift adjustments, surveillance checks, and production uplift estimate.'],
    ['Maintenance window', 'Recommend the best maintenance window for equipment health and uptime.', 'Pump vibration increased, separator pressure is drifting, and the crew has limited availability this week.', 'Balance downtime, reliability, safety, and lost-production cost.'],
    ['Gas lift tuning', 'Tune gas-lift parameters for stable production.', 'Injection gas is constrained and two wells are showing slugging symptoms after recent choke changes.', 'Provide target changes, monitoring signals, and rollback triggers.'],
    ['Work-order plan', 'Create a work-order plan with cost and benefit rationale.', 'The operations team needs field-ready tasks for high-priority wells and equipment exceptions.', 'Include job priority, parts, crew skills, estimated cost, benefit, and approval notes.'],
  ],
  'Cross-operator benchmarking': [
    ['Peer benchmark', 'Benchmark this operator against comparable public production data.', 'The asset team wants to understand production efficiency, lifting cost, downtime, and water-handling position versus nearby operators.', 'Highlight percentile rank and practical improvement levers.'],
    ['Cost position', 'Analyze cost position and operating efficiency gaps.', 'Lease operating expense is rising faster than production, with suspected compression and water-disposal drivers.', 'Separate controllable operating gaps from geology or facility constraints.'],
    ['Production rank', 'Rank wells by relative production performance.', 'Normalize wells by lateral length, age, choke strategy, and completion vintage before comparing performance.', 'Call out outliers, likely causes, and recommended investigations.'],
    ['Best practices', 'Identify best-practice gaps from peer operators.', 'Nearby operators show better uptime and lower intervention frequency on similar wells.', 'Recommend transferable practices and data needed to validate them.'],
  ],
  'Decline curve ensemble modeling': [
    ['Compare models', 'Compare Arps, hyperbolic, exponential, and logistic decline models.', 'Production history includes early flush production, a recent workover, and variable downtime that may bias curve fitting.', 'Explain which model should carry the most weight and why.'],
    ['Forecast variance', 'Explain forecast variance across decline models.', 'The reserve forecast has wide P10/P50/P90 spread and management needs a defensible production outlook.', 'Identify uncertainty drivers and confidence level.'],
    ['Model weights', 'Recommend ensemble model weights by well type.', 'Historical accuracy differs between conventional, shale, and artificial-lift wells in the portfolio.', 'Provide model weights, validation checks, and when to retrain.'],
    ['Reserve outlook', 'Prepare a reserve and cash-flow outlook from decline behavior.', 'The planning team needs expected volumes, risk bands, and operating triggers for the next 12 months.', 'Include forecast risks, assumptions, and decision points.'],
  ],
  'Environmental compliance assistant': [
    ['Permit review', 'Review environmental compliance risk for the selected facility.', 'Equipment is approaching permitted emissions limits and state reporting deadlines are near.', 'Prioritize compliance actions, documentation needs, and cost estimates.'],
    ['Emission event', 'Assess an emissions excursion and response plan.', 'A compressor upset caused elevated emissions for several hours and the team needs reporting guidance.', 'Include likely severity, notifications, corrective actions, and prevention steps.'],
    ['Inspection prep', 'Prepare for an environmental inspection.', 'Inspectors requested operating logs, maintenance records, LDAR evidence, and spill-prevention documentation.', 'Provide a checklist, gaps, and owner assignments.'],
    ['Cost controls', 'Suggest optimization measures to reduce compliance cost.', 'The facility must reduce emissions while maintaining production and avoiding unnecessary capital spend.', 'Rank measures by cost, impact, implementation effort, and compliance benefit.'],
  ],
  'Sensor anomaly streaming': [
    ['Pressure drop', 'Triage a sudden pressure drop from streaming sensor data.', 'Tubing pressure fell quickly while flow rate and vibration changed at the same time.', 'Differentiate blockage, leak, valve failure, and sensor fault.'],
    ['Valve failure', 'Evaluate whether the anomaly indicates valve failure.', 'Valve position feedback is inconsistent with pressure response and alarms are repeating every few minutes.', 'Recommend verification steps and urgent field actions.'],
    ['Streaming triage', 'Create a streaming anomaly triage workflow.', 'Operations wants real-time alert routing that avoids noise but catches production-impacting failures.', 'Define severity rules, thresholds, routing, and escalation timing.'],
    ['Root cause', 'Perform root-cause analysis for correlated sensor anomalies.', 'Pressure, temperature, vibration, and rate readings changed within the same operating window.', 'Provide likely causes, evidence, confidence, and data gaps.'],
  ],
  "Equipment maintenance without '/optimal": [
    ['Maintenance timing', 'Find the best maintenance timing for the equipment set.', 'Failures are rising but taking equipment offline now will reduce production during a high-price period.', 'Balance uptime, reliability, safety, and cost.'],
    ['Failure risk', 'Assess near-term equipment failure risk.', 'Pump run hours, vibration, temperature, and prior work orders suggest increasing failure probability.', 'Rank assets by urgency and recommended action.'],
    ['Parts plan', 'Plan parts and crew needs for maintenance.', 'The field team has limited spares and two critical jobs may compete for the same specialist crew.', 'Include parts, labor, schedule constraints, and contingency plan.'],
    ['Uptime tradeoff', 'Explain uptime versus reliability tradeoffs.', 'Management wants to defer maintenance, but operations sees warning signs on critical equipment.', 'Quantify risk, decision options, and approval recommendation.'],
  ],
  'Limited multi': [
    ['Portfolio rank', 'Rank wells across the portfolio for action.', 'The team needs to compare wells by production, decline, downtime, LOE, water cut, and intervention potential.', 'Provide ranked priorities and expected impact.'],
    ['Cross-well gaps', 'Find cross-well performance gaps and outliers.', 'Several wells underperform nearby peers despite similar completion design and operating conditions.', 'Explain likely causes and next diagnostics.'],
    ['Capital allocation', 'Recommend capital allocation across wells.', 'Budget is limited and must be split between workovers, artificial-lift tuning, facility fixes, and surveillance.', 'Include ROI, risk, and sequencing.'],
    ['Exception queue', 'Create an exception queue for asset managers.', 'Leadership wants a short list of wells requiring human review this week.', 'Include trigger reason, severity, and owner.'],
  ],
  "Production history logged but no '/production": [
    ['Anomaly review', 'Detect production anomalies from logged history.', 'Daily oil, gas, water, pressure, and downtime records show sudden shifts after normal operations.', 'Flag anomalies, likely causes, and verification steps.'],
    ['Data quality', 'Audit production-history data quality.', 'Some wells have missing readings, duplicated dates, and suspicious zero-production entries.', 'Separate operational events from data-entry issues.'],
    ['Backfill plan', 'Create a backfill and reconciliation plan.', 'Accounting, field tickets, and SCADA exports do not reconcile with production history.', 'Provide sources, checks, and correction workflow.'],
    ['Flow change', 'Explain sudden flow and pressure changes.', 'Production fell while pressure behavior changed across multiple consecutive readings.', 'Recommend diagnostics and response priority.'],
  ],
  "Pipeline monitoring without '/pipeline": [
    ['Leak triage', 'Predict whether pressure-drop patterns indicate rupture risk.', 'Pipeline pressure declined quickly with abnormal flow imbalance and downstream delivery variance.', 'Classify rupture, leak, blockage, sensor issue, or operating change.'],
    ['Integrity plan', 'Create a pipeline integrity response plan.', 'A segment has recurring pressure excursions, corrosion flags, and delayed inspection history.', 'Include inspection priority, isolation steps, and safety controls.'],
    ['Pressure trend', 'Analyze pipeline pressure trend anomalies.', 'Pressure, temperature, and flow readings are drifting outside normal envelope during high throughput.', 'Identify trend severity and next checks.'],
    ['Alert rules', 'Design pipeline alert rules and escalation paths.', 'Operations needs fewer false alarms while preserving rapid response for rupture indicators.', 'Define thresholds, evidence requirements, and notification flow.'],
  ],
  "Safety incidents without '/near": [
    ['Near-miss score', 'Score near-miss severity and escalation risk.', 'A field event had no injury but involved pressure release, incomplete permit steps, and contractor exposure.', 'Provide severity, recurrence risk, and required controls.'],
    ['Crew risk', 'Assess crew-level safety risk patterns.', 'Incidents cluster around shift changes, hot work, and simultaneous operations.', 'Recommend controls, training, and supervisor actions.'],
    ['Control plan', 'Build a corrective action and control plan.', 'Recent safety events point to gaps in hazard recognition and verification before work starts.', 'Assign actions, due dates, and evidence needed for closure.'],
    ['Executive safety', 'Prepare a safety review for leadership.', 'Leadership needs a concise view of high-risk events, control failures, and near-term prevention priorities.', 'Include decisions needed and residual risk.'],
  ],
  'No integration with geological/petrophysical databases': [
    ['Integration map', 'Map geology and petrophysics integration requirements.', 'Production models are disconnected from logs, core data, completions, structure, and reservoir properties.', 'Identify data sources, joins, and priority integrations.'],
    ['Reservoir link', 'Explain how reservoir context changes production interpretation.', 'Wells with similar operations show different decline behavior due to formation and completion variation.', 'Include petrophysical drivers and data gaps.'],
    ['Data gaps', 'Audit missing geological inputs for forecasting.', 'The forecast lacks porosity, permeability, pressure, saturation, and landing-zone context.', 'Rank missing inputs by forecast impact.'],
    ['Model enrichment', 'Recommend model enrichment using subsurface data.', 'The AI forecast should account for reservoir quality and completion design instead of production history only.', 'Describe features, validation, and implementation steps.'],
  ],
  'No asset lifecycle tracking (equipment purchase, installation, decommission dates)': [
    ['Lifecycle register', 'Create an asset lifecycle register plan.', 'Equipment records lack purchase date, installation date, service history, and expected decommission date.', 'Define required fields, ownership, and cleanup workflow.'],
    ['Replacement plan', 'Recommend replacement timing for critical assets.', 'Several pumps, compressors, and valves are aging without a clear replacement forecast.', 'Rank replacement candidates by risk and business impact.'],
    ['Decommission risk', 'Assess decommission and retirement risk.', 'Assets may remain in service beyond expected life with incomplete inspection and maintenance history.', 'Identify compliance, safety, and cost exposure.'],
    ['Cost exposure', 'Estimate lifecycle cost exposure.', 'Finance needs asset-level lifecycle cost, remaining useful life, and capital forecast inputs.', 'Provide assumptions and data needed.'],
  ],
  'No mobile/field': [
    ['Offline workflow', 'Design an offline field workflow for operators.', 'Crews work in low-connectivity areas and need to capture readings, photos, notes, and work status.', 'Include sync rules, conflict handling, and required fields.'],
    ['Field capture', 'Improve field data capture quality.', 'Manual entry causes late notes, missing readings, and inconsistent equipment identifiers.', 'Recommend forms, validation, and operator experience changes.'],
    ['Sync conflicts', 'Resolve mobile sync conflict scenarios.', 'Multiple field users may edit the same well note, work order, or inspection record before reconnecting.', 'Define merge rules and audit trail behavior.'],
    ['Rollout plan', 'Prepare a mobile rollout plan for field teams.', 'Operations wants adoption without slowing daily rounds or creating duplicate entry.', 'Include phases, training, metrics, and risks.'],
  ],
  'No preventive maintenance scheduling': [
    ['PM schedule', 'Create a preventive maintenance schedule.', 'Assets need interval-based and condition-based maintenance rules tied to operating hours, vibration, pressure, and criticality.', 'Provide schedule, priorities, and owners.'],
    ['Backlog risk', 'Assess preventive-maintenance backlog risk.', 'Deferred work orders are accumulating and critical equipment has unclear next service dates.', 'Rank backlog by safety, production, and reliability risk.'],
    ['Crew capacity', 'Plan PM workload against crew capacity.', 'The maintenance team must schedule recurring work while preserving emergency response capacity.', 'Include weekly load, conflicts, and escalation rules.'],
    ['Reliability plan', 'Build a reliability improvement plan.', 'Recurring failures suggest PM intervals and inspection tasks are not aligned to actual failure modes.', 'Recommend changes and success metrics.'],
  ],
  'No RBAC beyond auth': [
    ['Role matrix', 'Design a role-based access matrix.', 'Users include admins, engineers, operators, finance, contractors, and read-only executives.', 'Map permissions by module, action, and data sensitivity.'],
    ['Access audit', 'Audit access-control risk.', 'Authentication exists but feature-level permissions and sensitive operations are not restricted enough.', 'Identify exposure, priority fixes, and audit evidence.'],
    ['Segregation risk', 'Assess segregation-of-duties risk.', 'The same user may create, approve, and delete operational or financial records.', 'Recommend approval controls and privileged-action rules.'],
    ['Approval model', 'Define approval workflows for high-risk actions.', 'Deletes, exports, AI-generated work orders, and compliance changes need stronger governance.', 'Specify roles, approval steps, and logging.'],
  ],
  'No real': [
    ['Realtime design', 'Design real-time SCADA/IIoT integration.', 'The app currently relies on manual data entry and delayed imports for production and equipment signals.', 'Define data flow, polling/streaming choice, and reliability needs.'],
    ['Streaming alerts', 'Create a real-time alerting model.', 'Operations wants immediate alerts for pressure drops, high vibration, compressor trips, and production losses.', 'Include thresholds, routing, and false-positive controls.'],
    ['Latency risk', 'Assess operational risk from delayed data.', 'Manual data entry means anomalies can be discovered hours or days after the event.', 'Quantify impacts and mitigation steps.'],
    ['Ops dashboard', 'Specify a live operations dashboard.', 'Supervisors need current well status, alarms, active work, and production variance in one view.', 'Define widgets, refresh cadence, and drilldowns.'],
  ],
  'No webhooks for alert delivery (PagerDuty/Slack)': [
    ['Slack/PagerDuty', 'Design alert webhooks for Slack and PagerDuty.', 'Critical alerts must route to the right on-call users with context and acknowledgement tracking.', 'Define payloads, severity mapping, and retry rules.'],
    ['Escalation rules', 'Create alert escalation rules.', 'Unacknowledged alerts should escalate from field operator to supervisor to asset manager.', 'Include timing, ownership, and quiet-hour behavior.'],
    ['Delivery audit', 'Audit alert delivery and acknowledgement.', 'Management needs proof that critical alerts were sent, received, acknowledged, and resolved.', 'Define audit records and reporting fields.'],
    ['Failure handling', 'Plan webhook failure handling.', 'External notification systems can fail or rate-limit requests during incidents.', 'Recommend retries, fallbacks, and monitoring.'],
  ],
};

const fallbackPresets = (feature, description) => [
  ['Operational review', 'Review this workflow for operational impact.', description || 'The team needs a practical assessment for field operations and production reliability.', 'Focus on actionable recommendations.'],
  ['Risk triage', 'Triage the highest risks in this workflow.', description || 'The workflow may affect production, safety, compliance, cost, or data quality.', 'Rank risks by severity and urgency.'],
  ['Action plan', 'Create an implementation action plan.', description || 'The team needs the next practical steps to improve the workflow.', 'Include owners, sequence, and validation checks.'],
  ['Executive brief', 'Prepare an executive brief.', description || 'Leadership needs a concise view of value, risk, and decisions required.', 'Include business impact and decisions needed.'],
];

export const ADVANCED_TOOLS = [
  {
    id: 'agentic-well-optimization',
    title: 'Agentic well optimization',
    description: 'Continuously monitor production, equipment health, gas lift, maintenance windows, and work-order economics.',
    category: 'Production Intelligence',
    endpoint: '/api/cf-agentic-well-optimization/run',
  },
  {
    id: 'decline-curve-ensemble-modeling',
    title: 'Decline curve ensemble modeling',
    description: 'Compare decline models, weight forecasts by historical accuracy, and explain reserve uncertainty.',
    category: 'Production Intelligence',
    endpoint: '/api/cf-decline-curve-ensemble-modeling/run',
  },
  {
    id: 'cross-operator-benchmarking',
    title: 'Cross-operator benchmarking',
    description: 'Benchmark wells against peer operators by efficiency, uptime, cost, and production performance.',
    category: 'Production Intelligence',
    endpoint: '/api/cf-cross-operator-benchmarking/run',
  },
  {
    id: 'limited-multi',
    title: 'Multi-well portfolio optimization',
    presetKey: 'Limited multi',
    description: 'Rank multi-well portfolios, identify cross-well outliers, and optimize capital allocation.',
    category: 'Production Intelligence',
    endpoint: '/api/gap-limited-multi/run',
  },
  {
    id: 'production-history-reconciliation',
    title: 'Production anomaly detection',
    presetKey: "Production history logged but no '/production",
    description: 'Detect production anomalies, reconcile missing readings, and separate data-quality issues from operational events.',
    category: 'Production Intelligence',
    endpoint: '/api/gap-production-history-logged-but-no-production/run',
  },
  {
    id: 'sensor-anomaly-streaming',
    title: 'Sensor anomaly streaming',
    description: 'Triage pressure, temperature, vibration, and rate anomalies from near-real-time sensor signals.',
    category: 'Reliability & Safety',
    endpoint: '/api/cf-sensor-anomaly-streaming/run',
  },
  {
    id: 'pipeline-coverage',
    title: 'Pipeline rupture prediction',
    presetKey: "Pipeline monitoring without '/pipeline",
    description: 'Analyze pressure-drop patterns, rupture risk, integrity response, and alert thresholds.',
    category: 'Reliability & Safety',
    endpoint: '/api/gap-pipeline-monitoring-without-pipeline/run',
  },
  {
    id: 'maintenance-optimization',
    title: 'Optimal maintenance window',
    presetKey: "Equipment maintenance without '/optimal",
    description: 'Balance uptime, reliability, crew capacity, parts availability, and maintenance timing.',
    category: 'Reliability & Safety',
    endpoint: '/api/gap-equipment-maintenance-without-optimal/run',
  },
  {
    id: 'preventive-maintenance',
    title: 'No preventive maintenance scheduling',
    description: 'Build preventive-maintenance schedules, backlog risk views, crew plans, and reliability improvements.',
    category: 'Reliability & Safety',
    endpoint: '/api/gap-no-preventive-maintenance-scheduling/run',
  },
  {
    id: 'safety-near-miss',
    title: 'Near-miss severity prediction',
    presetKey: "Safety incidents without '/near",
    description: 'Score near-miss severity, crew risk patterns, corrective actions, and leadership safety reviews.',
    category: 'Reliability & Safety',
    endpoint: '/api/gap-safety-incidents-without-near/run',
  },
  {
    id: 'environmental-compliance-assistant',
    title: 'Environmental compliance assistant',
    description: 'Review permit risk, emissions events, inspection readiness, and compliance-cost controls.',
    category: 'Reliability & Safety',
    endpoint: '/api/cf-environmental-compliance-assistant/run',
  },
  {
    id: 'realtime-operations',
    title: 'Real-time SCADA and IIoT integration',
    presetKey: 'No real',
    description: 'Design SCADA/IIoT data flow, live alerting, latency controls, and operations dashboards.',
    category: 'Data & Automation',
    endpoint: '/api/gap-no-real/run',
  },
  {
    id: 'geo-petrophysics-integration',
    title: 'Geology and petrophysics integration',
    presetKey: 'No integration with geological/petrophysical databases',
    description: 'Connect production models with logs, reservoir properties, completion data, and subsurface context.',
    category: 'Data & Automation',
    endpoint: '/api/gap-no-integration-with-geological-petrophysical-datab/run',
  },
  {
    id: 'asset-lifecycle',
    title: 'Asset lifecycle tracking',
    presetKey: 'No asset lifecycle tracking (equipment purchase, installation, decommission dates)',
    description: 'Track equipment lifecycle, replacement timing, decommission risk, and capital exposure.',
    category: 'Data & Automation',
    endpoint: '/api/gap-no-asset-lifecycle-tracking-equipment-purchase-ins/run',
  },
  {
    id: 'alert-webhooks',
    title: 'Alert delivery webhooks',
    presetKey: 'No webhooks for alert delivery (PagerDuty/Slack)',
    description: 'Design alert routing, escalation rules, delivery audit, webhook retries, and failover behavior.',
    category: 'Data & Automation',
    endpoint: '/api/gap-no-webhooks-for-alert-delivery-pagerduty-slack/run',
  },
  {
    id: 'mobile-field',
    title: 'Mobile field operations',
    presetKey: 'No mobile/field',
    description: 'Define offline field workflows, capture validation, sync conflict rules, and rollout plans.',
    category: 'Field Operations',
    endpoint: '/api/gap-no-mobile-field/run',
  },
  {
    id: 'rbac-controls',
    title: 'RBAC and approval controls',
    presetKey: 'No RBAC beyond auth',
    description: 'Design role-based permissions, access audits, segregation controls, and approval workflows.',
    category: 'Governance',
    endpoint: '/api/gap-no-rbac-beyond-auth/run',
  },
];

export function getAdvancedPresets(feature, description = '', displayName = feature) {
  const rows = presets[feature] || fallbackPresets(feature, description);
  return rows.map(([label, focus, context, output]) => ({
    label,
    value: buildPrompt(displayName, focus, context, output),
  }));
}
