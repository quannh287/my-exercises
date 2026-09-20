"use client";

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
};

export function NumberStepper({ label, value, onChange, min = 1, max = 999, step = 1, suffix }: Props) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const btn =
    "size-11 shrink-0 rounded-full bg-bg text-xl leading-none text-accent disabled:opacity-30 active:bg-line";

  return (
    <div className="flex min-h-13 items-center gap-3 px-4 py-2 not-last:border-b not-last:border-line">
      <span className="flex-1 text-base">{label}</span>
      <button type="button" className={btn} onClick={() => onChange(clamp(value - step))} disabled={value <= min} aria-label={`Giảm ${label}`}>
        −
      </button>
      <span className="w-14 text-center font-mono text-base tabular-nums">
        {value}
        {suffix ? <span className="text-muted">{suffix}</span> : null}
      </span>
      <button type="button" className={btn} onClick={() => onChange(clamp(value + step))} disabled={value >= max} aria-label={`Tăng ${label}`}>
        +
      </button>
    </div>
  );
}
