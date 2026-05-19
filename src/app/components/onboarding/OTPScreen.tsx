import { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface OTPScreenProps {
  phoneNumber: string;
  countryCode?: string;
  onVerify: () => void;
  onBack: () => void;
}

export function OTPScreen({ phoneNumber, countryCode = '+44', onVerify, onBack }: OTPScreenProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      setTimeout(() => onVerify(), 500);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white px-4 sm:px-6 overflow-y-auto">
      <div className="py-3 sm:py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#0F0C2E] hover:text-[#3C3489] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full pb-6 sm:pb-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#0F0C2E] mb-2 sm:mb-3">Enter verification code</h1>
          <p className="text-sm sm:text-base text-gray-600">
            We've sent a 6-digit code to{' '}
            <span className="font-medium text-[#0F0C2E] whitespace-nowrap">
              {countryCode} {phoneNumber}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-6 gap-1.5 xs:gap-2 sm:gap-3 mb-6 sm:mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              aria-label={`Digit ${index + 1} of 6`}
              className="aspect-square w-full min-w-0 text-center text-lg sm:text-2xl font-semibold bg-[#F7F6FB] border-2 border-[#e5e7eb] rounded-lg sm:rounded-xl focus:outline-none focus:ring-[1.5px] focus:ring-[#7F77DD] focus:border-transparent"
            />
          ))}
        </div>

        <button className="text-[#3C3489] font-medium text-center hover:underline">
          Resend code
        </button>
      </div>
    </div>
  );
}
