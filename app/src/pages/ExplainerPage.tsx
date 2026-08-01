import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAssessmentStore } from "../store/useAssessmentStore";
import { getAnomalyFlags } from "../lib/anomalyRules";
import { FlagCard } from "../components/FlagCard";
import { MoneyDisplay } from "../components/MoneyDisplay";
import { LinkButton } from "../components/Button";
import { describeIta34Balance, describeItsaBalance, formatRand } from "../lib/money";
import type { ITA34Document, ITSADocument } from "../lib/types";

export function ExplainerPage() {
  const { id } = useParams<{ id: string }>();
  const assessment = useAssessmentStore((s) => s.assessments.find((a) => a.id === id));

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

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-gold-600">
        Step 3 of 4 — Your assessment, explained
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-950">
        Tax year {assessment.taxYear}
      </h1>

      {flags.length > 0 && (
        <div className="mt-8 space-y-4">
          {flags.map((flag) => (
            <FlagCard key={flag.id} flag={flag} />
          ))}
        </div>
      )}

      {flags.length === 0 && (
        <div className="mt-8 rounded-2xl border border-teal-600/30 bg-teal-50 p-5">
          <p className="text-[15px] leading-relaxed text-teal-700">
            Nothing structurally unusual here — no audit flags, no withheld refund, no odd dates.
            Read the summary below, but it's worth still working through the deduction checklist.
          </p>
        </div>
      )}

      <div className="prose-editorial mt-10">
        {doc.document_type === "ITA34" ? <ITA34Explainer doc={doc as ITA34Document} /> : <ITSAExplainer doc={doc as ITSADocument} />}
      </div>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-6">
        {doc.document_type === "ITA34" ? (
          <LinkButton to={`/assessment/${id}/gap-check`}>
            Check what you might be missing
            <ArrowRight className="h-4 w-4" />
          </LinkButton>
        ) : (
          <LinkButton to="/upload" variant="secondary">
            Upload the matching ITA34 for a deduction check
          </LinkButton>
        )}
        <LinkButton to={`/assessment/${id}/freelance`} variant="secondary">
          Add freelance/side income
        </LinkButton>
        <LinkButton to={`/assessment/${id}/export`} variant="ghost">
          Skip to filing-day checklist
        </LinkButton>
      </div>
    </div>
  );
}

function ITA34Explainer({ doc }: { doc: ITA34Document }) {
  const balance = describeIta34Balance(doc.balance.amount, doc.balance.direction);
  const s = doc.assessment_summary;
  return (
    <>
      <section>
        <p className="text-sm font-medium text-ink-500">Bottom line</p>
        <MoneyDisplay label={balance.label} tone={balance.tone} />
        <p className="mt-2 text-[15px] text-ink-600">
          {doc.assessment_type} assessment, dated {new Date(doc.date_of_assessment).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}.
        </p>
      </section>

      <section className="mt-8">
        <p className="text-sm font-medium text-ink-500">What SARS thinks you earned and can claim</p>
        <div className="mt-3 space-y-3 rounded-2xl border border-line bg-white p-5 text-[15px] leading-relaxed text-ink-800">
          <p>
            SARS assessed your income at <strong className="font-tabular">{formatRand(s.income.current)}</strong>
            {s.income.adjustment !== 0 && <> (an adjustment of {formatRand(s.income.adjustment)} from the previous figure)</>}.
          </p>
          <p>
            They allowed <strong className="font-tabular">{formatRand(s.deductions_allowed.current)}</strong> in deductions,
            bringing your taxable income to <strong className="font-tabular">{formatRand(s.taxable_income.current)}</strong>.
          </p>
          <p>
            Your calculated tax liability for the year is <strong className="font-tabular">{formatRand(s.calculated_tax_liability.current)}</strong>.
          </p>
        </div>
      </section>

      <section className="mt-8">
        <p className="text-sm font-medium text-ink-500">Compliance status</p>
        <ul className="mt-3 space-y-1.5 text-[15px] text-ink-800">
          <li>Provisional taxpayer: {doc.compliance.provisional_taxpayer ? "yes" : "no"}</li>
          <li>Selected for audit or verification: {doc.compliance.selected_for_audit_or_verification ? "yes" : "no"}</li>
        </ul>
      </section>
    </>
  );
}

function ITSAExplainer({ doc }: { doc: ITSADocument }) {
  const balance = describeItsaBalance(doc.account_summary.balance);
  return (
    <>
      <section>
        <p className="text-sm font-medium text-ink-500">Bottom line</p>
        <MoneyDisplay label={balance.label} tone={balance.tone} />
        <p className="mt-2 text-[15px] text-ink-600">
          Statement covering {doc.statement_period.from} to {doc.statement_period.to}, issued{" "}
          {new Date(doc.issue_date).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}.
        </p>
      </section>

      <section className="mt-8">
        <p className="text-sm font-medium text-ink-500">Transaction history</p>
        <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
          {doc.transactions.map((t) => {
            const d = describeItsaBalance(t.value);
            return (
              <div key={t.reference} className="flex items-center justify-between px-5 py-3 text-[15px]">
                <div>
                  <p className="text-ink-900">{t.description}</p>
                  <p className="text-sm text-ink-400">
                    {new Date(t.date).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" })}
                    {t.tax_year && ` · tax year ${t.tax_year}`}
                  </p>
                </div>
                <p className={`font-tabular text-sm ${t.value === 0 ? "text-ink-400" : d.tone === "refund" ? "text-teal-700" : "text-rust-700"}`}>
                  {t.value === 0 ? "R 0.00" : formatRand(t.value)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-line bg-paper-dim p-5 text-[15px] leading-relaxed text-ink-700">
        This is a statement of account, not a full assessment — it shows your balance and
        transaction history, but not the income and deduction line items SARS used to calculate
        it. To check for missed deductions, upload the matching ITA34 for this tax year.
      </section>
    </>
  );
}
