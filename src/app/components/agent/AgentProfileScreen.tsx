import { useEffect, useState } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import type { Agent } from '../../data/agents';
import { agentRatingSummary, fetchAgentReviews, type Review } from '../../data/reviews';
import { AgentContactButtons } from './AgentContactButtons';
import { PhoneOverlay, EmailOverlay, WhatsAppOverlay, WhatsAppFallbackSheet } from './ContactOverlays';

// ── helpers ───────────────────────────────────────────────────────────────────

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
          className={`${cls} ${i <= stars ? 'text-[#E5917A] fill-[#E5917A]' : 'text-gray-300 fill-gray-300'}`}
        />
      ))}
    </div>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────

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
    <div className="bg-[#F7F6FB] border border-[#e5e7eb] rounded-2xl px-4 py-3.5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-[#0F0C2E]">
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
          className="mt-1 text-xs font-medium text-[#3C3489] hover:underline"
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ReviewSkeleton() {
  return (
    <div className="bg-[#F7F6FB] border border-[#e5e7eb] rounded-2xl px-4 py-3.5 animate-pulse">
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

// ── Agent avatar ──────────────────────────────────────────────────────────────

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
    <div className="w-20 h-20 rounded-full bg-[#3C3489] flex items-center justify-center border-4 border-white shadow-lg">
      <span className="text-white font-semibold text-2xl">{initials}</span>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

interface AgentProfileScreenProps {
  agent: Agent;
  onBack: () => void;
  onChatWithAgent: () => void;
  /** Whether the current user is browsing as a guest. */
  isGuest?: boolean;
  /** Called when a guest taps any restricted action — opens sign-up prompt. */
  onGuestAction?: () => void;
}

export function AgentProfileScreen({
  agent,
  onBack,
  onChatWithAgent,
  isGuest = false,
  onGuestAction,
}: AgentProfileScreenProps) {
  const summary = agentRatingSummary(agent.id);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewList, setReviewList] = useState<Review[]>([]);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [overlay, setOverlay] = useState<'none' | 'call' | 'email' | 'whatsapp'>('none');
  const [whatsappFallbackOpen, setWhatsappFallbackOpen] = useState(false);

  useEffect(() => {
    setReviewsLoading(true);
    setReviewList([]);
    fetchAgentReviews(agent.id).then((data) => {
      setReviewList(data);
      setReviewsLoading(false);
    });
  }, [agent.id]);

  const BIO_LIMIT = 180;
  const bioLong = agent.bio.length > BIO_LIMIT;

  /** Open an overlay if logged in, otherwise surface the sign-up prompt. */
  const guardedOverlay = (type: 'call' | 'email' | 'whatsapp') => {
    if (isGuest) { onGuestAction?.(); return; }
    setOverlay(type);
  };

  const guardedChat = () => {
    if (isGuest) { onGuestAction?.(); return; }
    onChatWithAgent();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Header bar ── */}
      <div className="flex-shrink-0 flex items-center px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3 bg-white border-b border-[#f1f3f5]">
        <button
          onClick={onBack}
          aria-label="Back"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#0F0C2E] hover:text-[#3C3489] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center text-base font-semibold text-[#0F0C2E]">Agent Profile</h1>
        <div className="min-w-[44px]" />
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile hero */}
        <div className="flex flex-col items-center px-6 pt-6 pb-4">
          <AgentAvatar photoUrl={agent.photoUrl} initials={agent.initials} />
          <h2 className="mt-4 text-xl font-semibold text-[#0F0C2E]">{agent.fullName}</h2>
          <p className="mt-0.5 text-sm text-gray-500 text-center">{agent.agencyName}</p>
          {summary.count > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#E5917A] fill-[#E5917A]" />
              <span className="text-sm font-semibold text-[#0F0C2E]">{summary.average}</span>
              <span className="text-sm text-gray-500">· {summary.count} reviews</span>
            </div>
          )}
        </div>

        {/* Contact CTAs — all gated for guests */}
        <div className="px-5 mb-5">
          <AgentContactButtons
            onCall={() => guardedOverlay('call')}
            onEmail={() => guardedOverlay('email')}
            onWhatsApp={() => guardedOverlay('whatsapp')}
            onMessage={guardedChat}
          />
        </div>

        {/* About */}
        <div className="px-5 mb-5">
          <h3 className="text-base font-semibold text-[#0F0C2E] mb-2">About</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {bioExpanded || !bioLong ? agent.bio : `${agent.bio.slice(0, BIO_LIMIT)}…`}
          </p>
          {bioLong && (
            <button
              onClick={() => setBioExpanded((v) => !v)}
              className="mt-1.5 text-xs font-medium text-[#3C3489] hover:underline"
            >
              {bioExpanded ? 'Read less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Ratings & Reviews */}
        <div className="px-5 pb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-[#0F0C2E]">Ratings &amp; Reviews</h3>
            {!reviewsLoading && summary.count > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-[#E5917A] fill-[#E5917A]" />
                <span className="text-sm font-semibold text-[#0F0C2E]">{summary.average}</span>
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

      {/* ── Overlays (only reachable for logged-in users) ── */}
      {overlay === 'call' && (
        <PhoneOverlay
          phone={agent.phone}
          agentName={agent.fullName}
          onClose={() => setOverlay('none')}
        />
      )}
      {overlay === 'email' && (
        <EmailOverlay
          email={agent.email}
          agentName={agent.fullName}
          onClose={() => setOverlay('none')}
        />
      )}
      {overlay === 'whatsapp' && (
        <WhatsAppOverlay
          phone={agent.phone}
          agentName={agent.fullName}
          agentInitials={agent.initials}
          onClose={() => setOverlay('none')}
        />
      )}
      <WhatsAppFallbackSheet
        open={whatsappFallbackOpen}
        phone={agent.phone}
        smsBody="Hi, I found your profile on Star Homes and would like to find out more."
        onDismiss={() => setWhatsappFallbackOpen(false)}
      />
    </div>
  );
}
