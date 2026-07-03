const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

const RESOURCES = {
  'work-orders': {
    table: 'work_orders',
    title: 'Work Orders',
    required: ['title'],
    fields: ['title', 'well_name', 'asset_tag', 'priority', 'status', 'assigned_to', 'due_date', 'estimated_cost_usd', 'description'],
    createSql: `
      CREATE TABLE IF NOT EXISTS work_orders (
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
      )`,
  },
  assets: {
    table: 'asset_registry',
    title: 'Asset Registry',
    required: ['asset_tag', 'asset_name'],
    fields: ['asset_tag', 'asset_name', 'asset_type', 'well_name', 'manufacturer', 'install_date', 'lifecycle_status', 'criticality', 'replacement_due_date', 'notes'],
    createSql: `
      CREATE TABLE IF NOT EXISTS asset_registry (
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
      )`,
  },
  maintenance: {
    table: 'maintenance_schedules',
    title: 'Maintenance Schedule',
    required: ['task_name'],
    fields: ['task_name', 'asset_tag', 'well_name', 'maintenance_type', 'frequency', 'next_due_date', 'assigned_to', 'status', 'instructions'],
    createSql: `
      CREATE TABLE IF NOT EXISTS maintenance_schedules (
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
      )`,
  },
  inspections: {
    table: 'inspection_logs',
    title: 'Inspection Logs',
    required: ['inspection_type', 'site_name'],
    fields: ['inspection_type', 'site_name', 'well_name', 'inspector', 'inspection_date', 'status', 'findings', 'corrective_action', 'next_inspection_date'],
    createSql: `
      CREATE TABLE IF NOT EXISTS inspection_logs (
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
      )`,
  },
  permits: {
    table: 'compliance_permits',
    title: 'Compliance Permits',
    required: ['permit_number', 'permit_type'],
    fields: ['permit_number', 'permit_type', 'site_name', 'agency', 'status', 'issue_date', 'expiration_date', 'owner', 'requirements'],
    createSql: `
      CREATE TABLE IF NOT EXISTS compliance_permits (
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
      )`,
  },
  'crews-vendors': {
    table: 'crew_vendors',
    title: 'Crews & Vendors',
    required: ['name'],
    fields: ['name', 'organization_type', 'role', 'phone', 'email', 'status', 'certifications', 'assigned_area'],
    createSql: `
      CREATE TABLE IF NOT EXISTS crew_vendors (
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
      )`,
  },
  inventory: {
    table: 'inventory_parts',
    title: 'Inventory & Parts',
    required: ['part_number', 'part_name'],
    fields: ['part_number', 'part_name', 'category', 'quantity_on_hand', 'reorder_level', 'unit_cost_usd', 'warehouse_location', 'supplier', 'status'],
    createSql: `
      CREATE TABLE IF NOT EXISTS inventory_parts (
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
      )`,
  },
  documents: {
    table: 'documents',
    title: 'Documents',
    required: ['document_title'],
    fields: ['document_title', 'document_type', 'related_entity', 'owner', 'status', 'effective_date', 'expiration_date', 'file_url', 'notes'],
    createSql: `
      CREATE TABLE IF NOT EXISTS documents (
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
      )`,
  },
  notifications: {
    table: 'notification_center',
    title: 'Notification Center',
    required: ['title'],
    fields: ['title', 'channel', 'recipient', 'severity', 'status', 'sent_at', 'acknowledged_at', 'related_record', 'message'],
    createSql: `
      CREATE TABLE IF NOT EXISTS notification_center (
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
      )`,
  },
  settings: {
    table: 'app_settings',
    title: 'Settings',
    required: ['setting_key', 'setting_group'],
    fields: ['setting_key', 'setting_group', 'setting_value', 'description', 'updated_by'],
    createSql: `
      CREATE TABLE IF NOT EXISTS app_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL,
        setting_group VARCHAR(100) NOT NULL,
        setting_value TEXT,
        description TEXT,
        updated_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
  },
  wells: {
    table: 'well_master',
    title: 'Well Master Data',
    required: ['well_name'],
    fields: ['well_name', 'api_number', 'field_name', 'operator', 'well_type', 'status', 'spud_date', 'first_production_date', 'latitude', 'longitude', 'notes'],
    createSql: `
      CREATE TABLE IF NOT EXISTS well_master (
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
      )`,
  },
  targets: {
    table: 'production_targets',
    title: 'Production Targets',
    required: ['well_name', 'target_month'],
    fields: ['well_name', 'target_month', 'oil_target_bpd', 'gas_target_mcfd', 'water_limit_bpd', 'uptime_target_pct', 'owner', 'status', 'notes'],
    createSql: `
      CREATE TABLE IF NOT EXISTS production_targets (
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
      )`,
  },
  handovers: {
    table: 'shift_handovers',
    title: 'Shift Handovers',
    required: ['shift_date', 'outgoing_operator'],
    fields: ['shift_date', 'shift_name', 'outgoing_operator', 'incoming_operator', 'area', 'open_issues', 'completed_work', 'safety_notes', 'status'],
    createSql: `
      CREATE TABLE IF NOT EXISTS shift_handovers (
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
      )`,
  },
  approvals: {
    table: 'approval_workflows',
    title: 'Approval Workflows',
    required: ['request_title', 'request_type'],
    fields: ['request_title', 'request_type', 'requested_by', 'approver', 'status', 'priority', 'due_date', 'related_record', 'business_justification'],
    createSql: `
      CREATE TABLE IF NOT EXISTS approval_workflows (
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
      )`,
  },
  integrations: {
    table: 'integration_endpoints',
    title: 'Integrations & Webhooks',
    required: ['integration_name', 'integration_type'],
    fields: ['integration_name', 'integration_type', 'endpoint_url', 'auth_type', 'status', 'last_sync_at', 'owner', 'retry_policy', 'notes'],
    createSql: `
      CREATE TABLE IF NOT EXISTS integration_endpoints (
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
      )`,
  },
  reports: {
    table: 'operational_reports',
    title: 'Operational Reports',
    required: ['report_name', 'report_type'],
    fields: ['report_name', 'report_type', 'schedule', 'owner', 'status', 'last_run_at', 'next_run_at', 'delivery_channel', 'description'],
    createSql: `
      CREATE TABLE IF NOT EXISTS operational_reports (
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
      )`,
  },
  'audit-trail': {
    table: 'audit_trail',
    title: 'Audit Trail',
    required: ['action', 'entity_table'],
    fields: ['action', 'entity_table', 'entity_id', 'actor', 'summary'],
    readOnly: true,
    createSql: `
      CREATE TABLE IF NOT EXISTS audit_trail (
        id SERIAL PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        entity_table VARCHAR(100) NOT NULL,
        entity_id INTEGER,
        actor VARCHAR(255),
        summary TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`,
  },
};

const parseLimit = (value) => Math.max(1, Math.min(100, Number.parseInt(value || '50', 10) || 50));

async function ensureTables() {
  for (const resource of Object.values(RESOURCES)) {
    await pool.query(resource.createSql);
  }
}

function getResource(key) {
  const resource = RESOURCES[key];
  if (!resource) {
    const err = new Error('Unknown operations resource');
    err.status = 404;
    throw err;
  }
  return resource;
}

function validateRequired(resource, payload) {
  const missing = resource.required.filter((field) => !payload[field]);
  if (missing.length) {
    const err = new Error(`${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} required`);
    err.status = 400;
    throw err;
  }
}

function sanitizePayload(resource, body) {
  return resource.fields.reduce((payload, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) payload[field] = body[field] === '' ? null : body[field];
    return payload;
  }, {});
}

async function logAudit(req, action, resource, entityId, payload) {
  const actor = req.user?.email || req.user?.name || `user:${req.user?.id || 'unknown'}`;
  const summary = `${action} ${resource.title}${entityId ? ` #${entityId}` : ''}`;
  await pool.query(
    'INSERT INTO audit_trail (action, entity_table, entity_id, actor, summary) VALUES ($1,$2,$3,$4,$5)',
    [action, resource.table, entityId || null, actor, payload?.summary || summary]
  );
}

const tablesReady = ensureTables().catch((err) => {
  console.error(err);
  throw err;
});

router.use(async (req, res, next) => {
  try {
    await tablesReady;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Operations tables are not ready' });
  }
});

router.get('/resources', auth, async (req, res) => {
  res.json(Object.entries(RESOURCES).map(([key, resource]) => ({
    key,
    title: resource.title,
    fields: resource.fields,
    required: resource.required,
    readOnly: Boolean(resource.readOnly),
  })));
});

router.get('/insights/summary', auth, async (req, res) => {
  try {
    const countResults = await Promise.all(Object.entries(RESOURCES).map(async ([key, resource]) => {
      const result = await pool.query(`SELECT COUNT(*)::int AS total FROM ${resource.table}`);
      return { key, title: resource.title, table: resource.table, total: result.rows[0].total };
    }));

    const [
      overdueWorkOrders,
      dueMaintenance,
      expiringPermits,
      lowInventory,
      pendingApprovals,
      failedIntegrations,
      openInspections,
      failedReports,
      criticalNotifications,
    ] = await Promise.all([
      pool.query(`SELECT * FROM work_orders WHERE due_date < CURRENT_DATE AND status NOT IN ('Completed','Cancelled') ORDER BY due_date ASC LIMIT 10`),
      pool.query(`SELECT * FROM maintenance_schedules WHERE next_due_date <= CURRENT_DATE + INTERVAL '14 days' OR status IN ('Overdue','Due Soon') ORDER BY next_due_date ASC LIMIT 10`),
      pool.query(`SELECT * FROM compliance_permits WHERE expiration_date <= CURRENT_DATE + INTERVAL '60 days' AND status NOT IN ('Expired','Suspended') ORDER BY expiration_date ASC LIMIT 10`),
      pool.query(`SELECT * FROM inventory_parts WHERE quantity_on_hand <= reorder_level OR status IN ('Low Stock','Backordered') ORDER BY quantity_on_hand ASC LIMIT 10`),
      pool.query(`SELECT * FROM approval_workflows WHERE status IN ('Pending','Needs Info') ORDER BY due_date ASC NULLS LAST LIMIT 10`),
      pool.query(`SELECT * FROM integration_endpoints WHERE status IN ('Failed','Paused','Testing') ORDER BY updated_at DESC LIMIT 10`),
      pool.query(`SELECT * FROM inspection_logs WHERE status IN ('Open','Finding','Failed') ORDER BY inspection_date DESC NULLS LAST LIMIT 10`),
      pool.query(`SELECT * FROM operational_reports WHERE status IN ('Failed','Paused') ORDER BY next_run_at ASC NULLS LAST LIMIT 10`),
      pool.query(`SELECT * FROM notification_center WHERE severity IN ('High','Critical') AND status NOT IN ('Acknowledged') ORDER BY created_at DESC LIMIT 10`),
    ]);

    const exceptions = {
      overdueWorkOrders: overdueWorkOrders.rows,
      dueMaintenance: dueMaintenance.rows,
      expiringPermits: expiringPermits.rows,
      lowInventory: lowInventory.rows,
      pendingApprovals: pendingApprovals.rows,
      failedIntegrations: failedIntegrations.rows,
      openInspections: openInspections.rows,
      failedReports: failedReports.rows,
      criticalNotifications: criticalNotifications.rows,
    };

    res.json({
      counts: countResults,
      exceptionCounts: Object.fromEntries(Object.entries(exceptions).map(([key, rows]) => [key, rows.length])),
      exceptions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:resource', auth, async (req, res) => {
  try {
    const resource = getResource(req.params.resource);
    const limit = parseLimit(req.query.limit);
    const result = await pool.query(`SELECT * FROM ${resource.table} ORDER BY id DESC LIMIT $1`, [limit]);
    res.json(result.rows);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/:resource/:id', auth, async (req, res) => {
  try {
    const resource = getResource(req.params.resource);
    const result = await pool.query(`SELECT * FROM ${resource.table} WHERE id=$1`, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/:resource', auth, async (req, res) => {
  try {
    const resource = getResource(req.params.resource);
    if (resource.readOnly) return res.status(405).json({ error: `${resource.title} is read-only` });
    const payload = sanitizePayload(resource, req.body || {});
    validateRequired(resource, payload);
    const columns = Object.keys(payload);
    const values = Object.values(payload);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(',');
    const result = await pool.query(
      `INSERT INTO ${resource.table} (${columns.join(',')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    await logAudit(req, 'CREATE', resource, result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.put('/:resource/:id', auth, async (req, res) => {
  try {
    const resource = getResource(req.params.resource);
    if (resource.readOnly) return res.status(405).json({ error: `${resource.title} is read-only` });
    const payload = sanitizePayload(resource, req.body || {});
    if (!Object.keys(payload).length) return res.status(400).json({ error: 'No valid fields provided' });
    const values = Object.values(payload);
    const assignments = Object.keys(payload).map((field, index) => `${field}=$${index + 1}`).join(',');
    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE ${resource.table} SET ${assignments}, updated_at=NOW() WHERE id=$${values.length} RETURNING *`,
      values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    await logAudit(req, 'UPDATE', resource, result.rows[0].id);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.delete('/:resource/:id', auth, async (req, res) => {
  try {
    const resource = getResource(req.params.resource);
    if (resource.readOnly) return res.status(405).json({ error: `${resource.title} is read-only` });
    const result = await pool.query(`DELETE FROM ${resource.table} WHERE id=$1 RETURNING *`, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    await logAudit(req, 'DELETE', resource, result.rows[0].id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
