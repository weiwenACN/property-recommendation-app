import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronRight, Send } from 'lucide-react';
import type { SearchMode } from '../../data/pricing';

export interface AgentInfo {
  name: string;
  branch: string;
  initials: string;
  phone: string;
  email: string;
}

// ── Session store (persists for the browser session) ──────────────────────

interface Message {
  id: string;
  from: 'agent' | 'user';
  text: string;
  date: Date;
}

interface ChatSession {
  messages: Message[];
  usedChipIds: Set<string>;
}

const sessionStore = new Map<string, ChatSession>();

function getSession(agentId: string): ChatSession | undefined {
  return sessionStore.get(agentId);
}

function initSession(agentId: string, welcomeText: string): ChatSession {
  const session: ChatSession = {
    messages: [{ id: 'welcome', from: 'agent', text: welcomeText, date: new Date() }],
    usedChipIds: new Set(),
  };
  sessionStore.set(agentId, session);
  return session;
}

function saveSession(agentId: string, session: ChatSession) {
  sessionStore.set(agentId, session);
}

// ── Chip definitions ──────────────────────────────────────────────────────

interface Chip {
  id: string;
  text: string;
  response: string;
}

function getChips(mode: SearchMode): Chip[] {
  return [
    {
      id: 'available',
      text: 'Is this property still available?',
      response: "Yes, this property is currently available. I'd recommend getting in touch soon as it's had a lot of interest!",
    },
    {
      id: 'viewing',
      text: 'Can I arrange a viewing?',
      response: "Of course! What days and times work best for you? I'll check availability and confirm.",
    },
    {
      id: 'included',
      text: mode === 'rent' ? 'What is included in the rent?' : 'What is included in the sale?',
      response: "The listing covers the key details, but I can confirm exactly what's included — things like bills, furnishings, and parking. Just ask!",
    },
    {
      id: 'pets',
      text: 'Are pets allowed?',
      response: "Pet policies vary. Let me check the landlord's preference for this property and get back to you.",
    },
    {
      id: 'transport',
      text: 'What are the nearest transport links?',
      response: "You can see the nearest tube stations and walking times in the Location tab on this listing. Happy to discuss commute options too!",
    },
  ];
}

// ── Helpers ───────────────────────────────────────────────────────────────

function dateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function groupByDate(messages: Message[]): { label: string; messages: Message[] }[] {
  const groups: { label: string; messages: Message[] }[] = [];
  let currentLabel = '';
  for (const msg of messages) {
    const label = dateLabel(msg.date);
    if (label !== currentLabel) {
      groups.push({ label, messages: [msg] });
      currentLabel = label;
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }
  return groups;
}

// ── Main component ────────────────────────────────────────────────────────

interface ChatScreenProps {
  agent: AgentInfo;
  agentId: string;
  propertyTitle: string;
  searchMode: SearchMode;
  onBack: () => void;
  onFirstMessageSent?: () => void;
}

export function ChatScreen({
  agent,
  agentId,
  propertyTitle,
  searchMode,
  onBack,
  onFirstMessageSent,
}: ChatScreenProps) {
  const welcomeText = `Hi! I'm ${agent.name.split(' ')[0]}, your Star Homes agent for ${propertyTitle}. How can I help?`;

  // Initialise or restore session
  const existingSession = getSession(agentId);
  const isNewSession = !existingSession;

  const [messages, setMessages] = useState<Message[]>(
    existingSession ? existingSession.messages : initSession(agentId, welcomeText).messages,
  );
  const [usedChipIds, setUsedChipIds] = useState<Set<string>>(
    existingSession ? existingSession.usedChipIds : new Set(),
  );
  const [input, setInput] = useState('');
  const [firstSent, setFirstSent] = useState(false);
  const [pendingResponse, setPendingResponse] = useState(false);

  const allChips = getChips(searchMode);

  // Track whether this is the first visit for chip rendering
  const isFirstVisitRef = useRef(isNewSession);
  const [showChips, setShowChips] = useState(isNewSession && usedChipIds.size < allChips.length);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingResponse]);

  // Persist to session store whenever messages or chips change
  useEffect(() => {
    saveSession(agentId, { messages, usedChipIds });
  }, [agentId, messages, usedChipIds]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: `msg-${Date.now()}`, from: 'user', text: text.trim(), date: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    if (!firstSent) {
      setFirstSent(true);
      onFirstMessageSent?.();
    }
  };

  const handleChipTap = (chip: Chip) => {
    if (pendingResponse) return;
    // Send chip text as user message
    const userMsg: Message = { id: `chip-user-${chip.id}`, from: 'user', text: chip.text, date: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    if (!firstSent) { setFirstSent(true); onFirstMessageSent?.(); }

    // Mark chip as used
    const nextUsed = new Set(usedChipIds);
    nextUsed.add(chip.id);
    setUsedChipIds(nextUsed);
    if (nextUsed.size >= allChips.length) setShowChips(false);

    // Agent response after 800ms
    setPendingResponse(true);
    window.setTimeout(() => {
      const agentMsg: Message = { id: `chip-agent-${chip.id}-${Date.now()}`, from: 'agent', text: chip.response, date: new Date() };
      setMessages((prev) => [...prev, agentMsg]);
      setPendingResponse(false);
    }, 800);
  };

  const groups = groupByDate(messages);
  const lastUserMsgId = [...messages].reverse().find((m) => m.from === 'user')?.id ?? null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Header ── */}
      <div className="bg-[#1a2332] flex items-center gap-3 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 flex-shrink-0">
        <button
          onClick={onBack}
          aria-label="Back"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:text-[#ff6b35] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full bg-white/15 border border-white/30 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">{agent.initials}</span>
        </div>
        <div>
          <p className="text-white font-bold text-sm">{agent.name}</p>
          <p className="text-[10px] font-medium" style={{ color: '#4ade80' }}>● Active now</p>
        </div>
      </div>

      {/* ── Message area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {groups.map((group) => (
          <div key={group.label}>
            {/* Date label */}
            <div className="flex justify-center my-3">
              <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{group.label}</span>
            </div>
            {group.messages.map((msg) => (
              <div key={msg.id} className={`flex mb-2 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="flex flex-col" style={{ maxWidth: msg.from === 'user' ? '80%' : '88%' }}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.from === 'user'
                        ? 'bg-[#1a2332] text-white rounded-br-sm'
                        : 'bg-[#F1EFE8] text-[#1a2332] rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.from === 'user' && msg.id === lastUserMsgId && (
                    <p className="text-[10px] text-gray-400 text-right mt-0.5 mr-1">Delivered</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Typing indicator */}
        {pendingResponse && (
          <div className="flex justify-start mb-2">
            <div className="bg-[#F1EFE8] rounded-2xl rounded-bl-sm px-4 py-2.5 flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        )}

        {/* Suggested chips */}
        {showChips && isFirstVisitRef.current && (
          <div className="mt-3 mb-2">
            <p className="text-xs text-gray-400 mb-2">Common questions:</p>
            <div className="space-y-2">
              {allChips
                .filter((c) => !usedChipIds.has(c.id))
                .map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => handleChipTap(chip)}
                    disabled={pendingResponse}
                    className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-full text-sm font-medium text-left transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: '#EEEDFE', color: '#3C3489' }}
                  >
                    <span>{chip.text}</span>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#3C3489' }} />
                  </button>
                ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="flex-shrink-0 border-t border-[#e5e7eb] px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] flex items-center gap-2 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Type a message…"
          className="flex-1 h-11 px-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-full text-sm text-[#1a2332] focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim()}
          aria-label="Send"
          className="w-11 h-11 flex-shrink-0 rounded-full bg-[#1a2332] flex items-center justify-center disabled:bg-gray-300 transition-colors"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
