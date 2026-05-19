import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/feature/:featureKey" element={<PrivateRoute><FeaturePage /></PrivateRoute>} />
        <Route path="/unit-converter" element={<PrivateRoute><UnitConverter /></PrivateRoute>} />
        <Route path="/alerts" element={<PrivateRoute><AlertsPage /></PrivateRoute>} />
        <Route path="/field-notes" element={<PrivateRoute><FieldNotesPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/production-history" element={<PrivateRoute><ProductionHistoryPage /></PrivateRoute>} />
        <Route path="/ai-history" element={<PrivateRoute><AIHistoryPage /></PrivateRoute>} />
        <Route path="/alert-rules" element={<PrivateRoute><AlertRulesPage /></PrivateRoute>} />
        <Route path="/ai-predictive" element={<PrivateRoute><AIPredictivePage /></PrivateRoute>} />
        <Route path="/custom-views" element={<PrivateRoute><CustomViewsPage /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/login" />} />
      
          {/* // === Batch 06 Gaps & Frontend Mounts === */}
          <Route path="/cf-agentic-well-optimization" element={<CFAgenticWellOptimizationPage />} />
          <Route path="/cf-decline-curve-ensemble-modeling" element={<CFDeclineCurveEnsembleModelingPage />} />
          <Route path="/cf-sensor-anomaly-streaming" element={<CFSensorAnomalyStreamingPage />} />
          <Route path="/cf-environmental-compliance-assistant" element={<CFEnvironmentalComplianceAssistantPage />} />
          <Route path="/cf-cross-operator-benchmarking" element={<CFCrossOperatorBenchmarkingPage />} />
          <Route path="/gap-production-history-logged-but-no-production" element={<GapProductionHistoryLoggedButNoProductionPage />} />
          <Route path="/gap-pipeline-monitoring-without-pipeline" element={<GapPipelineMonitoringWithoutPipelinePage />} />
          <Route path="/gap-safety-incidents-without-near" element={<GapSafetyIncidentsWithoutNearPage />} />
          <Route path="/gap-equipment-maintenance-without-optimal" element={<GapEquipmentMaintenanceWithoutOptimalPage />} />
          <Route path="/gap-no-real" element={<GapNoRealPage />} />
          <Route path="/gap-no-asset-lifecycle-tracking-equipment-purchase-ins" element={<GapNoAssetLifecycleTrackingEquipmentPurchaseInsPage />} />
          <Route path="/gap-no-preventive-maintenance-scheduling" element={<GapNoPreventiveMaintenanceSchedulingPage />} />
          <Route path="/gap-limited-multi" element={<GapLimitedMultiPage />} />
          <Route path="/gap-no-integration-with-geological-petrophysical-datab" element={<GapNoIntegrationWithGeologicalPetrophysicalDatabPage />} />
          <Route path="/gap-no-webhooks-for-alert-delivery-pagerduty-slack" element={<GapNoWebhooksForAlertDeliveryPagerdutySlackPage />} />
          <Route path="/gap-no-mobile-field" element={<GapNoMobileFieldPage />} />
          <Route path="/gap-no-rbac-beyond-auth" element={<GapNoRbacBeyondAuthPage />} />
        </Routes>
    </Router>
  );
}

export default App;
