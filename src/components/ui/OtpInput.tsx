import React, { useRef, useEffect, useState } from 'react';

interface OtpInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
    length = 6,
    value,
    onChange,
    error,
    disabled = false
}) => {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Sync internal state with external value prop
        if (value) {
            const valueArray = value.split('').slice(0, length);
            if (valueArray.length < length) {
                // Pad with empty strings if value is shorter
                const padded = [...valueArray, ...new Array(length - valueArray.length).fill("")];
                setOtp(padded);
            } else {
                setOtp(valueArray);
            }
        } else {
            setOtp(new Array(length).fill(""));
        }
    }, [value, length]);

    const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (isNaN(Number(val))) return;

        const newOtp = [...otp];
        // Take the last character entered
        newOtp[index] = val.substring(val.length - 1);
        setOtp(newOtp);
        onChange(newOtp.join(""));

        // Move to next input if value is entered
        if (val && index < length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            // Move to previous input on backspace if current is empty
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text/plain").slice(0, length);
        if (!/^\d+$/.test(pastedData)) return; // Only allow numbers

        const newOtp = [...otp];
        pastedData.split('').forEach((char, index) => {
            if (index < length) newOtp[index] = char;
        });
        setOtp(newOtp);
        onChange(newOtp.join(""));

        // Focus either the last filled input or the first empty one
        const focusIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[focusIndex]?.focus();
    };

    return (
        <div className='flex flex-col items-center justify-center w-full'>
            <div className="flex gap-2 sm:gap-4 justify-center w-full">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(ref) => {
                            inputRefs.current[index] = ref;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        disabled={disabled}
                        className={`
              w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl
              bg-gray-50 dark:bg-[#0B0E14]/50
              border-2 
              ${error
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20'
                            }
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-4
              transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
                    />
                ))}
            </div>
            {error && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 animate-slide-in-down">
                    {error}
                </p>
            )}
        </div>
    );
};
