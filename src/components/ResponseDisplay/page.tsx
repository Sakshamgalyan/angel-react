"use client";

import React from 'react';
import type { ResponseShape } from '@/types/types';

const ResponseDisplay = React.memo(({ response }: { response?: ResponseShape | null }) => {
  if (!response) return null;

  const pretty = response.data ? JSON.stringify(response.data as Record<string, unknown>, null, 2) : undefined;

  return (
    <div 
      id="response" 
      className={`mt-6 p-4 md:p-6 rounded-xl border ${response.type === 'error' ? 'border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800' : 'border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800'}`}
      role="alert"
      aria-live="polite"
    >
      <div className={`font-semibold mb-3 ${response.type === 'error' ? 'text-red-900 dark:text-red-400' : 'text-green-900 dark:text-green-400'}`}>
        {response.message}
      </div>
      {pretty && (
        <pre className="mt-3 p-4 text-xs overflow-auto max-h-96 bg-gray-900 dark:bg-gray-950 text-green-400 rounded-lg font-mono">
          {pretty}
        </pre>
      )}
    </div>
  );
});

ResponseDisplay.displayName = 'ResponseDisplay';

export default ResponseDisplay;
