import React, { useMemo, useState } from 'react';
import { FaBell, FaChartLine, FaClipboardList, FaCogs, FaFlask, FaOilCan, FaShieldAlt, FaTools } from 'react-icons/fa';
import AIResultReport from '../components/AIResultReport';
import { ADVANCED_TOOLS, getAdvancedPresets } from '../services/advancedPresets';

const CATEGORY_ICONS = {
  'Production Intelligence': FaChartLine,
  'Reliability & Safety': FaShieldAlt,
  'Data & Automation': FaCogs,
  'Field Operations': FaClipboardList,
  Governance: FaTools,
};

const TOOL_ICONS = {
  'Production Intelligence': FaOilCan,
  'Reliability & Safety': FaBell,
  'Data & Automation': FaFlask,
  'Field Operations': FaClipboardList,
  Governance: FaShieldAlt,
};

export default function AdvancedToolsPage() {
  const [selectedId, setSelectedId] = useState(ADVANCED_TOOLS[0].id);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedTool = ADVANCED_TOOLS.find((tool) => tool.id === selectedId) || ADVANCED_TOOLS[0];
  const presets = getAdvancedPresets(selectedTool.presetKey || selectedTool.title, selectedTool.description, selectedTool.title);

  const groupedTools = useMemo(() => (
    ADVANCED_TOOLS.reduce((groups, tool) => {
      if (!groups[tool.category]) groups[tool.category] = [];
      groups[tool.category].push(tool);
      return groups;
    }, {})
  ), []);

  const applyPreset = (value) => {
    setInput(value);
    setError(null);
    setResult(null);
  };

  const selectTool = (tool) => {
    setSelectedId(tool.id);
    setInput('');
    setResult(null);
    setError(null);
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(selectedTool.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Request failed (${response.status}): ${text.slice(0, 220)}`);
      }

      setResult(await response.json());
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="advanced-lab-page">
      <header className="advanced-lab-header">
        <div>
          <span>Advanced AI Lab</span>
          <h1>Advanced operational intelligence</h1>
          <p>Grouped workflows for production forecasting, reliability, safety, automation, field operations, and governance.</p>
        </div>
        <div className="advanced-lab-count">
          <strong>{ADVANCED_TOOLS.length}</strong>
          <span>advanced tools</span>
        </div>
      </header>

      <div className="advanced-lab-layout">
        <aside className="advanced-tool-index" aria-label="Advanced tool selector">
          {Object.entries(groupedTools).map(([category, tools]) => {
            const CategoryIcon = CATEGORY_ICONS[category] || FaCogs;
            return (
              <section className="advanced-tool-group" key={category}>
                <div className="advanced-tool-group-title">
                  <CategoryIcon aria-hidden="true" />
                  <span>{category}</span>
                </div>
                <div className="advanced-tool-list">
                  {tools.map((tool) => {
                    const ToolIcon = TOOL_ICONS[tool.category] || FaOilCan;
                    return (
                      <button
                        className={`advanced-tool-row${tool.id === selectedId ? ' active' : ''}`}
                        key={tool.id}
                        type="button"
                        onClick={() => selectTool(tool)}
                      >
                        <ToolIcon aria-hidden="true" />
                        <span>{tool.title}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </aside>

        <section className="advanced-workspace">
          <div className="advanced-workspace-heading">
            <div>
              <span>{selectedTool.category}</span>
              <h2>{selectedTool.title}</h2>
              <p>{selectedTool.description}</p>
            </div>
          </div>

          <div className="advanced-preset-strip">
            {presets.map((preset) => (
              <button key={preset.label} type="button" onClick={() => applyPreset(preset.value)}>
                {preset.label}
              </button>
            ))}
          </div>

          <label className="advanced-input-label" htmlFor="advanced-ai-input">AI task context</label>
          <textarea
            id="advanced-ai-input"
            className="advanced-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={10}
            placeholder="Choose a workflow preset or enter the operating context, readings, constraints, and decision needed."
          />

          <div className="advanced-action-row">
            <button className="btn btn-ai" type="button" onClick={runAnalysis} disabled={loading || !input.trim()}>
              {loading ? 'Running analysis...' : `Run ${selectedTool.title}`}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => applyPreset('')}>
              Clear
            </button>
          </div>

          {error && <div className="advanced-error">{error}</div>}
          {result && <AIResultReport data={result} title={`${selectedTool.title} report`} />}
        </section>
      </div>
    </div>
  );
}
