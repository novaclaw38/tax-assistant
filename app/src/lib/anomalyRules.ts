import type { AnomalyFlag, SourceDocument } from "./types";

/**
 * Structural anomaly pass, run before any routine summary content —
 * per the product scope doc's finding that the real value of this product
 * is surfacing fine-print blockers on the first screen, not the fifth page.
 */
export function getAnomalyFlags(doc: SourceDocument): AnomalyFlag[] {
  const flags: AnomalyFlag[] = [];

  if (doc.document_type === "ITA34") {
    if (doc.taxpayer_profile === "salaried" && doc.income_breakdown.employment_income_irp5 === 0) {
      flags.push({
        id: "r0-income",
        severity: "critical",
        headline: "Your assessed income is R0",
        detail:
          "SARS has assessed your employment income (IRP5/IT3(a)) as R0 for this tax year, even though your profile indicates you were salaried. This usually means your employer's IRP5 either wasn't submitted to SARS or wasn't matched to your account.",
        action: "Check with your employer that your IRP5 was submitted, and compare this assessment against your actual payslips for the year before accepting it.",
      });
    }

    if (doc.refund_status.state === "withheld") {
      flags.push({
        id: "refund-withheld",
        severity: "critical",
        headline: "Your refund is being withheld, not paid out",
        detail: doc.refund_status.note ?? "SARS has flagged this refund as withheld pending further action.",
        action: doc.refund_status.banking_details_on_file
          ? "Check eFiling for the specific reason this refund is on hold."
          : "Log into eFiling and update your banking details, then confirm the refund is released.",
      });
    }

    if (doc.compliance.selected_for_audit_or_verification) {
      flags.push({
        id: "audit-flag",
        severity: "critical",
        headline: "This assessment has been selected for audit or verification",
        detail: "SARS may request supporting documents before finalising this assessment.",
        action: "Check eFiling for any outstanding document requests and respond before the deadline shown there.",
      });
    }
  }

  if (doc.document_type === "ITSA") {
    const issueDate = new Date(doc.issue_date);
    for (const txn of doc.transactions) {
      if (new Date(txn.date) > issueDate) {
        flags.push({
          id: `future-txn-${txn.reference}`,
          severity: "warning",
          headline: `An entry is dated after this statement was issued`,
          detail: `"${txn.description}" is dated ${formatDateShort(txn.date)}, after this statement's issue date of ${formatDateShort(doc.issue_date)}.`,
          action: "Worth checking on eFiling — this looks like a scheduled or pending entry rather than something to act on immediately.",
        });
      }
    }

    if (doc.compliance.selected_for_audit_or_verification) {
      flags.push({
        id: "audit-flag",
        severity: "critical",
        headline: "This account has been selected for audit or verification",
        detail: "SARS may request supporting documents before finalising the related assessment.",
        action: "Check eFiling for any outstanding document requests.",
      });
    }

    if (doc.compliance.outstanding_returns) {
      flags.push({
        id: "outstanding-returns",
        severity: "warning",
        headline: "SARS shows outstanding returns on this account",
        detail: "One or more tax returns appear not to have been filed yet.",
        action: "Check which tax years are outstanding on eFiling and file them to avoid penalties.",
      });
    }
  }

  if (doc.compliance.unprocessed_payments > 0) {
    flags.push({
      id: "unprocessed-payments",
      severity: "info",
      headline: "There are unprocessed payments on this account",
      detail: `R${doc.compliance.unprocessed_payments.toFixed(2)} in payments hasn't been fully processed yet.`,
      action: "This can take a few days to clear — worth checking again before assuming it's an error.",
    });
  }

  return flags;
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
