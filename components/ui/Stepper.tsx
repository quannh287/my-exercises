import { stepValue } from "@/lib/workout";

/** Big-touch number control: chalky hands and a sweaty screen, and no OS keyboard. */
export function Stepper({
  label,
  value,
  onChange,
  steps,
  min = 0,
  max = 999,
  unit,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** Positive magnitudes; each renders a − button on the left and a + on the right. */
  steps: number[];
  min?: number;
  max?: number;
  unit?: string;
}) {
  const jump = (delta: number) => {
    const next = stepValue(value, delta, min, max);
    if (next !== value) onChange(next);
  };

  const key = (delta: number) => (
    <button
      key={delta}
      type="button"
      onClick={() => jump(delta)}
      disabled={stepValue(value, delta, min, max) === value}
      aria-label={`${delta > 0 ? "Tăng" : "Giảm"} ${label} ${Math.abs(delta)}`}
      className="min-h-14 min-w-14 flex-1 rounded-card bg-surface font-mono text-base font-bold tabular-nums text-accent active:bg-accent-soft disabled:opacity-30"
    >
      {delta > 0 ? "+" : "−"}
      {Math.abs(delta)}
    </button>
  );

  return (
    <div className="rounded-card bg-bg p-3">
      <span className="block text-[0.65rem] font-semibold uppercase tracking-wide text-muted">{label}</span>
      <div className="mt-2 flex items-stretch gap-2">
        {[...steps].reverse().map((s) => key(-s))}
        <span className="grid min-w-16 flex-1 place-items-center font-mono text-2xl font-bold tabular-nums">
          {value}
          {unit ? <span className="text-xs font-semibold text-muted">{unit}</span> : null}
        </span>
        {steps.map((s) => key(s))}
      </div>
    </div>
  );
}
