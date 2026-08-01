import { AlertTriangle, Info, OctagonAlert } from "lucide-react";
import type { AnomalyFlag } from "../lib/types";

const styles = {
  critical: {
    wrap: "border-rust-600/30 bg-rust-50",
    icon: "text-rust-600",
    Icon: OctagonAlert,
    label: "Needs attention",
    labelClass: "text-rust-700",
  },
  warning: {
    wrap: "border-gold-500/35 bg-gold-50",
    icon: "text-gold-600",
    Icon: AlertTriangle,
    label: "Worth checking",
    labelClass: "text-gold-700",
  },
  info: {
    wrap: "border-ink-300 bg-paper-dim",
    icon: "text-ink-500",
    Icon: Info,
    label: "For your information",
    labelClass: "text-ink-600",
  },
} as const;

export function FlagCard({ flag }: { flag: AnomalyFlag }) {
  const s = styles[flag.severity];
  const Icon = s.Icon;
  return (
    <div className={`rounded-2xl border p-5 ${s.wrap}`}>
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${s.icon}`} strokeWidth={2} />
        <div className="min-w-0 flex-1">
          <div className={`text-xs font-semibold uppercase tracking-wide ${s.labelClass}`}>{s.label}</div>
          <h3 className="mt-1 font-display text-lg font-semibold text-ink-950">{flag.headline}</h3>
          <p className="mt-1.5 text-[15px] leading-relaxed text-ink-700">{flag.detail}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-900">
            <span className="font-semibold">What to do: </span>
            {flag.action}
          </p>
        </div>
      </div>
    </div>
  );
}
