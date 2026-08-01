import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { useAssessmentStore } from "../store/useAssessmentStore";
import { Button, LinkButton } from "../components/Button";
import { formatRand } from "../lib/money";

const textInput =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-[15px] text-ink-900 focus:border-ink-500 focus:outline-none";

export function FreelancePage() {
  const { id } = useParams<{ id: string }>();
  const assessment = useAssessmentStore((s) => s.assessments.find((a) => a.id === id));
  const addFreelanceEntry = useAssessmentStore((s) => s.addFreelanceEntry);
  const removeFreelanceEntry = useAssessmentStore((s) => s.removeFreelanceEntry);

  const [description, setDescription] = useState("");
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");

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

  const entries = assessment.freelanceEntries;
  const totalIncome = entries.reduce((sum, e) => sum + e.incomeAmount, 0);
  const totalExpense = entries.reduce((sum, e) => sum + e.expenseAmount, 0);

  function handleAdd() {
    if (!description.trim() || !income) return;
    addFreelanceEntry(id!, {
      description: description.trim(),
      incomeAmount: Number(income),
      expenseAmount: Number(expense || 0),
    });
    setDescription("");
    setIncome("");
    setExpense("");
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-gold-600">
        Optional — Freelance or side income
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-950">
        Anything SARS's auto-assessment wouldn't have seen?
      </h1>
      <p className="mt-3 text-ink-600">
        A simple record of extra income and related expenses — not a ledger. This feeds your
        filing-day checklist so you remember to declare it; it doesn't go anywhere near SARS from
        here.
      </p>

      <div className="mt-8 rounded-2xl border border-line bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-500">
              Description
            </label>
            <input
              className={`${textInput} mt-1.5`}
              placeholder="e.g. Freelance design work"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-500">
              Income
            </label>
            <input
              className={`${textInput} mt-1.5 w-32`}
              type="number"
              placeholder="0.00"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-500">
              Expenses
            </label>
            <input
              className={`${textInput} mt-1.5 w-32`}
              type="number"
              placeholder="0.00"
              value={expense}
              onChange={(e) => setExpense(e.target.value)}
            />
          </div>
        </div>
        <Button variant="secondary" size="md" className="mt-4" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          Add entry
        </Button>
      </div>

      {entries.length > 0 && (
        <div className="mt-6 divide-y divide-line rounded-2xl border border-line bg-white">
          {entries.map((e) => (
            <div key={e.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-[15px] text-ink-900">{e.description}</p>
                <p className="font-tabular text-sm text-ink-500">
                  {formatRand(e.incomeAmount)} income · {formatRand(e.expenseAmount)} expenses
                </p>
              </div>
              <button
                onClick={() => removeFreelanceEntry(id!, e.id)}
                className="text-ink-400 hover:text-rust-600"
                aria-label="Remove entry"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between px-5 py-3 text-sm font-medium text-ink-800">
            <span>Total</span>
            <span className="font-tabular">
              {formatRand(totalIncome)} income · {formatRand(totalExpense)} expenses
            </span>
          </div>
        </div>
      )}

      <div className="mt-10 flex justify-end border-t border-line pt-6">
        <LinkButton to={`/assessment/${id}/export`}>
          Continue to checklist
          <ArrowRight className="h-4 w-4" />
        </LinkButton>
      </div>
    </div>
  );
}
