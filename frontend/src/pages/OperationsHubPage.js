import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getOperationInsights } from '../services/api';

const EXCEPTION_GROUPS = [
  { key: 'overdueWorkOrders', label: 'Overdue Work Orders', path: '/operations/work-orders', tone: 'danger' },
  { key: 'dueMaintenance', label: 'Due Maintenance', path: '/operations/maintenance', tone: 'warning' },
  { key: 'expiringPermits', label: 'Expiring Permits', path: '/operations/permits', tone: 'warning' },
  { key: 'lowInventory', label: 'Low Inventory', path: '/operations/inventory', tone: 'danger' },
  { key: 'pendingApprovals', label: 'Pending Approvals', path: '/operations/approvals', tone: 'warning' },
  { key: 'failedIntegrations', label: 'Integration Issues', path: '/operations/integrations', tone: 'danger' },
  { key: 'openInspections', label: 'Open Inspections', path: '/operations/inspections', tone: 'warning' },
  { key: 'failedReports', label: 'Report Failures', path: '/operations/reports', tone: 'danger' },
  { key: 'criticalNotifications', label: 'Critical Notifications', path: '/operations/notifications', tone: 'danger' },
];

const labelFor = (row) => (
  row.title || row.task_name || row.permit_number || row.part_name || row.request_title ||
  row.integration_name || row.inspection_type || row.report_name || row.well_name || row.summary || `Record #${row.id}`
);

export default function OperationsHubPage() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getOperationInsights();
      setInsights(data);
    } catch (err) {
      toast.error(`Failed to load operations insights: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const totalRecords = insights?.counts?.reduce((sum, item) => sum + item.total, 0) || 0;
  const totalExceptions = Object.values(insights?.exceptionCounts || {}).reduce((sum, value) => sum + value, 0);

  return (
    <div className="feature-page">
      <div className="feature-content">
        <div className="feature-page-header">
          <div className="feature-page-header-left">
            <button className="btn-back" type="button" onClick={() => navigate('/dashboard')}>Back</button>
            <div>
              <h1 style={{ color: '#38BDF8' }}>Operations Hub</h1>
              <p className="operations-page-subtitle">Non-AI command center for operational records, exception queues, and workflow health.</p>
            </div>
          </div>
          <button className="btn btn-secondary" type="button" onClick={fetchInsights}>Refresh</button>
        </div>

        {loading ? (
          <div className="empty-state"><div className="ai-spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <>
            <div className="ops-hub-metrics">
              <div>
                <span>Total Records</span>
                <strong>{totalRecords.toLocaleString()}</strong>
              </div>
              <div>
                <span>Exception Items</span>
                <strong>{totalExceptions.toLocaleString()}</strong>
              </div>
              <div>
                <span>Operational Modules</span>
                <strong>{insights?.counts?.length || 0}</strong>
              </div>
            </div>

            <section className="ops-hub-section">
              <h2>Exception Queues</h2>
              <div className="ops-exception-grid">
                {EXCEPTION_GROUPS.map((group) => {
                  const rows = insights?.exceptions?.[group.key] || [];
                  return (
                    <button className={`ops-exception-card ${group.tone}`} key={group.key} type="button" onClick={() => navigate(group.path)}>
                      <span>{group.label}</span>
                      <strong>{rows.length}</strong>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="ops-hub-section">
              <h2>Current Exceptions</h2>
              <div className="ops-exception-list">
                {EXCEPTION_GROUPS.filter((group) => (insights?.exceptions?.[group.key] || []).length > 0).map((group) => (
                  <div className="ops-exception-panel" key={group.key}>
                    <div className="ops-exception-panel-header">
                      <strong>{group.label}</strong>
                      <button type="button" onClick={() => navigate(group.path)}>Open</button>
                    </div>
                    {(insights?.exceptions?.[group.key] || []).slice(0, 4).map((row) => (
                      <div className="ops-exception-row" key={`${group.key}-${row.id}`}>
                        <span>#{row.id}</span>
                        <strong>{labelFor(row)}</strong>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            <section className="ops-hub-section">
              <h2>Module Counts</h2>
              <div className="ops-count-grid">
                {(insights?.counts || []).map((item) => (
                  <div key={item.key}>
                    <span>{item.title}</span>
                    <strong>{item.total}</strong>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
