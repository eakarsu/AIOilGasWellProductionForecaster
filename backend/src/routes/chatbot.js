const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

const RESOURCES = {
  'wellhead analytics': { endpoint: '/wellhead-analytics', table: 'wellhead_analytics', aiType: 'wellhead', route: 'wellhead-analytics' },
  wellhead: { endpoint: '/wellhead-analytics', table: 'wellhead_analytics', aiType: 'wellhead', route: 'wellhead-analytics' },
  reservoir: { endpoint: '/reservoir-simulation', table: 'reservoir_simulation', aiType: 'reservoir', route: 'reservoir-simulation' },
  'reservoir simulation': { endpoint: '/reservoir-simulation', table: 'reservoir_simulation', aiType: 'reservoir', route: 'reservoir-simulation' },
  'decline curves': { endpoint: '/decline-curves', table: 'decline_curves', aiType: 'decline-curve', route: 'decline-curves' },
  decline: { endpoint: '/decline-curves', table: 'decline_curves', aiType: 'decline-curve', route: 'decline-curves' },
  equipment: { endpoint: '/equipment-failure', table: 'equipment_failure', aiType: 'equipment', route: 'equipment-failure' },
  'equipment failure': { endpoint: '/equipment-failure', table: 'equipment_failure', aiType: 'equipment', route: 'equipment-failure' },
  environmental: { endpoint: '/environmental-compliance', table: 'environmental_compliance', aiType: 'environmental', route: 'environmental-compliance' },
  'environmental compliance': { endpoint: '/environmental-compliance', table: 'environmental_compliance', aiType: 'environmental', route: 'environmental-compliance' },
  forecast: { endpoint: '/production-forecasting', table: 'production_forecasting', aiType: 'forecast', route: 'production-forecasting' },
  'production forecasting': { endpoint: '/production-forecasting', table: 'production_forecasting', aiType: 'forecast', route: 'production-forecasting' },
  performance: { endpoint: '/well-performance', table: 'well_performance', aiType: 'performance', route: 'well-performance' },
  'well performance': { endpoint: '/well-performance', table: 'well_performance', aiType: 'performance', route: 'well-performance' },
  drilling: { endpoint: '/drilling-operations', table: 'drilling_operations', aiType: 'drilling', route: 'drilling-operations' },
  'drilling operations': { endpoint: '/drilling-operations', table: 'drilling_operations', aiType: 'drilling', route: 'drilling-operations' },
  cost: { endpoint: '/cost-analysis', table: 'cost_analysis', aiType: 'cost', route: 'cost-analysis' },
  'cost analysis': { endpoint: '/cost-analysis', table: 'cost_analysis', aiType: 'cost', route: 'cost-analysis' },
  pipeline: { endpoint: '/pipeline-monitoring', table: 'pipeline_monitoring', aiType: 'pipeline', route: 'pipeline-monitoring' },
  'pipeline monitoring': { endpoint: '/pipeline-monitoring', table: 'pipeline_monitoring', aiType: 'pipeline', route: 'pipeline-monitoring' },
  water: { endpoint: '/water-management', table: 'water_management', aiType: 'water', route: 'water-management' },
  'water management': { endpoint: '/water-management', table: 'water_management', aiType: 'water', route: 'water-management' },
  safety: { endpoint: '/safety-incidents', table: 'safety_incidents', aiType: 'safety', route: 'safety-incidents' },
  'safety incidents': { endpoint: '/safety-incidents', table: 'safety_incidents', aiType: 'safety', route: 'safety-incidents' },
  'gas lift': { endpoint: '/gas-lift-optimization', table: 'gas_lift_optimization', aiType: 'gaslift', route: 'gas-lift-optimization' },
  'gas lift optimization': { endpoint: '/gas-lift-optimization', table: 'gas_lift_optimization', aiType: 'gaslift', route: 'gas-lift-optimization' },
  'production history': { endpoint: '/production-history', table: 'production_history', route: 'production-history', userScoped: true },
  history: { endpoint: '/production-history', table: 'production_history', route: 'production-history', userScoped: true },
  alerts: { endpoint: '/alerts', table: 'alerts', route: 'alerts' },
  alert: { endpoint: '/alerts', table: 'alerts', route: 'alerts' },
  'alert rules': { endpoint: '/alerts/rules', table: 'alert_rules', route: 'alerts/rules', userScoped: true },
  'alert rule': { endpoint: '/alerts/rules', table: 'alert_rules', route: 'alerts/rules', userScoped: true },
  'field notes': { endpoint: '/field-notes', table: 'field_notes', route: 'field-notes' },
  'field note': { endpoint: '/field-notes', table: 'field_notes', route: 'field-notes' },
  notes: { endpoint: '/field-notes', table: 'field_notes', route: 'field-notes' },
  'ai history': { endpoint: '/ai-history', table: 'ai_analyses', route: 'ai-history', userScoped: true },
  'ai analyses': { endpoint: '/ai-history', table: 'ai_analyses', route: 'ai-history', userScoped: true },
  'work orders': { endpoint: '/operations/work-orders', table: 'work_orders', route: 'operations/work-orders' },
  'work order': { endpoint: '/operations/work-orders', table: 'work_orders', route: 'operations/work-orders' },
  assets: { endpoint: '/operations/assets', table: 'asset_registry', route: 'operations/assets' },
  'asset registry': { endpoint: '/operations/assets', table: 'asset_registry', route: 'operations/assets' },
  maintenance: { endpoint: '/operations/maintenance', table: 'maintenance_schedules', route: 'operations/maintenance' },
  'maintenance schedule': { endpoint: '/operations/maintenance', table: 'maintenance_schedules', route: 'operations/maintenance' },
  inspections: { endpoint: '/operations/inspections', table: 'inspection_logs', route: 'operations/inspections' },
  inspection: { endpoint: '/operations/inspections', table: 'inspection_logs', route: 'operations/inspections' },
  'inspection logs': { endpoint: '/operations/inspections', table: 'inspection_logs', route: 'operations/inspections' },
  'inspection log': { endpoint: '/operations/inspections', table: 'inspection_logs', route: 'operations/inspections' },
  permits: { endpoint: '/operations/permits', table: 'compliance_permits', route: 'operations/permits' },
  permit: { endpoint: '/operations/permits', table: 'compliance_permits', route: 'operations/permits' },
  'compliance permits': { endpoint: '/operations/permits', table: 'compliance_permits', route: 'operations/permits' },
  'compliance permit': { endpoint: '/operations/permits', table: 'compliance_permits', route: 'operations/permits' },
  crews: { endpoint: '/operations/crews-vendors', table: 'crew_vendors', route: 'operations/crews-vendors' },
  vendors: { endpoint: '/operations/crews-vendors', table: 'crew_vendors', route: 'operations/crews-vendors' },
  'crews and vendors': { endpoint: '/operations/crews-vendors', table: 'crew_vendors', route: 'operations/crews-vendors' },
  inventory: { endpoint: '/operations/inventory', table: 'inventory_parts', route: 'operations/inventory' },
  parts: { endpoint: '/operations/inventory', table: 'inventory_parts', route: 'operations/inventory' },
  documents: { endpoint: '/operations/documents', table: 'documents', route: 'operations/documents' },
  document: { endpoint: '/operations/documents', table: 'documents', route: 'operations/documents' },
  notifications: { endpoint: '/operations/notifications', table: 'notification_center', route: 'operations/notifications' },
  notification: { endpoint: '/operations/notifications', table: 'notification_center', route: 'operations/notifications' },
  'notification center': { endpoint: '/operations/notifications', table: 'notification_center', route: 'operations/notifications' },
  settings: { endpoint: '/operations/settings', table: 'app_settings', route: 'operations/settings' },
  setting: { endpoint: '/operations/settings', table: 'app_settings', route: 'operations/settings' },
  'audit trail': { endpoint: '/operations/audit-trail', table: 'audit_trail', route: 'operations/audit-trail' },
  wells: { endpoint: '/operations/wells', table: 'well_master', route: 'operations/wells' },
  'well master': { endpoint: '/operations/wells', table: 'well_master', route: 'operations/wells' },
  'well master data': { endpoint: '/operations/wells', table: 'well_master', route: 'operations/wells' },
  targets: { endpoint: '/operations/targets', table: 'production_targets', route: 'operations/targets' },
  'production targets': { endpoint: '/operations/targets', table: 'production_targets', route: 'operations/targets' },
  'production target': { endpoint: '/operations/targets', table: 'production_targets', route: 'operations/targets' },
  handovers: { endpoint: '/operations/handovers', table: 'shift_handovers', route: 'operations/handovers' },
  'shift handovers': { endpoint: '/operations/handovers', table: 'shift_handovers', route: 'operations/handovers' },
  'shift handover': { endpoint: '/operations/handovers', table: 'shift_handovers', route: 'operations/handovers' },
  approvals: { endpoint: '/operations/approvals', table: 'approval_workflows', route: 'operations/approvals' },
  approval: { endpoint: '/operations/approvals', table: 'approval_workflows', route: 'operations/approvals' },
  'approval workflows': { endpoint: '/operations/approvals', table: 'approval_workflows', route: 'operations/approvals' },
  'approval workflow': { endpoint: '/operations/approvals', table: 'approval_workflows', route: 'operations/approvals' },
  integrations: { endpoint: '/operations/integrations', table: 'integration_endpoints', route: 'operations/integrations' },
  integration: { endpoint: '/operations/integrations', table: 'integration_endpoints', route: 'operations/integrations' },
  webhooks: { endpoint: '/operations/integrations', table: 'integration_endpoints', route: 'operations/integrations' },
  webhook: { endpoint: '/operations/integrations', table: 'integration_endpoints', route: 'operations/integrations' },
  reports: { endpoint: '/operations/reports', table: 'operational_reports', route: 'operations/reports' },
  'operational reports': { endpoint: '/operations/reports', table: 'operational_reports', route: 'operations/reports' },
  'operational report': { endpoint: '/operations/reports', table: 'operational_reports', route: 'operations/reports' },
};

