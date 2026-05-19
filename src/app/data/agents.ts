export interface Agent {
  id: string;
  fullName: string;
  agencyName: string;
  photoUrl: string | null; // CDN URL (WebP, 160px for 2x retina)
  phone: string;
  email: string;
  whatsapp: string; // international format digits only
  bio: string;
  initials: string;
}

export const agents: Agent[] = [
  {
    id: 'agent-1',
    fullName: 'Sarah Chen',
    agencyName: 'Star Homes · Canary Wharf Branch',
    photoUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&q=80&fm=webp',
    phone: '07700 900123',
    email: 'sarah@starhomes.co.uk',
    whatsapp: '447700900123',
    bio: "I'm Sarah, a property specialist with 8 years of experience helping buyers, sellers and renters find their perfect home across East London. I specialise in residential lettings, new builds and luxury apartments, always taking time to understand exactly what matters to you before making any recommendation. Outside work you'll find me exploring local markets and independent coffee shops in Hackney.",
    initials: 'SC',
  },
];

export function agentById(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}

export const DEFAULT_AGENT_ID = 'agent-1';
