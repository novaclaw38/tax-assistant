import type { ITA34Document, ITSADocument } from "./types";

/**
 * Seeded from the two real (anonymized) worked examples in the product
 * scope doc — the ITSA refund case and the ITA34 withheld-refund case.
 * Numbers are illustrative but internally consistent with the anomalies
 * each document is meant to demonstrate.
 */

export const SAMPLE_ITSA: ITSADocument = {
  document_type: "ITSA",
  reference_number: "9012345678",
  issue_date: "2026-08-01",
  statement_period: { from: "2026-01-01", to: "2026-08-01" },
  account_summary: {
    balance_brought_forward: 0,
    assessment: -3297.05,
    balance: -3297.05,
  },
  transactions: [
    {
      date: "2026-07-14",
      reference: "ITA34-2021-04",
      description: "Original assessment 2021",
      tax_year: 2021,
      value: -3297.05,
      running_balance: -3297.05,
    },
    {
      date: "2026-09-01",
      reference: "ITA34-2021-05",
      description: "Additional assessment 2021",
      tax_year: 2021,
      value: 0.0,
      running_balance: -3297.05,
    },
  ],
  compliance: {
    unprocessed_payments: 0,
    provisional_taxpayer: false,
    selected_for_audit_or_verification: false,
    outstanding_returns: false,
  },
  refund_advice: {
    refund_amount: 3297.05,
    note: "A refund is due and will be processed to your registered banking details.",
  },
  sign_convention: "negative = credit owed to taxpayer, per SARS's own printed note",
  taxpayer_profile: "salaried",
  extraction_confidence: "high",
  extraction_path: "pdf_text",
  raw_fields_needing_review: [],
};

export const SAMPLE_ITA34: ITA34Document = {
  document_type: "ITA34",
  reference_number: "9012345678",
  document_number: "ITA34-2021-04",
  date_of_assessment: "2026-07-14",
  year_of_assessment: 2021,
  assessment_type: "Original",
  payment_due_date: null,
  grace_period_until: null,
  prn_number: null,
  balance: {
    description: "Amount refundable",
    amount: 3297.05,
    direction: "refund_to_taxpayer",
  },
  compliance: {
    unprocessed_payments: 0,
    provisional_taxpayer: false,
    selected_for_audit_or_verification: false,
  },
  assessment_summary: {
    income: { previous: 0, current: 0, adjustment: 0 },
    deductions_allowed: { previous: 0, current: 0, adjustment: 0 },
    taxable_income: { previous: 0, current: 0, adjustment: 0 },
    calculated_tax_liability: { previous: 0, current: 0, adjustment: 0 },
  },
  income_breakdown: {
    employment_income_irp5: 0,
  },
  refund_status: {
    state: "withheld",
    banking_details_on_file: false,
    note:
      "This refund cannot be paid out as SARS does not hold valid banking details on file for this taxpayer. The refund will remain withheld until banking details are updated and confirmed via eFiling.",
  },
  taxpayer_profile: "salaried",
  extraction_confidence: "medium",
  extraction_path: "pdf_text",
  raw_fields_needing_review: ["income_breakdown.employment_income_irp5"],
};
