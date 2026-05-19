/**
 * LoanCalculator — global floating action button + bottom sheet calculator.
 *
 * Usage in App.tsx:
 *   <LoanCalculator
 *     propertyContext={mainScreen === 'property-detail' ? selectedProperty : null}
 *     visible={mainScreen !== 'chat'}
 *     open={calcOpen}
 *     onOpenChange={setCalcOpen}
 *     isGuest={isGuest}
 *     onGuestSave={() => openGuestPrompt('save your calculations')}
 *     onSaved={() => setGlobalToast('Calculation saved to your profile')}
 *     preFillCalculation={calcPreFill}
 *     onViewProperty={handleViewPropertyFromCalc}
 *   />
 *
 * When propertyContext is provided the Loan Amount pre-fills to 40% of the
 * property's sale price and Tenure / Rate start blank (no defaults) so the
 * user is prompted to enter their own values.
 * When preFillCalculation is provided all fields pre-fill from that saved
 * calculation and the previous result is shown immediately.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Calculator, X, Plus, Minus, Check, ChevronRight } from 'lucide-react';
import type { Property } from '../../data/properties';
import { saveCalculation, type SavedCalculation } from '../../data/calculatorStore';

// ── Maths ─────────────────────────────────────────────────────────────────────

function calcMonthly(
  principal: number,
  annualRatePct: number,
  tenureMonths: number,
): number | null {
  if (!principal || principal <= 0) return null;
  if (!tenureMonths || tenureMonths < 1) return null;
  const n = tenureMonths;
  if (annualRatePct <= 0) return principal / n;
  const r = annualRatePct / 100 / 12;
  const factor = Math.pow(1 + r, n);
  const m = (principal * r * factor) / (factor - 1);
  return isFinite(m) && m > 0 ? m : null;
}

function fmtGbp(amount: number): string {
  return `£${amount.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtGbpInt(amount: number): string {
  return `£${Math.round(amount).toLocaleString('en-GB')}`;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_TENURE = 25;
const DEFAULT_RATE = 3.5;
const MAX_LOAN = 99_999_999;
const MAX_TENURE_YEARS = 35;
const MAX_TENURE_MONTHS = MAX_TENURE_YEARS * 12;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LoanCalculatorProps {
  /** When set, pre-fills loan amount to 40% of property.salePrice. */
  propertyContext?: Property | null;
  /** When false, the FAB button is hidden (but an open sheet stays open). */
  visible?: boolean;
  /** Controlled open state. Pair with onOpenChange to open externally. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** True when the current user is a guest — gates the Save action. */
  isGuest?: boolean;
  /** Called when a guest taps Save (open the sign-up sheet). */
  onGuestSave?: () => void;
  /** Called after a logged-in user successfully saves a calculation. */
  onSaved?: () => void;
  /** Pre-fills all fields from a previously saved calculation. */
  preFillCalculation?: SavedCalculation | null;
  /** Called when the user taps "View property" inside the sheet. */
  onViewProperty?: () => void;
}

interface CalcResult {
  monthly: number;
  totalRepayable: number;
  totalInterest: number;
}

// ── LoanCalculator (root — renders FAB + sheet) ───────────────────────────────

