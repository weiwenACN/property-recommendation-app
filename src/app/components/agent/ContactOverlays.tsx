import { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { formatPhoneDisplay, toTelHref, toWaHref, toSmsHref } from '../../utils/phone';

// ── Phone overlay (dial-pad style) ────────────────────────────────────────────

interface PhoneOverlayProps {
  /** E.164 phone number e.g. "+447700900123" */
  phone: string;
  agentName: string;
  onClose: () => void;
}

export function PhoneOverlay({ phone, agentName, onClose }: PhoneOverlayProps) {
  const KEYS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  return (
    <div className="fixed inset-0 z-[9900] flex flex-col bg-[#0F0C2E] animate-in slide-in-from-bottom">
      {/* Header */}
      <div className="flex items-center px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
        <button
          onClick={onClose}
          aria-label="Back"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Number display (formatted for locale) */}
      <div className="flex flex-col items-center px-6 pt-4 pb-6" style={{ maxHeight: '20vh' }}>
        <p className="text-gray-400 text-sm mb-1">{agentName}</p>
        <p className="text-white text-3xl font-light tracking-wider">
          {formatPhoneDisplay(phone)}
        </p>
      </div>

      {/* Dial pad */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-3">
        {KEYS.map((row, ri) => (
          <div key={ri} className="grid grid-cols-3 gap-4 w-full max-w-xs">
            {row.map((key) => (
              <button
                key={key}
                className="h-16 rounded-full bg-white/10 text-white text-2xl font-medium hover:bg-white/20 transition-colors flex items-center justify-center"
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Call button — tel: href built from E.164 */}
      <div className="flex justify-center pb-[max(env(safe-area-inset-bottom),2rem)] pt-4">
        <a
          href={toTelHref(phone)}
          className="w-16 h-16 rounded-full bg-[#22c55e] flex items-center justify-center shadow-lg hover:bg-[#16a34a] transition-colors"
          aria-label={`Call ${agentName}`}
        >
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}

// ── Email overlay ─────────────────────────────────────────────────────────────

interface EmailOverlayProps {
  email: string;
  agentName: string;
  onClose: () => void;
}

export function EmailOverlay({ email, agentName, onClose }: EmailOverlayProps) {
  const [subject, setSubject] = useState('Property Enquiry via Star Homes');
  const [body, setBody] = useState('');

  return (
    <div className="fixed inset-0 z-[9900] flex flex-col bg-white animate-in slide-in-from-bottom">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3 border-b border-[#e5e7eb]">
        <button
          onClick={onClose}
          aria-label="Back"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#0F0C2E] hover:text-[#3C3489] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-[#0F0C2E]">New Message</h1>
        <a
          href={`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#3C3489] font-semibold text-sm"
        >
          Send
        </a>
      </div>

      {/* To */}
      <div className="flex items-center px-4 h-12 border-b border-[#f1f3f5]">
        <span className="text-sm text-gray-500 mr-2 w-12">To:</span>
        <p className="text-sm text-[#0F0C2E] font-medium">
          {agentName} &lt;{email}&gt;
        </p>
      </div>

      {/* Subject */}
      <div className="flex items-center px-4 h-12 border-b border-[#f1f3f5]">
        <span className="text-sm text-gray-500 mr-2 w-12">Subject:</span>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="flex-1 text-sm text-[#0F0C2E] focus:outline-none"
        />
      </div>

      {/* Body */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your message here…"
        className="flex-1 px-4 py-3 text-sm text-[#0F0C2E] resize-none focus:outline-none"
      />
    </div>
  );
}

// ── WhatsApp overlay ──────────────────────────────────────────────────────────

interface WhatsAppOverlayProps {
  /** E.164 phone number e.g. "+447700900123" */
  phone: string;
  agentName: string;
  agentInitials: string;
  onClose: () => void;
}

export function WhatsAppOverlay({
  phone,
  agentName,
  agentInitials,
  onClose,
}: WhatsAppOverlayProps) {
  const defaultMsg = 'Hi, I am interested in a property you have listed.';
  const [msg, setMsg] = useState(defaultMsg);
  // Build wa.me URL from E.164 — strips leading '+' as required
  const url = toWaHref(phone, msg);

  return (
    <div className="fixed inset-0 z-[9900] flex flex-col bg-[#ECE5DD] animate-in slide-in-from-bottom">
      {/* Header */}
      <div className="bg-[#075E54] flex items-center gap-3 px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
        <button
          onClick={onClose}
          aria-label="Back"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold text-xs">{agentInitials}</span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{agentName}</p>
          <p className="text-green-200 text-xs">online</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex items-end px-3 pb-3">
        <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 max-w-[80%] shadow-sm">
          <p className="text-sm text-[#0F0C2E]">Hi! How can I help you with the property?</p>
          <p className="text-[10px] text-gray-400 text-right mt-0.5">Agent</p>
        </div>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 bg-[#F0F0F0]">
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="flex-1 h-10 px-4 rounded-full bg-white text-sm text-[#0F0C2E] focus:outline-none"
        />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0"
          aria-label="Open in WhatsApp"
        >
          <Send className="w-4 h-4 text-white" />
        </a>
      </div>
    </div>
  );
}

// ── WhatsApp SMS fallback sheet ───────────────────────────────────────────────

interface WhatsAppFallbackSheetProps {
  open: boolean;
  /** E.164 phone number — used to build the sms: deep link. */
  phone: string;
  /** Caller provides a full SMS body string; this component builds the href. */
  smsBody: string;
  onDismiss: () => void;
}

export function WhatsAppFallbackSheet({
  open,
  phone,
  smsBody,
  onDismiss,
}: WhatsAppFallbackSheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9950]">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute inset-0 bg-black/40"
        tabIndex={-1}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl px-6 pt-4 pb-[max(env(safe-area-inset-bottom),1.5rem)] animate-in slide-in-from-bottom">
        <div className="mx-auto h-1.5 w-12 bg-[#e5e7eb] rounded-full mb-4" />
        <h2 className="text-lg font-semibold text-[#0F0C2E] mb-1">WhatsApp not found</h2>
        <p className="text-sm text-gray-600 mb-5">Would you like to send an SMS instead?</p>
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 min-h-[48px] border-2 border-[#e5e7eb] rounded-xl text-sm font-medium text-[#0F0C2E]"
          >
            Cancel
          </button>
          <a
            href={toSmsHref(phone, smsBody)}
            className="flex-1 min-h-[48px] bg-[#0F0C2E] rounded-xl text-sm font-medium text-white flex items-center justify-center"
            onClick={onDismiss}
          >
            Send SMS
          </a>
        </div>
      </div>
    </div>
  );
}