const TABLE_COLUMNS = {
  field_notes: ['well_name', 'note_type', 'title', 'content', 'author', 'priority'],
  alerts: ['alert_name', 'table_name', 'field_name', 'operator', 'threshold_value', 'severity'],
  alert_rules: ['metric', 'operator', 'threshold', 'entity_type'],
  production_history: ['well_id', 'recorded_at', 'oil_bpd', 'gas_mcfd', 'water_bpd', 'bhp'],
  work_orders: ['title', 'well_name', 'asset_tag', 'priority', 'status', 'assigned_to', 'due_date', 'estimated_cost_usd', 'description'],
  asset_registry: ['asset_tag', 'asset_name', 'asset_type', 'well_name', 'manufacturer', 'install_date', 'lifecycle_status', 'criticality', 'replacement_due_date', 'notes'],
  maintenance_schedules: ['task_name', 'asset_tag', 'well_name', 'maintenance_type', 'frequency', 'next_due_date', 'assigned_to', 'status', 'instructions'],
  inspection_logs: ['inspection_type', 'site_name', 'well_name', 'inspector', 'inspection_date', 'status', 'findings', 'corrective_action', 'next_inspection_date'],
  compliance_permits: ['permit_number', 'permit_type', 'site_name', 'agency', 'status', 'issue_date', 'expiration_date', 'owner', 'requirements'],
  crew_vendors: ['name', 'organization_type', 'role', 'phone', 'email', 'status', 'certifications', 'assigned_area'],
  inventory_parts: ['part_number', 'part_name', 'category', 'quantity_on_hand', 'reorder_level', 'unit_cost_usd', 'warehouse_location', 'supplier', 'status'],
  documents: ['document_title', 'document_type', 'related_entity', 'owner', 'status', 'effective_date', 'expiration_date', 'file_url', 'notes'],
  notification_center: ['title', 'channel', 'recipient', 'severity', 'status', 'sent_at', 'acknowledged_at', 'related_record', 'message'],
  app_settings: ['setting_key', 'setting_group', 'setting_value', 'description', 'updated_by'],
  well_master: ['well_name', 'api_number', 'field_name', 'operator', 'well_type', 'status', 'spud_date', 'first_production_date', 'latitude', 'longitude', 'notes'],
  production_targets: ['well_name', 'target_month', 'oil_target_bpd', 'gas_target_mcfd', 'water_limit_bpd', 'uptime_target_pct', 'owner', 'status', 'notes'],
  shift_handovers: ['shift_date', 'shift_name', 'outgoing_operator', 'incoming_operator', 'area', 'open_issues', 'completed_work', 'safety_notes', 'status'],
  approval_workflows: ['request_title', 'request_type', 'requested_by', 'approver', 'status', 'priority', 'due_date', 'related_record', 'business_justification'],
  integration_endpoints: ['integration_name', 'integration_type', 'endpoint_url', 'auth_type', 'status', 'last_sync_at', 'owner', 'retry_policy', 'notes'],
  operational_reports: ['report_name', 'report_type', 'schedule', 'owner', 'status', 'last_run_at', 'next_run_at', 'delivery_channel', 'description'],
};

