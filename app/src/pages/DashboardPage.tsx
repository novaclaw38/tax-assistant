import { Link } from "react-router-dom";
import { FileText, Upload } from "lucide-react";
import { useAssessmentStore } from "../store/useAssessmentStore";
import { LinkButton } from "../components/Button";
import { describeIta34Balance, describeItsaBalance } from "../lib/money";
import type { Assessment, AssessmentStage } from "../lib/types";

const stageLabels: Record<AssessmentStage, string> = {
  uploaded: "Uploaded — needs review",
  reviewed: "Reviewed",
  gap_checked: "Gap-check complete",
  exported: "Checklist exported",
};

const stageColors: Record<AssessmentStage, string> = {
  uploaded: "bg-gold-100 text-gold-700",
  reviewed: "bg-ink-900/10 text-ink-700",
  gap_checked: "bg-ink-900/10 text-ink-700",
  exported: "bg-teal-100 text-teal-700",
};

function stageRoute(a: Assessment): string {
  switch (a.stage) {
    case "uploaded":
      return `/review/${a.id}`;
    case "reviewed":
      return `/assessment/${a.id}`;
    case "gap_checked":
      return `/assessment/${a.id}/export`;
    case "exported":
      return `/assessment/${a.id}/export`;
  }
}

export function DashboardPage() {
  const assessments = useAssessmentStore((s) => s.assessments);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink-950">My assessments</h1>
        <LinkButton to="/upload" size="md">
          <Upload className="h-4 w-4" />
          Upload
        </LinkButton>
      </div>

      {assessments.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-line bg-white py-16 text-center">
          <FileText className="h-8 w-8 text-ink-300" strokeWidth={1.5} />
          <p className="mt-3 text-ink-600">Nothing uploaded yet.</p>
          <Link to="/upload" className="mt-2 text-sm font-medium text-ink-900 underline">
            Upload your first assessment
          </Link>
        </div>
      ) : (
        <div className="mt-8 divide-y divide-line rounded-2xl border border-line bg-white">
          {assessments.map((a) => {
            const balance =
              a.document.document_type === "ITA34"
                ? describeIta34Balance(a.document.balance.amount, a.document.balance.direction)
                : describeItsaBalance(a.document.account_summary.balance);
            return (
              <Link
                key={a.id}
                to={stageRoute(a)}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-paper-dim"
              >
                <div>
                  <p className="font-medium text-ink-950">
                    Tax year {a.taxYear} · {a.document.document_type}
                  </p>
                  <p className="mt-0.5 font-tabular text-sm text-ink-500">{balance.label}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${stageColors[a.stage]}`}>
                  {stageLabels[a.stage]}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
