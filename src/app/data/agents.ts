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
  {
    id: 'agent-3',
    fullName: 'James Okafor',
    agencyName: 'Star Homes · Hackney Branch',
    photoUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&h=160&fit=crop&q=80&fm=webp',
    phone: '+447700900456', // E.164 — United Kingdom
    email: 'james@starhomes.co.uk',
    bio: "Hello, I'm James — a passionate property consultant specialising in Hackney, Brixton and East London. With over a decade in the market I know these neighbourhoods inside out, from the best coffee spots to the quietest streets. I pride myself on honest advice, swift responses and making every client feel like my only client.",
    initials: 'JO',
  },
  {
    id: 'agent-4',
    fullName: 'Priya Sharma',
    agencyName: 'Star Homes · Clapham Branch',
    photoUrl:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=160&h=160&fit=crop&q=80&fm=webp',
    phone: '+447700900789', // E.164 — United Kingdom
    email: 'priya@starhomes.co.uk',
    bio: "Hi! I'm Priya, and I've spent seven years helping families and professionals settle into South London. Clapham, Brixton and the surrounding areas are my specialist patch — I love matching people with homes that truly fit their lives. Whether you're upsizing for a growing family or looking for your first rental, I'll make the process as smooth as possible.",
    initials: 'PS',
  },
  {
    id: 'agent-5',
    fullName: 'Tom Whitfield',
    agencyName: 'Star Homes · Notting Hill Branch',
    photoUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&q=80&fm=webp',
    phone: '+447700901012', // E.164 — United Kingdom
    email: 'tom@starhomes.co.uk',
    bio: "I'm Tom, and I've been selling and letting properties in Notting Hill and Kensington for over twelve years. From period townhouses to contemporary mews, I know every corner of this iconic neighbourhood. My clients value my calm, straightforward approach and my deep network of off-market opportunities.",
    initials: 'TW',
  },
  {
    id: 'agent-6',
    fullName: 'Mei Lin',
    agencyName: 'Star Homes · Greenwich Branch',
    photoUrl:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=160&h=160&fit=crop&q=80&fm=webp',
    phone: '+447700901345', // E.164 — United Kingdom
    email: 'mei@starhomes.co.uk',
    bio: "Hello, I'm Mei — specialising in Greenwich, Deptford and the riverside corridor since 2017. I help buyers and renters navigate one of London's most exciting up-and-coming areas: great transport links, outstanding architecture and a genuine community feel. I'm fluent in Mandarin and English, so I can assist international clients as easily as local ones.",
    initials: 'ML',
  },
];

export function agentById(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}

export const DEFAULT_AGENT_ID = 'agent-1';