const READ_ONLY_TABLES = new Set(['audit_trail', 'ai_analyses']);
const OPERATION_TABLES = [
  'work_orders',
  'asset_registry',
  'maintenance_schedules',
  'inspection_logs',
  'compliance_permits',
  'crew_vendors',
  'inventory_parts',
  'documents',
  'notification_center',
  'app_settings',
  'well_master',
  'production_targets',
  'shift_handovers',
  'approval_workflows',
  'integration_endpoints',
  'operational_reports',
  'audit_trail',
];
const TABLES_WITHOUT_UPDATED_AT = new Set(['production_history', 'audit_trail', 'ai_analyses']);

function normalize(text) {
  return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function findResource(message) {
  const text = normalize(message);
  return Object.entries(RESOURCES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([name]) => text.includes(name))?.[1] || null;
}

function extractJson(message) {
  const match = String(message).match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch (_) {
    return null;
  }
}

function getLimit(message) {
  const match = normalize(message).match(/\b(?:limit|top|show|list)\s+(\d{1,3})\b/);
  return Math.max(1, Math.min(50, match ? Number(match[1]) : 10));
}

function getId(message) {
  const match = normalize(message).match(/\bid\s*#?(\d+)\b|#(\d+)|\brow\s+(\d+)\b/);
  return match ? Number(match[1] || match[2] || match[3]) : null;
}

function extractSearchTerm(message, resource) {
  const raw = String(message || '');
  const patterns = [
    /\b(?:search|find)\s+(.+?)\s+in\s+(.+)$/i,
    /\b(?:search|find)\s+(.+)$/i,
  ];
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match?.[1]) {
      return match[1]
        .replace(new RegExp(resource.table.replace(/_/g, ' '), 'i'), '')
        .replace(/\b(?:work orders?|assets?|asset registry|maintenance|maintenance schedules?|permits?|compliance permits?|reports?|operational reports?|integrations?|webhooks?|documents?|inventory|parts|settings|notifications?|notification center|handovers?|shift handovers?|approvals?|approval workflows?|wells?|well master data|production targets?)\b/gi, '')
        .trim();
    }
  }
  return '';
}

