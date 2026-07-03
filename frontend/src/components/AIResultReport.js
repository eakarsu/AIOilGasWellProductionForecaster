import React from 'react';

const META_KEYS = new Set(['ok', 'id', 'raw', 'result_json', 'tokens_used', 'tokensUsed', 'model']);
const PRIORITY_KEYS = [
  'summary',
  'executive_summary',
  'findings',
  'anomalies',
  'recommendations',
  'risks',
  'next_steps',
  'implementation_plan',
  'action_items',
  'assumptions',
  'follow_up_questions',
  'confidence',
];

const SECTION_META = {
  summary: { label: 'Executive Summary', icon: 'Brief' },
  executive_summary: { label: 'Executive Summary', icon: 'Brief' },
  findings: { label: 'Key Findings', icon: 'Find' },
  anomalies: { label: 'Anomalies', icon: 'Alert' },
  recommendations: { label: 'Recommendations', icon: 'Action' },
  risks: { label: 'Risks', icon: 'Risk' },
  next_steps: { label: 'Next Steps', icon: 'Next' },
  implementation_plan: { label: 'Implementation Plan', icon: 'Plan' },
  action_items: { label: 'Action Items', icon: 'Action' },
  assumptions: { label: 'Assumptions', icon: 'Note' },
  follow_up_questions: { label: 'Follow-Up Questions', icon: 'Ask' },
  confidence: { label: 'Confidence', icon: 'Score' },
};

const CARD_TITLE_KEYS = ['title', 'name', 'risk', 'finding', 'recommendation', 'action', 'category', 'item', 'issue', 'step'];
const BADGE_KEYS = ['severity', 'priority', 'status', 'confidence', 'risk_level', 'impact'];

function humanizeKey(key) {
  return String(key)
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function parseMaybeJson(value) {
  if (typeof value !== 'string') return value;
  const cleaned = value.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  if (!cleaned) return '';
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    const match = cleaned.match(/[\[{][\s\S]*[\]}]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (_) {
        return cleaned;
      }
    }
    return cleaned;
  }
}

function normalizeReport(data) {
  const parsed = parseMaybeJson(data);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed.result_json || parseMaybeJson(parsed.raw) || parsed;
  }
  return parsed;
}

function sentenceText(value) {
  if (value === null || value === undefined || value === '') return 'Not specified';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toLocaleString();
  return String(value);
}

function renderTextBlock(text) {
  const lines = String(text).split('\n').map((line) => line.trim()).filter(Boolean);
  const listLines = lines.filter((line) => /^[-*]\s+|^\d+\.\s+/.test(line));
  if (listLines.length >= 2 && listLines.length === lines.length) {
    return (
      <ul className="ai-report-list">
        {listLines.map((line, index) => (
          <li key={index}>{line.replace(/^[-*]\s+|^\d+\.\s+/, '')}</li>
        ))}
      </ul>
    );
  }
  return String(text)
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph, index) => <p key={index}>{paragraph}</p>);
}

function renderScalar(value) {
  return <span>{sentenceText(value)}</span>;
}

function badgeTone(value) {
  const normalized = String(value || '').toLowerCase();
  if (/(critical|urgent|high|failed|blocked|severe)/.test(normalized)) return 'danger';
  if (/(medium|moderate|warning|review|pending)/.test(normalized)) return 'warning';
  if (/(low|good|complete|completed|approved|high confidence|strong)/.test(normalized)) return 'success';
  return 'neutral';
}

function findCardTitle(value, fallback) {
  for (const key of CARD_TITLE_KEYS) {
    if (value?.[key]) return [key, value[key]];
  }
  return [null, fallback];
}

function renderBadge(label, value) {
  return (
    <span className={`ai-report-badge ${badgeTone(value)}`} key={label}>
      {humanizeKey(label)}: {sentenceText(value)}
    </span>
  );
}

function renderObjectDetails(value, skipKeys = []) {
  return (
    <div className="ai-report-detail-grid">
      {Object.entries(value)
        .filter(([key]) => !skipKeys.includes(key) && !BADGE_KEYS.includes(key))
        .map(([key, item]) => (
          <div className="ai-report-detail" key={key}>
            <label>{humanizeKey(key)}</label>
            <div>{renderValue(item)}</div>
          </div>
        ))}
    </div>
  );
}

