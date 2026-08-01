import { Check } from "lucide-react";
import type { ReactNode } from "react";

interface ReviewFieldProps {
  label: string;
  fieldKey: string;
  needsReview: boolean;
  confirmed: boolean;
  onConfirm: (fieldKey: string) => void;
  children: ReactNode;
}

export function ReviewField({ label, fieldKey, needsReview, confirmed, onConfirm, children }: ReviewFieldProps) {
  const flagged = needsReview && !confirmed;
  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        flagged ? "border-gold-500/50 bg-gold-50" : "border-line bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-500">{label}</label>
          <div className="mt-1.5">{children}</div>
        </div>
        {needsReview && (
          <button
            type="button"
            onClick={() => onConfirm(fieldKey)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              confirmed
                ? "bg-teal-100 text-teal-700"
                : "bg-gold-500 text-white hover:bg-gold-600"
            }`}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            {confirmed ? "Confirmed" : "Confirm this value"}
          </button>
        )}
      </div>
    </div>
  );
}
