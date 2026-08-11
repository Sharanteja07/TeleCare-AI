import React, { useState } from 'react';
import Card from '../../components/Card';
import ChatBox from '../../components/ChatBox';

const EngineerChat = () => {
  const [messages, setMessages] = useState([
    { sender: 'customer', text: "Hello, my fiber router status light is blinking green but my device says no internet connection. Can you check my IP route configuration?", timestamp: "3 mins ago" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (text) => {
    const userMsg = { sender: 'agent', text, timestamp: "Just now" };
    setMessages(prev => [...prev, userMsg]);

    setIsTyping(true);
    // Simulate customer typing reply
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const replyText = "Okay, I rebooted my computer. The connection speed seems back to normal now. Thanks!";
    setMessages(prev => [...prev, { sender: 'customer', text: replyText, timestamp: "Just now" }]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-slate-800/40 pb-5">
        <h1 className="text-3xl font-display font-bold text-white">Live Customer Chat Support</h1>
        <p className="text-slate-400 text-xs font-sans mt-1">
          Monitor incoming user chats and provide live diagnostic answers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <ChatBox
            title="Live Chat Session #39812"
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            quickReplies={["Please power cycle router", "Re-authenticating IP pool", "Ticket resolved"]}
            onQuickReplyClick={(reply) => handleSendMessage(reply)}
          />
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card title="Active Client Info" subtitle="Target customer details">
            <div className="flex flex-col gap-3.5 text-xs font-sans">
              <div className="flex justify-between items-center pb-1 border-b border-slate-900/60">
                <span className="text-slate-400">Name:</span>
                <span className="text-white font-semibold">Alex Rivera</span>
              </div>
              <div className="flex justify-between items-center pb-1 border-b border-slate-900/60">
                <span className="text-slate-400">Account:</span>
                <span className="text-slate-200">ACT-9821-FX</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Plan:</span>
                <span className="text-cyan-400 font-semibold">Fiber Gigabit Ultra</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EngineerChat;
