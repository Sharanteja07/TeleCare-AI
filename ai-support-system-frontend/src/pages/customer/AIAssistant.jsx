import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, Send, User, RefreshCw, Plus, Headphones, Shield, CreditCard, CheckCircle2, ArrowRight
} from 'lucide-react';
import { aiTelecomEngine } from '../../services/aiTelecomEngine';

const SIM_QUICK_ACTIONS = [
  { label: 'SIM Not Working', prompt: 'My SIM is not working.' },
  { label: 'Activate SIM', prompt: 'My new SIM is not activated.' },
  { label: 'Lost SIM', prompt: 'I lost my SIM card.' },
  { label: 'Damaged SIM', prompt: 'My SIM card is damaged.' },
  { label: 'Replace SIM', prompt: 'I need a SIM replacement.' },
  { label: 'eSIM Issue', prompt: 'My eSIM is not working.' },
  { label: 'SIM PIN / PUK', prompt: 'I forgot my SIM PIN code.' },
  { label: 'SIM Portability', prompt: 'I want to port my SIM number.' },
  { label: 'Talk to Support', prompt: 'I want to talk to human support.' },
];

function formatTimestamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function parseFormattedText(text) {
  if (!text) return null;
  
  // Clean continuous string concatenations if present in text
  const cleanedText = text
    .replace(/\*\*(Block Lost SIM|Request Replacement|Contact Support Engineer)\*\*/g, '')
    .replace(/Block Lost SIMRequest ReplacementContact Support Engineer/g, '');

  const lines = cleanedText.split('\n');
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <React.Fragment key={lineIdx}>
        {parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={partIdx} style={{ color: '#FFFFFF', fontWeight: 600 }}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={partIdx}>{part}</span>;
        })}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

