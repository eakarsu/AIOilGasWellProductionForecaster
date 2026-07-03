require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool(process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
} : {
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
    equipment_failure, environmental_compliance, production_forecasting, production_history, well_performance,
    drilling_operations, cost_analysis, pipeline_monitoring, water_management,
    safety_incidents, gas_lift_optimization, alerts, alert_rules, field_notes, ai_analyses,
    work_orders, asset_registry, maintenance_schedules, inspection_logs, compliance_permits,
    crew_vendors, inventory_parts, documents, notification_center, app_settings,
    well_master, production_targets, shift_handovers, approval_workflows,
    integration_endpoints, operational_reports, audit_trail CASCADE;

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

    CREATE TABLE production_history (
      id SERIAL PRIMARY KEY,
      well_id INTEGER,
      user_id INTEGER REFERENCES users(id),
      recorded_at TIMESTAMP,
      oil_bpd DECIMAL,
      gas_mcfd DECIMAL,
      water_bpd DECIMAL,
      bhp DECIMAL,
      created_at TIMESTAMP DEFAULT NOW()
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

    CREATE TABLE alert_rules (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      metric VARCHAR(100) NOT NULL,
      operator VARCHAR(10) NOT NULL,
      threshold DECIMAL NOT NULL,
      entity_type VARCHAR(100),
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

    CREATE TABLE ai_analyses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      endpoint VARCHAR(100),
      entity_table VARCHAR(100),
      entity_id INTEGER,
      result TEXT,
      tokens_used INTEGER,
      model VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE work_orders (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      well_name VARCHAR(255),
      asset_tag VARCHAR(100),
      priority VARCHAR(50) DEFAULT 'Medium',
      status VARCHAR(50) DEFAULT 'Open',
      assigned_to VARCHAR(255),
      due_date DATE,
      estimated_cost_usd DECIMAL(12,2),
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE asset_registry (
      id SERIAL PRIMARY KEY,
      asset_tag VARCHAR(100) NOT NULL,
      asset_name VARCHAR(255) NOT NULL,
      asset_type VARCHAR(100),
      well_name VARCHAR(255),
      manufacturer VARCHAR(255),
      install_date DATE,
      lifecycle_status VARCHAR(50) DEFAULT 'In Service',
      criticality VARCHAR(50) DEFAULT 'Medium',
      replacement_due_date DATE,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE maintenance_schedules (
      id SERIAL PRIMARY KEY,
      task_name VARCHAR(255) NOT NULL,
      asset_tag VARCHAR(100),
      well_name VARCHAR(255),
      maintenance_type VARCHAR(100),
      frequency VARCHAR(100),
      next_due_date DATE,
      assigned_to VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Scheduled',
      instructions TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE inspection_logs (
      id SERIAL PRIMARY KEY,
      inspection_type VARCHAR(100) NOT NULL,
      site_name VARCHAR(255) NOT NULL,
      well_name VARCHAR(255),
      inspector VARCHAR(255),
      inspection_date DATE,
      status VARCHAR(50) DEFAULT 'Open',
      findings TEXT,
      corrective_action TEXT,
      next_inspection_date DATE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE compliance_permits (
      id SERIAL PRIMARY KEY,
      permit_number VARCHAR(100) NOT NULL,
      permit_type VARCHAR(100) NOT NULL,
      site_name VARCHAR(255),
      agency VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Active',
      issue_date DATE,
      expiration_date DATE,
      owner VARCHAR(255),
      requirements TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE crew_vendors (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      organization_type VARCHAR(50) DEFAULT 'Crew',
      role VARCHAR(100),
      phone VARCHAR(50),
      email VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Active',
      certifications TEXT,
      assigned_area VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE inventory_parts (
      id SERIAL PRIMARY KEY,
      part_number VARCHAR(100) NOT NULL,
      part_name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      quantity_on_hand INTEGER DEFAULT 0,
      reorder_level INTEGER DEFAULT 0,
      unit_cost_usd DECIMAL(12,2),
      warehouse_location VARCHAR(255),
      supplier VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Available',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE documents (
      id SERIAL PRIMARY KEY,
      document_title VARCHAR(255) NOT NULL,
      document_type VARCHAR(100),
      related_entity VARCHAR(255),
      owner VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Current',
      effective_date DATE,
      expiration_date DATE,
      file_url TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE notification_center (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      channel VARCHAR(50),
      recipient VARCHAR(255),
      severity VARCHAR(50) DEFAULT 'Medium',
      status VARCHAR(50) DEFAULT 'Pending',
      sent_at TIMESTAMP,
      acknowledged_at TIMESTAMP,
      related_record VARCHAR(255),
      message TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE app_settings (
      id SERIAL PRIMARY KEY,
      setting_key VARCHAR(100) NOT NULL,
      setting_group VARCHAR(100) NOT NULL,
      setting_value TEXT,
      description TEXT,
      updated_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE well_master (
      id SERIAL PRIMARY KEY,
      well_name VARCHAR(255) NOT NULL,
      api_number VARCHAR(100),
      field_name VARCHAR(255),
      operator VARCHAR(255),
      well_type VARCHAR(100),
      status VARCHAR(50) DEFAULT 'Active',
      spud_date DATE,
      first_production_date DATE,
      latitude DECIMAL(10,6),
      longitude DECIMAL(10,6),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE production_targets (
      id SERIAL PRIMARY KEY,
      well_name VARCHAR(255) NOT NULL,
      target_month DATE NOT NULL,
      oil_target_bpd DECIMAL(10,2),
      gas_target_mcfd DECIMAL(10,2),
      water_limit_bpd DECIMAL(10,2),
      uptime_target_pct DECIMAL(5,2),
      owner VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Draft',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE shift_handovers (
      id SERIAL PRIMARY KEY,
      shift_date DATE NOT NULL,
      shift_name VARCHAR(100),
      outgoing_operator VARCHAR(255) NOT NULL,
      incoming_operator VARCHAR(255),
      area VARCHAR(255),
      open_issues TEXT,
      completed_work TEXT,
      safety_notes TEXT,
      status VARCHAR(50) DEFAULT 'Open',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE approval_workflows (
      id SERIAL PRIMARY KEY,
      request_title VARCHAR(255) NOT NULL,
      request_type VARCHAR(100) NOT NULL,
      requested_by VARCHAR(255),
      approver VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Pending',
      priority VARCHAR(50) DEFAULT 'Medium',
      due_date DATE,
      related_record VARCHAR(255),
      business_justification TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE integration_endpoints (
      id SERIAL PRIMARY KEY,
      integration_name VARCHAR(255) NOT NULL,
      integration_type VARCHAR(100) NOT NULL,
      endpoint_url TEXT,
      auth_type VARCHAR(100),
      status VARCHAR(50) DEFAULT 'Active',
      last_sync_at TIMESTAMP,
      owner VARCHAR(255),
      retry_policy VARCHAR(255),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE operational_reports (
      id SERIAL PRIMARY KEY,
      report_name VARCHAR(255) NOT NULL,
      report_type VARCHAR(100) NOT NULL,
      schedule VARCHAR(100),
      owner VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Active',
      last_run_at TIMESTAMP,
      next_run_at TIMESTAMP,
      delivery_channel VARCHAR(100),
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE audit_trail (
      id SERIAL PRIMARY KEY,
      action VARCHAR(50) NOT NULL,
      entity_table VARCHAR(100) NOT NULL,
      entity_id INTEGER,
      actor VARCHAR(255),
      summary TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log('Seeding users...');
  const passwordHash = await bcrypt.hash(process.env.DEFAULT_PASSWORD || 'admin123', 10);
  const userResult = await pool.query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id',
    [process.env.DEFAULT_EMAIL || 'admin@oilgas.com', passwordHash, 'Admin User']
  );
  const adminUserId = userResult.rows[0].id;

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

  console.log('Seeding production history (15 records)...');
  const productionHistoryData = [
    [1, '2024-09-01', 910, 1280, 165, 3220],
    [1, '2024-10-01', 885, 1255, 172, 3185],
    [1, '2024-11-01', 860, 1215, 180, 3125],
    [2, '2024-09-01', 690, 1010, 205, 4075],
    [2, '2024-10-01', 655, 995, 216, 4010],
    [2, '2024-11-01', 620, 980, 224, 3965],
    [3, '2024-09-01', 1180, 1510, 238, 3820],
    [3, '2024-10-01', 1135, 1480, 246, 3750],
    [3, '2024-11-01', 1105, 1450, 252, 3695],
    [4, '2024-09-01', 420, 2580, 32, 2860],
    [4, '2024-10-01', 400, 2530, 34, 2820],
    [4, '2024-11-01', 382, 2495, 36, 2775],
    [5, '2024-09-01', 560, 890, 244, 2210],
    [5, '2024-10-01', 540, 870, 255, 2165],
    [5, '2024-11-01', 522, 852, 263, 2110]
  ];
  for (const h of productionHistoryData) {
    await pool.query(
      'INSERT INTO production_history (well_id, user_id, recorded_at, oil_bpd, gas_mcfd, water_bpd, bhp) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [h[0], adminUserId, h[1], h[2], h[3], h[4], h[5]]
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

  console.log('Seeding alerts (15 records)...');
  const alertsData = [
    ['High Wellhead Pressure', 'wellhead_analytics', 'pressure_psi', '>', 3500, 'High'],
    ['Low Flow Rate', 'wellhead_analytics', 'flow_rate_bpd', '<', 300, 'Medium'],
    ['High Water Cut', 'wellhead_analytics', 'water_cut_pct', '>', 35, 'High'],
    ['Critical Equipment Failure Risk', 'equipment_failure', 'failure_probability_pct', '>', 45, 'Critical'],
    ['Low Equipment Health', 'equipment_failure', 'health_score', '<', 60, 'High'],
    ['Environmental Penalty Exposure', 'environmental_compliance', 'penalty_amount', '>', 10000, 'High'],
    ['Low Forecast Confidence', 'production_forecasting', 'confidence_pct', '<', 72, 'Medium'],
    ['Pipeline Corrosion Warning', 'pipeline_monitoring', 'corrosion_rate_mpy', '>', 5, 'Critical'],
    ['Pipeline Pressure Drop', 'pipeline_monitoring', 'current_pressure_psi', '<', 600, 'High'],
    ['Water Recycling Low', 'water_management', 'recycled_pct', '<', 15, 'Medium'],
    ['Water Treatment Cost High', 'water_management', 'cost_per_bbl_usd', '>', 2, 'Medium'],
    ['Safety Lost Days', 'safety_incidents', 'days_lost', '>', 5, 'Critical'],
    ['Gas Lift Revenue Opportunity', 'gas_lift_optimization', 'incremental_revenue_usd', '>', 400000, 'Medium'],
    ['Cost Breakeven High', 'cost_analysis', 'breakeven_price_usd', '>', 50, 'High'],
    ['Drilling Torque High', 'drilling_operations', 'torque_ft_lb', '>', 24000, 'High']
  ];
  for (const a of alertsData) {
    await pool.query(
      'INSERT INTO alerts (alert_name, table_name, field_name, operator, threshold_value, severity) VALUES ($1,$2,$3,$4,$5,$6)',
      a
    );
  }

  console.log('Seeding alert rules (15 records)...');
  const alertRulesData = [
    ['pressure_psi', '>', 3500, 'wellhead_analytics'],
    ['flow_rate_bpd', '<', 300, 'wellhead_analytics'],
    ['water_cut_pct', '>', 35, 'wellhead_analytics'],
    ['failure_probability_pct', '>', 45, 'equipment_failure'],
    ['health_score', '<', 60, 'equipment_failure'],
    ['penalty_amount', '>', 10000, 'environmental_compliance'],
    ['confidence_pct', '<', 72, 'production_forecasting'],
    ['corrosion_rate_mpy', '>', 5, 'pipeline_monitoring'],
    ['current_pressure_psi', '<', 600, 'pipeline_monitoring'],
    ['recycled_pct', '<', 15, 'water_management'],
    ['cost_per_bbl_usd', '>', 2, 'water_management'],
    ['days_lost', '>', 5, 'safety_incidents'],
    ['incremental_revenue_usd', '>', 400000, 'gas_lift_optimization'],
    ['breakeven_price_usd', '>', 50, 'cost_analysis'],
    ['torque_ft_lb', '>', 24000, 'drilling_operations']
  ];
  for (const r of alertRulesData) {
    await pool.query(
      'INSERT INTO alert_rules (user_id, metric, operator, threshold, entity_type) VALUES ($1,$2,$3,$4,$5)',
      [adminUserId, r[0], r[1], r[2], r[3]]
    );
  }

  console.log('Seeding field notes (15 records)...');
  const fieldNotesData = [
    ['Eagle Ford A-1', 'Observation', 'Pressure trend improving', 'Tubing pressure stabilized after choke optimization. Continue monitoring for 48 hours.', 'Maria Torres', 'Medium'],
    ['Bakken B-3', 'Maintenance', 'Pump jack inspection complete', 'Rod string vibration observed. Recommend follow-up alignment check next week.', 'Jason Reed', 'High'],
    ['Wolfcamp F-1', 'Observation', 'Strong post-workover response', 'Oil rate remains above expected type curve after cleanout. Water cut stable.', 'Nina Patel', 'Low'],
    ['Marcellus C-7', 'Issue', 'Telemetry dropout', 'SCADA readings intermittent between 02:00 and 04:30. Field RTU reset completed.', 'Owen Clarke', 'Medium'],
    ['Haynesville D-2', 'Issue', 'Shut-in review required', 'Well remains shut-in. Review restart economics and pressure build-up data.', 'Lena Ortiz', 'High'],
    ['Spraberry E-5', 'Observation', 'Water cut elevated', 'Produced water trending above normal operating range. Check separator performance.', 'Caleb Brooks', 'High'],
    ['Niobrara G-4', 'Maintenance', 'Valve greasing completed', 'Surface valves greased and cycled. No leaks found during pressure test.', 'Priya Shah', 'Low'],
    ['Barnett H-2', 'Issue', 'Compressor vibration', 'Compressor vibration above baseline. Schedule bearing inspection.', 'Marcus Lee', 'High'],
    ['Woodford I-6', 'General', 'Lease road repaired', 'Access road graded after rain. Heavy equipment can resume normal travel.', 'Sarah Nguyen', 'Low'],
    ['Austin Chalk J-1', 'Observation', 'Gas rate variance', 'Gas rate showing intraday variability. Verify meter calibration.', 'Trevor Hall', 'Medium'],
    ['Tuscaloosa K-3', 'Safety', 'High-pressure job briefing', 'Crew completed pre-job safety meeting for high-pressure test.', 'Alicia Moore', 'Medium'],
    ['Monterey L-2', 'Maintenance', 'Tank battery inspection', 'No visible leaks. Secondary containment requires cleanup.', 'Ben Carter', 'Medium'],
    ['Bone Spring M-4', 'Observation', 'Gas lift adjustment', 'Injection rate increased by 100 MCFD. Watch oil response over next 24 hours.', 'Diana Flores', 'Medium'],
    ['Utica N-1', 'Safety', 'Noise monitoring', 'Compressor pad readings below threshold after barrier installation.', 'Evan Kim', 'Low'],
    ['SCOOP O-5', 'Issue', 'Chemical pump low output', 'Chemical injection pump output below target. Suspect worn check valve.', 'Grace Miller', 'High']
  ];
  for (const n of fieldNotesData) {
    await pool.query(
      'INSERT INTO field_notes (well_name, note_type, title, content, author, priority) VALUES ($1,$2,$3,$4,$5,$6)',
      n
    );
  }

  const wells = ['Eagle Ford A-1', 'Bakken B-3', 'Wolfcamp F-1', 'Marcellus C-7', 'Haynesville D-2', 'Spraberry E-5', 'Niobrara G-4', 'Barnett H-2', 'Woodford I-6', 'Austin Chalk J-1', 'Tuscaloosa K-3', 'Monterey L-2', 'Bone Spring M-4', 'Utica N-1', 'SCOOP O-5'];
  const techs = ['Maria Torres', 'Jason Reed', 'Nina Patel', 'Owen Clarke', 'Lena Ortiz', 'Caleb Brooks', 'Priya Shah', 'Marcus Lee', 'Sarah Nguyen', 'Trevor Hall', 'Alicia Moore', 'Ben Carter', 'Diana Flores', 'Evan Kim', 'Grace Miller'];

  console.log('Seeding work orders (15 records)...');
  for (let i = 0; i < 15; i += 1) {
    await pool.query(
      `INSERT INTO work_orders (title, well_name, asset_tag, priority, status, assigned_to, due_date, estimated_cost_usd, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        `${i % 3 === 0 ? 'Inspect' : i % 3 === 1 ? 'Repair' : 'Calibrate'} ${i % 2 === 0 ? 'pump package' : 'surface controls'}`,
        wells[i],
        `AST-${String(i + 1).padStart(3, '0')}`,
        ['Low', 'Medium', 'High', 'Critical'][i % 4],
        ['Open', 'Assigned', 'In Progress', 'Waiting Parts', 'Completed'][i % 5],
        techs[i],
        `2025-${String((i % 9) + 1).padStart(2, '0')}-${String((i % 24) + 5).padStart(2, '0')}`,
        2500 + i * 825,
        'Operational work order seeded for maintenance planning and field execution.'
      ]
    );
  }

  console.log('Seeding asset registry (15 records)...');
  for (let i = 0; i < 15; i += 1) {
    await pool.query(
      `INSERT INTO asset_registry (asset_tag, asset_name, asset_type, well_name, manufacturer, install_date, lifecycle_status, criticality, replacement_due_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        `AST-${String(i + 1).padStart(3, '0')}`,
        `${['ESP', 'Compressor', 'Separator', 'Safety Valve', 'Flow Meter'][i % 5]} ${i + 1}`,
        ['Pump', 'Compressor', 'Separator', 'Valve', 'Meter'][i % 5],
        wells[i],
        ['Schlumberger', 'Baker Hughes', 'Ariel', 'Emerson', 'NOV'][i % 5],
        `202${i % 5}-${String((i % 9) + 1).padStart(2, '0')}-15`,
        ['In Service', 'Maintenance', 'In Service', 'Planned', 'Retired'][i % 5],
        ['Low', 'Medium', 'High', 'Critical'][i % 4],
        `2026-${String((i % 9) + 1).padStart(2, '0')}-20`,
        'Lifecycle record for asset tracking and replacement planning.'
      ]
    );
  }

  console.log('Seeding maintenance schedules (15 records)...');
  for (let i = 0; i < 15; i += 1) {
    await pool.query(
      `INSERT INTO maintenance_schedules (task_name, asset_tag, well_name, maintenance_type, frequency, next_due_date, assigned_to, status, instructions)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        `${['Pump service', 'Valve inspection', 'Meter calibration', 'Compressor lube check', 'Separator cleaning'][i % 5]} - ${wells[i]}`,
        `AST-${String(i + 1).padStart(3, '0')}`,
        wells[i],
        ['Preventive', 'Inspection', 'Calibration', 'Corrective', 'Regulatory'][i % 5],
        ['Weekly', 'Monthly', 'Quarterly', 'Semiannual', 'Annual'][i % 5],
        `2025-${String((i % 10) + 2).padStart(2, '0')}-${String((i % 20) + 8).padStart(2, '0')}`,
        techs[i],
        ['Scheduled', 'Due Soon', 'Overdue', 'In Progress', 'Completed'][i % 5],
        'Follow manufacturer checklist, capture readings, and attach field notes after completion.'
      ]
    );
  }

  console.log('Seeding inspection logs (15 records)...');
  for (let i = 0; i < 15; i += 1) {
    await pool.query(
      `INSERT INTO inspection_logs (inspection_type, site_name, well_name, inspector, inspection_date, status, findings, corrective_action, next_inspection_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        ['Safety', 'Environmental', 'Equipment', 'Pipeline', 'Tank Battery'][i % 5],
        `${['Permian', 'Williston', 'Delaware', 'Appalachian', 'Gulf Coast'][i % 5]} Site ${i + 1}`,
        wells[i],
        techs[(i + 2) % techs.length],
        `2024-${String((i % 9) + 3).padStart(2, '0')}-${String((i % 24) + 1).padStart(2, '0')}`,
        ['Passed', 'Finding', 'Open', 'Closed', 'Failed'][i % 5],
        i % 4 === 0 ? 'Minor housekeeping and labeling findings.' : 'Inspection completed with standard observations.',
        i % 4 === 0 ? 'Assign field crew to close corrective action within 14 days.' : 'Continue routine monitoring.',
        `2025-${String((i % 9) + 3).padStart(2, '0')}-${String((i % 24) + 1).padStart(2, '0')}`
      ]
    );
  }

  console.log('Seeding compliance permits (15 records)...');
  for (let i = 0; i < 15; i += 1) {
    await pool.query(
      `INSERT INTO compliance_permits (permit_number, permit_type, site_name, agency, status, issue_date, expiration_date, owner, requirements)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        `PRM-${2025}-${String(i + 1).padStart(3, '0')}`,
        ['Air', 'Water', 'Waste', 'Drilling', 'Flaring'][i % 5],
        `${['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'][i % 5]} Facility`,
        ['EPA', 'Texas RRC', 'NDIC', 'PennDEP', 'CalGEM'][i % 5],
        ['Active', 'Pending', 'Expiring Soon', 'Active', 'Suspended'][i % 5],
        `2024-${String((i % 9) + 1).padStart(2, '0')}-01`,
        `2025-${String((i % 9) + 3).padStart(2, '0')}-28`,
        techs[(i + 4) % techs.length],
        'Maintain logs, inspection evidence, emission records, and renewal packet before expiration.'
      ]
    );
  }

  console.log('Seeding crews & vendors (15 records)...');
  for (let i = 0; i < 15; i += 1) {
    await pool.query(
      `INSERT INTO crew_vendors (name, organization_type, role, phone, email, status, certifications, assigned_area)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        techs[i],
        ['Crew', 'Vendor', 'Contractor', 'Operator', 'Inspector'][i % 5],
        ['Lease Operator', 'Maintenance Tech', 'HSE Inspector', 'Electrician', 'Integrity Specialist'][i % 5],
        `555-010${i}`,
        `${techs[i].toLowerCase().replace(/\s+/g, '.')}@petroai.example`,
        ['Active', 'On Call', 'Unavailable', 'Active', 'Inactive'][i % 5],
        ['H2S, LOTO', 'Confined Space', 'First Aid, H2S', 'Electrical Safety', 'API 1169'][i % 5],
        ['Permian', 'Williston', 'Delaware', 'Appalachian', 'Gulf Coast'][i % 5]
      ]
    );
  }

  console.log('Seeding inventory & parts (15 records)...');
  for (let i = 0; i < 15; i += 1) {
    await pool.query(
      `INSERT INTO inventory_parts (part_number, part_name, category, quantity_on_hand, reorder_level, unit_cost_usd, warehouse_location, supplier, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        `PT-${String(i + 1).padStart(4, '0')}`,
        ['Pressure transmitter', 'Valve kit', 'Pump seal', 'Flow meter', 'Chemical tote'][i % 5],
        ['Sensor', 'Valve', 'Pump', 'Electrical', 'Chemical'][i % 5],
        4 + i * 2,
        6 + (i % 5),
        125 + i * 73,
        `Warehouse ${['A', 'B', 'C'][i % 3]}-${i + 1}`,
        ['Emerson', 'Baker Hughes', 'NOV', 'Grainger', 'ChampionX'][i % 5],
        ['Available', 'Low Stock', 'Available', 'Reserved', 'Backordered'][i % 5]
      ]
    );
  }

  console.log('Seeding documents (15 records)...');
  for (let i = 0; i < 15; i += 1) {
    await pool.query(
      `INSERT INTO documents (document_title, document_type, related_entity, owner, status, effective_date, expiration_date, file_url, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        `${['Operating Procedure', 'Permit Evidence', 'Inspection Report', 'Equipment Manual', 'Vendor Contract'][i % 5]} ${i + 1}`,
        ['Procedure', 'Permit', 'Inspection', 'Manual', 'Contract'][i % 5],
        wells[i],
        techs[(i + 5) % techs.length],
        ['Current', 'Under Review', 'Current', 'Expired', 'Archived'][i % 5],
        `2024-${String((i % 9) + 1).padStart(2, '0')}-10`,
        `2026-${String((i % 9) + 1).padStart(2, '0')}-10`,
        `https://example.com/documents/petroai-${i + 1}.pdf`,
        'Document metadata seeded for controlled document workflow.'
      ]
    );
  }

  console.log('Seeding notifications (15 records)...');
  for (let i = 0; i < 15; i += 1) {
    await pool.query(
      `INSERT INTO notification_center (title, channel, recipient, severity, status, sent_at, acknowledged_at, related_record, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        `${['High pressure alert', 'Maintenance due', 'Permit expiring', 'Low inventory', 'Inspection finding'][i % 5]} - ${wells[i]}`,
        ['In-App', 'Email', 'Slack', 'PagerDuty', 'Webhook'][i % 5],
        techs[i],
        ['Low', 'Medium', 'High', 'Critical'][i % 4],
        ['Sent', 'Acknowledged', 'Pending', 'Escalated', 'Failed'][i % 5],
        `2025-01-${String((i % 24) + 1).padStart(2, '0')} 08:00:00`,
        i % 3 === 0 ? null : `2025-01-${String((i % 24) + 1).padStart(2, '0')} 09:15:00`,
        `WO-${i + 1}`,
        'Notification seeded for delivery and acknowledgement tracking.'
      ]
    );
  }

  console.log('Seeding settings (15 records)...');
  const settingsData = [
    ['default_pressure_unit', 'Units', 'psi', 'Default pressure display unit'],
    ['default_volume_unit', 'Units', 'bbl', 'Default liquid volume display unit'],
    ['high_pressure_threshold', 'Production', '3500', 'High-pressure review threshold'],
    ['water_cut_warning_pct', 'Production', '35', 'Water cut warning percentage'],
    ['maintenance_due_window_days', 'Maintenance', '14', 'Days before due date to flag PM work'],
    ['critical_alert_channel', 'Alerts', 'PagerDuty', 'Primary channel for critical alerts'],
    ['alert_ack_sla_minutes', 'Alerts', '30', 'Acknowledgement SLA for high severity alerts'],
    ['permit_renewal_notice_days', 'Compliance', '60', 'Days before expiration to notify permit owner'],
    ['document_retention_years', 'Compliance', '7', 'Document retention period'],
    ['inventory_low_stock_multiplier', 'Maintenance', '1.25', 'Low stock factor against reorder point'],
    ['rbac_delete_requires_admin', 'Security', 'true', 'Require admin role for destructive actions'],
    ['audit_log_retention_days', 'Security', '365', 'Audit trail retention period'],
    ['scada_poll_interval_seconds', 'Integrations', '60', 'SCADA polling interval'],
    ['webhook_retry_count', 'Integrations', '3', 'Webhook retry attempts'],
    ['field_offline_sync_hours', 'Integrations', '12', 'Maximum offline field sync window']
  ];
  for (const s of settingsData) {
    await pool.query(
      'INSERT INTO app_settings (setting_key, setting_group, setting_value, description, updated_by) VALUES ($1,$2,$3,$4,$5)',
      [s[0], s[1], s[2], s[3], 'Admin User']
    );
  }

  console.log('Seeding well master data (15 records)...');
  for (let i = 0; i < 15; i += 1) {
    await pool.query(
      `INSERT INTO well_master (well_name, api_number, field_name, operator, well_type, status, spud_date, first_production_date, latitude, longitude, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        wells[i],
        `42-${String(100 + i).padStart(3, '0')}-${String(20000 + i)}`,
        ['Permian Basin', 'Williston Basin', 'Delaware Basin', 'Appalachian', 'Gulf Coast'][i % 5],
        ['PetroAI Operating', 'Summit Energy', 'Frontier Resources', 'Blue Ridge E&P', 'Canyon Oil'][i % 5],
        ['Horizontal', 'Vertical', 'Directional', 'Injection', 'Disposal'][i % 5],
        ['Active', 'Active', 'Shut-in', 'Drilling', 'Completed'][i % 5],
        `202${i % 5}-${String((i % 9) + 1).padStart(2, '0')}-05`,
        `202${i % 5}-${String((i % 9) + 2).padStart(2, '0')}-15`,
        31.1 + i * 0.17,
        -102.2 - i * 0.13,
        'Master well record seeded for normalized cross-module references.'
      ]
    );
  }

  console.log('Seeding production targets (15 records)...');
  for (let i = 0; i < 15; i += 1) {
    await pool.query(
      `INSERT INTO production_targets (well_name, target_month, oil_target_bpd, gas_target_mcfd, water_limit_bpd, uptime_target_pct, owner, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        wells[i],
        `2025-${String((i % 12) + 1).padStart(2, '0')}-01`,
        450 + i * 42,
        800 + i * 120,
        180 + i * 18,
        92 + (i % 6),
        techs[i],
        ['Draft', 'Approved', 'Active', 'Met', 'Missed'][i % 5],
        'Monthly production target seeded for plan versus actual review.'
      ]
    );
  }

  console.log('Seeding shift handovers (15 records)...');
  for (let i = 0; i < 15; i += 1) {
    await pool.query(
      `INSERT INTO shift_handovers (shift_date, shift_name, outgoing_operator, incoming_operator, area, open_issues, completed_work, safety_notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        `2025-01-${String((i % 24) + 1).padStart(2, '0')}`,
        ['Day Shift', 'Night Shift', 'Swing Shift'][i % 3],
        techs[i],
        techs[(i + 1) % techs.length],
        ['Permian', 'Williston', 'Delaware', 'Appalachian', 'Gulf Coast'][i % 5],
        i % 3 === 0 ? 'Monitor compressor vibration and one open work order.' : 'No critical open issues.',
        'Completed routine rounds, checked alarms, and updated field notes.',
        i % 4 === 0 ? 'Review hot-work area before next shift.' : 'No new safety issues reported.',
        ['Open', 'Submitted', 'Reviewed', 'Closed'][i % 4]
      ]
    );
  }

  console.log('Seeding approval workflows (15 records)...');
  for (let i = 0; i < 15; i += 1) {
    await pool.query(
      `INSERT INTO approval_workflows (request_title, request_type, requested_by, approver, status, priority, due_date, related_record, business_justification)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        `${['Approve work order', 'Capital spend request', 'Data export approval', 'Permit change review', 'Record delete request'][i % 5]} ${i + 1}`,
        ['Work Order', 'Capital Spend', 'Data Export', 'Compliance Change', 'Record Delete'][i % 5],
        techs[i],
        techs[(i + 3) % techs.length],
        ['Pending', 'Approved', 'Needs Info', 'Rejected', 'Pending'][i % 5],
        ['Low', 'Medium', 'High', 'Critical'][i % 4],
        `2025-02-${String((i % 24) + 1).padStart(2, '0')}`,
        `REF-${i + 1}`,
        'Approval seeded to demonstrate controlled operational governance.'
      ]
    );
  }

  console.log('Seeding integrations & webhooks (15 records)...');
  for (let i = 0; i < 15; i += 1) {
    await pool.query(
      `INSERT INTO integration_endpoints (integration_name, integration_type, endpoint_url, auth_type, status, last_sync_at, owner, retry_policy, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        `${['SCADA Feed', 'Slack Alerts', 'PagerDuty Critical', 'ERP Work Orders', 'Data Lake Export'][i % 5]} ${i + 1}`,
        ['SCADA', 'Slack', 'PagerDuty', 'ERP', 'Data Lake'][i % 5],
        `https://integrations.example.com/petroai/${i + 1}`,
        ['API Key', 'OAuth', 'API Key', 'Basic', 'mTLS'][i % 5],
        ['Active', 'Testing', 'Failed', 'Paused', 'Active'][i % 5],
        `2025-01-${String((i % 24) + 1).padStart(2, '0')} 07:30:00`,
        techs[(i + 6) % techs.length],
        'Retry 3 times with exponential backoff',
        'Integration endpoint seeded for external system connectivity tracking.'
      ]
    );
  }

  console.log('Seeding operational reports (15 records)...');
  for (let i = 0; i < 15; i += 1) {
    await pool.query(
      `INSERT INTO operational_reports (report_name, report_type, schedule, owner, status, last_run_at, next_run_at, delivery_channel, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        `${['Daily Production', 'Maintenance Backlog', 'Compliance Deadline', 'Inventory Reorder', 'Executive Scorecard'][i % 5]} Report ${i + 1}`,
        ['Production', 'Maintenance', 'Compliance', 'Inventory', 'Executive'][i % 5],
        ['Daily', 'Weekly', 'Monthly', 'Weekly', 'Monthly'][i % 5],
        techs[(i + 8) % techs.length],
        ['Active', 'Active', 'Paused', 'Failed', 'Draft'][i % 5],
        `2025-01-${String((i % 24) + 1).padStart(2, '0')} 06:00:00`,
        `2025-02-${String((i % 24) + 1).padStart(2, '0')} 06:00:00`,
        ['Email', 'In-App', 'Slack', 'SFTP', 'Download'][i % 5],
        'Scheduled operational report seeded for reporting workflow.'
      ]
    );
  }

  console.log('Seeding audit trail (15 records)...');
  for (let i = 0; i < 15; i += 1) {
    await pool.query(
      'INSERT INTO audit_trail (action, entity_table, entity_id, actor, summary) VALUES ($1,$2,$3,$4,$5)',
      [
        ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'EXPORT'][i % 5],
        ['work_orders', 'asset_registry', 'maintenance_schedules', 'compliance_permits', 'documents'][i % 5],
        i + 1,
        techs[i],
        `Seeded audit event ${i + 1} for operations governance review.`
      ]
    );
  }

  console.log('Seeding AI analysis history (15 records)...');
  const aiHistoryData = [
    ['/ai/analyze/wellhead', 'wellhead_analytics', 1, 'Wellhead pressure is stable but close to high-pressure review threshold. Recommendation: continue choke monitoring and validate gauge calibration. Risks: pressure excursion, separator load increase. Next steps: review last 72 hours and confirm field readings.', 842, 'anthropic/claude-haiku-4.5'],
    ['/ai/analyze/equipment', 'equipment_failure', 4, 'Compressor health shows elevated failure risk due to high vibration and temperature. Recommendation: schedule bearing inspection and order critical spares. Risks: unplanned downtime, gas handling constraint. Next steps: maintenance window within 7 days.', 911, 'anthropic/claude-haiku-4.5'],
    ['/ai/analyze/environmental', 'environmental_compliance', 3, 'CO2 emissions exceed configured threshold. Recommendation: review capture options and prioritize corrective action. Risks: penalty exposure and audit finding. Next steps: assign remediation owner and update inspection plan.', 776, 'anthropic/claude-haiku-4.5'],
    ['/ai/analyze/forecast', 'production_forecasting', 10, 'Forecast confidence is low for Utica N-1 due to volatility and long horizon. Recommendation: rerun with updated production history and pressure data. Risks: reserve overstatement. Next steps: compare type curve and recent actuals.', 688, 'anthropic/claude-haiku-4.5'],
    ['/ai/analyze/pipeline', 'pipeline_monitoring', 8, 'Niobrara lateral integrity is critical due to high corrosion trend. Recommendation: immediate inspection and pressure reduction review. Risks: leak, forced outage. Next steps: dispatch integrity crew and prepare repair plan.', 958, 'anthropic/claude-haiku-4.5'],
    ['/ai/analyze/water', 'water_management', 10, 'Produced water trucking cost is high and recycling rate is zero. Recommendation: evaluate temporary treatment skid and disposal alternatives. Risks: margin erosion. Next steps: compare per-barrel disposal cost by route.', 744, 'anthropic/claude-haiku-4.5'],
    ['/ai/analyze/safety', 'safety_incidents', 8, 'Confined-space incident indicates critical procedural gap. Recommendation: refresh entry permits, ventilation testing, and rescue readiness. Risks: repeat severe event. Next steps: verify training records and audit equipment.', 1002, 'anthropic/claude-haiku-4.5'],
    ['/ai/analyze/gas-lift', 'gas_lift_optimization', 3, 'Gas lift optimization appears economically attractive with strong incremental revenue. Recommendation: preserve current injection setting and monitor GLR. Risks: over-injection and compressor constraint. Next steps: weekly rate review.', 691, 'anthropic/claude-haiku-4.5'],
    ['/ai/analyze/cost', 'cost_analysis', 15, 'Haynesville D-2 economics are unfavorable at current production state. Recommendation: evaluate restart case against shut-in maintenance cost. Risks: negative margin continuation. Next steps: update price deck and workover estimate.', 812, 'anthropic/claude-haiku-4.5'],
    ['/ai/analyze/drilling', 'drilling_operations', 14, 'Tuscaloosa drilling torque and mud weight need close attention. Recommendation: review hydraulics and wellbore stability model. Risks: stuck pipe, NPT. Next steps: run torque and drag model before next stand.', 923, 'anthropic/claude-haiku-4.5'],
    ['/ai/analyze/performance', 'well_performance', 13, 'Monterey L-2 has low efficiency driven by high water cut. Recommendation: assess lift method and water shutoff options. Risks: rising disposal cost. Next steps: review zonal contribution and pump curve.', 799, 'anthropic/claude-haiku-4.5'],
    ['/ai/analyze/reservoir', 'reservoir_simulation', 11, 'Thermal recovery assumptions require validation for Monterey Shale. Recommendation: update reservoir model with latest saturation data. Risks: recovery factor uncertainty. Next steps: run sensitivity scenarios.', 734, 'anthropic/claude-haiku-4.5'],
    ['/ai/analyze/decline-curve', 'decline_curves', 2, 'Bakken B-3 decline is steeper than expected. Recommendation: inspect artificial lift and compare offset wells. Risks: earlier economic limit. Next steps: run hyperbolic and exponential fit comparison.', 866, 'anthropic/claude-haiku-4.5'],
    ['/ai/analyze/production-anomaly', 'production_history', 3, 'Recent production history shows oil-rate drop with pressure decline. Recommendation: check choke setting, sand production, and pump performance. Risks: mechanical restriction. Next steps: inspect surface equipment.', 701, 'anthropic/claude-haiku-4.5'],
    ['/ai/analyze/multi-well-portfolio', 'production_history', null, 'Portfolio review identifies Wolfcamp F-1 and Eagle Ford A-1 as strongest near-term contributors. Recommendation: protect uptime on top wells and defer low-return work. Risks: concentration of production exposure.', 940, 'anthropic/claude-haiku-4.5']
  ];
  for (const ai of aiHistoryData) {
    await pool.query(
      'INSERT INTO ai_analyses (user_id, endpoint, entity_table, entity_id, result, tokens_used, model) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [adminUserId, ai[0], ai[1], ai[2], ai[3], ai[4], ai[5]]
    );
  }

  console.log('Seed completed successfully!');
  await pool.end();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
