'use client';

import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    disabled?: boolean;
}

interface DropDownProps {
    options: DropdownOption[];
    value?: string | number | null;
    onChange?: (option: DropdownOption) => void;
    placeholder?: string;
    className?: string;
    trigger?: React.ReactNode;
    align?: 'left' | 'right';
    disabled?: boolean;
    width?: string;
    label?: string;
}

export default function DropDown({
    options,
    value,
    onChange,
    placeholder = 'Select option',
    className,
    trigger,
    align = 'left',
    disabled = false,
    width = 'w-full',
    label,
}: DropDownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (option: DropdownOption) => {
        if (disabled || option.disabled) return;
        if (onChange) onChange(option);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        if (!disabled) setIsOpen(!isOpen);
    };

    return (
        <div
            ref={dropdownRef}
            className={clsx('relative inline-block text-left space-y-1', width, className)}
        >
            {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
            <div onClick={toggleDropdown} className="cursor-pointer">
                {trigger ? (
                    trigger
                ) : (
                    <button
                        type="button"
                        disabled={disabled}
                        className={clsx(
                            'flex items-center mt-1 justify-between w-full px-4.5 py-2.5 text-sm font-medium text-left border rounded-lg focus:outline-none transition-colors',
                            'bg-white',
                            'border-zinc-300',
                            'text-zinc-900',
                            disabled && 'opacity-50 cursor-not-allowed',
                            isOpen && 'ring-1 ring-black border-zinc-300'
                        )}
                    >
                        <span className="truncate flex items-center gap-2">
                            {selectedOption?.icon && (
                                <span className="text-zinc-400">{selectedOption.icon}</span>
                            )}
                            {selectedOption ? selectedOption.label : <span className="text-zinc-500">{placeholder}</span>}
                        </span>
                        <ChevronDown
                            className={clsx(
                                'w-4 h-4 ml-2 transition-transform duration-200 text-zinc-400',
                                isOpen && 'rotate-180'
                            )}
                        />
                    </button>
                )}
            </div>

            {isOpen && (
                <div
                    className={clsx(
                        'absolute z-50 origin-top-right rounded-lg shadow-lg ring-1 ring-black ring-opacity-5',
                        'bg-white border border-zinc-200',
                        align === 'right' ? 'right-0' : 'left-0',
                        'w-full min-w-[140px]'
                    )}
                >
                    <div className="py-1 max-h-60 overflow-auto divide-y divide-zinc-100">
                        {options.length > 0 ? (
                            options.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option)}
                                    className={clsx(
                                        'flex items-center justify-between px-4 py-2 text-sm cursor-pointer transition-colors',
                                        'hover:bg-zinc-100',
                                        option.disabled
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'text-zinc-700',
                                        value === option.value && 'bg-blue-50 text-blue-600'
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        {option.icon && <span className="text-zinc-400">{option.icon}</span>}
                                        <span className={clsx("font-medium", value === option.value && "font-semibold")}>
                                            {option.label}
                                        </span>
                                    </div>
                                    {value === option.value && (
                                        <Check className="w-4 h-4 text-blue-600" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-sm text-zinc-500 text-center">
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
