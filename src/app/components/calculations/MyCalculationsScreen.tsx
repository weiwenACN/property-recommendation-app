/**
 * MyCalculationsScreen — displays all saved home loan calculations for the
 * logged-in user, sorted newest first.
 *
 * Features:
 *  • Property-linked cards (thumbnail + address) vs. standalone ("Custom calculation")
 *  • Swipe-left to reveal delete zone; tap Delete → confirmation modal
 *  • Tap card → reopens calculator pre-filled with saved values
 *  • Empty state with CTA to open the calculator
 */

import { useRef, useState } from 'react';
import {
  ArrowLeft,
  Calculator,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import type { SavedCalculation } from '../../data/calculatorStore';
import { properties } from '../../data/properties';
import { relativeTime } from '../../data/relativeTime';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtGbp(amount: number): string {
  return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtLoanShort(amount: number): string {
  if (amount >= 1_000_000) return `£${(amount / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (amount >= 1_000) return `£${Math.round(amount / 1_000)}K`;
  return `£${Math.round(amount).toLocaleString('en-GB')}`;
}

function fmtTenure(tenureYears: number): string {
  const months = Math.round(tenureYears * 12);
  if (months % 12 === 0) {
    const y = months / 12;
    return `${y} yr${y === 1 ? '' : 's'}`;
  }
  const y = Math.floor(months / 12);
  const m = months % 12;
  return y > 0 ? `${y}y ${m}mo` : `${m} mo`;
}

// ── Delete confirmation modal ─────────────────────────────────────────────────

function DeleteConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="del-headline"
      style={{
        position: 'fixed', inset: 0, zIndex: 9600,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        background: 'rgba(15,12,46,0.55)',
        animation: 'delFadeIn 0.18s ease both',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        style={{
          background: '#FFFFFF', borderRadius: '20px',
          width: '100%', maxWidth: '320px',
          padding: '24px 20px 18px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
          animation: 'delSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: '#FEF2F2', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px',
          }}
        >
          <AlertTriangle style={{ width: '22px', height: '22px', color: '#EF4444' }} strokeWidth={2} />
        </div>

        <h2
          id="del-headline"
          style={{ fontSize: '16px', fontWeight: 700, color: '#0F0C2E', textAlign: 'center', margin: '0 0 8px', letterSpacing: '-0.2px' }}
        >
          Delete this calculation?
        </h2>
        <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', margin: '0 0 20px', lineHeight: 1.55 }}>
          This action cannot be undone.
        </p>

        <button
          onClick={onConfirm}
          style={{
            width: '100%', minHeight: '46px', borderRadius: '12px', border: 'none',
            background: '#EF4444', color: '#FFFFFF', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px', marginBottom: '8px',
            boxShadow: '0 3px 10px rgba(239,68,68,0.25)',
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <Trash2 style={{ width: '14px', height: '14px' }} />
          Delete
        </button>

        <button
          onClick={onCancel}
          style={{
            width: '100%', minHeight: '44px', borderRadius: '12px',
            border: '1.5px solid #E5E7EB', background: '#F7F6FB',
            color: '#374151', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#EEEDFE'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#F7F6FB'; }}
        >
          Cancel
        </button>
      </div>

      <style>{`
        @keyframes delFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes delSlideUp {
          from { transform: translateY(14px) scale(0.97); opacity: 0 }
          to   { transform: translateY(0)     scale(1);    opacity: 1 }
        }
      `}</style>
    </div>
  );
}

// ── Swipeable calculation card ────────────────────────────────────────────────

const DELETE_ZONE_WIDTH = 80;
const SWIPE_THRESHOLD = 40;

function CalculationCard({
  calc,
  onTap,
  onDeleteRequest,
}: {
  calc: SavedCalculation;
  onTap: () => void;
  onDeleteRequest: (id: string) => void;
}) {
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const totalMovement = useRef(0);

  const property = calc.propertyId
    ? properties.find((p) => p.id === calc.propertyId) ?? null
    : null;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsSwiping(true);
    startX.current = e.clientX;
    totalMovement.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isSwiping) return;
    const dx = e.clientX - startX.current;
    totalMovement.current = Math.abs(dx);
    setSwipeX(Math.min(0, Math.max(-DELETE_ZONE_WIDTH, dx)));
  };

  const handlePointerUp = () => {
    setIsSwiping(false);
    if (swipeX < -SWIPE_THRESHOLD) {
      setSwipeX(-DELETE_ZONE_WIDTH); // snap to reveal delete
    } else {
      setSwipeX(0); // snap back
    }
  };

  const handleClick = () => {
    // If the user was dragging, swallow the click
    if (totalMovement.current > 5) {
      totalMovement.current = 0;
      return;
    }
    // If card is in swiped state, snap back instead of navigating
    if (swipeX !== 0) {
      setSwipeX(0);
      return;
    }
    onTap();
  };

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#FFFFFF',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid #F1F3F5',
      }}
    >
      {/* Delete zone (lives behind the card) */}
      <div
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: `${DELETE_ZONE_WIDTH}px`,
          background: '#EF4444',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '4px', cursor: 'pointer',
        }}
        onClick={() => onDeleteRequest(calc.id)}
      >
        <Trash2 style={{ width: '18px', height: '18px', color: '#FFFFFF' }} />
        <span style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: 600 }}>Delete</span>
      </div>

      {/* Card content (draggable) */}
      <div
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.22s cubic-bezier(0.32,0,0.67,0)',
          background: '#FFFFFF',
          cursor: 'pointer',
          userSelect: 'none',
          touchAction: 'pan-y',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
      >
        {/* ── Property section (if linked) ── */}
        {property ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px 12px' }}>
            <img
              src={property.imageUrl}
              alt={property.address}
              style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F0C2E', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {property.address}
              </p>
              {calc.propertyPrice !== undefined && (
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                  £{calc.propertyPrice.toLocaleString('en-GB')} for sale
                </p>
              )}
            </div>
            <p style={{ fontSize: '11px', color: '#9CA3AF', flexShrink: 0, whiteSpace: 'nowrap' }}>
              {relativeTime(calc.timestamp)}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Calculator style={{ width: '16px', height: '16px', color: '#3C3489' }} strokeWidth={2} />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F0C2E', margin: 0 }}>
                Custom calculation
              </p>
            </div>
            <p style={{ fontSize: '11px', color: '#9CA3AF', flexShrink: 0, whiteSpace: 'nowrap' }}>
              {relativeTime(calc.timestamp)}
            </p>
          </div>
        )}

        {/* ── Divider ── */}
        <div style={{ height: '1px', background: '#F1F3F5', marginLeft: property ? '92px' : '0' }} />

        {/* ── Results section ── */}
        <div style={{ padding: '12px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '20px', fontWeight: 800, color: '#0F0C2E', margin: '0 0 3px', letterSpacing: '-0.4px', lineHeight: 1 }}>
              {fmtGbp(calc.monthlyPayment)}
            </p>
            <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>/ month</span>
          </div>
          <p style={{ fontSize: '12px', color: '#6B7280', textAlign: 'right', lineHeight: 1.5, margin: 0 }}>
            Loan {fmtLoanShort(calc.loanAmount)}
            <br />
            {fmtTenure(calc.tenureYears)} · {calc.annualRate}%
          </p>
        </div>

        {/* Swipe hint arrow (shows briefly when at rest) */}
        {swipeX === 0 && (
          <div
            style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              color: '#D1D5DB', opacity: 0.6, pointerEvents: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onOpenCalculator }: { onOpenCalculator: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 py-16 text-center">
      <div
        style={{
          width: '72px', height: '72px', borderRadius: '20px',
          background: 'linear-gradient(135deg, #EEEDFE 0%, #E0DEFE 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <Calculator style={{ width: '32px', height: '32px', color: '#3C3489' }} strokeWidth={1.5} />
      </div>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F0C2E', margin: '0 0 10px', letterSpacing: '-0.3px' }}>
        No calculations yet
      </h2>
      <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, margin: '0 0 28px', maxWidth: '280px' }}>
        Use the calculator on any property to estimate your monthly repayments and save it here for later.
      </p>
      <button
        onClick={onOpenCalculator}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          height: '50px', paddingLeft: '24px', paddingRight: '24px',
          borderRadius: '14px', border: 'none',
          background: '#0F0C2E', color: '#FFFFFF',
          fontSize: '15px', fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(15,12,46,0.24)',
          transition: 'transform 0.1s, background 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1650'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#0F0C2E'; }}
        onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <Calculator style={{ width: '16px', height: '16px' }} strokeWidth={2} />
        Open calculator
      </button>
    </div>
  );
}

// ── MyCalculationsScreen ──────────────────────────────────────────────────────

interface MyCalculationsScreenProps {
  calculations: SavedCalculation[];
  onBack: () => void;
  /** Opens the calculator pre-filled with the given saved calculation. */
  onOpenCalculation: (calc: SavedCalculation) => void;
  /** Permanently removes a calculation (called after confirmation). */
  onDeleteCalculation: (id: string) => void;
  /** Opens a blank calculator (empty-state CTA). */
  onOpenCalculator: () => void;
}

export function MyCalculationsScreen({
  calculations,
  onBack,
  onOpenCalculation,
  onDeleteCalculation,
  onOpenCalculator,
}: MyCalculationsScreenProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleDeleteRequest = (id: string) => {
    setPendingDeleteId(id);
  };

  const handleDeleteConfirm = () => {
    if (pendingDeleteId) onDeleteCalculation(pendingDeleteId);
    setPendingDeleteId(null);
  };

  const isEmpty = calculations.length === 0;

  return (
    <>
      <div className="flex flex-col h-full bg-[#F7F6FB]">

        {/* ── Dark header ── */}
        <div className="bg-[#0F0C2E] px-5 pb-5 header-pt rounded-b-[28px] shadow-lg shadow-[#0F0C2E]/20 relative overflow-hidden flex-shrink-0">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#3C3489]/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-4 left-0 w-24 h-24 bg-[#7F77DD]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white leading-tight tracking-tight">
                  My Calculations
                </h1>
                <p className="text-gray-300 text-sm mt-0.5">
                  {calculations.length === 0
                    ? 'No saved calculations'
                    : `${calculations.length} saved ${calculations.length === 1 ? 'calculation' : 'calculations'}`}
                </p>
              </div>

              {/* Calculator icon badge */}
              <div
                style={{
                  width: '44px', height: '44px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #7F77DD 0%, #3C3489 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(60,52,137,0.4)',
                }}
              >
                <Calculator style={{ width: '22px', height: '22px', color: '#FFFFFF' }} strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        {isEmpty ? (
          <EmptyState onOpenCalculator={onOpenCalculator} />
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Swipe hint */}
            <p className="text-[11px] text-gray-400 text-center pt-4 pb-2 px-5">
              Tap to reopen · swipe left to delete
            </p>

            <div className="px-4 pb-4 space-y-3">
              {calculations.map((calc) => (
                <CalculationCard
                  key={calc.id}
                  calc={calc}
                  onTap={() => onOpenCalculation(calc)}
                  onDeleteRequest={handleDeleteRequest}
                />
              ))}
            </div>

            {/* Bottom spacer */}
            <div className="h-6" />
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {pendingDeleteId && (
        <DeleteConfirmModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </>
  );
}
