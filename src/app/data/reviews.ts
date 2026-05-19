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
