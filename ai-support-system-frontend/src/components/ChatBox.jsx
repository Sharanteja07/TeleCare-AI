import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Paperclip } from 'lucide-react';
import Button from './Button';

const ChatBox = ({ 
  title, 
  messages, 
  onSendMessage, 
  isTyping = false, 
  placeholder = "Type your message...", 
  quickReplies = [],
  onQuickReplyClick
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  return (
    <div className="rounded-xl flex flex-col h-[520px] w-full border border-zinc-200 bg-white overflow-hidden shadow-sm">
      {/* Chat Header */}
      <div className="px-5 py-3.5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-sm">
            AI
          </div>
          <div>
            <h3 className="font-semibold text-xs text-black tracking-tight">{title}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 bg-black rounded-full" />
              <span className="text-[10px] text-zinc-500 font-medium">Assistant Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 mb-2">
              <Bot size={20} />
            </div>
            <p className="text-xs font-semibold text-black uppercase tracking-wider">No Messages</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Ask a question or select a quick option below.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isBot = msg.sender === 'bot' || msg.sender === 'agent' || msg.sender === 'system' || msg.sender === 'AI_Assistant';
            return (
              <div 
                key={index} 
                className={`flex gap-3 max-w-[80%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center border shrink-0 text-xs font-bold ${
                  isBot 
                    ? 'bg-zinc-50 border-zinc-200 text-black' 
                    : 'bg-black border-black text-white'
                }`}>
                  {isBot ? 'AI' : 'US'}
                </div>

                {/* Message bubble */}
                <div className="flex flex-col gap-1">
                  <div className={`p-3 rounded-xl text-xs leading-relaxed border ${
                    isBot 
                      ? 'bg-zinc-50 border-zinc-200 text-black rounded-tl-none' 
                      : 'bg-black text-white border-black rounded-tr-none'
                  }`}>
                    {msg.text}
                    {msg.attachment && (
                      <div className="mt-2 p-1.5 rounded bg-white/10 border border-white/5 flex items-center gap-1.5">
                        <Paperclip size={12} className="text-zinc-400" />
                        <span className="text-[9px] truncate max-w-[150px]">{msg.attachment.name}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] text-zinc-400 px-1">
                    {msg.timestamp || 'Just now'}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="w-7.5 h-7.5 rounded-lg bg-zinc-50 border border-zinc-200 text-black flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-xl rounded-tl-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      {quickReplies.length > 0 && (
        <div className="px-5 py-2 bg-zinc-50 border-t border-zinc-200 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => onQuickReplyClick && onQuickReplyClick(reply)}
              className="px-3 py-1 rounded-full border border-zinc-200 bg-white hover:border-black text-[10px] text-zinc-700 hover:text-black transition-all font-sans"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Form */}
      <form onSubmit={handleSubmit} className="px-5 py-3.5 bg-zinc-50 border-t border-zinc-200 flex items-center gap-2">
        <input 
          type="text" 
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 bg-white border border-zinc-200 text-xs rounded-lg px-3 py-2.5 text-black placeholder-zinc-400 focus:outline-none focus:border-black transition-all"
        />
        <Button 
          type="submit" 
          className="h-9 w-9 !p-0 rounded-lg shrink-0"
          disabled={!inputValue.trim()}
        >
          <Send size={14} />
        </Button>
      </form>
    </div>
  );
};

export default ChatBox;
