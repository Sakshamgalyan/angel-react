'use client';

import clsx from 'clsx';

export interface TabItem<T extends string> {
    id: T;
    label: string;
}

interface TabsProps<T extends string> {
    tabs: TabItem<T>[];
    activeTab: T;
    onChange: (tab: T) => void;
    className?: string;
    fullWidth?: boolean;
}

export function Tabs<T extends string>({
    tabs,
    activeTab,
    onChange,
    className,
    fullWidth = false,
}: TabsProps<T>) {
    return (
        <div
            className={clsx(
                'rounded-lg bg-gray-100 p-1',
                fullWidth ? 'flex w-full' : 'inline-flex',
                className
            )}
        >
            {tabs.map((tab) => {
                const isActive = tab.id === activeTab;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={clsx(
                            'px-4 py-2 text-sm rounded-md transition-all',
                            fullWidth && 'flex-1',
                            isActive
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-200'
                        )}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
