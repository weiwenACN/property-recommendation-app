import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronRight, Send, X } from 'lucide-react';
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
  /** Remaining spark action chips; empty for non-spark sessions. */
  sparkChipsRemaining: string[];
}

const sessionStore = new Map<string, ChatSession>();

function getSession(key: string): ChatSession | undefined {
  return sessionStore.get(key);
}

function initRegularSession(key: string, welcomeText: string): ChatSession {
  const session: ChatSession = {
    messages: [{ id: 'welcome', from: 'agent', text: welcomeText, date: new Date() }],
    usedChipIds: new Set(),
    sparkChipsRemaining: [],
  };
  sessionStore.set(key, session);
  return session;
}

function initSparkSession(key: string, autoMessage: string): ChatSession {
  const session: ChatSession = {
    messages: [{ id: 'spark-auto', from: 'user', text: autoMessage, date: new Date() }],
    usedChipIds: new Set(),
    sparkChipsRemaining: ['viewing', 'offer'],
  };
  sessionStore.set(key, session);
  return session;
}

function saveSession(key: string, session: ChatSession) {
  sessionStore.set(key, session);
}

// ── Regular chip definitions ──────────────────────────────────────────────

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
      response:
        "Yes, this property is currently available. I'd recommend getting in touch soon as it's had a lot of interest!",
    },
    {
      id: 'viewing',
      text: 'Can I arrange a viewing?',
      response:
        "Of course! What days and times work best for you? I'll check availability and confirm.",
    },
    {
      id: 'included',
      text: mode === 'rent' ? 'What is included in the rent?' : 'What is included in the sale?',
      response:
        "The listing covers the key details, but I can confirm exactly what's included — things like bills, furnishings, and parking. Just ask!",
    },
    {
      id: 'pets',
      text: 'Are pets allowed?',
      response:
        "Pet policies vary. Let me check the landlord's preference for this property and get back to you.",
    },
    {
      id: 'transport',
      text: 'What are the nearest transport links?',
      response:
        "You can see the nearest tube stations and walking times in the Location tab on this listing. Happy to discuss commute options too!",
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

function formatPrice(amount: number, mode: SearchMode): string {
  if (mode === 'rent') {
    return `£${amount.toLocaleString('en-GB')}/month`;
  }
  return `£${amount.toLocaleString('en-GB')}`;
}

// ── OfferSheet ────────────────────────────────────────────────────────────

interface OfferSheetProps {
  open: boolean;
  listedPrice: number;
  searchMode: SearchMode;
  onSend: (amount: number, note: string) => void;
  onClose: () => void;
}

function OfferSheet({ open, listedPrice, searchMode, onSend, onClose }: OfferSheetProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  if (!open) return null;

  const listedLabel =
    searchMode === 'rent'
      ? `Listed at £${listedPrice.toLocaleString('en-GB')}/month`
      : `Listed at £${listedPrice.toLocaleString('en-GB')}`;

  const amountPlaceholder =
    searchMode === 'rent' ? 'Monthly rent (e.g. 2000)' : 'Your offer (e.g. 650000)';

  const handleSend = () => {
    const parsed = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!parsed || isNaN(parsed)) return;
    onSend(parsed, note.trim());
  };

  return (
    <div className="fixed inset-0 z-[9100]">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close offer sheet"
        className="absolute inset-0 bg-black/40 animate-in fade-in cursor-default"
        tabIndex={-1}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-labelledby="offer-sheet-title"
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom"
      >
        {/* Handle + header */}
        <div className="px-5 pt-4 pb-3 border-b border-[#f1f3f5]">
          <div className="mx-auto h-1.5 w-12 bg-[#e5e7eb] rounded-full mb-4" />
          <div className="flex items-center justify-between">
            <h2 id="offer-sheet-title" className="text-lg font-bold text-[#1a2332]">
              Propose your offer
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 -mr-1 text-gray-400 hover:text-[#1a2332] min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Listed price reference */}
          <p className="text-sm text-gray-500 mt-0.5">{listedLabel}</p>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#1a2332] mb-1.5 uppercase tracking-wide">
              {searchMode === 'rent' ? 'Proposed monthly rent (£)' : 'Proposed price (£)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                £
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={amountPlaceholder}
                className="w-full h-12 pl-7 pr-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-sm text-[#1a2332] focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a2332] mb-1.5 uppercase tracking-wide">
              Note to agent (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for the agent…"
              rows={3}
              className="w-full px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-sm text-[#1a2332] focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] space-y-2">
          <button
            onClick={handleSend}
            disabled={!amount.trim()}
            className="w-full min-h-[48px] bg-[#1a2332] text-white rounded-xl font-semibold text-sm hover:bg-[#2a3342] disabled:bg-gray-300 transition-colors"
          >
            Send offer
          </button>
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-gray-500 hover:text-[#1a2332] py-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export interface SparkEntry {
  /** Pre-sent user message ("Hi, I'm interested in…"). */
  autoMessage: string;
  /** Unique session key for this spark conversation (e.g. "spark-prop-3"). */
  sessionKey: string;
  /** Listed price in £ (monthly if rent, total if buy), for the offer sheet. */
  listedPrice: number;
}

interface ChatScreenProps {
  agent: AgentInfo;
  agentId: string;
  propertyTitle: string;
  searchMode: SearchMode;
  onBack: () => void;
  onFirstMessageSent?: () => void;
  /** When provided, this chat was opened from a Spark swipe-right. */
  sparkEntry?: SparkEntry;
}

export function ChatScreen({
  agent,
  agentId,
  propertyTitle,
  searchMode,
  onBack,
  onFirstMessageSent,
  sparkEntry,
}: ChatScreenProps) {
  // Effective session key: spark sessions use a property-scoped key
  const effectiveKey = sparkEntry?.sessionKey ?? agentId;
  const welcomeText = `Hi! I'm ${agent.name.split(' ')[0]}, your Star Homes agent for ${propertyTitle}. How can I help?`;

  // Initialise or restore session
  const existingSession = getSession(effectiveKey);
  const isNewSession = !existingSession;
  const isSparkSession = !!sparkEntry;

  const initialSession = (() => {
    if (existingSession) return existingSession;
    if (sparkEntry) return initSparkSession(effectiveKey, sparkEntry.autoMessage);
    return initRegularSession(effectiveKey, welcomeText);
  })();

  const [messages, setMessages] = useState<Message[]>(initialSession.messages);
  const [usedChipIds, setUsedChipIds] = useState<Set<string>>(initialSession.usedChipIds);
  const [sparkChipsRemaining, setSparkChipsRemaining] = useState<string[]>(
    initialSession.sparkChipsRemaining,
  );
  const [input, setInput] = useState('');
  const [firstSent, setFirstSent] = useState(false);
  const [pendingResponse, setPendingResponse] = useState(false);
  const [offerSheetOpen, setOfferSheetOpen] = useState(false);

  const allChips = getChips(searchMode);
  const isFirstVisitRef = useRef(isNewSession && !isSparkSession);

  // For regular (non-spark) sessions, show chips on first visit
  const [showRegularChips, setShowRegularChips] = useState(
    isNewSession && !isSparkSession && usedChipIds.size < allChips.length,
  );

  // For spark sessions, trigger the 800ms agent reply on the very first mount
  const sparkReplyFiredRef = useRef(false);
  useEffect(() => {
    if (!isSparkSession || !isNewSession || sparkReplyFiredRef.current) return;
    sparkReplyFiredRef.current = true;
    setPendingResponse(true);
    const timer = window.setTimeout(() => {
      const replyMsg: Message = {
        id: `spark-agent-reply-${Date.now()}`,
        from: 'agent',
        text: "Great to hear! Would you like to arrange a viewing or make an offer?",
        date: new Date(),
      };
      setMessages((prev) => [...prev, replyMsg]);
      setPendingResponse(false);
      // sparkChipsRemaining is already initialised to ['viewing','offer']
    }, 800);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingResponse]);

  // Persist session whenever messages / chips change
  useEffect(() => {
    saveSession(effectiveKey, { messages, usedChipIds, sparkChipsRemaining });
  }, [effectiveKey, messages, usedChipIds, sparkChipsRemaining]);

  // ── Send helpers ─────────────────────────────────────────────────────────

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

  const agentReply = (text: string, chipId: string) => {
    setPendingResponse(true);
    window.setTimeout(() => {
      const agentMsg: Message = {
        id: `agent-${chipId}-${Date.now()}`,
        from: 'agent',
        text,
        date: new Date(),
      };
      setMessages((prev) => [...prev, agentMsg]);
      setPendingResponse(false);
    }, 800);
  };

  // ── Regular chip handler ─────────────────────────────────────────────────

  const handleChipTap = (chip: Chip) => {
    if (pendingResponse) return;
    const userMsg: Message = {
      id: `chip-user-${chip.id}`,
      from: 'user',
      text: chip.text,
      date: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!firstSent) { setFirstSent(true); onFirstMessageSent?.(); }

    const nextUsed = new Set(usedChipIds);
    nextUsed.add(chip.id);
    setUsedChipIds(nextUsed);
    if (nextUsed.size >= allChips.length) setShowRegularChips(false);

    agentReply(chip.response, chip.id);
  };

  // ── Spark chip handler ───────────────────────────────────────────────────

  const handleSparkChipTap = (chipId: 'viewing' | 'offer') => {
    if (pendingResponse) return;

    // Remove this chip from remaining list
    const nextChips = sparkChipsRemaining.filter((c) => c !== chipId);
    setSparkChipsRemaining(nextChips);

    if (chipId === 'offer') {
      setOfferSheetOpen(true);
      return;
    }

    // "Arrange a viewing"
    const userMsg: Message = {
      id: `spark-chip-user-${chipId}-${Date.now()}`,
      from: 'user',
      text: 'Arrange a viewing',
      date: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!firstSent) { setFirstSent(true); onFirstMessageSent?.(); }
    agentReply(
      "Of course! When are you free? I'll check availability and send you a confirmation.",
      `spark-${chipId}`,
    );
  };

  // ── Offer sheet send ─────────────────────────────────────────────────────

  const handleOfferSend = (amount: number, note: string) => {
    setOfferSheetOpen(false);

    const priceStr =
      searchMode === 'rent'
        ? `£${amount.toLocaleString('en-GB')}/month`
        : `£${amount.toLocaleString('en-GB')}`;
    const offerText = note
      ? `I'd like to propose ${priceStr}.\n\n${note}`
      : `I'd like to propose ${priceStr}.`;

    const userMsg: Message = {
      id: `offer-user-${Date.now()}`,
      from: 'user',
      text: offerText,
      date: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!firstSent) { setFirstSent(true); onFirstMessageSent?.(); }
    agentReply(
      "Thanks for your offer! I'll discuss it with the owner and get back to you shortly.",
      'offer-reply',
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const groups = groupByDate(messages);
  const lastUserMsgId = [...messages].reverse().find((m) => m.from === 'user')?.id ?? null;
  const showSparkChips = isSparkSession && sparkChipsRemaining.length > 0 && !pendingResponse;

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
              <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {group.label}
              </span>
            </div>
            {group.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex mb-2 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="flex flex-col"
                  style={{ maxWidth: msg.from === 'user' ? '80%' : '88%' }}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
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
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Spark action chips */}
        {showSparkChips && (
          <div className="mt-3 mb-2 space-y-2">
            <p className="text-xs text-gray-400 mb-2">What would you like to do next?</p>
            {sparkChipsRemaining.includes('viewing') && (
              <button
                onClick={() => handleSparkChipTap('viewing')}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-full text-sm font-medium text-left transition-opacity"
                style={{ backgroundColor: '#EEEDFE', color: '#3C3489' }}
              >
                <span>Arrange a viewing</span>
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#3C3489' }} />
              </button>
            )}
            {sparkChipsRemaining.includes('offer') && (
              <button
                onClick={() => handleSparkChipTap('offer')}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-full text-sm font-medium text-left transition-opacity"
                style={{ backgroundColor: '#EEEDFE', color: '#3C3489' }}
              >
                <span>
                  {searchMode === 'rent'
                    ? 'Propose a rental price'
                    : 'Make an offer'}
                </span>
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#3C3489' }} />
              </button>
            )}
          </div>
        )}

        {/* Regular suggested chips (non-spark sessions, first visit only) */}
        {showRegularChips && isFirstVisitRef.current && (
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
                    <ChevronRight
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: '#3C3489' }}
                    />
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
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
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

      {/* ── Offer sheet ── */}
      <OfferSheet
        open={offerSheetOpen}
        listedPrice={sparkEntry?.listedPrice ?? 0}
        searchMode={searchMode}
        onSend={handleOfferSend}
        onClose={() => setOfferSheetOpen(false)}
      />
    </div>
  );
}

// Re-export formatPrice in case other modules need it
export { formatPrice };
