import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import {
  FaBell,
  FaChartLine,
  FaClipboardList,
  FaCogs,
  FaExchangeAlt,
  FaFlask,
  FaHistory,
  FaHome,
  FaOilCan,
  FaRoute,
  FaShieldAlt,
  FaSignOutAlt,
  FaTools,
  FaUserCircle,
  FaWater,
} from 'react-icons/fa';
import { GiOilPump } from 'react-icons/gi';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import UnitConverter from './pages/UnitConverter';
import AlertsPage from './pages/AlertsPage';
import FieldNotesPage from './pages/FieldNotesPage';
import ProfilePage from './pages/ProfilePage';
import ProductionHistoryPage from './pages/ProductionHistoryPage';
import AIHistoryPage from './pages/AIHistoryPage';
import AlertRulesPage from './pages/AlertRulesPage';
import AIPredictivePage from './pages/AIPredictivePage';
import CustomViewsPage from './pages/CustomViewsPage';
import AdvancedToolsPage from './pages/AdvancedToolsPage';
import OperationsResourcePage from './pages/OperationsResourcePage';
import OperationsHubPage from './pages/OperationsHubPage';

// // === Batch 06 Gaps & Frontend Mounts ===
import CFAgenticWellOptimizationPage from './pages/CFAgenticWellOptimizationPage';
import CFDeclineCurveEnsembleModelingPage from './pages/CFDeclineCurveEnsembleModelingPage';
import CFSensorAnomalyStreamingPage from './pages/CFSensorAnomalyStreamingPage';
import CFEnvironmentalComplianceAssistantPage from './pages/CFEnvironmentalComplianceAssistantPage';
import CFCrossOperatorBenchmarkingPage from './pages/CFCrossOperatorBenchmarkingPage';
import GapProductionHistoryLoggedButNoProductionPage from './pages/GapProductionHistoryLoggedButNoProductionPage';
import GapPipelineMonitoringWithoutPipelinePage from './pages/GapPipelineMonitoringWithoutPipelinePage';
import GapSafetyIncidentsWithoutNearPage from './pages/GapSafetyIncidentsWithoutNearPage';
import GapEquipmentMaintenanceWithoutOptimalPage from './pages/GapEquipmentMaintenanceWithoutOptimalPage';
import GapNoRealPage from './pages/GapNoRealPage';
import GapNoAssetLifecycleTrackingEquipmentPurchaseInsPage from './pages/GapNoAssetLifecycleTrackingEquipmentPurchaseInsPage';
import GapNoPreventiveMaintenanceSchedulingPage from './pages/GapNoPreventiveMaintenanceSchedulingPage';
import GapLimitedMultiPage from './pages/GapLimitedMultiPage';
import GapNoIntegrationWithGeologicalPetrophysicalDatabPage from './pages/GapNoIntegrationWithGeologicalPetrophysicalDatabPage';
import GapNoWebhooksForAlertDeliveryPagerdutySlackPage from './pages/GapNoWebhooksForAlertDeliveryPagerdutySlackPage';
import GapNoMobileFieldPage from './pages/GapNoMobileFieldPage';
import GapNoRbacBeyondAuthPage from './pages/GapNoRbacBeyondAuthPage';
import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';
import { FEATURES } from './services/features';
import FloatingChatbot from './components/FloatingChatbot';

const FEATURE_ICON_MAP = {
  'wellhead-analytics': GiOilPump,
  'reservoir-simulation': FaFlask,
  'decline-curves': FaChartLine,
  'equipment-failure': FaTools,
  'environmental-compliance': FaShieldAlt,
  'production-forecasting': FaChartLine,
  'well-performance': FaChartLine,
  'drilling-operations': FaCogs,
  'cost-analysis': FaExchangeAlt,
  'pipeline-monitoring': FaRoute,
  'water-management': FaWater,
  'safety-incidents': FaShieldAlt,
  'gas-lift-optimization': FaOilCan,
};

const aiFeatureLinks = Object.entries(FEATURES).map(([key, feature]) => ({
  label: feature.title,
  to: `/feature/${key}`,
  icon: FEATURE_ICON_MAP[key] || FaOilCan,
}));

