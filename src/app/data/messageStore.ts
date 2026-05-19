/**
 * messageStore.ts — unified conversation store.
 *
 * All three chat entry points (property detail, agent profile, Spark swipe-right)
 * write to this store so the Messages tab can display a consolidated list.
 *
 * conversationId format: `${propertyId}_${agentId}`
 * This matches the sessionKey used by ChatScreen so in-memory sessions are
 * consistently keyed when navigating from the Messages tab.
 *
 * Stored under 'star-homes:conversations' in localStorage.
 */

import { read, write } from './stores';

// ── Types ─────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: number;
}

export interface Conversation {
  /** `${propertyId}_${agentId}` */
  id: string;
  propertyId: string;
  agentId: string;
  messages: ChatMessage[];
  /** Number of unread agent messages. */
  unreadCount: number;
  createdAt: number;
  updatedAt: number;
}

// ── Storage helpers ───────────────────────────────────────────────────────

const SLOT = 'star-homes:conversations';
const SEED_SLOT = 'star-homes:conv-seeded';

export function loadConversations(): Conversation[] {
  return read<Conversation[]>(SLOT) ?? [];
}

function persist(list: Conversation[]): void {
  write(SLOT, list);
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Returns the existing conversation or creates a new one.
 * Idempotent — safe to call on every chat entry.
 */
export function getOrCreateConversation(
  propertyId: string,
  agentId: string,
): Conversation {
  const list = loadConversations();
  const id = `${propertyId}_${agentId}`;
  const existing = list.find((c) => c.id === id);
  if (existing) return existing;

  const conv: Conversation = {
    id,
    propertyId,
    agentId,
    messages: [],
    unreadCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  persist([conv, ...list]);
  return conv;
}

/**
 * Appends a message to an existing conversation and persists.
 * Increments unreadCount when sender is 'agent'.
 * No-op if the conversation does not exist.
 */
export function addMessageToConversation(
  conversationId: string,
  text: string,
  sender: 'user' | 'agent',
): void {
  const list = loadConversations();
  const idx = list.findIndex((c) => c.id === conversationId);
  if (idx === -1) return;

  const now = Date.now();
  const msg: ChatMessage = {
    id: `msg-${now}-${Math.random().toString(36).slice(2, 7)}`,
    text,
    sender,
    timestamp: now,
  };
  const conv = list[idx];
  const updated: Conversation = {
    ...conv,
    messages: [...conv.messages, msg],
    unreadCount: sender === 'agent' ? conv.unreadCount + 1 : conv.unreadCount,
    updatedAt: now,
  };
  const next = [...list];
  next[idx] = updated;
  persist(next);
}

/** Zeroes the unread count for a conversation (call when the user opens the chat). */
export function markConversationRead(conversationId: string): void {
  const list = loadConversations();
  const idx = list.findIndex((c) => c.id === conversationId);
  if (idx === -1 || list[idx].unreadCount === 0) return;
  const next = [...list];
  next[idx] = { ...next[idx], unreadCount: 0 };
  persist(next);
}

/** Sum of all unread counts across every conversation. */
export function totalUnreadCount(): number {
  return loadConversations().reduce((s, c) => s + c.unreadCount, 0);
}

/** Wipes all conversations (e.g. on sign-out). */
export function clearConversations(): void {
  write(SLOT, []);
  write(SEED_SLOT, false);
}

// ── Demo seed ─────────────────────────────────────────────────────────────

function mkMsg(
  text: string,
  sender: 'user' | 'agent',
  timestamp: number,
): ChatMessage {
  return { id: `seed-${sender}-${timestamp}`, text, sender, timestamp };
}

/**
 * Seeds 4 demo conversations the first time the app runs on this device.
 * Subsequent calls are no-ops (guarded by SEED_SLOT flag).
 *
 * Call this once before rendering (e.g. inside a useState lazy initializer).
 */
export function ensureDemoConversations(): void {
  if (read<boolean>(SEED_SLOT)) return;
  write(SEED_SLOT, true);

  const now = Date.now();
  const h2ago = now - 2 * 60 * 60 * 1000;

  const yesterday6pm = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(18, 0, 0, 0);
    return d.getTime();
  })();

  // Most-recent Monday at 10am (if today is Monday, use last Monday)
  const monday10am = (() => {
    const d = new Date();
    const day = d.getDay(); // 0=Sun, 1=Mon ... 6=Sat
    const daysBack = day === 0 ? 6 : day === 1 ? 7 : day - 1;
    d.setDate(d.getDate() - daysBack);
    d.setHours(10, 0, 0, 0);
    return d.getTime();
  })();

  const lastWeek = now - 8 * 24 * 60 * 60 * 1000;

  const demo: Conversation[] = [
    // ── Conv 1: Sarah Chen / Westferry Circus (property 7) — 2h ago (1 unread) ──
    {
      id: '7_agent-1',
      propertyId: '7',
      agentId: 'agent-1',
      messages: [
        mkMsg(
          "Hi Sarah, I'm interested in the river-view apartment at 24 Westferry Circus.",
          'user',
          h2ago - 30 * 60_000,
        ),
        mkMsg(
          "Hi there! Great choice — this is one of our most popular listings. Would you like to arrange a viewing? I have slots available this week.",
          'agent',
          h2ago - 20 * 60_000,
        ),
        mkMsg("Yes please, I'm free Thursday afternoon.", 'user', h2ago - 10 * 60_000),
        mkMsg(
          "Perfect! I'll book you in for Thursday at 3 pm. See you then 😊",
          'agent',
          h2ago,
        ),
      ],
      unreadCount: 1,
      createdAt: h2ago - 30 * 60_000,
      updatedAt: h2ago,
    },

    // ── Conv 2: James Okafor / 14 Columbia Road (property 16) — yesterday ──
    {
      id: '16_agent-3',
      propertyId: '16',
      agentId: 'agent-3',
      messages: [
        mkMsg(
          "Hi James, I'd like to find out more about 14 Columbia Road.",
          'user',
          yesterday6pm - 20 * 60_000,
        ),
        mkMsg(
          "Hi! Lovely property on a great street — it has a beautiful courtyard garden. Any specific questions?",
          'agent',
          yesterday6pm - 15 * 60_000,
        ),
        mkMsg('Is it available for a June move-in?', 'user', yesterday6pm - 5 * 60_000),
        mkMsg(
          "Yes, it's available from 1st June. Would you like to arrange a viewing?",
          'agent',
          yesterday6pm,
        ),
      ],
      unreadCount: 0,
      createdAt: yesterday6pm - 20 * 60_000,
      updatedAt: yesterday6pm,
    },

    // ── Conv 3: Tom Whitfield / Portobello Mews (property 18) — Monday ──
    {
      id: '18_agent-5',
      propertyId: '18',
      agentId: 'agent-5',
      messages: [
        mkMsg(
          "Hi Tom, I'm very interested in the mews house on Portobello.",
          'user',
          monday10am,
        ),
        mkMsg(
          "Hi! It's a stunning property — the private courtyard is perfect for entertaining in summer. I can show you around any day this week.",
          'agent',
          monday10am + 5 * 60_000,
        ),
      ],
      unreadCount: 0,
      createdAt: monday10am,
      updatedAt: monday10am + 5 * 60_000,
    },

    // ── Conv 4: Mei Lin / Riverside Walk (property 19) — last week (1 unread) ──
    {
      id: '19_agent-6',
      propertyId: '19',
      agentId: 'agent-6',
      messages: [
        mkMsg(
          "Hello Mei, I'd love to view the river-view flat in Greenwich.",
          'user',
          lastWeek - 10 * 60_000,
        ),
        mkMsg(
          "Hi! It's a beautiful apartment with incredible Thames views. I have viewings available this week — does Wednesday morning work for you?",
          'agent',
          lastWeek,
        ),
      ],
      unreadCount: 1,
      createdAt: lastWeek - 10 * 60_000,
      updatedAt: lastWeek,
    },
  ];

  // Merge with any existing conversations (don't overwrite user-created ones)
  const existing = loadConversations();
  const merged = [
    ...demo.filter((d) => !existing.some((e) => e.id === d.id)),
    ...existing,
  ].sort((a, b) => b.updatedAt - a.updatedAt);

  persist(merged);
}
