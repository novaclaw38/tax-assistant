import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-ink-900 text-paper hover:bg-ink-800",
  secondary: "bg-transparent text-ink-900 border border-ink-900/25 hover:border-ink-900/60 hover:bg-ink-900/5",
  ghost: "bg-transparent text-ink-700 hover:text-ink-900 hover:bg-ink-900/5",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({ variant = "primary", size = "md", className = "", children, ...rest }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

interface LinkButtonProps {
  to: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

export function LinkButton({ to, variant = "primary", size = "md", className = "", children }: LinkButtonProps) {
  return (
    <Link to={to} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </Link>
  );
}
