export default function POSLoading() {
  // Lightweight skeleton shown during the server render so the manager never
  // sees a blank screen or a misleading "No products found" message.
  return (
    <div className="h-[100dvh] w-full bg-zinc-100 dark:bg-zinc-950 flex flex-col overflow-hidden">
      {/* Header bar skeleton */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-3 lg:p-4 flex justify-between items-center shrink-0">
        <div className="h-6 w-40 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Menu grid skeleton */}
        <div className="flex-1 flex flex-col pt-3 lg:pt-4 px-3 lg:px-6">
          <div className="flex gap-2 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-20 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[150px] lg:h-[180px] rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 lg:p-4 flex flex-col justify-between">
                <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-8 w-full rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="h-8 w-full rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart panel skeleton */}
        <div className="hidden lg:flex w-[400px] min-w-[350px] h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex-col p-5">
          <div className="h-6 w-32 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-6" />
          <div className="flex-1 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
