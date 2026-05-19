/**
 * LoanCalculator — global floating action button + bottom sheet calculator.
 *
 * Usage in App.tsx:
 *   <LoanCalculator
 *     propertyContext={mainScreen === 'property-detail' ? selectedProperty : null}
 *     visible={mainScreen !== 'chat'}
 *   />
 *
 * When propertyContext is provided the Loan Amount pre-fills to 40% of the
 * property's sale price and a contextual chip is shown below the input.
 * When propertyContext is null all inputs start at sensible defaults.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Calculator, X, Plus, Minus, Check } from 'lucide-react';
import type { Property } from '../../data/properties';
import { saveCalculation } from '../../data/calculatorStore';

// ── Maths ─────────────────────────────────────────────────────────────────────

/**
 * Standard amortisation formula.
 * Returns null when inputs are incomplete or invalid.
 */
function calcMonthly(
  principal: number,
  annualRatePct: number,
  tenureYears: number,
): number | null {
  if (!principal || principal <= 0) return null;
  if (!tenureYears || tenureYears < 1) return null;
  const n = tenureYears * 12;
  // Zero-interest edge case — simple equal principal repayment
  if (annualRatePct <= 0) return principal / n;
  const r = annualRatePct / 100 / 12;
  const factor = Math.pow(1 + r, n);
  const m = (principal * r * factor) / (factor - 1);
  return isFinite(m) && m > 0 ? m : null;
}

