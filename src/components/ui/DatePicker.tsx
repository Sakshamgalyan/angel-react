'use client';

import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface DatePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    label?: string;
    value?: Date | null;
    onChange?: (date: Date) => void;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
    minDate?: Date;
    maxDate?: Date;
    showTime?: boolean;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

export default function DatePicker({
    label,
    value,
    onChange,
    error,
    placeholder = 'Select date',
    className,
    disabled = false,
    minDate,
    maxDate,
    showTime = false,
    ...props
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // View state (which month/year we are looking at)
    const [viewDate, setViewDate] = useState(value || new Date());

    // Time state (separate from viewDate to avoid automatic updates on month change if we just want to update time)
    // Actually, keeping them in sync with value or viewDate is fine. 
    // If we change time, we probably want to update the value immediately if one is selected.

    useEffect(() => {
        if (value) {
            setViewDate(new Date(value));
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
        // Keep the time from the current viewDate or value
        newDate.setHours(viewDate.getHours(), viewDate.getMinutes(), viewDate.getSeconds());
        setViewDate(newDate);
    };

    const handleDateSelect = (day: number) => {
        if (disabled) return;
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        // Preserve time if it was already selected or use viewDate time (which might be current time or previous selection)
        newDate.setHours(viewDate.getHours(), viewDate.getMinutes(), viewDate.getSeconds());

        if (onChange) onChange(newDate);
        if (!showTime) {
            setIsOpen(false);
        } else {
            // If showing time, maybe update viewDate so the calendar stays on the selected date
            setViewDate(newDate);
        }
    };

    const handleTimeChange = (type: 'hours' | 'minutes' | 'seconds', val: number) => {
        if (disabled) return;
        const newDate = new Date(value || viewDate); // Use value if exists, else viewDate (which defaults to now)

        if (type === 'hours') newDate.setHours(val);
        if (type === 'minutes') newDate.setMinutes(val);
        if (type === 'seconds') newDate.setSeconds(val);

        // If we haven't selected a date yet (value is null), we should probably set today as date?
        // Or just update the viewDate and let them pick a date. 
        // Usually standard date pickers apply time to the *selected* date.

        if (onChange) onChange(newDate);
        setViewDate(newDate);
    }

    const isSelected = (day: number) => {
        if (!value) return false;
        return (
            value.getDate() === day &&
            value.getMonth() === viewDate.getMonth() &&
            value.getFullYear() === viewDate.getFullYear()
        );
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            today.getDate() === day &&
            today.getMonth() === viewDate.getMonth() &&
            today.getFullYear() === viewDate.getFullYear()
        );
    };

    const renderCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days: React.ReactNode[] = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const isDateDisabled = (minDate && currentDate < minDate) || (maxDate && currentDate > maxDate);

            days.push(
                <button
                    key={day}
                    type="button"
                    onClick={() => !isDateDisabled && handleDateSelect(day)}
                    disabled={isDateDisabled}
                    className={clsx(
                        "w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors",
                        isDateDisabled ? "text-zinc-300 cursor-not-allowed" : "hover:bg-blue-100 cursor-pointer",
                        isSelected(day) && "bg-blue-600 text-white hover:bg-blue-700",
                        !isSelected(day) && isToday(day) && "text-blue-600 font-semibold",
                        !isSelected(day) && !isDateDisabled && "text-zinc-700"
                    )}
                >
                    {day}
                </button>
            );
        }
        return days;
    };

    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        };
        if (showTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
            options.second = '2-digit';
        }
        return date.toLocaleString('en-US', options);
    };

    // Helper for time inputs
    const TimeInput = ({
        value,
        max,
        onChange
    }: {
        value: number,
        max: number,
        onChange: (val: number) => void
    }) => (
        <input
            type="number"
            min={0}
            max={max}
            value={value.toString().padStart(2, '0')} // display as 2 digits
            onChange={(e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val)) val = 0;
                if (val < 0) val = 0;
                if (val > max) val = max;
                onChange(val);
            }}
            className="w-12 p-1 text-center bg-zinc-50 border border-zinc-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
    );

    return (
        <div className={clsx("w-full space-y-1", className)} ref={containerRef}>
            {label && <label className="text-sm font-medium text-gray-800">{label}</label>}

            <div className="relative">
                <div
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={clsx(
                        "flex items-center mt-1 justify-between w-full px-4.5 py-2.5 text-sm text-left border rounded-lg cursor-pointer transition-colors",
                        "bg-white",
                        "border-zinc-300",
                        "focus-visible:ring-2 focus-visible:ring-blue-500",
                        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-50",
                        error && "border-red-500",
                        isOpen && "ring-2 ring-blue-500/20 border-blue-500"
                    )}
                >
                    <span className={clsx(!value && "text-zinc-500", value && "text-zinc-900")}>
                        {value ? formatDate(value) : placeholder}
                    </span>
                    <CalendarIcon className="w-4 h-4 text-zinc-400" />
                </div>

                {isOpen && (
                    <div className="absolute z-50 mt-2 p-4 bg-white border border-zinc-200 rounded-xl shadow-xl min-w-[300px]">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={() => changeMonth(-1)}
                                className="p-1 hover:bg-zinc-100 rounded-full transition-colors"
                                title="Previous month"
                            >
                                <ChevronLeft className="w-4 h-4 text-zinc-600" />
                            </button>
                            <span className="text-sm font-semibold text-zinc-900">
                                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                            </span>
                            <button
                                type="button"
                                onClick={() => changeMonth(1)}
                                className="p-1 hover:bg-zinc-100 rounded-full transition-colors"
                                title="Next month"
                            >
                                <ChevronRight className="w-4 h-4 text-zinc-600" />
                            </button>
                        </div>

                        {/* Days Header */}
                        <div className="grid grid-cols-7 mb-2 text-center">
                            {DAYS.map((day) => (
                                <div key={day} className="text-xs font-medium text-zinc-400 uppercase">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 place-items-center mb-2">
                            {renderCalendarDays()}
                        </div>

                        {/* Time Selection */}
                        {showTime && (
                            <div className="pt-3 mt-2 border-t border-zinc-100">
                                <div className="flex items-center gap-2 text-sm text-zinc-600 mb-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Time</span>
                                </div>
                                <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] text-zinc-400 mb-0.5">Hr</span>
                                            <TimeInput
                                                value={(value || viewDate).getHours()}
                                                max={23}
                                                onChange={(v) => handleTimeChange('hours', v)}
                                            />
                                        </div>
                                        <span className="text-zinc-400 mt-4">:</span>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] text-zinc-400 mb-0.5">Min</span>
                                            <TimeInput
                                                value={(value || viewDate).getMinutes()}
                                                max={59}
                                                onChange={(v) => handleTimeChange('minutes', v)}
                                            />
                                        </div>
                                        <span className="text-zinc-400 mt-4">:</span>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] text-zinc-400 mb-0.5">Sec</span>
                                            <TimeInput
                                                value={(value || viewDate).getSeconds()}
                                                max={59}
                                                onChange={(v) => handleTimeChange('seconds', v)}
                                            />
                                        </div>
                                    </div>
                                    {/* Optional "Now" button could go here */}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}