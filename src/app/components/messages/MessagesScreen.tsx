import { useState } from 'react';
import { MessageCircle, Flame, ChevronRight } from 'lucide-react';
import { StarHomesLogo } from '../common/StarHomesLogo';
import type { Conversation } from '../../data/messageStore';
import { properties } from '../../data/properties';
import { agents, agentById } from '../../data/agents';

// ── Types ─────────────────────────────────────────────────────────────────

interface MessagesScreenProps {
  conversations: Conversation[];
  onOpenConversation: (conv: Conversation) => void;
  /** Navigate to Spark tab when the empty-state CTA is tapped. */
  onStartConversation?: () => void;
}

type ViewMode = 'property' | 'agent';

// ── Helpers ───────────────────────────────────────────────────────────────

function fmtTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return 'Yesterday';
  if (days < 7) {
    return new Date(timestamp).toLocaleDateString('en-GB', { weekday: 'short' }); // Mon
  }
  return new Date(timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); // 12 May
}

// ── ConvRow ───────────────────────────────────────────────────────────────

interface ConvRowProps {
  conv: Conversation;
  onOpen: () => void;
  isLast: boolean;
}

function ConvRow({ conv, onOpen, isLast }: ConvRowProps) {
  const property = properties.find((p) => p.id === conv.propertyId);
  const agent = agentById(conv.agentId);
  const lastMsg = conv.messages[conv.messages.length - 1];

  const agencyShort = agent?.agencyName.includes(' · ')
    ? agent.agencyName.split(' · ')[1]
    : agent?.agencyName ?? '';

  return (
    <button
      onClick={onOpen}
      className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-[#F7F6FB] active:bg-[#EEEDFE] transition-colors text-left${
        isLast ? '' : ' border-b border-[#f1f3f5]'
      }`}
    >
      {/* Property thumbnail */}
      <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden bg-[#EEEDFE]">
        {property ? (
          <img
            src={`${property.imageUrl.split('?')[0]}?w=120&h=120&fit=crop&q=70`}
            alt={property.address}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-[#B4B2A9]" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Row 1: address + timestamp */}
        <div className="flex items-baseline justify-between gap-2">
          <p
            className="text-sm font-semibold text-[#0F0C2E] truncate"
            style={{ fontWeight: conv.unreadCount > 0 ? 700 : 600 }}
          >
            {property?.address ?? 'Unknown property'}
          </p>
          {lastMsg && (
            <span className="text-[11px] text-[#B4B2A9] flex-shrink-0">
              {fmtTime(lastMsg.timestamp)}
            </span>
          )}
        </div>

        {/* Row 2: agent name */}
        <p className="text-xs text-[#7F77DD] mt-0.5 truncate">
          {agent?.fullName ?? 'Agent'}
          {agencyShort ? (
            <span className="text-[#B4B2A9]"> · {agencyShort}</span>
          ) : null}
        </p>

        {/* Row 3: last message preview */}
        {lastMsg && (
          <p
            className="text-xs truncate mt-0.5"
            style={{
              color: conv.unreadCount > 0 ? '#0F0C2E' : '#9CA3AF',
              fontWeight: conv.unreadCount > 0 ? 500 : 400,
            }}
          >
            {lastMsg.sender === 'user' ? 'You: ' : ''}
            {lastMsg.text}
          </p>
        )}
      </div>

      {/* Unread badge */}
      {conv.unreadCount > 0 ? (
        <div className="w-5 h-5 rounded-full bg-[#E5917A] flex items-center justify-center flex-shrink-0 ml-1">
          <span className="text-[10px] font-bold text-white leading-none">
            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
          </span>
        </div>
      ) : (
        <ChevronRight className="w-4 h-4 text-[#D1D5DB] flex-shrink-0 ml-1" />
      )}
    </button>
  );
}

// ── AgentGroupHeader ──────────────────────────────────────────────────────

function AgentGroupHeader({
  agentId,
  count,
}: {
  agentId: string;
  count: number;
}) {
  const agent = agentById(agentId);
  if (!agent) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#F7F6FB] border-b border-[#EEEDFE]">
      {/* Agent avatar */}
      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-[#EEEDFE]">
        {agent.photoUrl ? (
          <img
            src={agent.photoUrl}
            alt={agent.fullName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#3C3489]/15">
            <span className="text-[#3C3489] font-semibold text-xs">{agent.initials}</span>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#0F0C2E] truncate">{agent.fullName}</p>
        <p className="text-xs text-[#B4B2A9] truncate">{agent.agencyName}</p>
      </div>
      <span className="ml-auto text-xs text-[#B4B2A9] flex-shrink-0">
        {count} {count === 1 ? 'property' : 'properties'}
      </span>
    </div>
  );
}

// ── SegmentedToggle ───────────────────────────────────────────────────────

function SegmentedToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div
      className="flex gap-0.5 p-1 rounded-full mx-5 my-4"
      style={{ background: '#EEEDFE' }}
    >
      {(['property', 'agent'] as ViewMode[]).map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className="flex-1 text-sm font-semibold py-1.5 rounded-full transition-all"
          style={{
            background: value === mode ? '#FFFFFF' : 'transparent',
            color: value === mode ? '#3C3489' : 'rgba(60,52,137,0.5)',
            boxShadow: value === mode ? '0 1px 4px rgba(15,12,46,0.08)' : 'none',
          }}
        >
          By {mode === 'property' ? 'Property' : 'Agent'}
        </button>
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────

function EmptyState({ onStartConversation }: { onStartConversation?: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
      <div className="w-full max-w-xs bg-white rounded-3xl p-8 shadow-sm border border-[#f1f3f5] text-center mb-6">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'linear-gradient(135deg, #EEEDFE 0%, #dbd8fc 100%)' }}
        >
          <MessageCircle className="w-10 h-10 text-[#3C3489]" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-bold text-[#0F0C2E] mb-2">No messages yet</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          When you contact an agent about a property, your conversation will appear here.
        </p>
      </div>

      {onStartConversation && (
        <button
          onClick={onStartConversation}
          className="flex items-center gap-3 bg-[#0F0C2E] text-white px-6 py-4 rounded-2xl hover:bg-[#1a1650] transition-colors shadow-lg shadow-[#0F0C2E]/20 w-full max-w-xs"
        >
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Flame className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <div className="text-left flex-1">
            <p className="font-semibold text-sm">Browse with Spark</p>
            <p className="text-white/60 text-xs">Swipe to find &amp; contact agents</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/50 flex-shrink-0" />
        </button>
      )}
    </div>
  );
}

// ── MessagesScreen ────────────────────────────────────────────────────────

export function MessagesScreen({
  conversations,
  onOpenConversation,
  onStartConversation,
}: MessagesScreenProps) {
  const [view, setView] = useState<ViewMode>('property');

  // Sort by most recent message, descending
  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  // Group by agentId for the "By Agent" view
  const byAgent = agents
    .map((agent) => ({
      agent,
      convs: sorted.filter((c) => c.agentId === agent.id),
    }))
    .filter(({ convs }) => convs.length > 0);

  return (
    <div className="flex flex-col h-full bg-[#F7F6FB]">
      {/* ── Dark hero header — kept exactly as original ── */}
      <div className="bg-[#0F0C2E] px-6 pb-8 header-pt-lg rounded-b-[32px] shadow-lg shadow-[#0F0C2E]/20 relative overflow-hidden flex-shrink-0">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#3C3489]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <StarHomesLogo variant="light" size="sm" className="mb-4" />
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="text-gray-300 mt-1 text-sm">Your agent conversations</p>
        </div>
      </div>

      {/* ── Content ── */}
      {sorted.length === 0 ? (
        <EmptyState onStartConversation={onStartConversation} />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Group toggle */}
          <SegmentedToggle value={view} onChange={setView} />

          {view === 'property' ? (
            /* ── By Property: flat list ── */
            <div className="mx-4 bg-white rounded-2xl overflow-hidden shadow-sm border border-[#f1f3f5] mb-6">
              {sorted.map((conv, i) => (
                <ConvRow
                  key={conv.id}
                  conv={conv}
                  onOpen={() => onOpenConversation(conv)}
                  isLast={i === sorted.length - 1}
                />
              ))}
            </div>
          ) : (
            /* ── By Agent: grouped ── */
            <div className="space-y-3 px-4 pb-6">
              {byAgent.map(({ agent, convs }) => (
                <div
                  key={agent.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#f1f3f5]"
                >
                  <AgentGroupHeader agentId={agent.id} count={convs.length} />
                  {convs.map((conv, i) => (
                    <ConvRow
                      key={conv.id}
                      conv={conv}
                      onOpen={() => onOpenConversation(conv)}
                      isLast={i === convs.length - 1}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
