import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Check, X } from "lucide-react";
import { useAssessmentStore } from "../store/useAssessmentStore";
import { DEDUCTION_PROMPTS } from "../lib/deductionPrompts";
import { Button } from "../components/Button";

export function GapCheckPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const assessment = useAssessmentStore((s) => s.assessments.find((a) => a.id === id));
  const setGapCheckResponse = useAssessmentStore((s) => s.setGapCheckResponse);
  const markGapChecked = useAssessmentStore((s) => s.markGapChecked);

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

  if (assessment.document.document_type !== "ITA34") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-display text-2xl font-semibold text-ink-950">
          The deduction check needs an ITA34
        </h1>
        <p className="mt-3 text-ink-600">
          A Statement of Account (ITSA) doesn't include income or deduction line items, so there's
          nothing to gap-check here. Upload the matching ITA34 for this tax year to use this
          screen.
        </p>
        <Link to="/upload" className="mt-6 inline-block text-ink-900 underline">
          Upload the ITA34
        </Link>
      </div>
    );
  }

  const profile = assessment.document.taxpayer_profile;
  const prompts = DEDUCTION_PROMPTS.filter((p) => p.appliesTo.includes(profile));
  const answered = prompts.filter((p) => assessment.gapCheckResponses[p.code]?.answer != null).length;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-gold-600">
        Step 4 of 5 — Things worth checking
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-950">
        Are you claiming everything you're entitled to?
      </h1>
      <p className="mt-3 text-ink-600">
        These aren't calculations — just flags for categories where SARS's data feed might not
        yet reflect something you're entitled to claim. Answer honestly; a "yes" just means it's
        worth checking on eFiling.
      </p>

      <div className="mt-8 space-y-4">
        {prompts.map((prompt) => {
          const response = assessment.gapCheckResponses[prompt.code];
          return (
            <div key={prompt.code} className="rounded-2xl border border-line bg-white p-5">
              <p className="font-medium text-ink-950">{prompt.question}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{prompt.explanation}</p>
              <div className="mt-4 flex gap-2">
                <AnswerButton
                  active={response?.answer === true}
                  onClick={() => setGapCheckResponse(id!, prompt.code, { answer: true, note: response?.note ?? "" })}
                  icon={Check}
                  label="Yes, check this"
                  tone="gold"
                />
                <AnswerButton
                  active={response?.answer === false}
                  onClick={() => setGapCheckResponse(id!, prompt.code, { answer: false, note: response?.note ?? "" })}
                  icon={X}
                  label="No, not applicable"
                  tone="neutral"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
        <p className="text-sm text-ink-500">
          {answered} of {prompts.length} answered
        </p>
        <Button
          onClick={() => {
            markGapChecked(id!);
            navigate(`/assessment/${id}/export`);
          }}
        >
          Continue to checklist
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function AnswerButton({
  active,
  onClick,
  icon: Icon,
  label,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Check;
  label: string;
  tone: "gold" | "neutral";
}) {
  const activeClass = tone === "gold" ? "bg-gold-500 text-white border-gold-500" : "bg-ink-900 text-paper border-ink-900";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active ? activeClass : "border-line text-ink-600 hover:border-ink-400"
      }`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
      {label}
    </button>
  );
}
