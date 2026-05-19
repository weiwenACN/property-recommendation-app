import { useCallback, useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface SignUpScreenProps {
  onContinue: (phoneNumber: string) => void;
  onSignUp: () => void;
  onGuestAccess?: () => void;
}

const MAX_DIGITS = 11;

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length <= MAX_DIGITS ? digits : digits.slice(0, MAX_DIGITS);
}

export function SignUpScreen({ onContinue, onSignUp, onGuestAccess }: SignUpScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (phoneNumber.length >= 10) {
        onContinue(phoneNumber);
      }
    },
    [onContinue, phoneNumber],
  );

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0 bg-white px-6 pt-safe pb-safe overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#0F0C2E] mb-3">Welcome</h1>
          <p className="text-gray-600">Enter your mobile number to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#0F0C2E] mb-2">
              Mobile Number
            </label>
            <div className="flex items-center">
              <div className="flex items-center justify-center bg-[#F7F6FB] border border-[#e5e7eb] rounded-l-xl px-4 h-14">
                <span className="text-[#0F0C2E] font-medium">+44</span>
              </div>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="7XXX XXXXXX"
                className="flex-1 h-14 px-4 bg-[#F7F6FB] border border-l-0 border-[#e5e7eb] rounded-r-xl focus:outline-none focus:ring-[1.5px] focus:ring-[#7F77DD] focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={phoneNumber.length < 10}
            className="w-full bg-[#3C3489] text-white py-4 rounded-xl hover:bg-[#2d2766] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg shadow-[#3C3489]/20"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#e5e7eb]" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[#e5e7eb]" />
          </div>

          <button
            type="button"
            onClick={onSignUp}
            className="w-full bg-[#EEEDFE] text-[#3C3489] py-4 rounded-xl hover:bg-[#EEEDFE]/80 transition-colors font-medium"
          >
            Sign Up
          </button>

          {onGuestAccess && (
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={onGuestAccess}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline-offset-2 hover:underline"
              >
                Continue as guest
              </button>
            </div>
          )}
        </form>

        <p className="text-sm text-gray-500 text-center mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
