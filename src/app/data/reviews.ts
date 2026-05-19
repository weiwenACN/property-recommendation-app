export interface Review {
  id: string;
  agentId: string;
  reviewerFirstName: string;
  reviewerLastInitial: string;
  reviewerType: 'Buyer' | 'Seller' | 'Tenant';
  stars: number; // 1–5
  text: string;
  dateSubmitted: string; // YYYY-MM-DD
}

export const reviews: Review[] = [
  {
    id: 'rev-1',
    agentId: 'agent-1',
    reviewerFirstName: 'James',
    reviewerLastInitial: 'T',
    reviewerType: 'Buyer',
    stars: 5,
    text: 'Sarah was absolutely fantastic throughout the whole process. She found us the perfect two-bedroom flat within our budget and was always available to answer questions. The whole transaction felt stress-free thanks to her expertise.',
    dateSubmitted: '2025-04-12',
  },
  {
    id: 'rev-2',
    agentId: 'agent-1',
    reviewerFirstName: 'Priya',
    reviewerLastInitial: 'M',
    reviewerType: 'Tenant',
    stars: 5,
    text: 'Excellent communication throughout. Sarah responded quickly to every message and made sure we understood each step of the letting process. She genuinely cared about finding us somewhere we\'d love.',
    dateSubmitted: '2025-03-28',
  },
  {
    id: 'rev-3',
    agentId: 'agent-1',
    reviewerFirstName: 'Oliver',
    reviewerLastInitial: 'R',
    reviewerType: 'Seller',
    stars: 4,
    text: 'Very knowledgeable about the Canary Wharf area and the current market. Achieved a sale price above our asking. Could have communicated the timeline a little earlier but overall a smooth experience.',
    dateSubmitted: '2025-03-05',
  },
  {
    id: 'rev-4',
    agentId: 'agent-1',
    reviewerFirstName: 'Amelia',
    reviewerLastInitial: 'K',
    reviewerType: 'Buyer',
    stars: 5,
    text: 'Couldn\'t recommend Sarah highly enough. She was patient, professional and incredibly thorough — showed us six properties before we found the one, never once making us feel rushed.',
    dateSubmitted: '2025-02-19',
  },
  {
    id: 'rev-5',
    agentId: 'agent-1',
    reviewerFirstName: 'Ravi',
    reviewerLastInitial: 'S',
    reviewerType: 'Tenant',
    stars: 4,
    text: 'Great experience renting through Sarah. She handled the landlord negotiations on our behalf and got us an extra month rent-free. Would use Star Homes again.',
    dateSubmitted: '2025-01-30',
  },
  {
    id: 'rev-6',
    agentId: 'agent-1',
    reviewerFirstName: 'Charlotte',
    reviewerLastInitial: 'B',
    reviewerType: 'Seller',
    stars: 5,
    text: 'Sarah sold our flat in under two weeks at asking price. Her staging advice and the professional photography she arranged made a real difference. Highly professional throughout.',
    dateSubmitted: '2025-01-10',
  },

  // ── James Okafor (agent-3) ─────────────────────────────────────────────
  {
    id: 'rev-7',
    agentId: 'agent-3',
    reviewerFirstName: 'Tobi',
    reviewerLastInitial: 'A',
    reviewerType: 'Buyer',
    stars: 5,
    text: "James was exceptional — patient, knowledgeable and genuinely invested in finding us the right home. He knew every street in Hackney and saved us from making two mistakes before we found our dream place. Wouldn't use anyone else.",
    dateSubmitted: '2025-04-20',
  },
  {
    id: 'rev-8',
    agentId: 'agent-3',
    reviewerFirstName: 'Fatima',
    reviewerLastInitial: 'O',
    reviewerType: 'Tenant',
    stars: 5,
    text: "The most responsive agent I've ever dealt with. James answered every question within the hour and sorted the paperwork so quickly we moved in a week ahead of schedule. Fantastic service.",
    dateSubmitted: '2025-03-14',
  },
  {
    id: 'rev-9',
    agentId: 'agent-3',
    reviewerFirstName: 'Kieran',
    reviewerLastInitial: 'M',
    reviewerType: 'Buyer',
    stars: 4,
    text: "Solid experience from start to finish. James flagged a survey issue before we committed and renegotiated the price, which saved us thousands. A trustworthy agent who clearly prioritises his clients.",
    dateSubmitted: '2025-02-28',
  },

  // ── Priya Sharma (agent-4) ─────────────────────────────────────────────
  {
    id: 'rev-10',
    agentId: 'agent-4',
    reviewerFirstName: 'Deepa',
    reviewerLastInitial: 'N',
    reviewerType: 'Tenant',
    stars: 5,
    text: "Priya found us the most amazing flat in Clapham in under two weeks. She listened carefully to our wishlist and didn't waste our time on unsuitable viewings. Warm, professional and brilliant at what she does.",
    dateSubmitted: '2025-04-05',
  },
  {
    id: 'rev-11',
    agentId: 'agent-4',
    reviewerFirstName: 'Marcus',
    reviewerLastInitial: 'H',
    reviewerType: 'Buyer',
    stars: 5,
    text: "We had a complicated chain and Priya kept it all together effortlessly. She communicated with every party, chased solicitors when needed and never lost her calm. Our sale completed two weeks early thanks to her.",
    dateSubmitted: '2025-03-22',
  },
  {
    id: 'rev-12',
    agentId: 'agent-4',
    reviewerFirstName: 'Ananya',
    reviewerLastInitial: 'R',
    reviewerType: 'Seller',
    stars: 4,
    text: "Priya achieved a sale price 4% above the guide price, which was beyond what we expected in the current market. A thorough professional who really knows South London values.",
    dateSubmitted: '2025-02-10',
  },

  // ── Tom Whitfield (agent-5) ────────────────────────────────────────────
  {
    id: 'rev-13',
    agentId: 'agent-5',
    reviewerFirstName: 'Harriet',
    reviewerLastInitial: 'J',
    reviewerType: 'Buyer',
    stars: 5,
    text: "Tom gave us access to two off-market mews houses that we'd never have found online. His network in Notting Hill is extraordinary. He was discreet, professional and made the whole process feel effortless.",
    dateSubmitted: '2025-04-18',
  },
  {
    id: 'rev-14',
    agentId: 'agent-5',
    reviewerFirstName: 'Edward',
    reviewerLastInitial: 'C',
    reviewerType: 'Seller',
    stars: 5,
    text: "Brilliant from start to finish. Tom priced our property perfectly, generated competitive interest and closed above asking. His knowledge of the W11 market is second to none.",
    dateSubmitted: '2025-03-08',
  },

  // ── Mei Lin (agent-6) ─────────────────────────────────────────────────
  {
    id: 'rev-15',
    agentId: 'agent-6',
    reviewerFirstName: 'Liang',
    reviewerLastInitial: 'W',
    reviewerType: 'Buyer',
    stars: 5,
    text: "Mei guided us through buying our first UK property entirely remotely. Her communication was impeccable — bilingual, prompt and detailed. When we finally arrived in London, everything was ready. Truly outstanding service.",
    dateSubmitted: '2025-04-30',
  },
  {
    id: 'rev-16',
    agentId: 'agent-6',
    reviewerFirstName: 'Sophie',
    reviewerLastInitial: 'T',
    reviewerType: 'Tenant',
    stars: 5,
    text: "Mei found me a stunning river-view flat in Greenwich within days of my enquiry. She knew every building in the area and matched me perfectly to the right one. Moving to London has never felt so easy.",
    dateSubmitted: '2025-03-17',
  },
];

/** Returns reviews for an agent, newest first. */
export function reviewsByAgent(agentId: string): Review[] {
  return reviews
    .filter((r) => r.agentId === agentId)
    .sort((a, b) => b.dateSubmitted.localeCompare(a.dateSubmitted));
}

/** Computes average rating and count directly from reviews data. */
export function agentRatingSummary(agentId: string): { average: number; count: number } {
  const list = reviewsByAgent(agentId);
  if (list.length === 0) return { average: 0, count: 0 };
  const sum = list.reduce((acc, r) => acc + r.stars, 0);
  return {
    average: Math.round((sum / list.length) * 10) / 10,
    count: list.length,
  };
}

/** Simulates an async fetch (600ms) so the profile header renders first. */
export function fetchAgentReviews(agentId: string): Promise<Review[]> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(reviewsByAgent(agentId)), 600);
  });
}
