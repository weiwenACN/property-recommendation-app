import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';

interface Message {
  id: string;
  from: 'agent' | 'user';
  text: string;
}

export interface AgentInfo {
  name: string;
  branch: string;
  initials: string;
  phone: string;
  email: string;
}

interface ChatScreenProps {
  agent: AgentInfo;
  propertyTitle: string;
  onBack: () => void;
  onFirstMessageSent?: () => void;
}

export function ChatScreen({ agent, propertyTitle, onBack, onFirstMessageSent }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      from: 'agent',
      text: `Hi! I'm ${agent.name.split(' ')[0]}, your Star Homes agent for ${propertyTitle}. How can I help?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [firstSent, setFirstSent] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: `msg-${Date.now()}`, from: 'user', text }]);
    setInput('');
    if (!firstSent) {
      setFirstSent(true);
      onFirstMessageSent?.();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-[#1a2332] px-4 pb-4 header-pt flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Back"
          className="text-white hover:text-[#ff6b35] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full bg-[#ff6b35] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">{agent.initials}</span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{agent.name}</p>
          <p className="text-gray-300 text-xs">{agent.branch}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start gap-2'}`}>
            {msg.from === 'agent' && (
              <div className="w-7 h-7 rounded-full bg-[#ff6b35] flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white font-bold text-[10px]">{agent.initials}</span>
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.from === 'user'
                  ? 'bg-[#1a2332] text-white rounded-br-sm'
                  : 'bg-[#f1f3f5] text-[#1a2332] rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 border-t border-[#e5e7eb] px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] flex items-center gap-2 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Type a message…"
          className="flex-1 h-11 px-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-full text-sm text-[#1a2332] focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          aria-label="Send"
          className="w-11 h-11 bg-[#1a2332] rounded-full flex items-center justify-center disabled:bg-gray-300 transition-colors flex-shrink-0"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
