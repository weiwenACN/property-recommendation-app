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
    <div className="flex flex-col min-h-screen bg-white px-6">
      <div className="py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#1a2332] hover:text-[#ff6b35] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a2332] mb-3">Enter verification code</h1>
          <p className="text-gray-600">
            We've sent a 6-digit code to<br />
            <span className="font-medium text-[#1a2332]">{countryCode} {phoneNumber}</span>
          </p>
        </div>

        <div className="flex gap-3 mb-8">
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
              className="flex-1 h-16 text-center text-2xl font-bold bg-[#f9fafb] border-2 border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
            />
          ))}
        </div>

        <button className="text-[#ff6b35] font-medium text-center hover:underline">
          Resend code
        </button>
      </div>
    </div>
  );
}
