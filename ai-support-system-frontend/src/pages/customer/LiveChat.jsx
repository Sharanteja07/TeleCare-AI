import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import ChatBox from '../../components/ChatBox';
import Button from '../../components/Button';
import { Headphones, Users, ShieldCheck } from 'lucide-react';

const LiveChat = () => {
  const [connecting, setConnecting] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Simulate connecting to active queue
    const timer = setTimeout(() => {
      setConnecting(false);
      setMessages([
        { sender: 'agent', text: "Hello! Thank you for contacting Aether support. My name is Dr. Sarah Chen from the optical network support team. How can I assist you today?", timestamp: "Just now" }
      ]);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (text) => {
    const userMsg = { sender: 'customer', text, timestamp: "Just now" };
    setMessages(prev => [...prev, userMsg]);

    setIsTyping(true);
    // Simulate support engineer typing response
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const replyText = "I see. I am checking the current routing tables on your local area line. Let me trigger an active fiber signal bounce to refresh your bandwidth limits.";
    setMessages(prev => [...prev, { sender: 'agent', text: replyText, timestamp: "Just now" }]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-slate-800/40 pb-5">
        <h1 className="text-3xl font-display font-bold text-white">Live Support Chat</h1>
        <p className="text-slate-400 text-xs font-sans mt-1">
          Establish an encrypted line to our support engineering room for complex configurations and account operations.
        </p>
      </div>

      {connecting ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-cyan-500/10 border-l-transparent animate-spin flex items-center justify-center">
            <Headphones className="text-cyan-400 animate-pulse" size={24} />
          </div>
          <h3 className="font-display font-bold text-white text-base">Routing Encrypted Support Tunnel...</h3>
          <p className="text-xs text-slate-500 font-sans max-w-xs">Connecting to an available optical networks support technician.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Chat Panel */}
          <div className="lg:col-span-3">
            <ChatBox
              title="Aether Live Engineering Desk"
              messages={messages}
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
              quickReplies={["Line is dropping", "Check bill status", "Thank you, all set"]}
              onQuickReplyClick={(reply) => handleSendMessage(reply)}
            />
          </div>

          {/* Diagnostics info */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Card title="Support Desk Details" subtitle="Active session connection parameters">
              <div className="flex flex-col gap-4 text-xs font-sans">
                <div className="flex justify-between items-center pb-2 border-b border-slate-900/60">
                  <span className="text-slate-400">Technician:</span>
                  <span className="text-white font-semibold">Dr. Sarah Chen</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-900/60">
                  <span className="text-slate-400">Department:</span>
                  <span className="text-slate-200">Diagnostics Hub</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-900/60">
                  <span className="text-slate-400">Link Integrity:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                    Secure (99.8%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Queue Wait:</span>
                  <span className="text-slate-200">0 mins</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveChat;
