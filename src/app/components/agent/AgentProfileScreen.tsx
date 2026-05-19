import { useState } from 'react';
import { ArrowLeft, Star, Phone, Mail, MessageCircle, Award, Briefcase, Home } from 'lucide-react';
import type { AgentInfo } from '../chat/ChatScreen';
import type { Property } from '../../data/properties';
import { properties as allProperties } from '../../data/properties';
import { priceFor, type SearchMode } from '../../data/pricing';

// ── Static agent profile data (prototype) ────────────────────────────────

const AGENT_PROFILE = {
  yearsExperience: 8,
  specialisations: ['Residential Lettings', 'New Builds', 'Luxury Apartments'],
  certifications: ['ARLA Propertymark', 'RICS Member'],
  rating: 4.8,
  reviewCount: 127,
  reviews: [
    {
      id: 'r1',
      reviewer: 'James T.',
      stars: 5,
      comment: 'Sarah was incredibly professional and found us the perfect flat within our budget. Highly recommend!',
    },
    {
      id: 'r2',
      reviewer: 'Priya M.',
      stars: 5,
      comment: 'Excellent communication throughout. Made the whole process stress-free.',
    },
    {
      id: 'r3',
      reviewer: 'Oliver R.',
      stars: 4,
      comment: 'Very knowledgeable about the Canary Wharf area. Would use again.',
    },
  ],
  managedPropertyIds: ['1', '3', '5', '7', '9'],
};

type ContactDialog = 'none' | 'call' | 'email';

interface AgentProfileScreenProps {
  agent: AgentInfo;
  searchMode: SearchMode;
  bookmarkIds: string[];
  onBack: () => void;
  onGoHome: () => void;
  onChatWithAgent: () => void;
  onPropertySelect: (property: Property) => void;
}