function formatRows(rows, resource) {
  if (!rows.length) return `No rows found for ${resource.table}.`;
  const preview = rows.slice(0, 5).map((row) => {
    const label = row.well_name || row.alert_name || row.title || row.asset_name || row.task_name || row.permit_number || row.name || row.part_name || row.document_title || row.setting_key || row.summary || row.endpoint || row.metric || row.pipeline_name || row.equipment_name || row.id;
    return `#${row.id}${label ? ` - ${label}` : ''}`;
  });
  return `Found ${rows.length} row${rows.length === 1 ? '' : 's'} from ${resource.table}. ${preview.join('; ')}`;
}

async function listRows(resource, userId, limit) {
  const values = [];
  let where = '';
  if (resource.userScoped) {
    values.push(userId);
    where = 'WHERE user_id = $1';
  }
  values.push(limit);
  const query = `SELECT * FROM ${resource.table} ${where} ORDER BY id DESC LIMIT $${values.length}`;
  const result = await pool.query(query, values);
  return result.rows;
}

async function countRows(resource, userId) {
  const values = [];
  let where = '';
  if (resource.userScoped) {
    values.push(userId);
    where = 'WHERE user_id = $1';
  }
  const result = await pool.query(`SELECT COUNT(*)::int AS total FROM ${resource.table} ${where}`, values);
  return result.rows[0].total;
}

