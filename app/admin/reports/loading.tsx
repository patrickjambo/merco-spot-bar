import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400 font-bold animate-pulse text-lg">Fetching live data...</p>
      </div>
    </div>
  );
}
