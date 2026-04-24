const router = require('express').Router();
const auth = require('../middleware/auth');
const { queryOpenRouter } = require('../services/openrouter');

router.post('/analyze/wellhead', auth, async (req, res) => {
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
    const analysis = await queryOpenRouter(prompt);
    res.json({ analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/reservoir', auth, async (req, res) => {
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
    const analysis = await queryOpenRouter(prompt);
    res.json({ analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/decline-curve', auth, async (req, res) => {
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
    const analysis = await queryOpenRouter(prompt);
    res.json({ analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/equipment', auth, async (req, res) => {
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
    const analysis = await queryOpenRouter(prompt);
    res.json({ analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/environmental', auth, async (req, res) => {
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
    const analysis = await queryOpenRouter(prompt);
    res.json({ analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/forecast', auth, async (req, res) => {
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
    const analysis = await queryOpenRouter(prompt);
    res.json({ analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/performance', auth, async (req, res) => {
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
    const analysis = await queryOpenRouter(prompt);
    res.json({ analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/drilling', auth, async (req, res) => {
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
    const analysis = await queryOpenRouter(prompt);
    res.json({ analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/cost', auth, async (req, res) => {
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
    const analysis = await queryOpenRouter(prompt);
    res.json({ analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/pipeline', auth, async (req, res) => {
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
    const analysis = await queryOpenRouter(prompt);
    res.json({ analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/water', auth, async (req, res) => {
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
    const analysis = await queryOpenRouter(prompt);
    res.json({ analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/safety', auth, async (req, res) => {
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
    const analysis = await queryOpenRouter(prompt);
    res.json({ analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/analyze/gaslift', auth, async (req, res) => {
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
    const analysis = await queryOpenRouter(prompt);
    res.json({ analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
