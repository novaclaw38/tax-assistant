const formatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatRand(amount: number): string {
  return formatter.format(Math.abs(amount)).replace("ZAR", "R").replace("R", "R ");
}

/**
 * Translates an ITSA balance into plain language honoring SARS's printed
 * sign convention: negative = credit owed to the taxpayer (a refund),
 * positive = amount owed to SARS. Never show the raw signed number to a user.
 */
export function describeItsaBalance(amount: number): { label: string; tone: "refund" | "owing" | "neutral" } {
  if (amount < 0) {
    return { label: `SARS owes you ${formatRand(amount)}`, tone: "refund" };
  }
  if (amount > 0) {
    return { label: `You owe SARS ${formatRand(amount)}`, tone: "owing" };
  }
  return { label: "Your account balance is R 0.00", tone: "neutral" };
}

export function describeIta34Balance(
  amount: number,
  direction: "refund_to_taxpayer" | "payable_by_taxpayer" | "zero",
): { label: string; tone: "refund" | "owing" | "neutral" } {
  if (direction === "refund_to_taxpayer") {
    return { label: `SARS owes you ${formatRand(amount)}`, tone: "refund" };
  }
  if (direction === "payable_by_taxpayer") {
    return { label: `You owe SARS ${formatRand(amount)}`, tone: "owing" };
  }
  return { label: "Your account balance is R 0.00", tone: "neutral" };
}
