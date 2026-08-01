import { Link, useParams } from "react-router-dom";
import { Download } from "lucide-react";
import { useAssessmentStore } from "../store/useAssessmentStore";
import { Button } from "../components/Button";
import { getAnomalyFlags } from "../lib/anomalyRules";
import { DEDUCTION_PROMPTS } from "../lib/deductionPrompts";
import { buildFilingChecklistPdf } from "../lib/pdfExport";
import { describeIta34Balance, describeItsaBalance, formatRand } from "../lib/money";

export function ExportPage() {
  const { id } = useParams<{ id: string }>();
  const assessment = useAssessmentStore((s) => s.assessments.find((a) => a.id === id));
  const markExported = useAssessmentStore((s) => s.markExported);

  if (!assessment) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-ink-600">We couldn't find that assessment.</p>
        <Link to="/upload" className="mt-4 inline-block text-ink-900 underline">
          Upload one now
        </Link>
      </div>
    );
  }

  const doc = assessment.document;
  const flags = getAnomalyFlags(doc);
  const answeredYes = DEDUCTION_PROMPTS.filter((p) => assessment.gapCheckResponses[p.code]?.answer === true);
  const balance =
    doc.document_type === "ITA34"
      ? describeIta34Balance(doc.balance.amount, doc.balance.direction)
      : describeItsaBalance(doc.account_summary.balance);

  function handleDownload() {
    const pdf = buildFilingChecklistPdf(assessment!);
    pdf.save(`taxassist-checklist-${assessment!.taxYear}.pdf`);
    markExported(id!);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-gold-600">
        Step 5 of 5 — Filing-day checklist
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-950">
        Take this with you to eFiling
      </h1>
      <p className="mt-3 text-ink-600">
        A one-page summary of what SARS assessed, what needs resolving, and what to verify you've
        claimed.
      </p>

      <div className="mt-8 rounded-2xl border border-line bg-white p-6">
        <p className="text-sm font-medium text-ink-500">Bottom line</p>
        <p className="mt-1 font-tabular font-display text-2xl font-semibold text-ink-950">{balance.label}</p>

        {flags.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-ink-500">Resolve before you file</p>
            <ul className="mt-2 space-y-1.5">
              {flags.map((f) => (
                <li key={f.id} className="text-[15px] text-ink-800">
                  • {f.headline}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <p className="text-sm font-medium text-ink-500">Deductions to verify</p>
          {answeredYes.length === 0 ? (
            <p className="mt-2 text-[15px] text-ink-500">
              None flagged yet — run the deduction gap-check first.
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {answeredYes.map((p) => (
                <li key={p.code} className="text-[15px] text-ink-800">
                  ☐ {p.question}
                </li>
              ))}
            </ul>
          )}
        </div>

        {assessment.freelanceEntries.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-ink-500">Freelance / side income to declare</p>
            <ul className="mt-2 space-y-1.5">
              {assessment.freelanceEntries.map((e) => (
                <li key={e.id} className="text-[15px] text-ink-800">
                  {e.description}: {formatRand(e.incomeAmount)} income, {formatRand(e.expenseAmount)} expenses
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