/** Format a GBP amount to 2dp, e.g. £1,234.56 */
function fmtGbp(amount: number): string {
  return `£${amount.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Format a GBP whole number without decimals, e.g. £340,000 */
function fmtGbpInt(amount: number): string {
  return `£${Math.round(amount).toLocaleString('en-GB')}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

const DEFAULT_TENURE = 25;
const DEFAULT_RATE = 3.5;
const MAX_LOAN = 99_999_999;
const MAX_TENURE = 35;

export interface LoanCalculatorProps {
  /** When set, pre-fills loan amount to 40% of property.salePrice. */
  propertyContext?: Property | null;
  /** When false, the FAB button is hidden (but an open sheet stays open). */
  visible?: boolean;
}

// ── LoanCalculator (root — renders FAB + sheet) ───────────────────────────────

export function LoanCalculator({ propertyContext, visible = true }: LoanCalculatorProps) {
  const [open, setOpen] = useState(false);
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

  // Clean up timer on unmount
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
            /* Sit 8px above the top of the floating pill nav.
               Pill nav container: paddingBottom = max(safe-inset, 12px).
               Pill itself ≈ 60px tall.
               So top of pill ≈ safe-inset + 12px + 60px from viewport bottom. */
            bottom: 'calc(max(env(safe-area-inset-bottom), 12px) + 68px + 8px)',
            zIndex: 820,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '6px',
            pointerEvents: 'none',
          }}
        >
          {/* Tooltip */}
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

          {/* Button */}
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
              boxShadow:
                '0 4px 16px rgba(15,12,46,0.38), 0 1px 4px rgba(0,0,0,0.12)',
              pointerEvents: 'auto',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.07)';
              e.currentTarget.style.boxShadow =
                '0 6px 24px rgba(15,12,46,0.48), 0 2px 8px rgba(0,0,0,0.16)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow =
                '0 4px 16px rgba(15,12,46,0.38), 0 1px 4px rgba(0,0,0,0.12)';
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1.07)'; }}
          >
            <Calculator
              style={{ width: '24px', height: '24px', color: '#FFFFFF' }}
              strokeWidth={2}
            />
          </button>
        </div>
      )}

      {/* ── Sheet ── */}
      {open && (
        <LoanCalculatorSheet
          propertyContext={propertyContext ?? null}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

// ── LoanCalculatorSheet ───────────────────────────────────────────────────────

interface LoanCalculatorSheetProps {
  propertyContext: Property | null;
  onClose: () => void;
}

function LoanCalculatorSheet({ propertyContext, onClose }: LoanCalculatorSheetProps) {
  // ── Pre-fill ──────────────────────────────────────────────────────────────
  const preFillAmount = propertyContext
    ? Math.round(propertyContext.salePrice * 0.4)
    : null;

  // ── Input state ───────────────────────────────────────────────────────────
  const [loanStr, setLoanStr] = useState<string>(
    preFillAmount ? preFillAmount.toLocaleString('en-GB') : '',
  );
  const [tenure, setTenure] = useState(DEFAULT_TENURE);
  const [tenureStr, setTenureStr] = useState(String(DEFAULT_TENURE));
  const [rateStr, setRateStr] = useState(String(DEFAULT_RATE));
  const [saved, setSaved] = useState(false);
  const loanInputRef = useRef<HTMLInputElement>(null);

  // ── Parsed values ─────────────────────────────────────────────────────────
  const loanAmount = useMemo(
    () => parseFloat(loanStr.replace(/,/g, '')) || 0,
    [loanStr],
  );
  const tenureYears = useMemo(
    () => Math.min(MAX_TENURE, Math.max(0, parseInt(tenureStr, 10) || 0)),
    [tenureStr],
  );
  const annualRate = useMemo(() => parseFloat(rateStr) || 0, [rateStr]);

  // ── Live calculation (debounced 200ms) ───────────────────────────────────
  const [monthly, setMonthly] = useState<number | null>(() =>
    preFillAmount
      ? calcMonthly(preFillAmount, DEFAULT_RATE, DEFAULT_TENURE)
      : null,
  );
  const calcTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (calcTimerRef.current) clearTimeout(calcTimerRef.current);
    calcTimerRef.current = window.setTimeout(() => {
      setMonthly(calcMonthly(loanAmount, annualRate, tenureYears));
    }, 200);
    return () => { if (calcTimerRef.current) clearTimeout(calcTimerRef.current); };
  }, [loanAmount, tenureYears, annualRate]);

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
    if (dragY > 90) {
      onClose();
    } else {
      setDragY(0);
    }
  }, [dragY, onClose]);

  // ── Validation ────────────────────────────────────────────────────────────
  const tenureError =
    tenureStr !== '' && tenureYears < 1
      ? 'Tenure must be at least 1 year'
      : null;
  const rateWarning =
    annualRate > 20 ? "That's an unusually high rate — please double-check" : null;

  // ── Derived output ────────────────────────────────────────────────────────
  const showOutput = monthly !== null && monthly > 0 && !tenureError;
  const totalRepayable = monthly !== null ? monthly * tenureYears * 12 : null;
  const totalInterest =
    totalRepayable !== null ? totalRepayable - loanAmount : null;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleLoanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, '');
    if (!digits) { setLoanStr(''); return; }
    const num = Math.min(parseInt(digits, 10), MAX_LOAN);
    setLoanStr(num.toLocaleString('en-GB'));
  };

  const handleTenureInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setTenureStr(raw);
    const n = parseInt(raw, 10);
    if (!isNaN(n)) setTenure(Math.min(MAX_TENURE, Math.max(1, n)));
  };

  const adjustTenure = (delta: number) => {
    const next = Math.min(MAX_TENURE, Math.max(1, tenure + delta));
    setTenure(next);
    setTenureStr(String(next));
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow digits and at most one decimal point
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    const dotCount = (raw.match(/\./g) ?? []).length;
    if (dotCount <= 1) setRateStr(raw);
  };

  const handleReset = () => {
    setLoanStr('');
    setTenure(DEFAULT_TENURE);
    setTenureStr(String(DEFAULT_TENURE));
    setRateStr(String(DEFAULT_RATE));
    setSaved(false);
  };

  const handleSave = () => {
    if (!showOutput || monthly === null || totalRepayable === null || totalInterest === null) return;
    saveCalculation({
      id: `calc-${Date.now()}`,
      timestamp: Date.now(),
      loanAmount,
      tenureYears,
      annualRate,
      monthlyPayment: monthly,
      totalRepayable,
      totalInterest,
      propertyAddress: propertyContext?.address,
      propertyPrice: propertyContext?.salePrice,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const canSave = showOutput && !saved;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    /* Full-viewport overlay */
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
          <div
            style={{
              width: '40px',
              height: '4px',
              background: '#E5E7EB',
              borderRadius: '2px',
              margin: '0 auto',
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            padding: '4px 20px 16px',
            flexShrink: 0,
            borderBottom: '1px solid #F1F3F5',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #7F77DD 0%, #3C3489 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Calculator style={{ width: '14px', height: '14px', color: '#FFFFFF' }} strokeWidth={2} />
                </div>
                <h2
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#0F0C2E',
                    margin: 0,
                    letterSpacing: '-0.3px',
                  }}
                >
                  Home Loan Calculator
                </h2>
              </div>

              {propertyContext ? (
                <p
                  style={{
                    fontSize: '12px',
                    color: '#3C3489',
                    fontWeight: 500,
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  For {propertyContext.address}
                </p>
              ) : (
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                  Estimate your monthly repayments
                </p>
              )}
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close calculator"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#F7F6FB',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B7280',
                flexShrink: 0,
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* ── Loan Amount ── */}
            <div>
              <label
                htmlFor="calc-loan"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}
              >
                Loan Amount
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#F7F6FB',
                  transition: 'border-color 0.15s',
                }}
                onFocusCapture={(e) =>
                  (e.currentTarget.style.borderColor = '#7F77DD')
                }
                onBlurCapture={(e) =>
                  (e.currentTarget.style.borderColor = '#E5E7EB')
                }
              >
                <span
                  style={{
                    padding: '0 10px 0 16px',
                    fontSize: '17px',
                    fontWeight: 700,
                    color: '#3C3489',
                    flexShrink: 0,
                    userSelect: 'none',
                  }}
                >
                  £
                </span>
                <input
                  id="calc-loan"
                  ref={loanInputRef}
                  type="text"
                  inputMode="numeric"
                  value={loanStr}
                  onChange={handleLoanChange}
                  placeholder="0"
                  style={{
                    flex: 1,
                    height: '50px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '16px',
                    color: '#0F0C2E',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Pre-fill chip */}
              {preFillAmount !== null && propertyContext && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '6px',
                    padding: '6px 10px',
                    background: '#EEEDFE',
                    borderRadius: '8px',
                  }}
                >
                  <span style={{ fontSize: '11px', color: '#3C3489', fontWeight: 500, flex: 1 }}>
                    Pre-filled: 40% of {fmtGbpInt(propertyContext.salePrice)}
                  </span>
                  <button
                    onClick={() => loanInputRef.current?.focus()}
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#3C3489',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0',
                      textDecoration: 'underline',
                      flexShrink: 0,
                    }}
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
              <label
                htmlFor="calc-tenure"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}
              >
                Loan Tenure
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Decrement */}
                <StepperButton
                  icon={<Minus style={{ width: '16px', height: '16px' }} />}
                  onClick={() => adjustTenure(-1)}
                  disabled={tenure <= 1}
                  aria-label="Decrease tenure"
                />

                {/* Input + suffix */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    border: `1.5px solid ${tenureError ? '#EF4444' : '#E5E7EB'}`,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#F7F6FB',
                    transition: 'border-color 0.15s',
                  }}
                  onFocusCapture={(e) =>
                    !tenureError && (e.currentTarget.style.borderColor = '#7F77DD')
                  }
                  onBlurCapture={(e) =>
                    !tenureError && (e.currentTarget.style.borderColor = '#E5E7EB')
                  }
                >
                  <input
                    id="calc-tenure"
                    type="text"
                    inputMode="numeric"
                    value={tenureStr}
                    onChange={handleTenureInput}
                    placeholder={String(DEFAULT_TENURE)}
                    style={{
                      flex: 1,
                      height: '50px',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '16px',
                      color: '#0F0C2E',
                      outline: 'none',
                      paddingLeft: '16px',
                      minWidth: 0,
                    }}
                  />
                  <span
                    style={{
                      paddingRight: '14px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#6B7280',
                      flexShrink: 0,
                      userSelect: 'none',
                    }}
                  >
                    years
                  </span>
                </div>

                {/* Increment */}
                <StepperButton
                  icon={<Plus style={{ width: '16px', height: '16px' }} />}
                  onClick={() => adjustTenure(1)}
                  disabled={tenure >= MAX_TENURE}
                  aria-label="Increase tenure"
                />
              </div>

              {tenureError ? (
                <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '5px' }}>
                  {tenureError}
                </p>
              ) : (
                <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '5px' }}>
                  How long you'll repay the loan · 1–{MAX_TENURE} years
                </p>
              )}
            </div>

            {/* ── Interest Rate ── */}
            <div>
              <label
                htmlFor="calc-rate"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}
              >
                Net Yearly Interest Rate
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: `1.5px solid ${rateWarning ? '#F59E0B' : '#E5E7EB'}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#F7F6FB',
                  transition: 'border-color 0.15s',
                }}
                onFocusCapture={(e) =>
                  !rateWarning && (e.currentTarget.style.borderColor = '#7F77DD')
                }
                onBlurCapture={(e) =>
                  !rateWarning && (e.currentTarget.style.borderColor = rateWarning ? '#F59E0B' : '#E5E7EB')
                }
              >
                <input
                  id="calc-rate"
                  type="text"
                  inputMode="decimal"
                  value={rateStr}
                  onChange={handleRateChange}
                  placeholder="0.0"
                  style={{
                    flex: 1,
                    height: '50px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '16px',
                    color: '#0F0C2E',
                    outline: 'none',
                    paddingLeft: '16px',
                    minWidth: 0,
                  }}
                />
                <span
                  style={{
                    paddingRight: '14px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#6B7280',
                    flexShrink: 0,
                    userSelect: 'none',
                  }}
                >
                  % p.a.
                </span>
              </div>

              {rateWarning ? (
                <p style={{ fontSize: '11px', color: '#D97706', marginTop: '5px' }}>
                  {rateWarning}
                </p>
              ) : (
                <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '5px' }}>
                  Your expected annual interest rate · 0–20%
                </p>
              )}
            </div>

            {/* ── Output panel ── */}
            <div
              style={{
                borderRadius: '16px',
                padding: '20px',
                background: showOutput ? '#0F0C2E' : '#F7F6FB',
                transition: 'background 0.35s ease',
                minHeight: '80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              {showOutput ? (
                <>
                  {/* Label */}
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.5)',
                      margin: '0 0 4px',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Monthly Installment
                  </p>

                  {/* Big figure */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '16px' }}>
                    <p
                      style={{
                        fontSize: '30px',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        margin: 0,
                        letterSpacing: '-0.6px',
                        lineHeight: 1,
                      }}
                    >
                      {fmtGbp(monthly!)}
                    </p>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                      / month
                    </span>
                  </div>

                  {/* Breakdown */}
                  <div
                    style={{
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      paddingTop: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                        Total repayable
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.82)' }}>
                        {fmtGbp(totalRepayable!)} over {tenureYears}y
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                        Total interest
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#E5917A' }}>
                        {fmtGbp(totalInterest!)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p
                  style={{
                    fontSize: '13px',
                    color: '#9CA3AF',
                    textAlign: 'center',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  Enter all fields to see your monthly installment
                </p>
              )}
            </div>

            {/* ── Actions ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Save */}
              <button
                onClick={handleSave}
                disabled={!canSave}
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '14px',
                  border: 'none',
                  background: !canSave
                    ? '#F3F4F6'
                    : saved
                    ? '#1D9E75'
                    : 'linear-gradient(135deg, #4F47A8 0%, #3C3489 100%)',
                  color: !canSave ? '#9CA3AF' : '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: canSave ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.3s ease, transform 0.1s ease',
                  boxShadow:
                    canSave && !saved
                      ? '0 4px 16px rgba(60,52,137,0.28)'
                      : 'none',
                }}
                onMouseDown={(e) =>
                  canSave && (e.currentTarget.style.transform = 'scale(0.98)')
                }
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {saved ? (
                  <>
                    <Check style={{ width: '16px', height: '16px' }} strokeWidth={3} />
                    Saved!
                  </>
                ) : (
                  'Save calculation'
                )}
              </button>

              {/* Reset */}
              <button
                onClick={handleReset}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: '#9CA3AF',
                  fontWeight: 500,
                  padding: '6px',
                  width: '100%',
                  textAlign: 'center',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#6B7280')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
              >
                Reset to defaults
              </button>
            </div>

            {/* Safe area spacer */}
            <div style={{ height: 'max(env(safe-area-inset-bottom), 8px)' }} />
          </div>
        </div>
      </div>

      {/* Keyframe animations injected via a style tag */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(60px); opacity: 0.6; }
          to   { transform: translateY(0);    opacity: 1;   }
        }
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
        width: '48px',
        height: '50px',
        borderRadius: '12px',
        border: '1.5px solid #E5E7EB',
        background: disabled ? '#F9FAFB' : '#F7F6FB',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: disabled ? '#D1D5DB' : '#0F0C2E',
        flexShrink: 0,
        transition: 'background 0.15s, transform 0.1s',
      }}
      onMouseDown={(e) =>
        !disabled && (e.currentTarget.style.transform = 'scale(0.92)')
      }
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {icon}
    </button>
  );
}