export function AgentProfileScreen({
  agent,
  searchMode,
  onBack,
  onGoHome,
  onChatWithAgent,
  onPropertySelect,
}: AgentProfileScreenProps) {
  const [dialog, setDialog] = useState<ContactDialog>('none');
  const managedProperties = AGENT_PROFILE.managedPropertyIds
    .map((id) => allProperties.find((p) => p.id === id))
    .filter((p): p is Property => Boolean(p));

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Header ── */}
      <div className="bg-[#1a2332] px-4 pb-5 header-pt flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            aria-label="Back"
            className="text-white hover:text-[#ff6b35] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onGoHome}
            aria-label="Go to home"
            className="text-white hover:text-[#ff6b35] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#ff6b35] flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-white font-bold text-xl">{agent.initials}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{agent.name}</h1>
            <p className="text-gray-300 text-sm">{agent.branch}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="w-3.5 h-3.5 text-[#ff6b35] fill-[#ff6b35]" />
              <span className="text-white text-sm font-semibold">{AGENT_PROFILE.rating}</span>
              <span className="text-gray-400 text-xs">({AGENT_PROFILE.reviewCount} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5 space-y-6">

          {/* Credentials */}
          <section>
            <h2 className="text-base font-bold text-[#1a2332] mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#ff6b35]" />
              Credentials
            </h2>
            <div className="rounded-2xl border border-[#e5e7eb] divide-y divide-[#e5e7eb] overflow-hidden">
              <div className="px-4 py-3 flex items-start justify-between gap-3">
                <span className="text-sm text-gray-500">Experience</span>
                <span className="text-sm font-medium text-[#1a2332]">{AGENT_PROFILE.yearsExperience} years</span>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-gray-500 mb-2">Specialisations</p>
                <div className="flex flex-wrap gap-1.5">
                  {AGENT_PROFILE.specialisations.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-full bg-[#f1f3f5] text-xs font-medium text-[#1a2332]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-gray-500 mb-2">Certifications</p>
                <div className="flex flex-wrap gap-1.5">
                  {AGENT_PROFILE.certifications.map((c) => (
                    <span key={c} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fff5f2] border border-[#ff6b35]/30 text-xs font-medium text-[#ff6b35]">
                      <Award className="w-3 h-3" />
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Ratings & reviews */}
          <section>
            <h2 className="text-base font-bold text-[#1a2332] mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-[#ff6b35]" />
              Ratings &amp; reviews
            </h2>

            {/* Overall rating banner */}
            <div className="rounded-2xl bg-[#1a2332] px-4 py-3 flex items-center gap-4 mb-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{AGENT_PROFILE.rating}</p>
                <p className="text-gray-400 text-xs">out of 5</p>
              </div>
              <div className="flex-1">
                <div className="flex gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i <= Math.round(AGENT_PROFILE.rating) ? 'text-[#ff6b35] fill-[#ff6b35]' : 'text-gray-600'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-400 text-xs">{AGENT_PROFILE.reviewCount} verified reviews</p>
              </div>
            </div>

            {/* Review list */}
            <div className="space-y-3">
              {AGENT_PROFILE.reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-[#e5e7eb] px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold text-[#1a2332]">{review.reviewer}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i <= review.stars ? 'text-[#ff6b35] fill-[#ff6b35]' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Properties managed */}
          {managedProperties.length > 0 && (
            <section>
              <h2 className="text-base font-bold text-[#1a2332] mb-3">Properties managed</h2>
              <div className="flex gap-3 overflow-x-auto pb-3 -mx-5 px-5 scrollbar-hide">
                {managedProperties.map((property) => (
                  <button
                    key={property.id}
                    onClick={() => onPropertySelect(property)}
                    className="flex-shrink-0 w-44 rounded-2xl border border-[#e5e7eb] overflow-hidden bg-white hover:shadow-md transition-shadow text-left"
                  >
                    <div className="h-28 bg-[#f1f3f5] relative overflow-hidden">
                      <img
                        src={`https://images.unsplash.com/photo-${property.id === '1' ? '1560448204' : property.id === '3' ? '1600596542815' : property.id === '5' ? '1512917774080' : property.id === '7' ? '1568605114967' : '1600607687920'}-3b7d3e5f?w=400&q=80`}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-[#1a2332] truncate">{property.title}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{property.address}</p>
                      <p className="text-xs font-semibold text-[#ff6b35] mt-1">
                        {priceFor(searchMode, property)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="pb-4" />
        </div>
      </div>

      {/* ── Bottom contact actions ── */}
      <div className="flex-shrink-0 bg-white border-t border-[#e5e7eb] px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setDialog('call')}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 border-[#1a2332] text-[#1a2332] hover:bg-[#f9fafb] transition-colors min-h-[64px]"
          >
            <Phone className="w-5 h-5" />
            <span className="text-xs font-medium">Call</span>
          </button>
          <button
            onClick={() => setDialog('email')}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 border-[#1a2332] text-[#1a2332] hover:bg-[#f9fafb] transition-colors min-h-[64px]"
          >
            <Mail className="w-5 h-5" />
            <span className="text-xs font-medium">Email</span>
          </button>
          <button
            onClick={onChatWithAgent}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#1a2332] text-white hover:bg-[#0f1620] transition-colors min-h-[64px]"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-medium">Message</span>
          </button>
        </div>
      </div>

      {/* ── Call dialog ── */}
      {dialog === 'call' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold text-[#1a2332] mb-1">Call {agent.name}?</h2>
            <p className="text-sm text-gray-600 mb-6">{agent.phone}</p>
            <div className="flex gap-3">
              <button onClick={() => setDialog('none')}
                className="flex-1 min-h-[44px] border-2 border-[#e5e7eb] rounded-xl text-sm font-medium text-[#1a2332] hover:bg-[#f9fafb] transition-colors">
                Cancel
              </button>
              <a href={`tel:${agent.phone}`} onClick={() => setDialog('none')}
                className="flex-1 min-h-[44px] bg-[#1a2332] rounded-xl text-sm font-medium text-white flex items-center justify-center hover:bg-[#0f1620] transition-colors">
                Call
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Email dialog ── */}
      {dialog === 'email' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold text-[#1a2332] mb-1">Email {agent.name}?</h2>
            <p className="text-sm text-gray-600 mb-6">{agent.email}</p>
            <div className="flex gap-3">
              <button onClick={() => setDialog('none')}
                className="flex-1 min-h-[44px] border-2 border-[#e5e7eb] rounded-xl text-sm font-medium text-[#1a2332] hover:bg-[#f9fafb] transition-colors">
                Cancel
              </button>
              <a href={`mailto:${agent.email}`} onClick={() => setDialog('none')}
                className="flex-1 min-h-[44px] bg-[#1a2332] rounded-xl text-sm font-medium text-white flex items-center justify-center hover:bg-[#0f1620] transition-colors">
                Open Mail
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
