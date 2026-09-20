import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-white active:bg-accent/85",
  secondary: "bg-surface text-accent border border-accent/30 active:bg-accent-soft",
  danger: "bg-surface text-danger border border-danger/30 active:bg-danger/10",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button
      className={`h-13 w-full rounded-card px-5 text-base font-semibold transition-colors disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
