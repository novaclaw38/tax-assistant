import { jsPDF } from "jspdf";
import type { Assessment } from "./types";
import { DEDUCTION_PROMPTS } from "./deductionPrompts";
import { getAnomalyFlags } from "./anomalyRules";
import { describeIta34Balance, describeItsaBalance, formatRand } from "./money";

const MARGIN = 20;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

export function buildFilingChecklistPdf(assessment: Assessment): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  const heading = (text: string, size = 16) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(16, 26, 46);
    doc.text(text, MARGIN, y);
    y += size * 0.5;
  };

  const body = (text: string, size = 10) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(60, 70, 90);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
    doc.text(lines, MARGIN, y);
    y += lines.length * (size * 0.45) + 3;
  };

  const rule = () => {
    doc.setDrawColor(226, 221, 205);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 6;
  };

  heading("TaxAssist — Filing-day checklist", 18);
  body(`Tax year ${assessment.taxYear} · Generated ${new Date().toLocaleDateString("en-ZA")}`, 9);
  y += 2;
  rule();

  const source = assessment.document;
  heading("Your bottom line", 13);
  if (source.document_type === "ITA34") {
    const balance = describeIta34Balance(source.balance.amount, source.balance.direction);
    body(balance.label);
  } else {
    const balance = describeItsaBalance(source.account_summary.balance);
    body(balance.label);
  }
  y += 2;

  const flags = getAnomalyFlags(source);
  if (flags.length > 0) {
    heading("Resolve before you file", 13);
    for (const flag of flags) {
      body(`• ${flag.headline}`, 10);
      body(flag.action, 9);
      y += 1;
    }
  }

  rule();
  heading("Deductions to verify", 13);
  const answeredYes = DEDUCTION_PROMPTS.filter((p) => assessment.gapCheckResponses[p.code]?.answer === true);
  if (answeredYes.length === 0) {
    body("No deduction categories flagged — run the gap-check for this assessment before filing.", 10);
  } else {
    for (const prompt of answeredYes) {
      body(`[ ] ${prompt.question}`, 10);
    }
  }

  if (assessment.freelanceEntries.length > 0) {
    rule();
    heading("Freelance / side income to declare", 13);
    let totalIncome = 0;
    let totalExpense = 0;
    for (const entry of assessment.freelanceEntries) {
      body(`${entry.description}: ${formatRand(entry.incomeAmount)} income, ${formatRand(entry.expenseAmount)} expenses`, 10);
      totalIncome += entry.incomeAmount;
      totalExpense += entry.expenseAmount;
    }
    body(`Total: ${formatRand(totalIncome)} income, ${formatRand(totalExpense)} expenses`, 10);
  }

  rule();
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(120, 128, 145);
  doc.text(
    doc.splitTextToSize(
      "TaxAssist is an explainer and checklist tool, not a registered tax practitioner service. It does not file on your behalf and does not guarantee a refund. Confirm all figures on eFiling before submitting.",
      CONTENT_WIDTH,
    ),
    MARGIN,
    y,
  );

  return doc;
}