function renderObjectCard(item, index) {
  const [titleKey, title] = findCardTitle(item, `Item ${index + 1}`);
  const badges = Object.entries(item).filter(([key, value]) => BADGE_KEYS.includes(key) && value !== undefined && value !== null && value !== '');
  return (
    <div className="ai-report-item-card" key={index}>
      <div className="ai-report-item-header">
        <strong>{sentenceText(title)}</strong>
        {badges.length > 0 && (
          <div className="ai-report-badges">
            {badges.map(([key, value]) => renderBadge(key, value))}
          </div>
        )}
      </div>
      {renderObjectDetails(item, titleKey ? [titleKey] : [])}
    </div>
  );
}

function renderArray(value) {
  if (value.length === 0) {
    return <p>None identified.</p>;
  }

  if (value.every((item) => item === null || typeof item !== 'object')) {
    return (
      <ul className="ai-report-list">
        {value.map((item, index) => (
          <li key={index}>{sentenceText(item)}</li>
        ))}
      </ul>
    );
  }

  return (
    <div className="ai-report-card-list">
      {value.map((item, index) => (
        item && typeof item === 'object' ? renderObjectCard(item, index) : (
          <div className="ai-report-item-card" key={index}>{renderScalar(item)}</div>
        )
      ))}
    </div>
  );
}

function renderValue(value) {
  const parsed = parseMaybeJson(value);
  if (Array.isArray(parsed)) return renderArray(parsed);
  if (parsed && typeof parsed === 'object') return renderObjectDetails(parsed);
  if (typeof parsed === 'string' && parsed.includes('\n')) return renderTextBlock(parsed);
  return renderScalar(parsed);
}

function sectionValue(report, key) {
  if (!report || typeof report !== 'object' || Array.isArray(report)) return undefined;
  return report[key];
}

function sectionMeta(key) {
  return SECTION_META[key] || { label: humanizeKey(key), icon: 'Info' };
}

function renderSection(key, value) {
  const meta = sectionMeta(key);
  const isSummary = key === 'summary' || key === 'executive_summary';
  return (
    <section className={`ai-report-section${isSummary ? ' summary' : ''}`} key={key}>
      <div className="ai-report-section-heading">
        <span className="ai-report-section-icon">{meta.icon}</span>
        <h4>{meta.label}</h4>
      </div>
      <div className="ai-report-text">{renderValue(value)}</div>
    </section>
  );
}

export default function AIResultReport({ data, title = 'AI Analysis Report' }) {
  const report = normalizeReport(data);
  const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {};

  if (!report) return null;

  if (typeof report === 'string') {
    return (
      <div className="ai-report">
        <div className="ai-report-header">
          <div>
            <span>Professional Analysis</span>
            <h3>{title}</h3>
          </div>
        </div>
        <section className="ai-report-section summary">
          <div className="ai-report-section-heading">
            <span className="ai-report-section-icon">Brief</span>
            <h4>Executive Summary</h4>
          </div>
          <div className="ai-report-text">{renderValue(report)}</div>
        </section>
      </div>
    );
  }

  const prioritizedSections = PRIORITY_KEYS
    .filter((key) => sectionValue(report, key) !== undefined && sectionValue(report, key) !== null && sectionValue(report, key) !== '')
    .map((key) => [key, sectionValue(report, key)]);

  const remainingSections = Object.entries(report)
    .filter(([key, value]) => !META_KEYS.has(key) && !PRIORITY_KEYS.includes(key) && value !== undefined && value !== null && value !== '');

  const metaItems = [
    source.model ? ['Model', source.model] : null,
    source.tokens_used || source.tokensUsed ? ['Tokens', source.tokens_used || source.tokensUsed] : null,
    source.id ? ['Run ID', source.id] : null,
  ].filter(Boolean);

  return (
    <div className="ai-report">
      <div className="ai-report-header">
        <div>
          <span>Professional Analysis</span>
          <h3>{title}</h3>
        </div>
        {metaItems.length > 0 && (
          <div className="ai-report-meta">
            {metaItems.map(([label, value]) => (
              <div key={label}>
                <label>{label}</label>
                <strong>{sentenceText(value)}</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      {[...prioritizedSections, ...remainingSections].map(([key, value]) => renderSection(key, value))}
    </div>
  );
}
