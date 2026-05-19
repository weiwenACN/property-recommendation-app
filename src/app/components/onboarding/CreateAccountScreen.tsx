import { useCallback, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { StarHomesLogo } from '../common/StarHomesLogo';

interface CreateAccountScreenProps {
  onBack: () => void;
  onRegister: (countryCode: string, phoneNumber: string) => void;
}

interface Country {
  code: string;
  label: string;
  name: string;
  placeholder: string;
  maxDigits: number;
}

const COUNTRIES: Country[] = [
  { code: '+44', label: '🇬🇧 +44', name: 'United Kingdom', placeholder: '7XXX XXXXXX', maxDigits: 11 },
  { code: '+1',  label: '🇺🇸 +1',  name: 'United States',  placeholder: '(XXX) XXX-XXXX', maxDigits: 10 },
  { code: '+1c', label: '🇨🇦 +1',  name: 'Canada',         placeholder: '(XXX) XXX-XXXX', maxDigits: 10 },
  { code: '+61', label: '🇦🇺 +61', name: 'Australia',      placeholder: '4XX XXX XXX',     maxDigits: 9 },
  { code: '+91', label: '🇮🇳 +91', name: 'India',          placeholder: 'XXXXX XXXXX',     maxDigits: 10 },
  { code: '+49', label: '🇩🇪 +49', name: 'Germany',        placeholder: '1XX XXXXXXX',     maxDigits: 11 },
  { code: '+33', label: '🇫🇷 +33', name: 'France',         placeholder: '6 XX XX XX XX',   maxDigits: 9 },
  { code: '+65', label: '🇸🇬 +65', name: 'Singapore',      placeholder: 'XXXX XXXX',       maxDigits: 8 },
  { code: '+971',label: '🇦🇪 +971',name: 'United Arab Emirates', placeholder: '5X XXX XXXX', maxDigits: 9 },
  { code: '+64', label: '🇳🇿 +64', name: 'New Zealand',    placeholder: '2X XXX XXXX',     maxDigits: 9 },
];

// Built once at module load; the <option> list never changes so there's
// no reason to re-create these React elements on every keystroke.
const COUNTRY_OPTIONS = COUNTRIES.map((c) => (
  <option key={c.code} value={c.code}>
    {c.label}
  </option>
));

const COUNTRIES_BY_KEY = new Map(COUNTRIES.map((c) => [c.code, c]));

export function CreateAccountScreen({ onBack, onRegister }: CreateAccountScreenProps) {
  const [selectedKey, setSelectedKey] = useState<string>('+44');
  const [phoneNumber, setPhoneNumber] = useState('');

  const derived = useMemo(() => {
    const country = COUNTRIES_BY_KEY.get(selectedKey) ?? COUNTRIES[0];
    return {
      country,
      dialingCode: country.code.replace(/c$/, ''),
      minDigits: Math.max(7, country.maxDigits - 2),
    };
  }, [selectedKey]);

  const isValid = phoneNumber.length >= derived.minDigits;

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, derived.country.maxDigits);
      setPhoneNumber(digits);
    },
    [derived.country.maxDigits],
  );

  const handleCountryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKey(e.target.value);
    setPhoneNumber('');
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isValid) {
        onRegister(derived.dialingCode, phoneNumber);
      }
    },
    [isValid, onRegister, derived.dialingCode, phoneNumber],
  );

  return (
    <div className="flex flex-col h-full min-h-0 bg-white px-6 pt-safe pb-safe overflow-y-auto">
      <div className="py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#0F0C2E] hover:text-[#3C3489] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-8">
          <StarHomesLogo variant="dark" className="mb-6" />
          <h1 className="text-3xl font-semibold text-[#0F0C2E] mb-3">Create your account</h1>
          <p className="text-gray-600">Enter your mobile number to register</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#0F0C2E] mb-2">
              Mobile Number
            </label>
            <div className="flex items-center">
              <div className="relative">
                <select
                  aria-label="Country code"
                  value={selectedKey}
                  onChange={handleCountryChange}
                  className="h-14 pl-4 pr-9 bg-[#F7F6FB] border border-[#e5e7eb] rounded-l-xl text-[#0F0C2E] font-medium appearance-none cursor-pointer focus:outline-none focus:ring-[1.5px] focus:ring-[#7F77DD] focus:border-transparent"
                >
                  {COUNTRY_OPTIONS}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-[#0F0C2E] pointer-events-none" />
              </div>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder={derived.country.placeholder}
                className="flex-1 h-14 px-4 bg-[#F7F6FB] border border-l-0 border-[#e5e7eb] rounded-r-xl focus:outline-none focus:ring-[1.5px] focus:ring-[#7F77DD] focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {derived.country.name} &middot; format {derived.country.placeholder}
            </p>
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className="w-full bg-[#3C3489] text-white py-4 rounded-xl hover:bg-[#2d2766] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg shadow-[#3C3489]/20"
          >
            Register
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-8">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
