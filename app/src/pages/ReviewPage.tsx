import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAssessmentStore } from "../store/useAssessmentStore";
import { ReviewField } from "../components/ReviewField";
import { ConfidenceBadge } from "../components/ConfidenceBadge";
import { Button } from "../components/Button";
import { formatRand } from "../lib/money";
import type { ITA34Document, ITSADocument } from "../lib/types";

const textInput =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-[15px] text-ink-900 focus:border-ink-500 focus:outline-none";

function formatRandSigned(amount: number): string {
  return `${amount < 0 ? "-" : ""}${formatRand(amount)}`;
}

export function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const assessment = useAssessmentStore((s) => s.assessments.find((a) => a.id === id));
  const confirmField = useAssessmentStore((s) => s.confirmField);
  const updateDocument = useAssessmentStore((s) => s.updateDocument);
  const markReviewed = useAssessmentStore((s) => s.markReviewed);

  const [localDoc, setLocalDoc] = useState(assessment?.document);

  const needsReview = assessment?.document.raw_fields_needing_review ?? [];
  const confirmedFields = assessment?.confirmedFields ?? [];
  const allConfirmed = useMemo(
    () => needsReview.every((f) => confirmedFields.includes(f)),
    [needsReview, confirmedFields],
  );

  if (!assessment || !localDoc) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-ink-600">We couldn't find that assessment.</p>
        <Link to="/upload" className="mt-4 inline-block text-ink-900 underline">
          Upload one now
        </Link>
      </div>
    );
  }

  function persist(next: typeof localDoc) {
    setLocalDoc(next);
    if (next) updateDocument(id!, next);
  }

  function handleContinue() {
    markReviewed(id!);
    navigate(`/assessment/${id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-gold-600">
        Step 2 of 4 — Confirm what we read
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-950">
        Check these fields before we continue
      </h1>
      <p className="mt-3 text-ink-600">
        Correct anything that looks wrong. Fields we're less sure about need your explicit
        confirmation — never trust an extraction on a financial document without a second look.
      </p>

      <div className="mt-8 space-y-4">
        {localDoc.document_type === "ITA34" ? (
          <ITA34Fields
            doc={localDoc as ITA34Document}
            confirmedFields={confirmedFields}
            onConfirm={(f) => confirmField(id!, f)}
            onChange={(next) => persist(next)}
          />
        ) : (
          <ITSAFields doc={localDoc as ITSADocument} />
        )}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
        <p className="text-sm text-ink-500">
          {allConfirmed
            ? "All flagged fields confirmed."
            : `${needsReview.length - confirmedFields.filter((f) => needsReview.includes(f)).length} field(s) still need confirmation.`}
        </p>
        <Button onClick={handleContinue} disabled={!allConfirmed}>
          Continue to explainer
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ITA34Fields({
  doc,
  confirmedFields,
  onConfirm,
  onChange,
}: {
  doc: ITA34Document;
  confirmedFields: string[];
  onConfirm: (f: string) => void;
  onChange: (doc: ITA34Document) => void;
}) {
  const needsReview = doc.raw_fields_needing_review;
  return (
    <>
      <div className="flex items-center justify-between rounded-xl border border-line bg-paper-dim px-4 py-3">
        <span className="text-sm font-medium text-ink-700">Notice of Assessment (ITA34)</span>
        <ConfidenceBadge level={doc.extraction_confidence} />
      </div>

      <ReviewField label="Reference number" fieldKey="reference_number" needsReview={false} confirmed onConfirm={() => {}}>
        <input
          className={textInput}
          value={doc.reference_number}
          onChange={(e) => onChange({ ...doc, reference_number: e.target.value })}
        />
      </ReviewField>

      <ReviewField label="Year of assessment" fieldKey="year_of_assessment" needsReview={false} confirmed onConfirm={() => {}}>
        <input
          className={textInput}
          type="number"
          value={doc.year_of_assessment}
          onChange={(e) => onChange({ ...doc, year_of_assessment: Number(e.target.value) })}
        />
      </ReviewField>

      <ReviewField
        label="Balance"
        fieldKey="balance.amount"
        needsReview={needsReview.includes("balance.amount")}
        confirmed={confirmedFields.includes("balance.amount")}
        onConfirm={onConfirm}
      >
        <div className="flex items-center gap-2">
          <input
            className={textInput}
            type="number"
            step="0.01"
            value={doc.balance.amount}
            onChange={(e) => onChange({ ...doc, balance: { ...doc.balance, amount: Number(e.target.value) } })}
          />
          <span className="whitespace-nowrap text-sm text-ink-500">
            {doc.balance.direction === "refund_to_taxpayer" ? "refund to you" : doc.balance.direction === "payable_by_taxpayer" ? "you owe" : "zero"}
          </span>
        </div>
      </ReviewField>

      <ReviewField
        label="Employment income (IRP5/IT3(a))"
        fieldKey="income_breakdown.employment_income_irp5"
        needsReview={needsReview.includes("income_breakdown.employment_income_irp5")}
        confirmed={confirmedFields.includes("income_breakdown.employment_income_irp5")}
        onConfirm={onConfirm}
      >
        <input
          className={textInput}
          type="number"
          step="0.01"
          value={doc.income_breakdown.employment_income_irp5}
          onChange={(e) =>
            onChange({
              ...doc,
              income_breakdown: { employment_income_irp5: Number(e.target.value) },
            })
          }
        />
        {doc.income_breakdown.employment_income_irp5 === 0 && (
          <p className="mt-2 text-sm text-gold-700">
            This is R0 — unusual for a salaried profile. Compare against your payslips before
            confirming.
          </p>
        )}
      </ReviewField>

      <ReviewField label="Provisional taxpayer" fieldKey="compliance.provisional_taxpayer" needsReview={false} confirmed onConfirm={() => {}}>
        <p className="text-[15px] text-ink-900">{doc.compliance.provisional_taxpayer ? "Yes" : "No"}</p>
      </ReviewField>

      <ReviewField
        label="Selected for audit or verification"
        fieldKey="compliance.selected_for_audit_or_verification"
        needsReview={false}
        confirmed
        onConfirm={() => {}}
      >
        <p className="text-[15px] text-ink-900">
          {doc.compliance.selected_for_audit_or_verification ? "Yes" : "No"}
        </p>
      </ReviewField>
    </>
  );
}

function ITSAFields({ doc }: { doc: ITSADocument }) {
  return (
    <>
      <div className="flex items-center justify-between rounded-xl border border-line bg-paper-dim px-4 py-3">
        <span className="text-sm font-medium text-ink-700">Statement of Account (ITSA)</span>
        <ConfidenceBadge level={doc.extraction_confidence} />
      </div>

      <ReviewField label="Reference number" fieldKey="reference_number" needsReview={false} confirmed onConfirm={() => {}}>
        <p className="text-[15px] text-ink-900">{doc.reference_number}</p>
      </ReviewField>

      <ReviewField label="Statement period" fieldKey="statement_period" needsReview={false} confirmed onConfirm={() => {}}>
        <p className="text-[15px] text-ink-900">
          {doc.statement_period.from} to {doc.statement_period.to}
        </p>
      </ReviewField>

      <ReviewField label="Account balance" fieldKey="account_summary.balance" needsReview={false} confirmed onConfirm={() => {}}>
        <p className="font-tabular text-[15px] text-ink-900">{formatRandSigned(doc.account_summary.balance)}</p>
        <p className="mt-1 text-xs text-ink-400">
          Shown as SARS prints it (negative = credit owed to you) — we'll translate this on the
          next screen.
        </p>
      </ReviewField>

      <div className="rounded-xl border border-line bg-white p-4">
        <label className="block text-xs font-medium uppercase tracking-wide text-ink-500">
          Transactions
        </label>
        <div className="mt-2 divide-y divide-line">
          {doc.transactions.map((t) => (
            <div key={t.reference} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="text-ink-900">{t.description}</p>
                <p className="text-ink-400">{t.date}</p>
              </div>
              <p className="font-tabular text-ink-700">{formatRandSigned(t.value)}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
