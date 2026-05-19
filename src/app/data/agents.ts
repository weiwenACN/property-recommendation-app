/**
 * agents.ts — agent records for the Star Homes prototype.
 *
 * Phone numbers MUST be stored in E.164 format (e.g. "+447700900123").
 * Use the helpers in src/app/utils/phone.ts to format them for display and
 * to build tel:, wa.me/, and sms: deep links.  Never hardcode a country code
 * anywhere else in the codebase — derive it from the number itself.
 */

export interface Agent {
  id: string;
  fullName: string;
  agencyName: string;
  photoUrl: string | null; // CDN URL (WebP, 160px for 2x retina)
  /** E.164 format — e.g. "+447700900123" or "+6591234567". */
  phone: string;
  email: string;
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
    phone: '+447700900123', // E.164 — United Kingdom
    email: 'sarah@starhomes.co.uk',
    bio: "I'm Sarah, a property specialist with 8 years of experience helping buyers, sellers and renters find their perfect home across East London. I specialise in residential lettings, new builds and luxury apartments, always taking time to understand exactly what matters to you before making any recommendation. Outside work you'll find me exploring local markets and independent coffee shops in Hackney.",
    initials: 'SC',
  },
  {
    id: 'agent-2',
    fullName: 'Wei Lin',
    agencyName: 'Star Homes · Singapore Office',
    photoUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&q=80&fm=webp',
    phone: '+6591234567', // E.164 — Singapore
    email: 'wei.lin@starhomes.sg',
    bio: "Hi, I'm Wei Lin, based in our Singapore office and specialising in cross-border relocations for professionals moving to London. With a background in international finance I understand exactly what overseas buyers and renters need — from school catchments to commute times. I'll guide you through every step, from virtual viewings to offer submission.",
    initials: 'WL',
  },
];

export function agentById(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}

export const DEFAULT_AGENT_ID = 'agent-1';
