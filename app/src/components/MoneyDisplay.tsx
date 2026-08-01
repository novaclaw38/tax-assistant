const tones = {
  refund: "text-teal-700",
  owing: "text-rust-700",
  neutral: "text-ink-800",
} as const;

export function MoneyDisplay({
  label,
  tone,
  size = "lg",
}: {
  label: string;
  tone: "refund" | "owing" | "neutral";
  size?: "md" | "lg";
}) {
  return (
    <p
      className={`font-tabular font-display ${size === "lg" ? "text-3xl sm:text-4xl" : "text-xl"} font-semibold ${tones[tone]}`}
    >
      {label}
    </p>
  );
}
