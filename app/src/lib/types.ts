export type Confidence = "high" | "medium" | "low";
export type ExtractionPath = "pdf_text" | "vision_fallback";
export type TaxpayerProfile = "salaried" | "freelance" | "mixed";

export interface FigureTriplet {
  previous: number;
  current: number;
  adjustment: number;
}

export interface ITA34Document {
  document_type: "ITA34";
  reference_number: string;
  document_number: string;
  date_of_assessment: string;
  year_of_assessment: number;
  assessment_type: "Original" | "Additional" | "Reduced" | "Original Estimate";
  payment_due_date: string | null;
  grace_period_until: string | null;
  prn_number: string | null;
  balance: {
    description: string;
    amount: number;
    direction: "refund_to_taxpayer" | "payable_by_taxpayer" | "zero";
  };
  compliance: {
    unprocessed_payments: number;
    provisional_taxpayer: boolean;
    selected_for_audit_or_verification: boolean;
  };
  assessment_summary: {
    income: FigureTriplet;
    deductions_allowed: FigureTriplet;
    taxable_income: FigureTriplet;
    calculated_tax_liability: FigureTriplet;
  };
  income_breakdown: {
    employment_income_irp5: number;
  };
  refund_status: {
    state: "payable" | "withheld" | "not_applicable";
    note: string | null;
    banking_details_on_file: boolean;
  };
  taxpayer_profile: TaxpayerProfile;
  extraction_confidence: Confidence;
  extraction_path: ExtractionPath;
  raw_fields_needing_review: string[];
}

export interface ITSATransaction {
  date: string;
  reference: string;
  description: string;
  tax_year: number | null;
  value: number;
  running_balance: number;
}

export interface ITSADocument {
  document_type: "ITSA";
  reference_number: string;
  issue_date: string;
  statement_period: { from: string; to: string };
  account_summary: {
    balance_brought_forward: number;
    assessment: number;
    balance: number;
  };
  transactions: ITSATransaction[];
  compliance: {
    unprocessed_payments: number;
    provisional_taxpayer: boolean;
    selected_for_audit_or_verification: boolean;
    outstanding_returns: boolean;
  };
  refund_advice: {
    refund_amount: number | null;
    note: string;
  };
  sign_convention: string;
  taxpayer_profile: TaxpayerProfile;
  extraction_confidence: Confidence;
  extraction_path: ExtractionPath;
  raw_fields_needing_review: string[];
}

export type SourceDocument = ITA34Document | ITSADocument;

export type FlagSeverity = "critical" | "warning" | "info";

export interface AnomalyFlag {
  id: string;
  severity: FlagSeverity;
  headline: string;
  detail: string;
  action: string;
}

export interface DeductionPrompt {
  code: string;
  question: string;
  explanation: string;
  appliesTo: TaxpayerProfile[];
}

export interface GapCheckResponse {
  answer: boolean | null;
  note: string;
}

export interface FreelanceEntry {
  id: string;
  description: string;
  incomeAmount: number;
  expenseAmount: number;
}

export type AssessmentStage =
  | "uploaded"
  | "reviewed"
  | "gap_checked"
  | "exported";

export interface Assessment {
  id: string;
  taxYear: number;
  createdAt: string;
  stage: AssessmentStage;
  document: SourceDocument;
  confirmedFields: string[];
  gapCheckResponses: Record<string, GapCheckResponse>;
  freelanceEntries: FreelanceEntry[];
}