export function LoanCalculator({
  propertyContext,
  visible = true,
  open: controlledOpen,
  onOpenChange,
  isGuest = false,
  onGuestSave,
  onSaved,
  preFillCalculation,
  onViewProperty,
}: LoanCalculatorProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    setInternalOpen(v);
    onOpenChange?.(v);
  };

  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimerRef = useRef<number | null>(null);

  const handlePointerDown = () => {
    tooltipTimerRef.current = window.setTimeout(() => setShowTooltip(true), 600);
  };
  const clearTooltipTimer = () => {
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
    setShowTooltip(false);
  };

  useEffect(() => () => { if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current); }, []);

  const handleFABClick = () => {
    clearTooltipTimer();
    setOpen(true);
  };

  return (
    <>
      {/* ── FAB ── */}
      {visible && (
        <div
          style={{
            position: 'fixed',
            right: '20px',
            bottom: 'calc(max(env(safe-area-inset-bottom), 12px) + 68px + 8px)',
            zIndex: 820,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '6px',
            pointerEvents: 'none',
          }}
        >
          {showTooltip && (
            <div
              aria-hidden="true"
              style={{
                background: 'rgba(15,12,46,0.92)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 500,
                padding: '6px 10px',
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                pointerEvents: 'none',
              }}
            >
              Home loan calculator
            </div>
          )}

          <button
            onClick={handleFABClick}
            onPointerDown={handlePointerDown}
            onPointerUp={clearTooltipTimer}
            onPointerLeave={clearTooltipTimer}
            onPointerCancel={clearTooltipTimer}
            aria-label="Open home loan calculator"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#0F0C2E',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(15,12,46,0.38), 0 1px 4px rgba(0,0,0,0.12)',
              pointerEvents: 'auto',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.07)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(15,12,46,0.48), 0 2px 8px rgba(0,0,0,0.16)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,12,46,0.38), 0 1px 4px rgba(0,0,0,0.12)';
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1.07)'; }}
          >
            <Calculator style={{ width: '24px', height: '24px', color: '#FFFFFF' }} strokeWidth={2} />
          </button>
        </div>
      )}

      {isOpen && (
        <LoanCalculatorSheet
          propertyContext={propertyContext ?? null}
          onClose={() => setOpen(false)}
          isGuest={isGuest}
          onGuestSave={onGuestSave}
          onSaved={onSaved}
          preFillCalculation={preFillCalculation ?? null}
          onViewProperty={onViewProperty}
        />
      )}
    </>
  );
}

// ── LoanCalculatorSheet ───────────────────────────────────────────────────────

interface LoanCalculatorSheetProps {
  propertyContext: Property | null;
  onClose: () => void;
  isGuest: boolean;
  onGuestSave?: () => void;
  onSaved?: () => void;
  preFillCalculation: SavedCalculation | null;
  onViewProperty?: () => void;
}

