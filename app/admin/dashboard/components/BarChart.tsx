// Presentational server component — renders a lightweight bar chart with plain CSS
// (no charting library, no client JavaScript), so it adds nothing to page load.
export default function BarChart({
  title,
  data,
  accent = "bg-amber-500",
}: {
  title: string;
  data: { label: string; value: number }[];
  accent?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const peak = data.reduce((best, d) => (d.value > best.value ? d : best), data[0] ?? { label: "", value: 0 });

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex justify-between items-baseline mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">{title}</h2>
        <span className="text-sm font-bold text-zinc-900 dark:text-white">{total.toLocaleString()} RWF</span>
      </div>
      <div className="flex items-end gap-1 h-32">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col justify-end items-center h-full"
            title={`${d.label}: ${d.value.toLocaleString()} RWF`}
          >
            <div
              className={`w-full rounded-t ${d.value > 0 ? accent : "bg-zinc-100 dark:bg-zinc-800"} transition-all`}
              style={{ height: `${Math.max(d.value > 0 ? 4 : 2, (d.value / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1 mt-2">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[9px] text-zinc-400 truncate">
            {d.label}
          </span>
        ))}
      </div>
      {peak.value > 0 && (
        <p className="text-xs text-zinc-400 mt-3">
          Peak: <span className="font-semibold text-zinc-600 dark:text-zinc-300">{peak.label}</span> · {peak.value.toLocaleString()} RWF
        </p>
      )}
    </div>
  );
}
