import { useState } from 'react';

export interface DeepLinkState {
  toast: string | null;
  whatsappFallbackOpen: boolean;
  whatsappNumber: string;
}

export function useDeepLink() {
  const [toast, setToast] = useState<string | null>(null);
  const [whatsappFallbackOpen, setWhatsappFallbackOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const clearToast = () => setToast(null);

  const triggerCall = (phone: string) => {
    try {
      window.location.href = `tel:${phone}`;
    } catch {
      setToast('Unable to open phone app on this device.');
    }
  };

  const triggerEmail = (email: string) => {
    try {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent('Property Enquiry via Star Homes')}`;
    } catch {
      setToast('No email app found. Please set up an email account on your device.');
    }
  };

  const triggerWhatsApp = (number: string) => {
    const url = `https://wa.me/${number}?text=${encodeURIComponent('Hi, I found your listing on Star Homes and would like to find out more.')}`;
    // On mobile, attempt to open; show fallback sheet if likely unavailable
    const isMobile = /iPhone|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = url;
      // Show fallback sheet after 2s if still on page (WhatsApp not installed)
      const timer = window.setTimeout(() => {
        setWhatsappNumber(number);
        setWhatsappFallbackOpen(true);
      }, 2000);
      // Clean up if user leaves
      const cleanup = () => window.clearTimeout(timer);
      window.addEventListener('blur', cleanup, { once: true });
    } else {
      // Desktop: open in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const triggerSMS = (number: string) => {
    window.location.href = `sms:+${number}?body=${encodeURIComponent('Hi, I found your listing on Star Homes and would like to find out more.')}`;
    setWhatsappFallbackOpen(false);
  };

  const dismissWhatsappFallback = () => setWhatsappFallbackOpen(false);

  return {
    toast,
    clearToast,
    whatsappFallbackOpen,
    whatsappNumber,
    triggerCall,
    triggerEmail,
    triggerWhatsApp,
    triggerSMS,
    dismissWhatsappFallback,
  };
}