async function getRow(resource, userId, id) {
  const values = [id];
  let where = 'WHERE id = $1';
  if (resource.userScoped) {
    values.push(userId);
    where += ` AND user_id = $${values.length}`;
  }
  const result = await pool.query(`SELECT * FROM ${resource.table} ${where}`, values);
  return result.rows[0] || null;
}

async function createRow(resource, body, userId) {
  const columns = TABLE_COLUMNS[resource.table];
  if (!columns || READ_ONLY_TABLES.has(resource.table)) {
    throw new Error(`Create is not enabled for ${resource.table}. Use the page form or provide a supported operations table.`);
  }
  const payload = Array.isArray(body) ? body[0] : body;
  if (!payload || typeof payload !== 'object') throw new Error('Provide JSON data for the row to create.');

  const insertColumns = resource.userScoped ? ['user_id', ...columns] : columns;
  const values = resource.userScoped ? [userId, ...columns.map((col) => payload[col] ?? null)] : columns.map((col) => payload[col] ?? null);
  const placeholders = values.map((_, index) => `$${index + 1}`).join(',');
  const result = await pool.query(
    `INSERT INTO ${resource.table} (${insertColumns.join(',')}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  await logChatAudit('CREATE', resource.table, result.rows[0].id, userId);
  return result.rows[0];
}

async function updateRow(resource, body, userId, id) {
  const columns = TABLE_COLUMNS[resource.table];
  if (!columns || READ_ONLY_TABLES.has(resource.table)) {
    throw new Error(`Update is not enabled for ${resource.table}.`);
  }
  const payload = Array.isArray(body) ? body[0] : body;
  if (!payload || typeof payload !== 'object') throw new Error('Provide JSON data for fields to update.');
  const updates = columns.filter((col) => Object.prototype.hasOwnProperty.call(payload, col));
  if (!updates.length) throw new Error(`No supported fields provided. Supported fields: ${columns.join(', ')}`);

  const values = updates.map((col) => payload[col] ?? null);
  const assignments = updates.map((col, index) => `${col}=$${index + 1}`).join(',');
  values.push(id);
  let where = `WHERE id=$${values.length}`;
  if (resource.userScoped) {
    values.push(userId);
    where += ` AND user_id=$${values.length}`;
  }
  const timestampUpdate = TABLES_WITHOUT_UPDATED_AT.has(resource.table) ? '' : ', updated_at=NOW()';
  const result = await pool.query(`UPDATE ${resource.table} SET ${assignments}${timestampUpdate} ${where} RETURNING *`, values);
  if (!result.rows.length) throw new Error(`No ${resource.table} row found with id ${id}`);
  await logChatAudit('UPDATE', resource.table, id, userId);
  return result.rows[0];
}

async function deleteRow(resource, userId, id) {
  if (READ_ONLY_TABLES.has(resource.table)) throw new Error(`Delete is not enabled for ${resource.table}.`);
  const values = [id];
  let where = 'WHERE id=$1';
  if (resource.userScoped) {
    values.push(userId);
    where += ` AND user_id=$${values.length}`;
  }
  const result = await pool.query(`DELETE FROM ${resource.table} ${where} RETURNING *`, values);
  if (!result.rows.length) throw new Error(`No ${resource.table} row found with id ${id}`);
  await logChatAudit('DELETE', resource.table, id, userId);
  return result.rows[0];
}

async function searchRows(resource, userId, term, limit) {
  const columns = TABLE_COLUMNS[resource.table];
  if (!columns?.length) throw new Error(`Search is not enabled for ${resource.table}.`);
  const searchable = columns.filter((col) => /^[a-z_][a-z0-9_]*$/.test(col));
  const values = [`%${term}%`];
  let where = `WHERE CONCAT_WS(' ', ${searchable.map((col) => `${col}::text`).join(', ')}) ILIKE $1`;
  if (resource.userScoped) {
    values.push(userId);
    where += ` AND user_id=$${values.length}`;
  }
  values.push(limit);
  const result = await pool.query(`SELECT * FROM ${resource.table} ${where} ORDER BY id DESC LIMIT $${values.length}`, values);
  return result.rows;
}

async function logChatAudit(action, table, entityId, userId) {
  if (!OPERATION_TABLES.includes(table) || table === 'audit_trail') return;
  await pool.query(
    'INSERT INTO audit_trail (action, entity_table, entity_id, actor, summary) VALUES ($1,$2,$3,$4,$5)',
    [action, table, entityId || null, `chatbot:user:${userId}`, `${action} ${table}${entityId ? ` #${entityId}` : ''} via chatbot`]
  ).catch(() => {});
}

async function operationsSummary() {
  const rows = [];
  for (const table of OPERATION_TABLES) {
    const result = await pool.query(`SELECT COUNT(*)::int AS total FROM ${table}`).catch(() => ({ rows: [{ total: 0 }] }));
    rows.push({ table, total: result.rows[0].total });
  }
  return rows;
}

const EXCEPTION_QUERIES = [
  {
    pattern: /\b(overdue work orders?|late work orders?)\b/,
    replyLabel: 'overdue work orders',
    path: '/operations/work-orders',
    sql: `SELECT * FROM work_orders WHERE due_date < CURRENT_DATE AND status NOT IN ('Completed','Cancelled') ORDER BY due_date ASC LIMIT 20`,
  },
  {
    pattern: /\b(due maintenance|maintenance due|overdue maintenance)\b/,
    replyLabel: 'maintenance items due soon',
    path: '/operations/maintenance',
    sql: `SELECT * FROM maintenance_schedules WHERE next_due_date <= CURRENT_DATE + INTERVAL '14 days' OR status IN ('Overdue','Due Soon') ORDER BY next_due_date ASC LIMIT 20`,
  },
  {
    pattern: /\b(expiring permits?|permit expirations?)\b/,
    replyLabel: 'expiring permits',
    path: '/operations/permits',
    sql: `SELECT * FROM compliance_permits WHERE expiration_date <= CURRENT_DATE + INTERVAL '60 days' AND status NOT IN ('Expired','Suspended') ORDER BY expiration_date ASC LIMIT 20`,
  },
  {
    pattern: /\b(low stock|low inventory|backordered parts?)\b/,
    replyLabel: 'low-stock inventory items',
    path: '/operations/inventory',
    sql: `SELECT * FROM inventory_parts WHERE quantity_on_hand <= reorder_level OR status IN ('Low Stock','Backordered') ORDER BY quantity_on_hand ASC LIMIT 20`,
  },
  {
    pattern: /\b(pending approvals?|approval queue|needs approval)\b/,
    replyLabel: 'pending approvals',
    path: '/operations/approvals',
    sql: `SELECT * FROM approval_workflows WHERE status IN ('Pending','Needs Info') ORDER BY due_date ASC NULLS LAST LIMIT 20`,
  },
  {
    pattern: /\b(failed integrations?|integration issues?|webhook issues?|failed webhooks?)\b/,
    replyLabel: 'integration issues',
    path: '/operations/integrations',
    sql: `SELECT * FROM integration_endpoints WHERE status IN ('Failed','Paused','Testing') ORDER BY updated_at DESC LIMIT 20`,
  },
  {
    pattern: /\b(open inspections?|inspection findings?|failed inspections?)\b/,
    replyLabel: 'open inspection items',
    path: '/operations/inspections',
    sql: `SELECT * FROM inspection_logs WHERE status IN ('Open','Finding','Failed') ORDER BY inspection_date DESC NULLS LAST LIMIT 20`,
  },
  {
    pattern: /\b(failed reports?|report failures?)\b/,
    replyLabel: 'failed or paused reports',
    path: '/operations/reports',
    sql: `SELECT * FROM operational_reports WHERE status IN ('Failed','Paused') ORDER BY next_run_at ASC NULLS LAST LIMIT 20`,
  },
  {
    pattern: /\b(critical notifications?|unacknowledged notifications?|unacked notifications?)\b/,
    replyLabel: 'unacknowledged critical notifications',
    path: '/operations/notifications',
    sql: `SELECT * FROM notification_center WHERE severity IN ('High','Critical') AND status NOT IN ('Acknowledged') ORDER BY created_at DESC LIMIT 20`,
  },
];

async function getExceptionRows(text) {
  const match = EXCEPTION_QUERIES.find((query) => query.pattern.test(text));
  if (!match) return null;
  const result = await pool.query(match.sql);
  return { ...match, rows: result.rows };
}

async function convertUnits(message) {
  const raw = String(message || '').trim();
  const match = raw.match(/convert\s+(-?\d+(?:\.\d+)?)\s+(.+?)\s+(?:to|into)\s+(.+)$/i);
  if (!match) throw new Error('Use: convert 100 BPD to m3/day');
  const value = Number(match[1]);
  const fromUnit = match[2].trim();
  const toUnit = match[3].trim();
  const res = await fetch(`http://localhost:${process.env.BACKEND_PORT || 4000}/api/unit-converter/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${message.__token || ''}` },
    body: JSON.stringify({ value, fromUnit, toUnit }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function runAiAnalysis(req, resource, item) {
  const token = req.header('Authorization')?.replace('Bearer ', '') || '';
  const response = await fetch(`http://localhost:${process.env.BACKEND_PORT || 4000}/api/ai/analyze/${resource.aiType}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ data: item }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI analysis failed: ${errorText.slice(0, 300)}`);
  }
  return response.json();
}

router.post('/message', auth, async (req, res) => {
  try {
    const message = req.body?.message || '';
    const text = normalize(message);
    const userId = req.user.id;

    if (!message.trim()) return res.status(400).json({ error: 'message is required' });

    if (/\b(help|what can you do|capabilities)\b/.test(text)) {
      return res.json({
        reply: 'I can list, search, count, open, create, update, delete, and inspect supported rows. I can also summarize operations, evaluate alert rules, check alerts, convert units, and run AI analysis for a record.',
        examples: [
          'Show top 5 alerts',
          'Show work order id 3',
          'Search compressor in work orders',
          'Count production history',
          'Create field note {"well_name":"Eagle Ford A-1","title":"Valve checked","content":"No leak","priority":"Low"}',
          'Create work order {"title":"Inspect compressor vibration","well_name":"Barnett H-2","priority":"High","status":"Open"}',
          'Update work order id 3 {"status":"Completed"}',
          'Delete notification id 4',
          'Open production targets',
          'Operations summary',
          'Show overdue work orders',
          'Show low stock inventory',
          'Show expiring permits',
          'Show inventory',
          'Count compliance permits',
          'Add maintenance schedule {"task_name":"Monthly valve inspection","asset_tag":"AST-003","status":"Scheduled"}',
          'Evaluate alert rules',
          'Convert 100 BPD to m3/day',
          'Run AI wellhead id 1',
        ],
      });
    }

    const exceptionResult = await getExceptionRows(text);
    if (exceptionResult) {
      return res.json({
        reply: `Found ${exceptionResult.rows.length} ${exceptionResult.replyLabel}.`,
        data: exceptionResult.rows,
        action: { type: 'navigate', path: exceptionResult.path },
      });
    }

    if (/\b(operations summary|operations overview|summarize operations|summary of operations)\b/.test(text)) {
      const summary = await operationsSummary();
      const total = summary.reduce((sum, row) => sum + row.total, 0);
      const preview = summary.slice(0, 8).map((row) => `${row.table}: ${row.total}`).join('; ');
      return res.json({
        reply: `Operations contains ${total} records across ${summary.length} operational tables. ${preview}`,
        data: summary,
        action: { type: 'navigate', path: '/operations-hub' },
      });
    }

    if (text.includes('evaluate alert')) {
      const rules = await pool.query('SELECT * FROM alert_rules WHERE user_id=$1 AND is_active=true ORDER BY id DESC LIMIT 50', [userId]);
      return res.json({ reply: `Alert rules ready for evaluation: ${rules.rows.length} active rules. Open Alert Rules to inspect violations.`, data: rules.rows });
    }

    if (text.includes('check alerts')) {
      const alerts = await pool.query('SELECT * FROM alerts WHERE is_active=true ORDER BY id DESC LIMIT 50');
      return res.json({ reply: `Checked ${alerts.rows.length} active alerts. Open Alerts to run full threshold evaluation.`, data: alerts.rows });
    }

    if (text.startsWith('convert ')) {
      const token = req.header('Authorization')?.replace('Bearer ', '') || '';
      const converted = await convertUnits({ toString: () => message, __token: token });
      return res.json({ reply: `${converted.value} ${converted.fromUnit} = ${converted.result} ${converted.toUnit}`, data: converted });
    }

    const resource = findResource(message);
    if (!resource) {
      return res.json({
        reply: 'I could not match that to an app feature. Try: show alerts, count field notes, create production history with JSON, update work order id 3 with JSON, or run AI wellhead id 1.',
      });
    }

    if (/\b(open|go to|navigate to)\b/.test(text)) {
      return res.json({
        reply: `Opening ${resource.table}.`,
        action: { type: 'navigate', path: resource.endpoint },
      });
    }

    if (/\b(count|how many)\b/.test(text)) {
      const total = await countRows(resource, userId);
      return res.json({ reply: `${resource.table} has ${total} row${total === 1 ? '' : 's'}.`, data: { total, table: resource.table } });
    }

    if (/\b(search|find)\b/.test(text)) {
      const term = extractSearchTerm(message, resource);
      if (!term) return res.json({ reply: `Tell me what to search for in ${resource.table}. Example: search compressor in work orders.` });
      const rows = await searchRows(resource, userId, term, getLimit(message));
      return res.json({
        reply: rows.length ? `Found ${rows.length} ${resource.table} row${rows.length === 1 ? '' : 's'} matching "${term}".` : `No ${resource.table} rows matched "${term}".`,
        data: rows,
        action: { type: 'navigate', path: resource.endpoint },
      });
    }

    if (/\b(show|get|detail|details|view)\b/.test(text) && getId(message)) {
      const id = getId(message);
      const row = await getRow(resource, userId, id);
      if (!row) return res.status(404).json({ error: `No ${resource.table} row found with id ${id}` });
      return res.json({
        reply: `Loaded ${resource.table} row #${id}.`,
        data: row,
        action: { type: 'navigate', path: resource.endpoint },
      });
    }

    if (/\b(create|add|insert)\b/.test(text)) {
      const payload = extractJson(message);
      const row = await createRow(resource, payload, userId);
      return res.json({ reply: `Created row #${row.id} in ${resource.table}.`, data: row });
    }

    if (/\b(update|edit|change|set)\b/.test(text)) {
      const id = getId(message);
      if (!id) return res.json({ reply: `Tell me which ${resource.table} row to update. Example: update work order id 3 {"status":"Completed"}` });
      const payload = extractJson(message);
      const row = await updateRow(resource, payload, userId, id);
      return res.json({
        reply: `Updated ${resource.table} row #${id}.`,
        data: row,
        action: { type: 'navigate', path: resource.endpoint },
      });
    }

    if (/\b(delete|remove)\b/.test(text)) {
      const id = getId(message);
      if (!id) return res.json({ reply: `Tell me which ${resource.table} row to delete. Example: delete notification id 4.` });
      const row = await deleteRow(resource, userId, id);
      return res.json({
        reply: `Deleted ${resource.table} row #${id}.`,
        data: row,
        action: { type: 'navigate', path: resource.endpoint },
      });
    }

    if (/\b(run ai|analyze|analysis)\b/.test(text) && resource.aiType) {
      const idMatch = text.match(/\bid\s*#?(\d+)\b|#(\d+)/);
      const id = idMatch ? Number(idMatch[1] || idMatch[2]) : null;
      if (!id) return res.json({ reply: `Tell me which ${resource.table} row to analyze, for example: run AI ${resource.aiType} id 1.` });
      const item = await pool.query(`SELECT * FROM ${resource.table} WHERE id=$1`, [id]);
      if (!item.rows.length) return res.status(404).json({ error: `No ${resource.table} row found with id ${id}` });
      const analysis = await runAiAnalysis(req, resource, item.rows[0]);
      return res.json({
        reply: `Completed AI analysis for ${resource.table} row #${id}.`,
        data: analysis,
        action: { type: 'navigate', path: `/feature/${resource.route}` },
      });
    }

    const rows = await listRows(resource, userId, getLimit(message));
    return res.json({ reply: formatRows(rows, resource), data: rows, action: { type: 'navigate', path: resource.endpoint } });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Chatbot request failed' });
  }
});

module.exports = router;
