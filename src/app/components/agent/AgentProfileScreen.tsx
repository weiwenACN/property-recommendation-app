import { useEffect, useState } from 'react';
import { ArrowLeft, Star, Phone, Mail, MessageCircle } from 'lucide-react';
import type { Agent } from '../../data/agents';
import { agentRatingSummary, fetchAgentReviews, type Review } from '../../data/reviews';

// ── helpers ───────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StarRow({ stars, size = 'sm' }: { stars: number; size?: 'sm' | 'xs' }) {
  const cls = size === 'xs' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${cls} ${i <= stars ? 'text-[#ff6b35] fill-[#ff6b35]' : 'text-gray-300 fill-gray-300'}`}
        />
      ))}
    </div>
  );
}

// ── Review card ───────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 160;
  const long = review.text.length > LIMIT;

  const typeColor =
    review.reviewerType === 'Buyer'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : review.reviewerType === 'Seller'
      ? 'bg-purple-50 text-purple-700 border-purple-200'
      : 'bg-green-50 text-green-700 border-green-200';

  return (
    <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl px-4 py-3.5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-[#1a2332]">
            {review.reviewerFirstName} {review.reviewerLastInitial}.
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <StarRow stars={review.stars} size="xs" />
            <span className="text-[10px] text-gray-400">{formatDate(review.dateSubmitted)}</span>
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeColor}`}>
          {review.reviewerType}
        </span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">
        {expanded || !long ? review.text : `${review.text.slice(0, LIMIT)}…`}
      </p>
      {long && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs font-medium text-[#ff6b35] hover:underline"
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────

function ReviewSkeleton() {
  return (
    <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl px-4 py-3.5 animate-pulse">
      <div className="flex items-start justify-between mb-2">
        <div className="space-y-1.5">
          <div className="h-3.5 w-24 bg-gray-200 rounded-full" />
          <div className="h-3 w-20 bg-gray-200 rounded-full" />
        </div>
        <div className="h-5 w-12 bg-gray-200 rounded-full" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-gray-200 rounded-full" />
        <div className="h-3 w-5/6 bg-gray-200 rounded-full" />
        <div className="h-3 w-4/6 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

// ── Agent avatar ──────────────────────────────────────────────────────────

function AgentAvatar({ photoUrl, initials }: { photoUrl: string | null; initials: string }) {
  const [imgError, setImgError] = useState(false);

  if (photoUrl && !imgError) {
    return (
      <img
        src={photoUrl}
        alt="Agent profile photo"
        width={80}
        height={80}
        onError={() => setImgError(true)}
        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
      />
    );
  }

  return (
    <div className="w-20 h-20 rounded-full bg-[#ff6b35] flex items-center justify-center border-4 border-white shadow-lg">
      <span className="text-white font-bold text-2xl">{initials}</span>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────

interface AgentProfileScreenProps {
  agent: Agent;
  onBack: () => void;
  onChatWithAgent: () => void;
}

export function AgentProfileScreen({
  agent,
  onBack,
  onChatWithAgent,
}: AgentProfileScreenProps) {
  const summary = agentRatingSummary(agent.id);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewList, setReviewList] = useState<Review[]>([]);
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    setReviewsLoading(true);
    setReviewList([]);
    fetchAgentReviews(agent.id).then((data) => {
      setReviewList(data);
      setReviewsLoading(false);
    });
  }, [agent.id]);

  // WhatsApp deep-link
  const whatsappUrl = `https://wa.me/${agent.whatsapp}?text=${encodeURIComponent(`Hi ${agent.fullName.split(' ')[0]}, I found your profile on Star Homes and would like to discuss a property.`)}`;

  const BIO_LIMIT = 180;
  const bioLong = agent.bio.length > BIO_LIMIT;

  // onChatWithAgent is used via the WhatsApp button; keep prop to avoid lint error
  void onChatWithAgent;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Header bar ── */}
      <div className="flex-shrink-0 flex items-center px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3 bg-white border-b border-[#f1f3f5]">
        <button
          onClick={onBack}
          aria-label="Back"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#1a2332] hover:text-[#ff6b35] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold text-[#1a2332]">Agent Profile</h1>
        <div className="min-w-[44px]" /> {/* balance */}
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile hero */}
        <div className="flex flex-col items-center px-6 pt-6 pb-4">
          <AgentAvatar photoUrl={agent.photoUrl} initials={agent.initials} />
          <h2 className="mt-4 text-xl font-bold text-[#1a2332]">{agent.fullName}</h2>
          <p className="mt-0.5 text-sm text-gray-500 text-center">{agent.agencyName}</p>
          {summary.count > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#ff6b35] fill-[#ff6b35]" />
              <span className="text-sm font-semibold text-[#1a2332]">{summary.average}</span>
              <span className="text-sm text-gray-500">· {summary.count} reviews</span>
            </div>
          )}
        </div>

        {/* Contact CTAs */}
        <div className="px-5 mb-5">
          <div className="grid grid-cols-3 gap-2">
            <a
              href={`tel:${agent.phone}`}
              className="flex flex-col items-center gap-1.5 py-3.5 rounded-xl border-2 border-[#1a2332] text-[#1a2332] hover:bg-[#f9fafb] transition-colors min-h-[68px]"
            >
              <Phone className="w-5 h-5" />
              <span className="text-xs font-medium">Call</span>
            </a>
            <a
              href={`mailto:${agent.email}`}
              className="flex flex-col items-center gap-1.5 py-3.5 rounded-xl border-2 border-[#1a2332] text-[#1a2332] hover:bg-[#f9fafb] transition-colors min-h-[68px]"
            >
              <Mail className="w-5 h-5" />
              <span className="text-xs font-medium">Email</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 py-3.5 rounded-xl bg-[#25D366] text-white hover:bg-[#1fb85a] transition-colors min-h-[68px]"
            >
              {/* WhatsApp icon as inline SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-xs font-medium">WhatsApp</span>
            </a>
          </div>
        </div>

        {/* About */}
        <div className="px-5 mb-5">
          <h3 className="text-base font-bold text-[#1a2332] mb-2">About</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {bioExpanded || !bioLong ? agent.bio : `${agent.bio.slice(0, BIO_LIMIT)}…`}
          </p>
          {bioLong && (
            <button
              onClick={() => setBioExpanded((v) => !v)}
              className="mt-1.5 text-xs font-medium text-[#ff6b35] hover:underline"
            >
              {bioExpanded ? 'Read less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Ratings & Reviews */}
        <div className="px-5 pb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#1a2332]">Ratings &amp; Reviews</h3>
            {!reviewsLoading && summary.count > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-[#ff6b35] fill-[#ff6b35]" />
                <span className="text-sm font-semibold text-[#1a2332]">{summary.average}</span>
                <span className="text-xs text-gray-400">/ 5</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {reviewsLoading ? (
              <>
                <ReviewSkeleton />
                <ReviewSkeleton />
              </>
            ) : reviewList.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No reviews yet.</p>
            ) : (
              reviewList.map((r) => <ReviewCard key={r.id} review={r} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