const operationsLinks = [
  { label: 'Operations Hub', to: '/operations-hub', icon: FaHome },
  { label: 'Production History', to: '/production-history', icon: FaHistory },
  { label: 'Well Master Data', to: '/operations/wells', icon: GiOilPump },
  { label: 'Production Targets', to: '/operations/targets', icon: FaChartLine },
  { label: 'AI Predictive Tools', to: '/ai-predictive', icon: FaChartLine },
  { label: 'Alerts', to: '/alerts', icon: FaBell },
  { label: 'Alert Rules', to: '/alert-rules', icon: FaShieldAlt },
  { label: 'Field Notes', to: '/field-notes', icon: FaClipboardList },
  { label: 'Shift Handovers', to: '/operations/handovers', icon: FaExchangeAlt },
  { label: 'Work Orders', to: '/operations/work-orders', icon: FaTools },
  { label: 'Approvals', to: '/operations/approvals', icon: FaShieldAlt },
  { label: 'Asset Registry', to: '/operations/assets', icon: FaCogs },
  { label: 'Maintenance Schedule', to: '/operations/maintenance', icon: FaHistory },
  { label: 'Inspection Logs', to: '/operations/inspections', icon: FaClipboardList },
  { label: 'Compliance Permits', to: '/operations/permits', icon: FaShieldAlt },
  { label: 'Crews & Vendors', to: '/operations/crews-vendors', icon: FaUserCircle },
  { label: 'Inventory & Parts', to: '/operations/inventory', icon: FaCogs },
  { label: 'Documents', to: '/operations/documents', icon: FaClipboardList },
  { label: 'Notifications', to: '/operations/notifications', icon: FaBell },
  { label: 'Integrations', to: '/operations/integrations', icon: FaRoute },
  { label: 'Reports', to: '/operations/reports', icon: FaChartLine },
  { label: 'Settings', to: '/operations/settings', icon: FaCogs },
  { label: 'Audit Trail', to: '/operations/audit-trail', icon: FaShieldAlt },
  { label: 'Unit Converter', to: '/unit-converter', icon: FaExchangeAlt },
  { label: 'Custom Views', to: '/custom-views', icon: FaCogs },
  { label: 'AI History', to: '/ai-history', icon: FaHistory },
  { label: 'Profile', to: '/profile', icon: FaUserCircle },
];

