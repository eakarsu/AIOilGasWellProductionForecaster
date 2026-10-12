import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaRobot, FaTimes } from 'react-icons/fa';
import { sendChatbotMessage } from '../services/api';
import AIResultReport from './AIResultReport';

const EXAMPLES = [
  'Operations summary',
  'Show overdue work orders',
  'Show low stock inventory',
  'Show expiring permits',
  'Search compressor in work orders',
];

export default function FloatingChatbot() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Ask me to show, search, count, create, update, delete, convert, evaluate alerts, or open data from any app feature.',
    },
  ]);
  const inputRef = useRef(null);

  const sendMessage = async (text = input) => {
    const value = text.trim();
    if (!value || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: value }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await sendChatbotMessage(value);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply || 'Done.',
          data: data.data,
          examples: data.examples,
          action: data.action,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: err.response?.data?.error || err.message || 'Chatbot request failed.' },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="floating-chatbot">
      {open && (
        <section className="chatbot-panel" aria-label="PetroAI chatbot">
          <header className="chatbot-header">
            <div>
              <span>PetroAI Assistant</span>
              <strong>Dynamic app actions</strong>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chatbot">
              <FaTimes />
            </button>
          </header>

          <div className="chatbot-examples">
            {EXAMPLES.slice(0, 4).map((example) => (
              <button key={example} type="button" onClick={() => setInput(example)} disabled={loading}>
                {example}
              </button>
            ))}
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={index} className={`chatbot-message ${message.role}`}>
                <div>{message.text}</div>
                {message.examples && (
                  <div className="chatbot-example-list">
                    {message.examples.map((example) => (
                      <button key={example} type="button" onClick={() => setInput(example)}>{example}</button>
                    ))}
                  </div>
                )}
                {message.data !== undefined && message.data !== null && <AIResultReport data={message.data} title="Assistant result" />}
                {message.action?.path && (
                  <button
                    type="button"
                    className="chatbot-open-page"
                    onClick={() => {
                      navigate(message.action.path);
                      setOpen(false);
                    }}
                  >
                    Open related page
                  </button>
                )}
              </div>
            ))}
            {loading && <div className="chatbot-message assistant"><div>Calling app APIs...</div></div>}
          </div>

          <div className="chatbot-input-row">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask: show, search, update, create, delete, open, convert..."
              rows={2}
            />
            <button type="button" onClick={() => sendMessage()} disabled={loading || !input.trim()} aria-label="Send">
              <FaPaperPlane />
            </button>
          </div>
        </section>
      )}

      <button type="button" className="chatbot-launcher" onClick={() => setOpen((value) => !value)} aria-label="Open PetroAI chatbot">
        <FaRobot />
      </button>
    </div>
  );
}
