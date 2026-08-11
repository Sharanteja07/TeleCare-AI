import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, User, Wifi, WifiOff } from 'lucide-react';
import httpClient from '../services/httpClient';

const formatTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * ChatWindow — real-time ticket chat
 * Props: ticketId, currentUser, readonly
 */
export const ChatWindow = ({ ticketId, currentUser, readonly = false }) => {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const [wsState, setWsState]     = useState('connecting'); // connecting | live | polling
  const messagesEndRef = useRef(null);
  const wsRef          = useRef(null);
  const pollRef        = useRef(null);
  const retryTimeout   = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await httpClient.get(`/api/chat/history/${ticketId}`);
      const msgs = res.data?.messages || res.data || [];
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch (e) { /* silent */ }
    finally { setLoading(false); }
  }, [ticketId]);

  useEffect(() => {
    fetchHistory();

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    const apiBase = import.meta.env.VITE_API_BASE_URL || '';
    let wsHost = '127.0.0.1:8000';
    let wsProtocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    if (apiBase.startsWith('http://') || apiBase.startsWith('https://')) {
      try {
        const urlObj = new URL(apiBase);
        wsHost = urlObj.host;
        wsProtocol = urlObj.protocol === 'https:' ? 'wss:' : 'ws:';
      } catch (e) { /* fallback */ }
    } else if (typeof window !== 'undefined' && window.location.host) {
      wsHost = window.location.host;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || `${wsProtocol}//${wsHost}/api/chat/ws/${ticketId}?token=${token}`;


    const connect = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        setWsState('connecting');

        ws.onopen = () => {
          setWsState('live');
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        };

        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id && m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          } catch {}
        };

        ws.onclose = () => {
          setWsState('polling');
          if (!pollRef.current) {
            pollRef.current = setInterval(fetchHistory, 5000);
          }
          // Reconnect after 6s
          retryTimeout.current = setTimeout(connect, 6000);
        };

        ws.onerror = () => {
          setWsState('polling');
          ws.close();
        };
      } catch {
        setWsState('polling');
        if (!pollRef.current) pollRef.current = setInterval(fetchHistory, 5000);
      }
    };

    connect();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pollRef.current) clearInterval(pollRef.current);
      if (retryTimeout.current) clearTimeout(retryTimeout.current);
    };
  }, [ticketId, fetchHistory]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || readonly || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    const optimistic = {
      id: `opt-${Date.now()}`,
      sender_username: currentUser?.username,
      sender_id: currentUser?.id,
      text,
      message: text,
      timestamp: new Date().toISOString(),
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setMessages(prev => [...prev, optimistic]);
      wsRef.current.send(JSON.stringify({ text }));
    } else {
      // REST fallback
      try {
        await httpClient.post('/api/chat/send', { ticket_id: ticketId, text });
        setMessages(prev => [...prev, optimistic]);
      } catch { /* silent */ }
    }

    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSend(e);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '480px',
        background: 'rgba(13,18,36,0.9)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(120,160,255,0.15)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(120,160,255,0.1)',
          background: 'rgba(16,25,47,0.6)',
        }}
      >
        <div
          style={{
            width: 32, height: 32, borderRadius: '10px',
            background: 'rgba(59,183,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Bot size={16} style={{ color: '#3BB7FF' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Live Chat</div>
          <div style={{ fontSize: '11px', color: '#A8B3CF' }}>
            Ticket #{ticketId}
          </div>
        </div>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '11px', fontWeight: 500,
            color: wsState === 'live' ? '#00E676' : '#FFC107',
            background: wsState === 'live' ? 'rgba(0,230,118,0.1)' : 'rgba(255,193,7,0.1)',
            padding: '3px 8px', borderRadius: '99px',
            border: `1px solid ${wsState === 'live' ? 'rgba(0,230,118,0.25)' : 'rgba(255,193,7,0.25)'}`,
          }}
        >
          {wsState === 'live' ? <Wifi size={11} /> : <WifiOff size={11} />}
          {wsState === 'live' ? 'Live' : 'Polling'}
        </div>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center', color: '#A8B3CF' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(59,183,255,0.3)', borderTopColor: '#3BB7FF', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
              <p style={{ fontSize: '13px' }}>Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#A8B3CF' }}>
            <Bot size={32} style={{ marginBottom: 10, opacity: 0.3 }} />
            <p style={{ fontSize: '13px' }}>No messages yet. Start the conversation!</p>
          </div>
        ) : messages.map((msg, idx) => {
          const isSelf = msg.sender_id === currentUser?.id || msg.sender_username === currentUser?.username;
          const isAi = msg.sender_username === 'AI_Assistant';

          return (
            <div key={msg.id || idx} style={{ display: 'flex', width: '100%', justifyContent: isSelf ? 'flex-end' : 'flex-start', gap: '8px', alignItems: 'flex-end', animation: 'fadeIn 0.25s ease-out' }}>
              {!isSelf && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: isAi ? 'rgba(59,183,255,0.15)' : 'rgba(120,160,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(120,160,255,0.15)' }}>
                  {isAi ? <Bot size={13} style={{ color: '#3BB7FF' }} /> : <User size={13} style={{ color: '#A8B3CF' }} />}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '75%', alignItems: isSelf ? 'flex-end' : 'flex-start' }}>
                {!isSelf && <span style={{ fontSize: '11px', color: '#A8B3CF', paddingLeft: '4px' }}>{msg.sender_username}</span>}
                <div
                  style={isSelf ? {
                    background: 'linear-gradient(135deg, #3BB7FF, #5E8BFF)',
                    color: '#fff',
                    borderRadius: '16px 16px 4px 16px',
                    padding: '9px 13px',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    boxShadow: '0 4px 15px rgba(59,183,255,0.25)',
                  } : {
                    background: 'rgba(18,25,47,0.85)',
                    border: '1px solid rgba(120,160,255,0.15)',
                    color: '#fff',
                    borderRadius: '16px 16px 16px 4px',
                    padding: '9px 13px',
                    fontSize: '13px',
                    lineHeight: '1.5',
                  }}
                >
                  {msg.text || msg.message}
                </div>
                <span style={{ fontSize: '10px', color: '#A8B3CF', opacity: 0.7 }}>
                  {formatTime(msg.timestamp || msg.created_at)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!readonly && (
        <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(120,160,255,0.1)', background: 'rgba(16,25,47,0.5)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message... (Enter to send)"
              style={{
                flex: 1,
                background: 'rgba(7,11,24,0.8)',
                border: '1px solid rgba(120,160,255,0.2)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '13px',
                padding: '9px 13px',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#3BB7FF'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(120,160,255,0.2)'}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              style={{
                width: 38, height: 38,
                borderRadius: '10px',
                background: !input.trim() ? 'rgba(59,183,255,0.1)' : 'linear-gradient(135deg, #3BB7FF, #5E8BFF)',
                border: 'none',
                cursor: !input.trim() ? 'not-allowed' : 'pointer',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: input.trim() ? '0 4px 15px rgba(59,183,255,0.35)' : 'none',
                transition: 'all 0.25s ease',
                flexShrink: 0,
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
