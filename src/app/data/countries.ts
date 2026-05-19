/**
 * countries.ts — dial-code data for the country picker.
 *
 * Each entry has a unique `key` (so US and Canada can share the '+1' dial code),
 * an ISO 3166-1 alpha-2 `code` for the flag image, the actual `dialCode` string,
 * and per-country phone formatting hints.
 *
 * Flag images are served from flagcdn.com — e.g.
 *   https://flagcdn.com/w40/gb.png  (40 px wide, ~30 px tall, 4:3 ratio)
 *
 * Default country: United Kingdom (+44) — listed first.
 */

export interface Country {
  /** Unique key used for React state (not the dial code — US/CA both use +1). */
  key: string;
  /** ISO 3166-1 alpha-2 country code (lowercase) — used to build the flag URL. */
  code: string;
  /** ITU dial code string, e.g. "+44". */
  dialCode: string;
  /** Human-readable country name. */
  name: string;
  /** Example format shown as input placeholder. */
  placeholder: string;
  /** Max digit count for the national number (excl. leading 0 if applicable). */
  maxDigits: number;
}

export const COUNTRIES: Country[] = [
  { key: '+44',  code: 'gb', dialCode: '+44',  name: 'United Kingdom',       placeholder: '7XXX XXXXXX',    maxDigits: 11 },
  { key: '+1us', code: 'us', dialCode: '+1',   name: 'United States',        placeholder: '(XXX) XXX-XXXX', maxDigits: 10 },
  { key: '+1ca', code: 'ca', dialCode: '+1',   name: 'Canada',               placeholder: '(XXX) XXX-XXXX', maxDigits: 10 },
  { key: '+61',  code: 'au', dialCode: '+61',  name: 'Australia',            placeholder: '4XX XXX XXX',    maxDigits: 9  },
  { key: '+91',  code: 'in', dialCode: '+91',  name: 'India',                placeholder: 'XXXXX XXXXX',    maxDigits: 10 },
  { key: '+65',  code: 'sg', dialCode: '+65',  name: 'Singapore',            placeholder: 'XXXX XXXX',      maxDigits: 8  },
  { key: '+971', code: 'ae', dialCode: '+971', name: 'United Arab Emirates', placeholder: '5X XXX XXXX',    maxDigits: 9  },
  { key: '+60',  code: 'my', dialCode: '+60',  name: 'Malaysia',             placeholder: '1X-XXXX XXXX',   maxDigits: 10 },
  { key: '+64',  code: 'nz', dialCode: '+64',  name: 'New Zealand',          placeholder: '2X XXX XXXX',    maxDigits: 9  },
  { key: '+49',  code: 'de', dialCode: '+49',  name: 'Germany',              placeholder: '1XX XXXXXXX',    maxDigits: 11 },
  { key: '+33',  code: 'fr', dialCode: '+33',  name: 'France',               placeholder: '6 XX XX XX XX',  maxDigits: 9  },
  { key: '+34',  code: 'es', dialCode: '+34',  name: 'Spain',                placeholder: '6XX XXX XXX',    maxDigits: 9  },
  { key: '+39',  code: 'it', dialCode: '+39',  name: 'Italy',                placeholder: '3XX XXX XXXX',   maxDigits: 10 },
  { key: '+31',  code: 'nl', dialCode: '+31',  name: 'Netherlands',          placeholder: '6 XXXX XXXX',    maxDigits: 9  },
  { key: '+81',  code: 'jp', dialCode: '+81',  name: 'Japan',                placeholder: '90-XXXX-XXXX',   maxDigits: 10 },
  { key: '+86',  code: 'cn', dialCode: '+86',  name: 'China',                placeholder: '1XX XXXX XXXX',  maxDigits: 11 },
  { key: '+82',  code: 'kr', dialCode: '+82',  name: 'South Korea',          placeholder: '10-XXXX-XXXX',   maxDigits: 10 },
  { key: '+27',  code: 'za', dialCode: '+27',  name: 'South Africa',         placeholder: '6X XXX XXXX',    maxDigits: 9  },
];

export const DEFAULT_COUNTRY_KEY = '+44'; // United Kingdom / London

export function countryByKey(key: string): Country {
  return COUNTRIES.find((c) => c.key === key) ?? COUNTRIES[0];
}

/** Returns the flagcdn.com PNG URL for a country code at the given pixel width. */
export function flagUrl(code: string, width: 20 | 40 | 80 = 40): string {
  return `https://flagcdn.com/w${width}/${code.toLowerCase()}.png`;
}