const AIAssistant = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: "Hi! 👋 I'm your **TeleCare AI Assistant**.\n\nI can help with SIM activation, replacement, lost or damaged SIMs, eSIM issues, PIN/PUK problems, and other SIM-related issues.\n\nHow can I help you today?",
      timestamp: formatTimestamp(),
      showEscalationButtons: false,
      category: null,
      customButtons: []
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: formatTimestamp(),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = aiTelecomEngine.processMessage(text);
      
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        timestamp: formatTimestamp(),
        showEscalationButtons: response.showEscalationButtons || false,
        category: response.category || 'SIM Not Working',
        customButtons: response.customButtons || []
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    aiTelecomEngine.reset();
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'ai',
        text: "Hi! 👋 I'm your TeleCare AI Assistant. How can I help with your SIM card today?",
        timestamp: formatTimestamp(),
        showEscalationButtons: false,
        category: null,
        customButtons: []
      }
    ]);
  };

  const handleActionButtonClick = (category) => {
    const targetCat = category || 'SIM Not Working';
    navigate(`/dashboard/tickets/create?category=${encodeURIComponent(targetCat)}`);
  };

  const cardStyle = {
    background: 'rgba(18,25,47,0.72)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 0 30px rgba(59,183,255,0.12), 0 8px 32px rgba(0,0,0,0.4)',
    borderRadius: '16px',
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: '#070B18', color: '#FFFFFF', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Main Chat Container */}
      <div 
        style={{ 
          ...cardStyle, 
          height: 'calc(100vh - 120px)', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        
        {/* Header Bar */}
        <div 
          style={{ 
            padding: '16px 20px', 
            borderBottom: '1px solid rgba(120,160,255,0.12)', 
            background: 'rgba(13,18,36,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{ 
                width: 40, height: 40, borderRadius: '12px', 
                background: 'linear-gradient(135deg, #3BB7FF 0%, #5E8BFF 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 15px rgba(59,183,255,0.3)'
              }}
            >
              <Bot size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif' }}>
                TeleCare AI Assistant
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#A8B3CF', marginTop: '2px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00E676', boxShadow: '0 0 8px #00E676' }} />
                <span>Online · TeleCare AI Assistant</span>
              </div>
            </div>
          </div>

          <button 
            onClick={resetChat}
            className="btn-ghost"
            style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Reset Conversation"
          >
            <RefreshCw size={14} /> New Chat
          </button>
        </div>

        {/* Messages Stream */}
        <div 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px',
            background: 'rgba(7,11,24,0.4)'
          }}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id} 
                style={{ 
                  display: 'flex', 
                  width: '100%', 
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                {!isUser && (
                  <div 
                    style={{ 
                      width: 32, height: 32, borderRadius: '50%', 
                      background: 'rgba(59,183,255,0.15)', 
                      border: '1px solid rgba(59,183,255,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: '2px'
                    }}
                  >
                    <Bot size={16} color="#3BB7FF" />
                  </div>
                )}

                <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                  <div 
                    style={
                      isUser ? {
                        background: 'linear-gradient(135deg, #3BB7FF, #5E8BFF)',
                        color: '#FFFFFF',
                        borderRadius: '18px 18px 4px 18px',
                        padding: '12px 16px',
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                        boxShadow: '0 4px 20px rgba(59,183,255,0.25)',
                      } : {
                        background: 'rgba(18,25,47,0.85)',
                        border: '1px solid rgba(120,160,255,0.15)',
                        color: '#FFFFFF',
                        borderRadius: '18px 18px 18px 4px',
                        padding: '12px 16px',
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                      }
                    }
                  >
                    {parseFormattedText(msg.text)}

                    {/* Custom Action Buttons — Formatted as distinct buttons */}
                    {msg.customButtons && msg.customButtons.length > 0 ? (
                      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {msg.customButtons.map((btn, idx) => (
                          <button
                            key={idx}
                            tabIndex={0}
                            onClick={() => handleActionButtonClick(btn.category)}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleActionButtonClick(btn.category)}
                            className="btn-primary"
                            style={{ 
                              padding: '8px 14px', 
                              fontSize: '0.8rem', 
                              fontWeight: 600,
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '6px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              boxShadow: '0 4px 12px rgba(59,183,255,0.2)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Plus size={14} /> [ {btn.label} ]
                          </button>
                        ))}
                      </div>
                    ) : msg.showEscalationButtons && (
                      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        <button
                          tabIndex={0}
                          onClick={() => handleActionButtonClick(msg.category || 'SIM Not Working')}
                          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleActionButtonClick(msg.category || 'SIM Not Working')}
                          className="btn-primary"
                          style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
                        >
                          <Plus size={14} /> [ Create Support Ticket ]
                        </button>
                        <button
                          tabIndex={0}
                          onClick={() => handleSend('Continue Troubleshooting')}
                          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSend('Continue Troubleshooting')}
                          className="btn-ghost"
                          style={{ padding: '8px 14px', fontSize: '0.8rem', borderRadius: '8px' }}
                        >
                          Continue Troubleshooting
                        </button>
                      </div>
                    )}
                  </div>

                  <span style={{ fontSize: '0.7rem', color: '#A8B3CF', marginTop: '4px', padding: '0 4px', opacity: 0.8 }}>
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div 
                    style={{ 
                      width: 32, height: 32, borderRadius: '50%', 
                      background: 'rgba(94,139,255,0.2)', 
                      border: '1px solid rgba(94,139,255,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: '2px'
                    }}
                  >
                    <User size={16} color="#5E8BFF" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(59,183,255,0.15)', border: '1px solid rgba(59,183,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={16} color="#3BB7FF" />
              </div>
              <div style={{ background: 'rgba(18,25,47,0.85)', border: '1px solid rgba(120,160,255,0.15)', padding: '10px 16px', borderRadius: '18px 18px 18px 4px', color: '#A8B3CF', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>SIM Support Assistant is typing</span>
                <span className="animate-pulse">...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Chips Bar */}
        <div 
          style={{ 
            padding: '10px 16px', 
            borderTop: '1px solid rgba(120,160,255,0.1)', 
            background: 'rgba(13,18,36,0.8)',
            overflowX: 'auto'
          }}
        >
          <div style={{ display: 'flex', gap: '8px', width: 'max-content' }}>
            {SIM_QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleSend(action.prompt)}
                disabled={isTyping}
                style={{
                  background: 'rgba(59,183,255,0.06)',
                  border: '1px solid rgba(59,183,255,0.15)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  color: '#A8B3CF',
                  cursor: isTyping ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!isTyping) {
                    e.currentTarget.style.borderColor = '#3BB7FF';
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.background = 'rgba(59,183,255,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(59,183,255,0.15)';
                  e.currentTarget.style.color = '#A8B3CF';
                  e.currentTarget.style.background = 'rgba(59,183,255,0.06)';
                }}
              >
                <span>📱</span> {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div 
          style={{ 
            padding: '12px 16px', 
            borderTop: '1px solid rgba(120,160,255,0.12)', 
            background: 'rgba(13,18,36,0.95)' 
          }}
        >
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about SIM activation, replacement, lost SIM, eSIM, PUK code..."
              style={{
                flex: 1,
                background: 'rgba(7,11,24,0.8)',
                border: '1px solid rgba(120,160,255,0.2)',
                borderRadius: '12px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                padding: '10px 14px',
                outline: 'none',
                resize: 'none',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.3s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3BB7FF';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,183,255,0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(120,160,255,0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="btn-primary"
              style={{
                padding: '10px 18px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: (!input.trim() || isTyping) ? 0.4 : 1,
                cursor: (!input.trim() || isTyping) ? 'not-allowed' : 'pointer'
              }}
            >
              <span>Send</span> <Send size={14} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AIAssistant;
