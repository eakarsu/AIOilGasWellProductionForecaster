module.exports={
 caseType:'operator_approved_well_forecast',initialState:'asset_registered',
 states:['asset_registered','sources_synchronized','constraints_validated','forecast_recorded','operator_review','decision_approved','execution_observed','exception_recovery','outcome_recorded'],
 createRoles:['production_engineer','operations_manager'],assessmentRoles:['production_engineer','field_operator','safety_reviewer','reservoir_engineer'],auditRoles:['operations_manager','safety_reviewer','auditor'],connectorRoles:['integration_operator','operations_manager'],
 evidenceKinds:['well_asset_version','telemetry_batch_digest','production_history_snapshot','reservoir_model_version','constraint_manifest','weather_gis_snapshot','maintenance_status','forecast_manifest','backtest_report','operator_review','decision_record','execution_feedback','exception_record','realized_outcome','asset_lifecycle_record'],
 requiredSignals:['assetVersion','historyVersion','modelVersion','constraintVersion','sourceTimestamp','evaluatedAt','staleAfterSeconds','forecastErrorBound','safetyLimitsVerified','offlineBufferComplete','policyVersion'],
 professionalBoundary:'Forecasts are advisory and cannot change well controls, dispatch crews, alter lift/injection, bypass safety/environmental systems, or replace qualified engineering and field operators.',
 connectors:[{name:'telemetry',purpose:'timestamped read-only batches'},{name:'erp_wms_tms',purpose:'jobs/material/logistics snapshots'},{name:'scada',purpose:'read-only asset references'},{name:'gis_weather',purpose:'site conditions'},{name:'maintenance',purpose:'equipment/lifecycle state'},{name:'notification',purpose:'operator acknowledgements'},{name:'geology_reservoir',purpose:'approved model references'}],
 transitions:[
  {from:'asset_registered',action:'synchronize_sources',to:'sources_synchronized',roles:['integration_operator','production_engineer'],requiresEvidence:true},
  {from:'sources_synchronized',action:'validate_constraints',to:'constraints_validated',roles:['production_engineer','safety_reviewer'],requiresEvidence:true},
  {from:'constraints_validated',action:'record_forecast',to:'forecast_recorded',roles:['production_engineer','reservoir_engineer'],requiresEvidence:true},
  {from:'forecast_recorded',action:'submit_operator_review',to:'operator_review',roles:['field_operator','safety_reviewer'],requiresEvidence:true,dualControl:true},
  {from:'operator_review',action:'approve_decision',to:'decision_approved',roles:['operations_manager'],requiresEvidence:true,dualControl:true},
  {from:'decision_approved',action:'record_execution_observation',to:'execution_observed',roles:['field_operator','integration_operator'],requiresEvidence:true},
  {from:'execution_observed',action:'open_exception',to:'exception_recovery',roles:['field_operator','safety_reviewer'],requiresEvidence:true},
  {from:'execution_observed',action:'record_outcome',to:'outcome_recorded',roles:['production_engineer'],requiresEvidence:true,dualControl:true},
  {from:'exception_recovery',action:'record_outcome',to:'outcome_recorded',roles:['operations_manager'],requiresEvidence:true,dualControl:true}
 ],
 assess:x=>{const source=Date.parse(x.sourceTimestamp),evaluated=Date.parse(x.evaluatedAt),limit=Number(x.staleAfterSeconds),bound=Number(x.forecastErrorBound);const stale=!Number.isFinite(source)||!Number.isFinite(evaluated)||!Number.isFinite(limit)||limit<=0||evaluated<source||(evaluated-source)/1000>limit;const validBound=Number.isFinite(bound)&&bound>=0&&bound<=1;return{disposition:stale||!validBound||x.safetyLimitsVerified!==true||x.offlineBufferComplete!==true?'manual_engineering_fallback':'operator_forecast_review_required',controlCommand:null,stale,errorBound:validBound?bound:null,versions:{asset:x.assetVersion,history:x.historyVersion,model:x.modelVersion,constraints:x.constraintVersion}};}
};
