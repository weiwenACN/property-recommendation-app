import { useEffect, useState } from 'react';
import {
  Check,
  Edit3,
  Phone,
  Bell,
  LogOut,
  ChevronRight,
  Clock,
  Shield,
  Info,
  User,
  Calculator,
  AlertTriangle,
  X,
} from 'lucide-react';
import { StarHomesLogo } from '../common/StarHomesLogo';
import { preferenceOptions } from '../../data/preferences';
import { calculationCount } from '../../data/calculatorStore';

interface ProfileScreenProps {
  preferences: string[];
  onUpdatePreferences: (preferences: string[]) => void;
  /** Optional: navigate to recently viewed history screen. */
  onOpenHistory?: () => void;
  /** Called when the user confirms sign-out in the confirmation modal. */
  onSignOut: () => void;
}

// ── SignOutModal ──────────────────────────────────────────────────────────────

interface SignOutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function SignOutModal({ onConfirm, onCancel }: SignOutModalProps) {
  return (
    /* Full-viewport overlay — fade in */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-headline"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        /* Semi-transparent backdrop */
        background: 'rgba(15, 12, 46, 0.55)',
        animation: 'soFadeIn 0.2s ease both',
      }}
      /* Tapping the backdrop cancels */
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      {/* Modal card — centred, width-constrained */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '340px',
          padding: '28px 24px 20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12)',
          animation: 'soSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: '#FEF2F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <AlertTriangle style={{ width: '24px', height: '24px', color: '#EF4444' }} strokeWidth={2} />
        </div>

        {/* Headline */}
        <h2
          id="signout-headline"
          style={{
            fontSize: '17px',
            fontWeight: 700,
            color: '#0F0C2E',
            textAlign: 'center',
            margin: '0 0 10px',
            letterSpacing: '-0.3px',
            lineHeight: 1.3,
          }}
        >
          Are you sure you want to sign out?
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '13px',
            color: '#6B7280',
            textAlign: 'center',
            lineHeight: 1.6,
            margin: '0 0 24px',
          }}
        >
          Your preferences and history will be saved for when you return.
        </p>

        {/* CTA — destructive Sign Out */}
        <button
          onClick={onConfirm}
          style={{
            width: '100%',
            minHeight: '50px',
            borderRadius: '14px',
            border: 'none',
            background: '#EF4444',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '10px',
            boxShadow: '0 4px 14px rgba(239,68,68,0.28)',
            transition: 'background 0.15s, transform 0.1s',
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#DC2626'; }}
        >
          <LogOut style={{ width: '16px', height: '16px' }} />
          Sign Out
        </button>

        {/* Cancel */}
        <button
          onClick={onCancel}
          style={{
            width: '100%',
            minHeight: '48px',
            borderRadius: '14px',
            border: '1.5px solid #E5E7EB',
            background: '#F7F6FB',
            color: '#374151',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#EEEDFE'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#F7F6FB'; }}
        >
          Cancel
        </button>
      </div>

      {/* Keyframes for this modal */}
      <style>{`
        @keyframes soFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes soSlideUp { from { transform: translateY(16px) scale(0.97); opacity: 0 }
                               to   { transform: translateY(0)     scale(1);    opacity: 1 } }
      `}</style>
    </div>
  );
}

// ── ProfileScreen ─────────────────────────────────────────────────────────────

export function ProfileScreen({
  preferences,
  onUpdatePreferences,
  onOpenHistory,
  onSignOut,
}: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>(preferences);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const savedCalcCount = calculationCount();

  useEffect(() => {
    if (!isEditing) setDraft(preferences);
  }, [preferences, isEditing]);

  const togglePreference = (id: string) => {
    setDraft((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const startEditing = () => {
    setDraft(preferences);
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdatePreferences(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(preferences);
    setIsEditing(false);
  };

  const handleSignOutConfirm = () => {
    setShowSignOutModal(false);
    onSignOut();
  };

  const selectedOptions = preferenceOptions.filter((o) => preferences.includes(o.id));

  const accountRows = [
    { icon: Phone,      label: 'Phone number',    value: 'Connected',                                             action: undefined   },
    { icon: Bell,       label: 'Notifications',    value: 'On',                                                    action: undefined   },
    { icon: Clock,      label: 'Recently viewed',  value: undefined,                                               action: onOpenHistory },
    { icon: Calculator, label: 'My calculations',  value: savedCalcCount > 0 ? String(savedCalcCount) : undefined, action: undefined   },
    { icon: Shield,     label: 'Privacy settings', value: undefined,                                               action: undefined   },
    { icon: Info,       label: 'App version',       value: '1.0.0',                                                action: undefined   },
  ];

  return (
    <>
      <div className="flex flex-col h-full bg-[#F7F6FB]">
        {/* ── Dark hero header ── */}
        <div className="bg-[#0F0C2E] px-6 pb-10 header-pt-lg rounded-b-[32px] shadow-lg shadow-[#0F0C2E]/20 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#3C3489]/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-6 left-0 w-32 h-32 bg-[#7F77DD]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative">
            <StarHomesLogo variant="light" size="sm" className="mb-5" />
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7F77DD] to-[#3C3489] flex items-center justify-center shadow-lg flex-shrink-0 border-2 border-white/20">
                <User className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">My Profile</h1>
                <p className="text-gray-300 text-sm mt-0.5">Star Homes member</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-4">

            {/* Lifestyle priorities card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#f1f3f5] overflow-hidden">
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-[#0F0C2E]">Lifestyle priorities</h2>
                  {!isEditing && (
                    <button
                      onClick={startEditing}
                      className="flex items-center gap-1.5 text-[#3C3489] font-semibold text-sm bg-[#EEEDFE] px-3 py-1.5 rounded-lg hover:bg-[#e0defe] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {preferences.length === 0 ? 'Add' : 'Edit'}
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  selectedOptions.length === 0 ? (
                    <div className="py-6 text-center">
                      <div className="w-10 h-10 rounded-xl bg-[#F7F6FB] flex items-center justify-center mx-auto mb-3">
                        <Edit3 className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        No priorities set yet.<br />
                        Tap <span className="font-semibold text-[#0F0C2E]">Add</span> to choose what matters to you.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <div
                            key={option.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#EEEDFE] border border-[#3C3489]/20 text-[#3C3489] text-sm font-semibold"
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {option.label}
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <>
                    <p className="text-xs text-gray-500 mb-4">
                      Pick anything that matters — we'll match areas accordingly.
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {preferenceOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = draft.includes(option.id);
                        return (
                          <button
                            key={option.id}
                            onClick={() => togglePreference(option.id)}
                            className={`relative p-4 rounded-2xl border-2 text-left transition-all min-h-[80px] ${
                              isSelected
                                ? 'border-[#3C3489] bg-[#EEEDFE]'
                                : 'border-[#e5e7eb] bg-[#F7F6FB] hover:border-[#7F77DD]'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-2.5 right-2.5 bg-[#3C3489] rounded-full p-0.5">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </div>
                            )}
                            <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-[#3C3489]' : 'text-gray-500'}`} />
                            <div className={`text-xs font-semibold leading-snug ${isSelected ? 'text-[#3C3489]' : 'text-[#0F0C2E]'}`}>
                              {option.label}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button
                        onClick={handleCancel}
                        className="w-full bg-[#F7F6FB] text-[#0F0C2E] py-3 rounded-xl hover:bg-[#EEEDFE] transition-colors font-semibold text-sm border border-[#e5e7eb]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="w-full bg-[#0F0C2E] text-white py-3 rounded-xl hover:bg-[#1a1650] transition-colors font-semibold text-sm shadow-md shadow-[#0F0C2E]/20"
                      >
                        Save{draft.length > 0 ? ` (${draft.length})` : ''}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Account card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#f1f3f5] overflow-hidden">
              <div className="px-5 pt-4 pb-1">
                <h2 className="text-base font-bold text-[#0F0C2E]">Account</h2>
              </div>
              <div className="divide-y divide-[#f1f3f5]">
                {accountRows.map(({ icon: Icon, label, value, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    disabled={!action && value !== undefined ? false : !action}
                    className={`w-full px-5 py-3.5 flex items-center gap-3.5 text-left transition-colors ${
                      action ? 'hover:bg-[#F7F6FB] cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#F7F6FB] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#3C3489]" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-[#0F0C2E]">{label}</span>
                    {value && (
                      <span className="text-xs text-gray-400 font-medium">{value}</span>
                    )}
                    {action && (
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Sign Out ──────────────────────────────────────────────────────
                Separated from the rest by a full-width divider.
                Full-width button, destructive red, 48px tap target.
                Bottom padding ensures it never touches the nav bar edge.
            ───────────────────────────────────────────────────────────────── */}
            <div className="pt-2">
              {/* Divider */}
              <div className="h-px bg-[#e5e7eb] mb-5" />

              {/* Button */}
              <button
                onClick={() => setShowSignOutModal(true)}
                className="w-full min-h-[52px] flex items-center justify-center gap-2.5 rounded-2xl font-semibold text-[15px] transition-all active:scale-[0.98] bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 hover:border-red-200"
                aria-label="Sign out of Star Homes"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
                Sign Out
              </button>

              {/* Breathing room above the floating pill nav */}
              <div className="h-5" />
            </div>

          </div>
        </div>
      </div>

      {/* Confirmation modal — rendered outside the scroll container */}
      {showSignOutModal && (
        <SignOutModal
          onConfirm={handleSignOutConfirm}
          onCancel={() => setShowSignOutModal(false)}
        />
      )}
    </>
  );
}