const advancedLinks = [
  { label: 'Advanced AI Lab', to: '/advanced', icon: FaFlask },
];

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function SidebarSection({ title, links }) {
  return (
    <div className="sidebar-section">
      <div className="sidebar-section-title">{title}</div>
      <div className="sidebar-link-list">
        {links.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <Icon className="sidebar-link-icon" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function AppShell({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Application navigation">
        <NavLink to="/dashboard" className="sidebar-brand">
          <div className="sidebar-brand-icon"><GiOilPump /></div>
          <div>
            <strong>PetroAI</strong>
            <span>Production Forecaster</span>
          </div>
        </NavLink>

        <nav className="sidebar-nav">
          <SidebarSection title="Command Center" links={[{ label: 'Overview', to: '/dashboard', icon: FaHome }]} />
          <SidebarSection title="AI Well Modules" links={aiFeatureLinks} />
          <SidebarSection title="Operations" links={operationsLinks} />
          <SidebarSection title="Advanced" links={advancedLinks} />
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <FaUserCircle aria-hidden="true" />
            <div>
              <strong>{user.name || 'Admin'}</strong>
              <span>{user.email || 'admin@oilgas.com'}</span>
            </div>
          </div>
          <button className="sidebar-logout" type="button" onClick={handleLogout}>
            <FaSignOutAlt aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="app-main">{children}</main>
      <FloatingChatbot />
    </div>
  );
}

function ProtectedShell({ children }) {
  return (
    <PrivateRoute>
      <AppShell>{children}</AppShell>
    </PrivateRoute>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/codex/custom-viz" element={<CodexCustomVizFeature />} />
        <Route path="/codex/operations" element={<CodexOperationsFeature />} />

        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedShell><Dashboard /></ProtectedShell>} />
        <Route path="/feature/:featureKey" element={<ProtectedShell><FeaturePage /></ProtectedShell>} />
        <Route path="/unit-converter" element={<ProtectedShell><UnitConverter /></ProtectedShell>} />
        <Route path="/alerts" element={<ProtectedShell><AlertsPage /></ProtectedShell>} />
        <Route path="/field-notes" element={<ProtectedShell><FieldNotesPage /></ProtectedShell>} />
        <Route path="/profile" element={<ProtectedShell><ProfilePage /></ProtectedShell>} />
        <Route path="/production-history" element={<ProtectedShell><ProductionHistoryPage /></ProtectedShell>} />
        <Route path="/ai-history" element={<ProtectedShell><AIHistoryPage /></ProtectedShell>} />
        <Route path="/alert-rules" element={<ProtectedShell><AlertRulesPage /></ProtectedShell>} />
        <Route path="/ai-predictive" element={<ProtectedShell><AIPredictivePage /></ProtectedShell>} />
        <Route path="/custom-views" element={<ProtectedShell><CustomViewsPage /></ProtectedShell>} />
        <Route path="/advanced" element={<ProtectedShell><AdvancedToolsPage /></ProtectedShell>} />
        <Route path="/operations-hub" element={<ProtectedShell><OperationsHubPage /></ProtectedShell>} />
        <Route path="/operations/:resourceKey" element={<ProtectedShell><OperationsResourcePage /></ProtectedShell>} />
        <Route path="/" element={<Navigate to="/login" />} />
      
          {/* // === Batch 06 Gaps & Frontend Mounts === */}
          <Route path="/cf-agentic-well-optimization" element={<ProtectedShell><CFAgenticWellOptimizationPage /></ProtectedShell>} />
          <Route path="/cf-decline-curve-ensemble-modeling" element={<ProtectedShell><CFDeclineCurveEnsembleModelingPage /></ProtectedShell>} />
          <Route path="/cf-sensor-anomaly-streaming" element={<ProtectedShell><CFSensorAnomalyStreamingPage /></ProtectedShell>} />
          <Route path="/cf-environmental-compliance-assistant" element={<ProtectedShell><CFEnvironmentalComplianceAssistantPage /></ProtectedShell>} />
          <Route path="/cf-cross-operator-benchmarking" element={<ProtectedShell><CFCrossOperatorBenchmarkingPage /></ProtectedShell>} />
          <Route path="/gap-production-history-logged-but-no-production" element={<ProtectedShell><GapProductionHistoryLoggedButNoProductionPage /></ProtectedShell>} />
          <Route path="/gap-pipeline-monitoring-without-pipeline" element={<ProtectedShell><GapPipelineMonitoringWithoutPipelinePage /></ProtectedShell>} />
          <Route path="/gap-safety-incidents-without-near" element={<ProtectedShell><GapSafetyIncidentsWithoutNearPage /></ProtectedShell>} />
          <Route path="/gap-equipment-maintenance-without-optimal" element={<ProtectedShell><GapEquipmentMaintenanceWithoutOptimalPage /></ProtectedShell>} />
          <Route path="/gap-no-real" element={<ProtectedShell><GapNoRealPage /></ProtectedShell>} />
          <Route path="/gap-no-asset-lifecycle-tracking-equipment-purchase-ins" element={<ProtectedShell><GapNoAssetLifecycleTrackingEquipmentPurchaseInsPage /></ProtectedShell>} />
          <Route path="/gap-no-preventive-maintenance-scheduling" element={<ProtectedShell><GapNoPreventiveMaintenanceSchedulingPage /></ProtectedShell>} />
          <Route path="/gap-limited-multi" element={<ProtectedShell><GapLimitedMultiPage /></ProtectedShell>} />
          <Route path="/gap-no-integration-with-geological-petrophysical-datab" element={<ProtectedShell><GapNoIntegrationWithGeologicalPetrophysicalDatabPage /></ProtectedShell>} />
          <Route path="/gap-no-webhooks-for-alert-delivery-pagerduty-slack" element={<ProtectedShell><GapNoWebhooksForAlertDeliveryPagerdutySlackPage /></ProtectedShell>} />
          <Route path="/gap-no-mobile-field" element={<ProtectedShell><GapNoMobileFieldPage /></ProtectedShell>} />
          <Route path="/gap-no-rbac-beyond-auth" element={<ProtectedShell><GapNoRbacBeyondAuthPage /></ProtectedShell>} />
        </Routes>
    </Router>
  );
}

export default App;