function LoanCalculatorSheet({
  propertyContext,
  onClose,
  isGuest,
  onGuestSave,
  onSaved,
  preFillCalculation,
  onViewProperty,
}: LoanCalculatorSheetProps) {
  // ── Derive initial values from props (used at mount time only) ────────────
  const preFillAmount = propertyContext
    ? Math.round(propertyContext.salePrice * 0.4)
    : null;

  const fromSaved = preFillCalculation != null;
  const savedMonths = fromSaved ? Math.round(preFillCalculation!.tenureYears * 12) : null;
  const _initUnit: 'years' | 'months' =
    !fromSaved ? 'years' : savedMonths! % 12 !== 0 ? 'months' : 'years';
  const _initTenureStr = fromSaved
    ? (_initUnit === 'months'
        ? String(savedMonths!)
        : String(Math.round(preFillCalculation!.tenureYears)))
    : propertyContext
    ? ''
    : String(DEFAULT_TENURE);
  const _initRateStr = fromSaved
    ? String(preFillCalculation!.annualRate)
    : propertyContext
    ? ''
    : String(DEFAULT_RATE);
  const _initLoanStr = fromSaved
    ? preFillCalculation!.loanAmount.toLocaleString('en-GB')
    : preFillAmount
    ? preFillAmount.toLocaleString('en-GB')
    : '';
  const _initCalcResult: CalcResult | null = fromSaved
    ? {
        monthly: preFillCalculation!.monthlyPayment,
        totalRepayable: preFillCalculation!.totalRepayable,
        totalInterest: preFillCalculation!.totalInterest,
      }
    : null;

  // ── Input state ───────────────────────────────────────────────────────────
  const [loanStr, setLoanStr] = useState(_initLoanStr);
  const [tenureStr, setTenureStr] = useState(_initTenureStr);
  const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>(_initUnit);
  const [rateStr, setRateStr] = useState(_initRateStr);
  const [calcResult, setCalcResult] = useState<CalcResult | null>(_initCalcResult);
  const [saved, setSaved] = useState(false);
  const loanInputRef = useRef<HTMLInputElement>(null);

  // ── Parsed / derived values ───────────────────────────────────────────────
  const loanAmount = parseFloat(loanStr.replace(/,/g, '')) || 0;
  const maxTenure = tenureUnit === 'years' ? MAX_TENURE_YEARS : MAX_TENURE_MONTHS;
  const tenureValue = Math.min(maxTenure, Math.max(0, parseInt(tenureStr, 10) || 0));
  const tenureMonths = tenureUnit === 'years' ? tenureValue * 12 : tenureValue;
  const annualRate = parseFloat(rateStr) || 0;

  // ── Invalidate result when any input changes (skip first mount) ───────────
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCalcResult(null);
    setSaved(false);
  }, [loanStr, tenureStr, tenureUnit, rateStr]);

  // ── Drag to dismiss ───────────────────────────────────────────────────────
  const dragStartY = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handleHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setDragY(Math.max(0, e.clientY - dragStartY.current));
  };
  const handleHandlePointerUp = useCallback(() => {
    setIsDragging(false);
    if (dragY > 90) onClose();
    else setDragY(0);
  }, [dragY, onClose]);

  // ── Validation ────────────────────────────────────────────────────────────
  const tenureError =
    tenureStr !== '' && tenureValue < 1
      ? `Tenure must be at least 1 ${tenureUnit === 'years' ? 'year' : 'month'}`
      : null;
  const rateWarning = annualRate > 20 ? "That's an unusually high rate — please double-check" : null;

  // ── Output state ──────────────────────────────────────────────────────────
  const showOutput = calcResult !== null && !tenureError;
  const canCalculate = loanAmount > 0 && tenureStr !== '' && rateStr !== '' && !tenureError;
  const canSave = isGuest ? showOutput : showOutput && !saved;

  const tenureDisplayStr = (() => {
    if (!tenureValue) return '';
    if (tenureUnit === 'years') return `${tenureValue}y`;
    if (tenureValue % 12 === 0) return `${tenureValue / 12}y`;
    const y = Math.floor(tenureValue / 12);
    const m = tenureValue % 12;
    return y > 0 ? `${y}y ${m}mo` : `${m}mo`;
  })();

  // Header context: prefer saved calc's property address, fall back to propertyContext
  const contextAddress =
    preFillCalculation?.propertyAddress ?? propertyContext?.address ?? null;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleLoanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, '');
    if (!digits) { setLoanStr(''); return; }
    setLoanStr(Math.min(parseInt(digits, 10), MAX_LOAN).toLocaleString('en-GB'));
  };

  const handleTenureInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTenureStr(e.target.value.replace(/[^0-9]/g, ''));
  };

  const adjustTenure = (delta: number) => {
    const current = parseInt(tenureStr, 10) || 0;
    setTenureStr(String(Math.min(maxTenure, Math.max(1, current + delta))));
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    if ((raw.match(/\./g) ?? []).length <= 1) setRateStr(raw);
  };

  const handleTenureUnitChange = (unit: 'years' | 'months') => {
    if (unit === tenureUnit) return;
    if (tenureStr !== '') {
      const current = parseInt(tenureStr, 10);
      if (!isNaN(current) && current > 0) {
        const converted =
          unit === 'months'
            ? Math.min(MAX_TENURE_MONTHS, Math.round(current * 12))
            : Math.min(MAX_TENURE_YEARS, Math.max(1, Math.round(current / 12)));
        setTenureStr(String(converted));
      }
    }
    setTenureUnit(unit);
  };

  const handleCalculate = () => {
    const monthly = calcMonthly(loanAmount, annualRate, tenureMonths);
    if (monthly === null) return;
    const totalRepayable = monthly * tenureMonths;
    setCalcResult({ monthly, totalRepayable, totalInterest: totalRepayable - loanAmount });
  };

  const handleReset = () => {
    setLoanStr(_initLoanStr);
    setTenureStr(_initTenureStr);
    setTenureUnit(_initUnit);
    setRateStr(_initRateStr);
    setCalcResult(_initCalcResult);
    setSaved(false);
  };

  const handleSave = () => {
    // Guest: show sign-up prompt instead
    if (isGuest) { onGuestSave?.(); return; }
    if (!showOutput || calcResult === null) return;

    const tenureYrs = tenureUnit === 'years' ? tenureValue : tenureValue / 12;
    saveCalculation({
      id: `calc-${Date.now()}`,
      timestamp: Date.now(),
      loanAmount,
      tenureYears: tenureYrs,
      annualRate,
      monthlyPayment: calcResult.monthly,
      totalRepayable: calcResult.totalRepayable,
      totalInterest: calcResult.totalInterest,
      // Preserve property context — use saved calc's values if re-saving from My Calculations
      propertyId: preFillCalculation?.propertyId ?? propertyContext?.id,
      propertyAddress: preFillCalculation?.propertyAddress ?? propertyContext?.address,
      propertyPrice: preFillCalculation?.propertyPrice ?? propertyContext?.salePrice,
    });
    setSaved(true);
    onSaved?.();
    setTimeout(() => setSaved(false), 2500);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9100 }}>
      {/* Scrim */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.48)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Home Loan Calculator"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#FFFFFF',
          borderRadius: '24px 24px 0 0',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
          transform: `translateY(${Math.max(0, dragY)}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0, 0.67, 0)',
          animation: 'slideUp 0.32s cubic-bezier(0.32, 0, 0.67, 0)',
        }}
      >
        {/* Drag handle */}
        <div
          style={{ padding: '12px 0 6px', cursor: 'grab', flexShrink: 0, userSelect: 'none' }}
          onPointerDown={handleHandlePointerDown}
          onPointerMove={handleHandlePointerMove}
          onPointerUp={handleHandlePointerUp}
          onPointerCancel={handleHandlePointerUp}
        >
          <div style={{ width: '40px', height: '4px', background: '#E5E7EB', borderRadius: '2px', margin: '0 auto' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '4px 20px 16px', flexShrink: 0, borderBottom: '1px solid #F1F3F5' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div
                  style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #7F77DD 0%, #3C3489 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <Calculator style={{ width: '14px', height: '14px', color: '#FFFFFF' }} strokeWidth={2} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F0C2E', margin: 0, letterSpacing: '-0.3px' }}>
                  Home Loan Calculator
                </h2>
              </div>

              {contextAddress ? (
                <p style={{ fontSize: '12px', color: '#3C3489', fontWeight: 500, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  For {contextAddress}
                </p>
              ) : (
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 4px' }}>
                  Estimate your monthly repayments
                </p>
              )}

              {/* View property button — only when opened from a saved property-linked calculation */}
              {preFillCalculation?.propertyId && onViewProperty && (
                <button
                  onClick={onViewProperty}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                    fontSize: '11px', fontWeight: 600, color: '#3C3489',
                    background: '#EEEDFE', border: 'none', borderRadius: '6px',
                    padding: '3px 8px', cursor: 'pointer', marginTop: '2px',
                  }}
                >
                  View property
                  <ChevronRight style={{ width: '11px', height: '11px' }} />
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              aria-label="Close calculator"
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: '#F7F6FB', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#6B7280', flexShrink: 0,
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* ── Loan Amount ── */}
            <div>
              <label htmlFor="calc-loan" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Loan Amount
              </label>
              <div
                style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', background: '#F7F6FB', transition: 'border-color 0.15s' }}
                onFocusCapture={(e) => (e.currentTarget.style.borderColor = '#7F77DD')}
                onBlurCapture={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
              >
                <span style={{ padding: '0 10px 0 16px', fontSize: '17px', fontWeight: 700, color: '#3C3489', flexShrink: 0, userSelect: 'none' }}>£</span>
                <input
                  id="calc-loan" ref={loanInputRef}
                  type="text" inputMode="numeric"
                  value={loanStr} onChange={handleLoanChange}
                  placeholder="0"
                  style={{ flex: 1, height: '50px', border: 'none', background: 'transparent', fontSize: '16px', color: '#0F0C2E', outline: 'none' }}
                />
              </div>

              {/* Pre-fill chip — only when opened from property (not saved calc) */}
              {!fromSaved && preFillAmount !== null && propertyContext && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', padding: '6px 10px', background: '#EEEDFE', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#3C3489', fontWeight: 500, flex: 1 }}>
                    Pre-filled: 40% of {fmtGbpInt(propertyContext.salePrice)}
                  </span>
                  <button
                    onClick={() => loanInputRef.current?.focus()}
                    style={{ fontSize: '11px', fontWeight: 600, color: '#3C3489', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', flexShrink: 0 }}
                  >
                    Edit
                  </button>
                </div>
              )}

              <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '5px' }}>
                The amount you plan to borrow · max {fmtGbpInt(MAX_LOAN)}
              </p>
            </div>

            {/* ── Loan Tenure ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label htmlFor="calc-tenure" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  Loan Tenure
                </label>
                <div style={{ display: 'flex', background: '#F1F3F5', borderRadius: '8px', padding: '2px', gap: '2px' }}>
                  {(['years', 'months'] as const).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => handleTenureUnitChange(unit)}
                      style={{
                        padding: '4px 10px', borderRadius: '6px', border: 'none',
                        fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                        transition: 'background 0.15s, color 0.15s',
                        background: tenureUnit === unit ? '#0F0C2E' : 'transparent',
                        color: tenureUnit === unit ? '#FFFFFF' : '#6B7280',
                      }}
                    >
                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <StepperButton
                  icon={<Minus style={{ width: '16px', height: '16px' }} />}
                  onClick={() => adjustTenure(-1)}
                  disabled={tenureValue <= 1}
                  aria-label="Decrease tenure"
                />
                <div
                  style={{ flex: 1, display: 'flex', alignItems: 'center', border: `1.5px solid ${tenureError ? '#EF4444' : '#E5E7EB'}`, borderRadius: '12px', overflow: 'hidden', background: '#F7F6FB', transition: 'border-color 0.15s' }}
                  onFocusCapture={(e) => !tenureError && (e.currentTarget.style.borderColor = '#7F77DD')}
                  onBlurCapture={(e) => !tenureError && (e.currentTarget.style.borderColor = '#E5E7EB')}
                >
                  <input
                    id="calc-tenure"
                    type="text" inputMode="numeric"
                    value={tenureStr} onChange={handleTenureInput}
                    placeholder={tenureUnit === 'years' ? String(DEFAULT_TENURE) : String(DEFAULT_TENURE * 12)}
                    style={{ flex: 1, height: '50px', border: 'none', background: 'transparent', fontSize: '16px', color: '#0F0C2E', outline: 'none', paddingLeft: '16px', minWidth: 0 }}
                  />
                  <span style={{ paddingRight: '14px', fontSize: '14px', fontWeight: 500, color: '#6B7280', flexShrink: 0, userSelect: 'none' }}>
                    {tenureUnit}
                  </span>
                </div>
                <StepperButton
                  icon={<Plus style={{ width: '16px', height: '16px' }} />}
                  onClick={() => adjustTenure(1)}
                  disabled={tenureValue >= maxTenure}
                  aria-label="Increase tenure"
                />
              </div>

              {tenureError ? (
                <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '5px' }}>{tenureError}</p>
              ) : (
                <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '5px' }}>
                  How long you'll repay the loan · 1–{tenureUnit === 'years' ? `${MAX_TENURE_YEARS} years` : `${MAX_TENURE_MONTHS} months`}
                </p>
              )}
            </div>

            {/* ── Interest Rate ── */}
            <div>
              <label htmlFor="calc-rate" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Net Yearly Interest Rate
              </label>
              <div
                style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${rateWarning ? '#F59E0B' : '#E5E7EB'}`, borderRadius: '12px', overflow: 'hidden', background: '#F7F6FB', transition: 'border-color 0.15s' }}
                onFocusCapture={(e) => !rateWarning && (e.currentTarget.style.borderColor = '#7F77DD')}
                onBlurCapture={(e) => !rateWarning && (e.currentTarget.style.borderColor = rateWarning ? '#F59E0B' : '#E5E7EB')}
              >
                <input
                  id="calc-rate"
                  type="text" inputMode="decimal"
                  value={rateStr} onChange={handleRateChange}
                  placeholder="0.0"
                  style={{ flex: 1, height: '50px', border: 'none', background: 'transparent', fontSize: '16px', color: '#0F0C2E', outline: 'none', paddingLeft: '16px', minWidth: 0 }}
                />
                <span style={{ paddingRight: '14px', fontSize: '14px', fontWeight: 500, color: '#6B7280', flexShrink: 0, userSelect: 'none' }}>% p.a.</span>
              </div>
              {rateWarning ? (
                <p style={{ fontSize: '11px', color: '#D97706', marginTop: '5px' }}>{rateWarning}</p>
              ) : (
                <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '5px' }}>Your expected annual interest rate · 0–20%</p>
              )}
            </div>

            {/* ── Calculate button ── */}
            <button
              type="button"
              onClick={handleCalculate}
              disabled={!canCalculate}
              style={{
                width: '100%', height: '52px', borderRadius: '14px', border: 'none',
                background: canCalculate ? '#0F0C2E' : '#F3F4F6',
                color: canCalculate ? '#FFFFFF' : '#9CA3AF',
                fontSize: '15px', fontWeight: 600,
                cursor: canCalculate ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: canCalculate ? '0 4px 16px rgba(15,12,46,0.24)' : 'none',
                transition: 'background 0.15s, box-shadow 0.15s, transform 0.1s',
              }}
              onMouseDown={(e) => canCalculate && (e.currentTarget.style.transform = 'scale(0.98)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Calculator style={{ width: '16px', height: '16px' }} strokeWidth={2} />
              Calculate
            </button>

            {/* ── Output panel ── */}
            <div
              style={{
                borderRadius: '16px', padding: '20px',
                background: showOutput ? '#0F0C2E' : '#F7F6FB',
                transition: 'background 0.35s ease',
                minHeight: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}
            >
              {showOutput && calcResult ? (
                <>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', margin: '0 0 4px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    Monthly Installment
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '30px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.6px', lineHeight: 1 }}>
                      {fmtGbp(calcResult.monthly)}
                    </p>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>/ month</span>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Total repayable</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.82)' }}>
                        {fmtGbp(calcResult.totalRepayable)} over {tenureDisplayStr}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Total interest</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#E5917A' }}>{fmtGbp(calcResult.totalInterest)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                  Fill in all fields and tap{' '}
                  <strong style={{ color: '#6B7280' }}>Calculate</strong>{' '}
                  to see your monthly installment
                </p>
              )}
            </div>

            {/* ── Formula note ── */}
            {showOutput && (
              <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', margin: '-8px 0 0', lineHeight: 1.6 }}>
                Based on M = P × r(1+r)ⁿ / (1+r)ⁿ−1
              </p>
            )}

            {/* ── Actions ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleSave}
                disabled={!canSave && !isGuest}
                style={{
                  width: '100%', height: '52px', borderRadius: '14px', border: 'none',
                  background: !canSave && !isGuest
                    ? '#F3F4F6'
                    : saved
                    ? '#1D9E75'
                    : 'linear-gradient(135deg, #4F47A8 0%, #3C3489 100%)',
                  color: !canSave && !isGuest ? '#9CA3AF' : '#FFFFFF',
                  fontSize: '15px', fontWeight: 600,
                  cursor: canSave || isGuest ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'background 0.3s ease, transform 0.1s ease',
                  boxShadow: (canSave && !saved) ? '0 4px 16px rgba(60,52,137,0.28)' : 'none',
                }}
                onMouseDown={(e) => (canSave || isGuest) && (e.currentTarget.style.transform = 'scale(0.98)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {saved ? (
                  <><Check style={{ width: '16px', height: '16px' }} strokeWidth={3} />Saved!</>
                ) : (
                  'Save calculation'
                )}
              </button>

              <button
                onClick={handleReset}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#9CA3AF', fontWeight: 500, padding: '6px', width: '100%', textAlign: 'center', transition: 'color 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#6B7280')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
              >
                Reset
              </button>
            </div>

            <div style={{ height: 'max(env(safe-area-inset-bottom), 8px)' }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(60px); opacity: 0.6; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ── StepperButton ─────────────────────────────────────────────────────────────

function StepperButton({
  icon,
  onClick,
  disabled,
  'aria-label': ariaLabel,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  'aria-label': string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        width: '48px', height: '50px', borderRadius: '12px',
        border: '1.5px solid #E5E7EB',
        background: disabled ? '#F9FAFB' : '#F7F6FB',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: disabled ? '#D1D5DB' : '#0F0C2E',
        flexShrink: 0, transition: 'background 0.15s, transform 0.1s',
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'scale(0.92)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {icon}
    </button>
  );
}
