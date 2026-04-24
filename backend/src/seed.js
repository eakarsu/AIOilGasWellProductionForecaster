require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'oilgas_forecaster',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function seed() {
  console.log('Creating tables...');

  await pool.query(`
    DROP TABLE IF EXISTS users, wellhead_analytics, reservoir_simulation, decline_curves,
    equipment_failure, environmental_compliance, production_forecasting, well_performance,
    drilling_operations, cost_analysis, pipeline_monitoring, water_management,
    safety_incidents, gas_lift_optimization, alerts, field_notes CASCADE;

    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE wellhead_analytics (
      id SERIAL PRIMARY KEY,
      well_name VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      latitude DECIMAL(10,6),
      longitude DECIMAL(10,6),
      well_type VARCHAR(100),
      status VARCHAR(50),
      pressure_psi DECIMAL(10,2),
      temperature_f DECIMAL(10,2),
      flow_rate_bpd DECIMAL(10,2),
      gas_oil_ratio DECIMAL(10,2),
      water_cut_pct DECIMAL(5,2),
      choke_size VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE reservoir_simulation (
      id SERIAL PRIMARY KEY,
      reservoir_name VARCHAR(255) NOT NULL,
      field_name VARCHAR(255),
      depth_ft DECIMAL(10,2),
      porosity_pct DECIMAL(5,2),
      permeability_md DECIMAL(10,2),
      fluid_type VARCHAR(100),
      reservoir_pressure_psi DECIMAL(10,2),
      temperature_f DECIMAL(10,2),
      oil_saturation_pct DECIMAL(5,2),
      gas_saturation_pct DECIMAL(5,2),
      water_saturation_pct DECIMAL(5,2),
      recovery_factor_pct DECIMAL(5,2),
      simulation_model VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE decline_curves (
      id SERIAL PRIMARY KEY,
      well_name VARCHAR(255) NOT NULL,
      field_name VARCHAR(255),
      initial_rate_bpd DECIMAL(10,2),
      current_rate_bpd DECIMAL(10,2),
      decline_rate_pct DECIMAL(5,2),
      decline_type VARCHAR(50),
      b_factor DECIMAL(5,3),
      economic_limit_bpd DECIMAL(10,2),
      estimated_reserves_bbl DECIMAL(15,2),
      production_start_date DATE,
      time_to_abandonment_months INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE equipment_failure (
      id SERIAL PRIMARY KEY,
      equipment_name VARCHAR(255) NOT NULL,
      equipment_type VARCHAR(100),
      well_name VARCHAR(255),
      manufacturer VARCHAR(255),
      install_date DATE,
      last_maintenance_date DATE,
      operating_hours INTEGER,
      health_score DECIMAL(5,2),
      failure_probability_pct DECIMAL(5,2),
      vibration_level VARCHAR(50),
      temperature_f DECIMAL(10,2),
      status VARCHAR(50),
      next_maintenance_date DATE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE environmental_compliance (
      id SERIAL PRIMARY KEY,
      well_name VARCHAR(255) NOT NULL,
      site_name VARCHAR(255),
      emission_type VARCHAR(100),
      emission_level DECIMAL(10,4),
      emission_unit VARCHAR(50),
      regulatory_threshold DECIMAL(10,4),
      compliance_status VARCHAR(50),
      inspection_date DATE,
      inspector_name VARCHAR(255),
      corrective_action TEXT,
      penalty_amount DECIMAL(12,2),
      next_inspection_date DATE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE production_forecasting (
      id SERIAL PRIMARY KEY,
      well_name VARCHAR(255) NOT NULL,
      field_name VARCHAR(255),
      current_rate_bpd DECIMAL(10,2),
      forecast_period_months INTEGER,
      predicted_rate_bpd DECIMAL(10,2),
      predicted_cumulative_bbl DECIMAL(15,2),
      confidence_pct DECIMAL(5,2),
      forecast_method VARCHAR(100),
      oil_price_usd DECIMAL(10,2),
      estimated_revenue_usd DECIMAL(15,2),
      risk_factor VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE well_performance (
      id SERIAL PRIMARY KEY,
      well_name VARCHAR(255) NOT NULL,
      field_name VARCHAR(255),
      oil_rate_bpd DECIMAL(10,2),
      gas_rate_mcfd DECIMAL(10,2),
      water_rate_bpd DECIMAL(10,2),
      water_cut_pct DECIMAL(5,2),
      gas_oil_ratio DECIMAL(10,2),
      bottom_hole_pressure_psi DECIMAL(10,2),
      tubing_pressure_psi DECIMAL(10,2),
      casing_pressure_psi DECIMAL(10,2),
      uptime_pct DECIMAL(5,2),
      efficiency_pct DECIMAL(5,2),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE drilling_operations (
      id SERIAL PRIMARY KEY,
      well_name VARCHAR(255) NOT NULL,
      rig_name VARCHAR(255),
      operator VARCHAR(255),
      field_name VARCHAR(255),
      spud_date DATE,
      current_depth_ft DECIMAL(10,2),
      target_depth_ft DECIMAL(10,2),
      rop_ft_hr DECIMAL(10,2),
      wob_klb DECIMAL(10,2),
      torque_ft_lb DECIMAL(10,2),
      rpm INTEGER,
      mud_weight_ppg DECIMAL(5,2),
      mud_type VARCHAR(100),
      bit_type VARCHAR(100),
      bit_size_in DECIMAL(5,2),
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE cost_analysis (
      id SERIAL PRIMARY KEY,
      well_name VARCHAR(255) NOT NULL,
      field_name VARCHAR(255),
      capex_usd DECIMAL(15,2),
      opex_monthly_usd DECIMAL(12,2),
      drilling_cost_usd DECIMAL(15,2),
      completion_cost_usd DECIMAL(15,2),
      npv_usd DECIMAL(15,2),
      irr_pct DECIMAL(5,2),
      payback_months INTEGER,
      breakeven_price_usd DECIMAL(10,2),
      oil_price_usd DECIMAL(10,2),
      production_rate_bpd DECIMAL(10,2),
      operating_margin_pct DECIMAL(5,2),
      project_status VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE pipeline_monitoring (
      id SERIAL PRIMARY KEY,
      pipeline_name VARCHAR(255) NOT NULL,
      segment_id VARCHAR(100),
      origin VARCHAR(255),
      destination VARCHAR(255),
      length_miles DECIMAL(10,2),
      diameter_in DECIMAL(5,2),
      material VARCHAR(100),
      max_pressure_psi DECIMAL(10,2),
      current_pressure_psi DECIMAL(10,2),
      flow_rate_bpd DECIMAL(10,2),
      fluid_type VARCHAR(100),
      wall_thickness_in DECIMAL(5,3),
      corrosion_rate_mpy DECIMAL(5,2),
      last_inspection_date DATE,
      integrity_status VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE water_management (
      id SERIAL PRIMARY KEY,
      well_name VARCHAR(255) NOT NULL,
      field_name VARCHAR(255),
      produced_water_bpd DECIMAL(10,2),
      injected_water_bpd DECIMAL(10,2),
      disposal_method VARCHAR(100),
      treatment_type VARCHAR(100),
      tds_ppm DECIMAL(12,2),
      ph_level DECIMAL(4,2),
      oil_in_water_ppm DECIMAL(10,2),
      disposal_well_name VARCHAR(255),
      injection_pressure_psi DECIMAL(10,2),
      water_source VARCHAR(100),
      recycled_pct DECIMAL(5,2),
      cost_per_bbl_usd DECIMAL(10,2),
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE safety_incidents (
      id SERIAL PRIMARY KEY,
      incident_title VARCHAR(255) NOT NULL,
      site_name VARCHAR(255),
      well_name VARCHAR(255),
      incident_date DATE,
      incident_type VARCHAR(100),
      severity VARCHAR(50),
      description TEXT,
      root_cause TEXT,
      corrective_action TEXT,
      injuries_count INTEGER DEFAULT 0,
      days_lost INTEGER DEFAULT 0,
      reported_by VARCHAR(255),
      investigation_status VARCHAR(50),
      osha_recordable VARCHAR(10),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE gas_lift_optimization (
      id SERIAL PRIMARY KEY,
      well_name VARCHAR(255) NOT NULL,
      field_name VARCHAR(255),
      injection_rate_mcfd DECIMAL(10,2),
      injection_pressure_psi DECIMAL(10,2),
      oil_rate_before_bpd DECIMAL(10,2),
      oil_rate_after_bpd DECIMAL(10,2),
      gas_source VARCHAR(100),
      valve_count INTEGER,
      deepest_valve_depth_ft DECIMAL(10,2),
      casing_pressure_psi DECIMAL(10,2),
      tubing_pressure_psi DECIMAL(10,2),
      glr_scf_bbl DECIMAL(10,2),
      optimization_status VARCHAR(50),
      cost_per_mcf_usd DECIMAL(10,2),
      incremental_revenue_usd DECIMAL(12,2),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE alerts (
      id SERIAL PRIMARY KEY,
      alert_name VARCHAR(255) NOT NULL,
      table_name VARCHAR(100) NOT NULL,
      field_name VARCHAR(100) NOT NULL,
      operator VARCHAR(10) NOT NULL,
      threshold_value DECIMAL(15,4) NOT NULL,
      severity VARCHAR(50) DEFAULT 'Medium',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE field_notes (
      id SERIAL PRIMARY KEY,
      well_name VARCHAR(255) NOT NULL,
      note_type VARCHAR(50) DEFAULT 'General',
      title VARCHAR(255) NOT NULL,
      content TEXT,
      author VARCHAR(255),
      priority VARCHAR(50) DEFAULT 'Low',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log('Seeding users...');
  const passwordHash = await bcrypt.hash(process.env.DEFAULT_PASSWORD || 'admin123', 10);
  await pool.query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)',
    [process.env.DEFAULT_EMAIL || 'admin@oilgas.com', passwordHash, 'Admin User']
  );

  console.log('Seeding wellhead analytics (15 records)...');
  const wellheadData = [
    ['Eagle Ford Well A-1', 'Permian Basin, TX', 31.9686, -102.0779, 'Horizontal', 'Active', 2450, 185, 850, 1200, 15.5, '32/64'],
    ['Bakken Well B-3', 'Williston Basin, ND', 48.1470, -103.6180, 'Horizontal', 'Active', 3200, 210, 620, 980, 22.3, '24/64'],
    ['Marcellus Well C-7', 'Appalachian Basin, PA', 41.2033, -77.1945, 'Vertical', 'Active', 1800, 165, 380, 2500, 8.2, '48/64'],
    ['Haynesville Well D-2', 'East Texas Basin, LA', 32.5252, -93.7502, 'Horizontal', 'Shut-in', 4100, 290, 0, 3200, 5.1, '16/64'],
    ['Spraberry Well E-5', 'Midland Basin, TX', 32.0036, -102.0990, 'Vertical', 'Active', 1950, 175, 520, 850, 35.0, '28/64'],
    ['Wolfcamp Well F-1', 'Delaware Basin, TX', 31.7619, -104.0219, 'Horizontal', 'Active', 3600, 225, 1100, 1450, 18.7, '40/64'],
    ['Niobrara Well G-4', 'Denver Basin, CO', 40.0150, -104.7703, 'Horizontal', 'Active', 2100, 195, 450, 1100, 28.5, '20/64'],
    ['Barnett Well H-2', 'Fort Worth Basin, TX', 32.7555, -97.3308, 'Vertical', 'Inactive', 1400, 155, 180, 3800, 42.0, '12/64'],
    ['Woodford Well I-6', 'Anadarko Basin, OK', 35.0078, -97.0929, 'Horizontal', 'Active', 2800, 200, 720, 1800, 12.4, '36/64'],
    ['Austin Chalk Well J-1', 'Gulf Coast, TX', 29.7604, -95.3698, 'Directional', 'Active', 3100, 240, 950, 900, 20.1, '44/64'],
    ['Tuscaloosa Marine Well K-3', 'Mississippi Salt Basin, LA', 30.4515, -91.1871, 'Horizontal', 'Active', 4500, 310, 280, 650, 8.9, '24/64'],
    ['Monterey Well L-2', 'San Joaquin Basin, CA', 35.3733, -119.0187, 'Vertical', 'Active', 1650, 170, 340, 750, 55.0, '20/64'],
    ['Bone Spring Well M-4', 'Delaware Basin, NM', 32.3199, -104.2286, 'Horizontal', 'Active', 2900, 215, 780, 1300, 16.3, '32/64'],
    ['Utica Well N-1', 'Appalachian Basin, OH', 40.4173, -82.9071, 'Horizontal', 'Active', 3400, 250, 550, 4200, 6.5, '28/64'],
    ['SCOOP Well O-5', 'Anadarko Basin, OK', 34.8006, -97.4353, 'Horizontal', 'Active', 2650, 205, 680, 1650, 14.8, '36/64']
  ];
  for (const w of wellheadData) {
    await pool.query(
      'INSERT INTO wellhead_analytics (well_name, location, latitude, longitude, well_type, status, pressure_psi, temperature_f, flow_rate_bpd, gas_oil_ratio, water_cut_pct, choke_size) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
      w
    );
  }

  console.log('Seeding reservoir simulation (15 records)...');
  const reservoirData = [
    ['Permian Wolfcamp A', 'Spraberry-Wolfcamp', 8500, 8.2, 0.15, 'Black Oil', 4200, 180, 62, 8, 30, 12.5, 'Black Oil'],
    ['Bakken Middle', 'Williston Basin', 10200, 6.5, 0.02, 'Volatile Oil', 5800, 240, 58, 12, 30, 8.3, 'Compositional'],
    ['Eagle Ford Condensate', 'Eagle Ford Shale', 11500, 10.1, 0.08, 'Gas Condensate', 6200, 280, 35, 25, 40, 15.2, 'Compositional'],
    ['Marcellus Dry Gas', 'Appalachian', 7800, 7.5, 0.001, 'Dry Gas', 3800, 170, 5, 85, 10, 72.0, 'Dual Porosity'],
    ['Delaware Bone Spring', 'Delaware Basin', 9200, 12.3, 0.5, 'Black Oil', 4800, 195, 55, 10, 35, 18.7, 'Black Oil'],
    ['Haynesville Deep', 'East Texas', 13500, 5.8, 0.03, 'Dry Gas', 9200, 340, 3, 92, 5, 65.0, 'Compositional'],
    ['Niobrara B Bench', 'DJ Basin', 7200, 9.5, 0.1, 'Light Oil', 3500, 165, 68, 5, 27, 14.1, 'Black Oil'],
    ['Woodford Shale', 'Anadarko Basin', 12000, 4.2, 0.005, 'Gas Condensate', 7500, 260, 28, 42, 30, 22.5, 'Dual Porosity'],
    ['Austin Chalk Upper', 'Gulf Coast', 8800, 15.0, 2.5, 'Black Oil', 4100, 185, 70, 5, 25, 25.3, 'Black Oil'],
    ['Tuscaloosa Marine', 'MS Salt Basin', 14000, 18.5, 150.0, 'Black Oil', 10500, 330, 72, 3, 25, 32.0, 'Black Oil'],
    ['Monterey Shale', 'San Joaquin', 5500, 11.0, 0.08, 'Heavy Oil', 2200, 140, 78, 2, 20, 8.5, 'Thermal'],
    ['Utica Point Pleasant', 'Appalachian', 9500, 5.0, 0.01, 'Wet Gas', 5200, 210, 15, 60, 25, 45.0, 'Compositional'],
    ['SCOOP Woodford', 'Anadarko', 11800, 7.8, 0.04, 'Volatile Oil', 6800, 255, 48, 18, 34, 16.8, 'Compositional'],
    ['Vaca Muerta', 'Neuquen Basin', 9800, 9.0, 0.2, 'Black Oil', 5500, 220, 60, 8, 32, 20.0, 'Black Oil'],
    ['Duvernay Shale', 'Western Canadian', 11000, 6.2, 0.015, 'Gas Condensate', 7800, 275, 30, 35, 35, 28.5, 'Compositional']
  ];
  for (const r of reservoirData) {
    await pool.query(
      'INSERT INTO reservoir_simulation (reservoir_name, field_name, depth_ft, porosity_pct, permeability_md, fluid_type, reservoir_pressure_psi, temperature_f, oil_saturation_pct, gas_saturation_pct, water_saturation_pct, recovery_factor_pct, simulation_model) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
      r
    );
  }

  console.log('Seeding decline curves (15 records)...');
  const declineData = [
    ['PB-001', 'Permian Basin', 1200, 850, 8.5, 'Hyperbolic', 0.85, 25, 2500000, '2019-03-15', 96],
    ['WB-003', 'Williston Basin', 980, 620, 12.0, 'Exponential', 0, 20, 1800000, '2018-07-22', 72],
    ['EF-007', 'Eagle Ford', 1500, 950, 6.2, 'Hyperbolic', 0.65, 30, 3200000, '2020-01-10', 120],
    ['MC-012', 'Marcellus', 650, 380, 15.5, 'Harmonic', 1.0, 15, 980000, '2017-11-05', 48],
    ['HV-002', 'Haynesville', 800, 0, 20.0, 'Exponential', 0, 10, 450000, '2016-05-18', 12],
    ['DB-005', 'Delaware Basin', 1400, 1100, 5.8, 'Hyperbolic', 0.75, 35, 4100000, '2021-04-20', 144],
    ['NB-004', 'Niobrara', 720, 450, 10.3, 'Hyperbolic', 0.90, 20, 1500000, '2019-09-12', 84],
    ['BN-008', 'Barnett', 550, 180, 18.0, 'Exponential', 0, 10, 320000, '2015-02-28', 18],
    ['WF-006', 'Woodford', 1050, 720, 7.8, 'Hyperbolic', 0.70, 25, 2100000, '2020-06-15', 108],
    ['AC-011', 'Austin Chalk', 1350, 950, 5.5, 'Harmonic', 1.0, 30, 3800000, '2021-08-01', 132],
    ['TM-009', 'Tuscaloosa Marine', 480, 280, 11.2, 'Hyperbolic', 0.55, 15, 1100000, '2018-12-10', 60],
    ['MY-010', 'Monterey', 580, 340, 9.0, 'Exponential', 0, 15, 850000, '2017-04-22', 36],
    ['BS-013', 'Bone Spring', 1100, 780, 7.2, 'Hyperbolic', 0.80, 25, 2800000, '2020-11-08', 102],
    ['UT-014', 'Utica', 900, 550, 9.8, 'Hyperbolic', 0.60, 20, 1650000, '2019-01-30', 78],
    ['SK-015', 'SCOOP', 1000, 680, 8.0, 'Hyperbolic', 0.72, 25, 2300000, '2020-03-25', 96]
  ];
  for (const d of declineData) {
    await pool.query(
      'INSERT INTO decline_curves (well_name, field_name, initial_rate_bpd, current_rate_bpd, decline_rate_pct, decline_type, b_factor, economic_limit_bpd, estimated_reserves_bbl, production_start_date, time_to_abandonment_months) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      d
    );
  }

  console.log('Seeding equipment failure prediction (15 records)...');
  const equipmentData = [
    ['ESP-PB-001', 'Electric Submersible Pump', 'Eagle Ford A-1', 'Schlumberger', '2021-03-15', '2024-08-20', 18500, 82, 15, 'Low', 185, 'Operational', '2025-02-20'],
    ['SRP-WB-003', 'Sucker Rod Pump', 'Bakken B-3', 'Weatherford', '2019-07-10', '2024-06-15', 32000, 65, 35, 'Medium', 155, 'Warning', '2024-12-15'],
    ['PCP-EF-007', 'Progressive Cavity Pump', 'Wolfcamp F-1', 'NOV', '2022-01-20', '2024-09-01', 12000, 91, 8, 'Low', 165, 'Operational', '2025-03-01'],
    ['CMP-MC-012', 'Gas Compressor', 'Marcellus C-7', 'Ariel Corporation', '2018-05-25', '2024-07-30', 42000, 55, 48, 'High', 220, 'Critical', '2024-10-30'],
    ['SEP-HV-002', 'Separator', 'Haynesville D-2', 'NATCO Group', '2020-11-12', '2024-09-10', 24000, 78, 18, 'Low', 195, 'Operational', '2025-03-10'],
    ['XMS-DB-005', 'Christmas Tree', 'Bone Spring M-4', 'FMC Technologies', '2021-08-05', '2024-05-20', 15000, 88, 10, 'Low', 175, 'Operational', '2024-11-20'],
    ['VLV-NB-004', 'Safety Valve', 'Niobrara G-4', 'Baker Hughes', '2020-02-18', '2024-08-05', 28000, 72, 25, 'Medium', 190, 'Warning', '2025-02-05'],
    ['HTR-BN-008', 'Line Heater', 'Barnett H-2', 'Exterran', '2017-09-30', '2024-04-15', 48000, 42, 62, 'High', 350, 'Critical', '2024-10-15'],
    ['MET-WF-006', 'Flow Meter', 'Woodford I-6', 'Emerson', '2022-06-14', '2024-09-20', 8500, 95, 5, 'Low', 145, 'Operational', '2025-06-20'],
    ['TNK-AC-011', 'Storage Tank', 'Austin Chalk J-1', 'Matrix Service', '2019-12-08', '2024-03-25', 35000, 68, 30, 'Medium', 110, 'Warning', '2024-09-25'],
    ['PLG-TM-009', 'Plunger Lift', 'Tuscaloosa K-3', 'Patriot Artificial Lift', '2020-08-22', '2024-07-10', 22000, 75, 22, 'Medium', 200, 'Operational', '2025-01-10'],
    ['DEH-MY-010', 'Dehydrator', 'Monterey L-2', 'NATCO Group', '2018-03-11', '2024-06-28', 38000, 58, 40, 'High', 245, 'Warning', '2024-12-28'],
    ['GEN-BS-013', 'Generator', 'SCOOP O-5', 'Caterpillar', '2021-05-30', '2024-08-15', 14000, 85, 12, 'Low', 200, 'Operational', '2025-02-15'],
    ['PMP-UT-014', 'Hydraulic Pump', 'Utica N-1', 'Halliburton', '2019-10-05', '2024-05-30', 30000, 60, 38, 'High', 210, 'Warning', '2024-11-30'],
    ['CHP-SK-015', 'Chemical Injection Pump', 'Spraberry E-5', 'Milton Roy', '2022-09-18', '2024-09-05', 6000, 93, 6, 'Low', 140, 'Operational', '2025-09-05']
  ];
  for (const e of equipmentData) {
    await pool.query(
      'INSERT INTO equipment_failure (equipment_name, equipment_type, well_name, manufacturer, install_date, last_maintenance_date, operating_hours, health_score, failure_probability_pct, vibration_level, temperature_f, status, next_maintenance_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
      e
    );
  }

  console.log('Seeding environmental compliance (15 records)...');
  const envData = [
    ['Eagle Ford A-1', 'Permian Site Alpha', 'Methane', 2.5, 'tons/year', 5.0, 'Compliant', '2024-06-15', 'John Martinez', 'None required', 0, '2025-06-15'],
    ['Bakken B-3', 'Williston Site Beta', 'VOC', 8.2, 'tons/year', 10.0, 'Compliant', '2024-05-20', 'Sarah Johnson', 'None required', 0, '2025-05-20'],
    ['Marcellus C-7', 'Appalachian Site Gamma', 'CO2', 150.0, 'tons/year', 100.0, 'Non-Compliant', '2024-07-10', 'Mike Anderson', 'Install carbon capture equipment', 25000, '2024-10-10'],
    ['Haynesville D-2', 'East Texas Site Delta', 'H2S', 0.8, 'ppm', 3.0, 'Compliant', '2024-04-22', 'Lisa Chen', 'None required', 0, '2025-04-22'],
    ['Wolfcamp F-1', 'Delaware Site Epsilon', 'Flaring', 45.0, 'MMCF/year', 50.0, 'Compliant', '2024-08-05', 'Robert Wilson', 'Reduce flaring by Q3', 0, '2025-02-05'],
    ['Niobrara G-4', 'DJ Basin Site Zeta', 'PM2.5', 12.5, 'ug/m3', 12.0, 'Non-Compliant', '2024-03-18', 'Emily Davis', 'Install particulate filters', 15000, '2024-09-18'],
    ['Barnett H-2', 'Fort Worth Site Eta', 'Benzene', 0.3, 'ppm', 1.0, 'Compliant', '2024-06-30', 'David Kim', 'None required', 0, '2025-06-30'],
    ['Woodford I-6', 'Anadarko Site Theta', 'NOx', 35.0, 'tons/year', 40.0, 'Compliant', '2024-07-25', 'Karen Brown', 'Monitor closely', 0, '2025-01-25'],
    ['Austin Chalk J-1', 'Gulf Coast Site Iota', 'Produced Water', 250.0, 'BBL/day', 200.0, 'Non-Compliant', '2024-05-12', 'Thomas Lee', 'Upgrade water treatment facility', 50000, '2024-08-12'],
    ['Tuscaloosa K-3', 'MS Basin Site Kappa', 'Methane', 4.8, 'tons/year', 5.0, 'Compliant', '2024-08-20', 'Jennifer White', 'Leak detection program active', 0, '2025-08-20'],
    ['Monterey L-2', 'San Joaquin Site Lambda', 'SOx', 18.0, 'tons/year', 15.0, 'Non-Compliant', '2024-02-28', 'Chris Garcia', 'Install scrubber systems', 35000, '2024-08-28'],
    ['Bone Spring M-4', 'Delaware Site Mu', 'Groundwater', 0.05, 'mg/L TDS', 0.5, 'Compliant', '2024-09-01', 'Amanda Taylor', 'Regular monitoring', 0, '2025-09-01'],
    ['Utica N-1', 'Ohio Site Nu', 'Noise', 75.0, 'dB', 80.0, 'Compliant', '2024-04-15', 'Steven Hall', 'Sound barriers installed', 0, '2025-04-15'],
    ['SCOOP O-5', 'Oklahoma Site Xi', 'Spill Risk', 2.0, 'incidents/yr', 0, 'Non-Compliant', '2024-06-08', 'Michelle Adams', 'Implement spill prevention plan', 20000, '2024-12-08'],
    ['Spraberry E-5', 'Midland Site Omicron', 'Methane', 3.2, 'tons/year', 5.0, 'Compliant', '2024-07-15', 'Daniel Moore', 'LDAR program ongoing', 0, '2025-07-15']
  ];
  for (const e of envData) {
    await pool.query(
      'INSERT INTO environmental_compliance (well_name, site_name, emission_type, emission_level, emission_unit, regulatory_threshold, compliance_status, inspection_date, inspector_name, corrective_action, penalty_amount, next_inspection_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
      e
    );
  }

  console.log('Seeding production forecasting (15 records)...');
  const forecastData = [
    ['Eagle Ford A-1', 'Permian Basin', 850, 12, 720, 265000, 85, 'Arps Decline', 75.50, 20007500, 'Low'],
    ['Bakken B-3', 'Williston Basin', 620, 24, 480, 400000, 78, 'Type Curve', 72.00, 28800000, 'Medium'],
    ['Wolfcamp F-1', 'Delaware Basin', 1100, 6, 1020, 185000, 92, 'Machine Learning', 78.25, 14478750, 'Low'],
    ['Marcellus C-7', 'Appalachian', 380, 36, 250, 330000, 72, 'Material Balance', 68.00, 22440000, 'Medium'],
    ['Niobrara G-4', 'DJ Basin', 450, 18, 350, 195000, 80, 'Arps Decline', 71.50, 13942500, 'Low'],
    ['Woodford I-6', 'Anadarko', 720, 12, 640, 235000, 88, 'Reservoir Sim', 76.00, 17860000, 'Low'],
    ['Austin Chalk J-1', 'Gulf Coast', 950, 24, 750, 615000, 75, 'Type Curve', 74.25, 45663750, 'Medium'],
    ['Bone Spring M-4', 'Delaware Basin', 780, 18, 620, 380000, 82, 'Machine Learning', 77.00, 29260000, 'Low'],
    ['SCOOP O-5', 'Anadarko', 680, 12, 580, 225000, 86, 'Arps Decline', 73.50, 16537500, 'Low'],
    ['Utica N-1', 'Appalachian', 550, 36, 380, 500000, 70, 'Material Balance', 69.75, 34875000, 'High'],
    ['Tuscaloosa K-3', 'MS Basin', 280, 24, 200, 175000, 68, 'Type Curve', 80.00, 14000000, 'High'],
    ['Spraberry E-5', 'Midland Basin', 520, 18, 420, 280000, 79, 'Arps Decline', 75.00, 21000000, 'Medium'],
    ['Monterey L-2', 'San Joaquin', 340, 12, 290, 115000, 74, 'Reservoir Sim', 82.50, 9487500, 'Medium'],
    ['Haynesville D-2', 'East Texas', 0, 6, 350, 65000, 60, 'Type Curve', 70.00, 4550000, 'High'],
    ['Barnett H-2', 'Fort Worth', 180, 12, 140, 58000, 65, 'Arps Decline', 71.00, 4118000, 'High']
  ];
  for (const f of forecastData) {
    await pool.query(
      'INSERT INTO production_forecasting (well_name, field_name, current_rate_bpd, forecast_period_months, predicted_rate_bpd, predicted_cumulative_bbl, confidence_pct, forecast_method, oil_price_usd, estimated_revenue_usd, risk_factor) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      f
    );
  }

  console.log('Seeding well performance (15 records)...');
  const perfData = [
    ['Eagle Ford A-1', 'Permian Basin', 850, 1200, 180, 15.5, 1200, 3200, 2450, 1800, 96.5, 88.2],
    ['Bakken B-3', 'Williston Basin', 620, 980, 220, 22.3, 980, 4100, 3200, 2400, 94.0, 82.5],
    ['Wolfcamp F-1', 'Delaware Basin', 1100, 1450, 250, 18.7, 1450, 3800, 3600, 2800, 98.0, 92.1],
    ['Marcellus C-7', 'Appalachian', 380, 2500, 35, 8.2, 2500, 2800, 1800, 1200, 97.5, 90.0],
    ['Niobrara G-4', 'DJ Basin', 450, 1100, 175, 28.5, 1100, 2600, 2100, 1500, 93.0, 78.5],
    ['Woodford I-6', 'Anadarko', 720, 1800, 120, 12.4, 1800, 3500, 2800, 2100, 95.5, 85.8],
    ['Austin Chalk J-1', 'Gulf Coast', 950, 900, 240, 20.1, 900, 3100, 3100, 2200, 91.0, 86.3],
    ['Bone Spring M-4', 'Delaware Basin', 780, 1300, 160, 16.3, 1300, 3400, 2900, 2100, 96.0, 89.5],
    ['SCOOP O-5', 'Anadarko', 680, 1650, 130, 14.8, 1650, 3200, 2650, 1900, 95.0, 84.0],
    ['Utica N-1', 'Appalachian', 550, 4200, 45, 6.5, 4200, 3800, 3400, 2600, 97.0, 91.2],
    ['Tuscaloosa K-3', 'MS Basin', 280, 650, 30, 8.9, 650, 5500, 4500, 3200, 90.0, 75.0],
    ['Spraberry E-5', 'Midland Basin', 520, 850, 260, 35.0, 850, 2400, 1950, 1400, 92.5, 76.8],
    ['Monterey L-2', 'San Joaquin', 340, 750, 310, 55.0, 750, 1800, 1650, 1100, 88.0, 65.5],
    ['Haynesville D-2', 'East Texas', 0, 3200, 0, 5.1, 3200, 6500, 4100, 3000, 0, 0],
    ['Barnett H-2', 'Fort Worth', 180, 3800, 350, 42.0, 3800, 1800, 1400, 900, 85.0, 55.2]
  ];
  for (const p of perfData) {
    await pool.query(
      'INSERT INTO well_performance (well_name, field_name, oil_rate_bpd, gas_rate_mcfd, water_rate_bpd, water_cut_pct, gas_oil_ratio, bottom_hole_pressure_psi, tubing_pressure_psi, casing_pressure_psi, uptime_pct, efficiency_pct) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
      p
    );
  }

  console.log('Seeding drilling operations (15 records)...');
  const drillingData = [
    ['PB-H101', 'Rig Titan-1', 'Pioneer Natural Resources', 'Permian Basin', '2024-06-01', 8200, 10500, 85, 35, 18000, 120, 10.5, 'Oil-Based', 'PDC', 8.75, 'Drilling'],
    ['WB-H202', 'Rig Falcon-3', 'Continental Resources', 'Williston Basin', '2024-05-15', 10800, 11200, 45, 40, 22000, 80, 12.8, 'Water-Based', 'Roller Cone', 8.5, 'Drilling'],
    ['EF-H303', 'Rig Eagle-7', 'EOG Resources', 'Eagle Ford', '2024-07-10', 9500, 9500, 0, 0, 0, 0, 11.2, 'Oil-Based', 'PDC', 6.75, 'Completed'],
    ['DB-H404', 'Rig Mustang-2', 'Diamondback Energy', 'Delaware Basin', '2024-08-01', 5600, 12000, 120, 30, 15000, 150, 9.8, 'Synthetic', 'PDC', 8.75, 'Drilling'],
    ['MC-V505', 'Rig Patriot-5', 'Range Resources', 'Marcellus', '2024-04-20', 7800, 7800, 0, 0, 0, 0, 9.5, 'Water-Based', 'PDC', 8.5, 'Completed'],
    ['HV-H606', 'Rig Thunder-4', 'Chesapeake Energy', 'Haynesville', '2024-09-01', 3200, 14000, 65, 45, 25000, 90, 14.2, 'Oil-Based', 'Hybrid', 6.125, 'Drilling'],
    ['NB-H707', 'Rig Summit-1', 'Civitas Resources', 'Niobrara', '2024-07-25', 7200, 7200, 0, 0, 0, 0, 10.0, 'Water-Based', 'PDC', 8.75, 'Completing'],
    ['WF-H808', 'Rig Viper-6', 'Devon Energy', 'Woodford', '2024-08-15', 8900, 12500, 55, 38, 20000, 100, 13.5, 'Synthetic', 'PDC', 6.75, 'Drilling'],
    ['AC-D909', 'Rig Horizon-2', 'Magnolia Oil & Gas', 'Austin Chalk', '2024-06-20', 8800, 8800, 0, 0, 0, 0, 10.8, 'Oil-Based', 'PDC', 7.875, 'Completed'],
    ['BS-H010', 'Rig Stallion-3', 'Matador Resources', 'Bone Spring', '2024-09-05', 4100, 9800, 95, 32, 16000, 130, 10.2, 'Synthetic', 'PDC', 8.75, 'Drilling'],
    ['UT-H111', 'Rig Liberty-8', 'Gulfport Energy', 'Utica', '2024-03-10', 9500, 9500, 0, 0, 0, 0, 11.0, 'Water-Based', 'PDC', 8.5, 'Completed'],
    ['SK-H212', 'Rig Prairie-4', 'Marathon Oil', 'SCOOP', '2024-08-25', 6800, 11500, 72, 36, 19000, 110, 12.0, 'Oil-Based', 'PDC', 8.75, 'Drilling'],
    ['SP-V313', 'Rig Desert-1', 'Laredo Petroleum', 'Spraberry', '2024-07-01', 5500, 5500, 0, 0, 0, 0, 9.2, 'Water-Based', 'Roller Cone', 9.875, 'Completed'],
    ['TM-H414', 'Rig Bayou-2', 'Goodrich Petroleum', 'Tuscaloosa Marine', '2024-09-10', 2800, 14500, 38, 48, 28000, 70, 15.5, 'Oil-Based', 'PDC', 6.125, 'Drilling'],
    ['VM-H515', 'Rig Condor-5', 'YPF', 'Vaca Muerta', '2024-08-20', 7200, 10000, 78, 34, 17000, 115, 11.5, 'Synthetic', 'PDC', 8.5, 'Drilling']
  ];
  for (const d of drillingData) {
    await pool.query(
      'INSERT INTO drilling_operations (well_name, rig_name, operator, field_name, spud_date, current_depth_ft, target_depth_ft, rop_ft_hr, wob_klb, torque_ft_lb, rpm, mud_weight_ppg, mud_type, bit_type, bit_size_in, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)',
      d
    );
  }

  console.log('Seeding cost analysis (15 records)...');
  const costData = [
    ['Eagle Ford A-1', 'Permian Basin', 8500000, 125000, 4200000, 3800000, 12500000, 28.5, 18, 42, 75.50, 850, 45.2, 'Producing'],
    ['Bakken B-3', 'Williston Basin', 9200000, 145000, 5100000, 3600000, 8900000, 22.1, 24, 48, 72.00, 620, 38.5, 'Producing'],
    ['Wolfcamp F-1', 'Delaware Basin', 7800000, 110000, 3800000, 3500000, 18200000, 35.8, 14, 38, 78.25, 1100, 52.0, 'Producing'],
    ['Marcellus C-7', 'Appalachian', 5500000, 85000, 2800000, 2200000, 6200000, 18.5, 28, 35, 68.00, 380, 32.1, 'Producing'],
    ['Niobrara G-4', 'DJ Basin', 6800000, 95000, 3200000, 3100000, 7800000, 20.3, 22, 40, 71.50, 450, 36.8, 'Producing'],
    ['Woodford I-6', 'Anadarko', 8100000, 120000, 4500000, 3200000, 10500000, 25.7, 20, 44, 76.00, 720, 42.5, 'Producing'],
    ['Austin Chalk J-1', 'Gulf Coast', 7200000, 105000, 3600000, 3100000, 15800000, 32.4, 16, 40, 74.25, 950, 48.3, 'Producing'],
    ['Bone Spring M-4', 'Delaware Basin', 7500000, 108000, 3700000, 3300000, 13200000, 29.6, 17, 39, 77.00, 780, 46.1, 'Producing'],
    ['SCOOP O-5', 'Anadarko', 8800000, 135000, 4800000, 3500000, 9500000, 23.8, 21, 46, 73.50, 680, 40.2, 'Producing'],
    ['PB-H101', 'Permian Basin', 10200000, 0, 5500000, 4200000, 0, 0, 0, 0, 75.50, 0, 0, 'Drilling'],
    ['DB-H404', 'Delaware Basin', 9800000, 0, 5200000, 4100000, 0, 0, 0, 0, 78.25, 0, 0, 'Drilling'],
    ['Utica N-1', 'Appalachian', 6200000, 92000, 3000000, 2700000, 5800000, 16.2, 30, 36, 69.75, 550, 30.5, 'Producing'],
    ['Tuscaloosa K-3', 'MS Basin', 11500000, 165000, 6200000, 4800000, 4200000, 12.8, 36, 52, 80.00, 280, 25.0, 'Producing'],
    ['Monterey L-2', 'San Joaquin', 5800000, 78000, 2600000, 2800000, 8500000, 26.5, 19, 45, 82.50, 340, 44.0, 'Producing'],
    ['Haynesville D-2', 'East Texas', 9500000, 155000, 5800000, 3200000, -1200000, -3.5, 0, 55, 70.00, 0, -8.2, 'Shut-in']
  ];
  for (const c of costData) {
    await pool.query(
      'INSERT INTO cost_analysis (well_name, field_name, capex_usd, opex_monthly_usd, drilling_cost_usd, completion_cost_usd, npv_usd, irr_pct, payback_months, breakeven_price_usd, oil_price_usd, production_rate_bpd, operating_margin_pct, project_status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)',
      c
    );
  }

  console.log('Seeding pipeline monitoring (15 records)...');
  const pipelineData = [
    ['Permian Mainline', 'PML-001', 'Midland Terminal', 'Cushing Hub', 245, 24, 'Carbon Steel', 1200, 850, 125000, 'Crude Oil', 0.500, 2.5, '2024-06-15', 'Good'],
    ['Eagle Ford Express', 'EFX-002', 'Karnes City', 'Corpus Christi', 180, 20, 'Carbon Steel', 1000, 720, 85000, 'Crude Oil', 0.438, 3.2, '2024-05-20', 'Good'],
    ['Bakken North', 'BKN-003', 'Stanley Station', 'Clearbrook Terminal', 320, 16, 'Carbon Steel', 1440, 980, 45000, 'Crude Oil', 0.375, 4.1, '2024-03-10', 'Fair'],
    ['Marcellus Gas Line', 'MGL-004', 'Washington County', 'Leidy Hub', 150, 30, 'Steel Alloy', 1480, 1100, 0, 'Natural Gas', 0.562, 1.8, '2024-07-25', 'Good'],
    ['Delaware Basin Lateral', 'DBL-005', 'Reeves County', 'Wink Terminal', 85, 12, 'Carbon Steel', 800, 650, 35000, 'Crude Oil', 0.312, 5.5, '2024-01-15', 'Warning'],
    ['Haynesville Gathering', 'HVG-006', 'DeSoto Parish', 'Perryville Hub', 120, 24, 'Steel Alloy', 1200, 920, 0, 'Natural Gas', 0.500, 2.0, '2024-08-10', 'Good'],
    ['Gulf Coast Trunk', 'GCT-007', 'Houston Terminal', 'Port Arthur', 95, 36, 'Carbon Steel', 900, 620, 180000, 'Crude Oil', 0.625, 1.5, '2024-04-22', 'Good'],
    ['Niobrara Lateral', 'NBL-008', 'Weld County', 'Greeley Station', 65, 10, 'Carbon Steel', 720, 580, 22000, 'Crude Oil', 0.250, 6.8, '2024-02-28', 'Critical'],
    ['Woodford Gathering', 'WFG-009', 'Carter County', 'Ardmore Hub', 110, 16, 'Carbon Steel', 1000, 780, 40000, 'Mixed', 0.375, 3.5, '2024-06-30', 'Good'],
    ['Utica Gas Express', 'UGX-010', 'Belmont County', 'Clarington Hub', 200, 20, 'Steel Alloy', 1440, 1050, 0, 'Natural Gas', 0.438, 2.2, '2024-07-15', 'Good'],
    ['SCOOP Connector', 'SCC-011', 'Grady County', 'Cushing Hub', 175, 16, 'Carbon Steel', 1100, 820, 55000, 'Crude Oil', 0.375, 3.8, '2024-05-12', 'Fair'],
    ['Bone Spring Lateral', 'BSL-012', 'Eddy County', 'Jal Station', 55, 8, 'Carbon Steel', 600, 520, 18000, 'Crude Oil', 0.250, 7.2, '2023-11-20', 'Warning'],
    ['Austin Chalk Line', 'ACL-013', 'Gonzales County', 'Victoria Terminal', 90, 14, 'Carbon Steel', 850, 680, 48000, 'Crude Oil', 0.344, 4.0, '2024-08-05', 'Good'],
    ['Tuscaloosa Spur', 'TCS-014', 'Wilkinson County', 'St. James Terminal', 130, 12, 'Carbon Steel', 750, 600, 15000, 'Crude Oil', 0.312, 4.5, '2024-04-10', 'Fair'],
    ['Spraberry Connector', 'SPC-015', 'Midland County', 'Midland Terminal', 40, 10, 'Carbon Steel', 680, 520, 25000, 'Crude Oil', 0.250, 5.0, '2024-07-01', 'Good']
  ];
  for (const p of pipelineData) {
    await pool.query(
      'INSERT INTO pipeline_monitoring (pipeline_name, segment_id, origin, destination, length_miles, diameter_in, material, max_pressure_psi, current_pressure_psi, flow_rate_bpd, fluid_type, wall_thickness_in, corrosion_rate_mpy, last_inspection_date, integrity_status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)',
      p
    );
  }

  console.log('Seeding water management (15 records)...');
  const waterData = [
    ['Eagle Ford A-1', 'Permian Basin', 180, 150, 'Injection', 'Filtration + Chemical', 35000, 6.8, 15, 'SWD-PB-01', 2200, 'Produced', 25, 0.85, 'Active'],
    ['Bakken B-3', 'Williston Basin', 220, 200, 'Injection', 'Desalination', 48000, 7.2, 22, 'SWD-WB-01', 2800, 'Produced', 15, 1.20, 'Active'],
    ['Wolfcamp F-1', 'Delaware Basin', 250, 180, 'Injection', 'Filtration + UV', 28000, 6.5, 12, 'SWD-DB-01', 1900, 'Produced', 35, 0.72, 'Active'],
    ['Marcellus C-7', 'Appalachian', 35, 0, 'Trucking', 'Chemical Treatment', 85000, 5.8, 8, 'N/A', 0, 'Produced', 0, 2.50, 'Active'],
    ['Niobrara G-4', 'DJ Basin', 175, 120, 'Injection', 'Filtration', 42000, 7.0, 18, 'SWD-DJ-01', 2400, 'Produced', 20, 0.95, 'Active'],
    ['Woodford I-6', 'Anadarko', 120, 100, 'Injection', 'Chemical + Filtration', 38000, 6.9, 14, 'SWD-AN-01', 2100, 'Produced', 30, 0.80, 'Active'],
    ['Austin Chalk J-1', 'Gulf Coast', 240, 160, 'Injection', 'Electro-coagulation', 52000, 7.1, 25, 'SWD-GC-01', 2600, 'Produced', 18, 1.10, 'Warning'],
    ['Bone Spring M-4', 'Delaware Basin', 160, 140, 'Injection', 'Filtration + Chemical', 30000, 6.7, 10, 'SWD-DB-02', 2000, 'Recycled', 45, 0.65, 'Active'],
    ['SCOOP O-5', 'Anadarko', 130, 110, 'Injection', 'Chemical Treatment', 36000, 6.8, 16, 'SWD-AN-02', 2300, 'Produced', 22, 0.88, 'Active'],
    ['Utica N-1', 'Appalachian', 45, 0, 'Trucking', 'Desalination', 125000, 5.5, 5, 'N/A', 0, 'Produced', 0, 3.20, 'Active'],
    ['Tuscaloosa K-3', 'MS Basin', 30, 25, 'Injection', 'Filtration', 22000, 7.3, 20, 'SWD-MS-01', 1800, 'Produced', 10, 1.50, 'Active'],
    ['Spraberry E-5', 'Midland Basin', 260, 200, 'Injection', 'Filtration + Chemical', 40000, 6.6, 28, 'SWD-MB-01', 2500, 'Produced', 12, 0.90, 'Warning'],
    ['Monterey L-2', 'San Joaquin', 310, 0, 'Evaporation Pond', 'Chemical Treatment', 15000, 7.5, 35, 'N/A', 0, 'Produced', 0, 1.80, 'Active'],
    ['Haynesville D-2', 'East Texas', 0, 0, 'N/A', 'N/A', 0, 0, 0, 'N/A', 0, 'N/A', 0, 0, 'Inactive'],
    ['Barnett H-2', 'Fort Worth', 350, 280, 'Injection', 'Electro-coagulation', 55000, 6.4, 32, 'SWD-FW-01', 2700, 'Produced', 8, 1.35, 'Active']
  ];
  for (const w of waterData) {
    await pool.query(
      'INSERT INTO water_management (well_name, field_name, produced_water_bpd, injected_water_bpd, disposal_method, treatment_type, tds_ppm, ph_level, oil_in_water_ppm, disposal_well_name, injection_pressure_psi, water_source, recycled_pct, cost_per_bbl_usd, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)',
      w
    );
  }

  console.log('Seeding safety incidents (15 records)...');
  const safetyData = [
    ['H2S Gas Alarm Activation', 'Permian Site Alpha', 'Eagle Ford A-1', '2024-08-15', 'Gas Release', 'Medium', 'H2S alarm triggered during wellhead maintenance', 'Incomplete valve isolation', 'Updated lockout/tagout procedures', 0, 0, 'Mike Torres', 'Closed', 'No'],
    ['Slip and Fall - Rig Floor', 'Williston Site Beta', 'Bakken B-3', '2024-07-22', 'Slip/Trip/Fall', 'Low', 'Worker slipped on wet rig floor during connection', 'Inadequate housekeeping', 'Installed non-slip mats, updated cleaning schedule', 1, 3, 'Sarah Johnson', 'Closed', 'Yes'],
    ['Pressure Surge - Flowline', 'Delaware Site Epsilon', 'Wolfcamp F-1', '2024-09-01', 'Pressure Event', 'High', 'Unexpected pressure surge during well testing', 'Choke malfunction', 'Replaced choke, added redundant pressure relief', 0, 0, 'Robert Chen', 'Open', 'No'],
    ['Vehicle Rollover', 'Appalachian Site Gamma', 'Marcellus C-7', '2024-06-10', 'Vehicle Accident', 'High', 'Service truck rolled over on access road', 'Soft road shoulder, excessive speed', 'Road improvements, speed monitoring', 2, 15, 'Lisa Anderson', 'Closed', 'Yes'],
    ['Chemical Splash - Eyes', 'DJ Basin Site Zeta', 'Niobrara G-4', '2024-05-18', 'Chemical Exposure', 'Medium', 'Corrosion inhibitor splashed during transfer', 'Improper PPE usage', 'PPE compliance training, face shield requirement', 1, 2, 'David Kim', 'Closed', 'Yes'],
    ['Fire - Tank Battery', 'Anadarko Site Theta', 'Woodford I-6', '2024-08-28', 'Fire', 'Critical', 'Lightning strike ignited vapors at tank battery', 'Natural cause - lightning', 'Installed lightning protection, vapor recovery', 0, 0, 'Karen Brown', 'Open', 'No'],
    ['Near Miss - Dropped Object', 'Gulf Coast Site Iota', 'Austin Chalk J-1', '2024-07-05', 'Dropped Object', 'Medium', 'Wrench dropped from elevated platform', 'Tool not tethered', 'Mandatory tool tethering policy', 0, 0, 'Thomas Lee', 'Closed', 'No'],
    ['Confined Space Rescue', 'MS Basin Site Kappa', 'Tuscaloosa K-3', '2024-04-12', 'Confined Space', 'Critical', 'Worker overcome by fumes in storage tank', 'Inadequate ventilation testing', 'Updated confined space entry procedures', 1, 8, 'Jennifer White', 'Closed', 'Yes'],
    ['Bee Sting Allergic Reaction', 'San Joaquin Site Lambda', 'Monterey L-2', '2024-06-25', 'Wildlife/Insect', 'Low', 'Field technician stung, allergic reaction', 'Environmental hazard', 'EpiPen kits at all field locations', 1, 1, 'Chris Garcia', 'Closed', 'Yes'],
    ['Near Miss - Well Kick', 'East Texas Site Delta', 'HV-H606', '2024-09-08', 'Well Control', 'Critical', 'Unexpected kick during drilling at 12,500 ft', 'Formation pressure higher than predicted', 'Updated pore pressure model, increased mud weight', 0, 0, 'Amanda Taylor', 'Open', 'No'],
    ['Noise Exposure Exceedance', 'Fort Worth Site Eta', 'Barnett H-2', '2024-03-15', 'Noise Exposure', 'Low', 'Compressor noise exceeded 85 dB limit', 'Aging compressor bearings', 'Installed noise barriers, ear protection mandate', 0, 0, 'Steven Hall', 'Closed', 'No'],
    ['Pipeline Leak Detection', 'Oklahoma Site Xi', 'SCOOP O-5', '2024-07-30', 'Spill/Leak', 'High', 'Small crude oil leak detected at pipeline junction', 'Corrosion at weld joint', 'Emergency repair, added cathodic protection', 0, 0, 'Michelle Adams', 'Closed', 'No'],
    ['Heat Exhaustion', 'Midland Site Omicron', 'Spraberry E-5', '2024-08-02', 'Heat Illness', 'Medium', 'Two workers affected by heat during summer ops', 'Insufficient hydration breaks', 'Mandatory cooling breaks, hydration stations', 2, 4, 'Daniel Moore', 'Closed', 'Yes'],
    ['Crane Malfunction', 'Delaware Site Mu', 'Bone Spring M-4', '2024-05-28', 'Equipment Failure', 'High', 'Crane hydraulic line burst during lift operation', 'Worn hydraulic hose', 'Replaced all hydraulic lines, added inspection checklist', 0, 0, 'Emily Davis', 'Closed', 'No'],
    ['Near Miss - Forklift', 'Ohio Site Nu', 'Utica N-1', '2024-09-12', 'Vehicle Near Miss', 'Low', 'Forklift nearly struck pedestrian in yard', 'Poor visibility at corner', 'Installed mirrors and warning lights', 0, 0, 'Steven Hall', 'Open', 'No']
  ];
  for (const s of safetyData) {
    await pool.query(
      'INSERT INTO safety_incidents (incident_title, site_name, well_name, incident_date, incident_type, severity, description, root_cause, corrective_action, injuries_count, days_lost, reported_by, investigation_status, osha_recordable) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)',
      s
    );
  }

  console.log('Seeding gas lift optimization (15 records)...');
  const gasLiftData = [
    ['Eagle Ford A-1', 'Permian Basin', 800, 1200, 650, 850, 'Field Gas', 4, 8200, 1800, 2450, 1200, 'Optimized', 2.50, 425000],
    ['Bakken B-3', 'Williston Basin', 650, 1400, 480, 620, 'Field Gas', 5, 9800, 2400, 3200, 980, 'Active', 2.80, 310000],
    ['Wolfcamp F-1', 'Delaware Basin', 1200, 1100, 850, 1100, 'Purchased', 3, 7500, 2800, 3600, 1450, 'Optimized', 3.20, 580000],
    ['Niobrara G-4', 'DJ Basin', 550, 1050, 320, 450, 'Field Gas', 4, 6800, 1500, 2100, 1100, 'Active', 2.40, 285000],
    ['Woodford I-6', 'Anadarko', 900, 1300, 550, 720, 'Field Gas', 5, 10500, 2100, 2800, 1800, 'Optimized', 2.60, 395000],
    ['Austin Chalk J-1', 'Gulf Coast', 700, 980, 750, 950, 'Purchased', 3, 7200, 2200, 3100, 900, 'Active', 3.50, 465000],
    ['Bone Spring M-4', 'Delaware Basin', 1000, 1150, 600, 780, 'Field Gas', 4, 8500, 2100, 2900, 1300, 'Optimized', 2.70, 420000],
    ['SCOOP O-5', 'Anadarko', 850, 1250, 500, 680, 'Field Gas', 5, 10200, 1900, 2650, 1650, 'Active', 2.55, 375000],
    ['Spraberry E-5', 'Midland Basin', 600, 950, 380, 520, 'Field Gas', 4, 5200, 1400, 1950, 850, 'Needs Review', 2.30, 295000],
    ['Monterey L-2', 'San Joaquin', 450, 850, 250, 340, 'Purchased', 3, 4800, 1100, 1650, 750, 'Active', 4.10, 195000],
    ['Tuscaloosa K-3', 'MS Basin', 400, 1500, 180, 280, 'Purchased', 6, 12000, 3200, 4500, 650, 'Active', 3.80, 210000],
    ['Barnett H-2', 'Fort Worth', 350, 800, 120, 180, 'Field Gas', 3, 3800, 900, 1400, 3800, 'Needs Review', 2.20, 125000],
    ['Utica N-1', 'Appalachian', 500, 1350, 380, 550, 'Field Gas', 5, 8800, 2600, 3400, 4200, 'Optimized', 2.45, 365000],
    ['Haynesville D-2', 'East Texas', 0, 0, 0, 0, 'N/A', 0, 0, 3000, 4100, 3200, 'Inactive', 0, 0],
    ['PB-H101', 'Permian Basin', 1100, 1180, 0, 0, 'Field Gas', 4, 9200, 2500, 3300, 0, 'Planned', 2.65, 0]
  ];
  for (const g of gasLiftData) {
    await pool.query(
      'INSERT INTO gas_lift_optimization (well_name, field_name, injection_rate_mcfd, injection_pressure_psi, oil_rate_before_bpd, oil_rate_after_bpd, gas_source, valve_count, deepest_valve_depth_ft, casing_pressure_psi, tubing_pressure_psi, glr_scf_bbl, optimization_status, cost_per_mcf_usd, incremental_revenue_usd) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)',
      g
    );
  }

  console.log('Seed completed successfully!');
  await pool.end();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
