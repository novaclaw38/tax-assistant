import type { Confidence } from "../lib/types";

const styles: Record<Confidence, string> = {
  high: "bg-teal-100 text-teal-700",
  medium: "bg-gold-100 text-gold-700",
  low: "bg-rust-100 text-rust-700",
};

const labels: Record<Confidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence — please verify",
};

export function ConfidenceBadge({ level }: { level: Confidence }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[level]}`}>
      {labels[level]}
    </span>
  );
}
