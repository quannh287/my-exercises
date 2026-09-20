import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-white active:bg-accent/85",
  secondary: "bg-surface text-accent border border-line active:bg-line/40",
  danger: "bg-surface text-danger border border-line active:bg-line/40",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button
      className={`h-13 w-full rounded-full px-5 text-base font-semibold transition-colors disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
