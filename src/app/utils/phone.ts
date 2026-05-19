/**
 * phone.ts — E.164 phone number utilities
 *
 * All agent phone numbers are stored in E.164 format (e.g. +447700900123).
 * These helpers format them for display and construct correct deep-link hrefs.
 * No country code is hardcoded here — everything is derived from the number itself.
 */
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Format an E.164 number for human display using international notation.
 *   "+447700900123"  →  "+44 7700 900123"
 *   "+6591234567"    →  "+65 9123 4567"
 *   "+12025551234"   →  "+1 202 555 1234"
 *
 * Falls back to the raw string when parsing fails.
 */
export function formatPhoneDisplay(e164: string): string {
  try {
    return parsePhoneNumber(e164).formatInternational();
  } catch {
    return e164;
  }
}

/**
 * tel: deep-link. Modern diallers understand E.164 directly.
 *   "+447700900123"  →  "tel:+447700900123"
 */
export function toTelHref(e164: string): string {
  return `tel:${e164}`;
}

/**
 * WhatsApp web/app link. wa.me requires digits only (no leading +).
 *   "+447700900123"  →  "https://wa.me/447700900123?text=..."
 */
export function toWaHref(e164: string, message: string): string {
  const digits = e164.replace(/^\+/, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * SMS deep-link. Standard on iOS and Android: passes E.164 with '+' prefix.
 *   "+447700900123"  →  "sms:+447700900123?body=..."
 */
export function toSmsHref(e164: string, body: string): string {
  return `sms:${e164}?body=${encodeURIComponent(body)}`;
}

/**
 * Validate that a string is a well-formed E.164 number.
 * Useful when creating new agent records.
 */
export function isValidE164(value: string): boolean {
  if (!/^\+\d{7,15}$/.test(value)) return false;
  try {
    return isValidPhoneNumber(value);
  } catch {
    return false;
  }
}
