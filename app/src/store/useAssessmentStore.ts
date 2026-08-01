import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";
import type { Assessment, AssessmentStage, FreelanceEntry, GapCheckResponse, SourceDocument } from "../lib/types";

interface AssessmentRow {
  id: string;
  tax_year: number;
  stage: AssessmentStage;
  document: SourceDocument;
  confirmed_fields: string[];
  gap_check_responses: Record<string, GapCheckResponse>;
  created_at: string;
}

interface FreelanceRow {
  id: string;
  assessment_id: string;
  description: string;
  income_amount: number;
  expense_amount: number;
}

function rowToAssessment(row: AssessmentRow, freelanceRows: FreelanceRow[]): Assessment {
  return {
    id: row.id,
    taxYear: row.tax_year,
    createdAt: row.created_at,
    stage: row.stage,
    document: row.document,
    confirmedFields: row.confirmed_fields ?? [],
    gapCheckResponses: row.gap_check_responses ?? {},
    freelanceEntries: freelanceRows
      .filter((f) => f.assessment_id === row.id)
      .map((f) => ({
        id: f.id,
        description: f.description,
        incomeAmount: f.income_amount,
        expenseAmount: f.expense_amount,
      })),
  };
}

interface AssessmentStore {
  assessments: Assessment[];
  loading: boolean;
  loadAssessments: (userId: string) => Promise<void>;
  clear: () => void;
  addAssessment: (userId: string, document: SourceDocument, sourceFilePath?: string) => Promise<string>;
  confirmField: (id: string, fieldKey: string) => Promise<void>;
  updateDocument: (id: string, document: SourceDocument) => Promise<void>;
  markReviewed: (id: string) => Promise<void>;
  setGapCheckResponse: (id: string, code: string, response: GapCheckResponse) => Promise<void>;
  markGapChecked: (id: string) => Promise<void>;
  addFreelanceEntry: (id: string, entry: Omit<FreelanceEntry, "id">) => Promise<void>;
  removeFreelanceEntry: (id: string, entryId: string) => Promise<void>;
  markExported: (id: string) => Promise<void>;
}

function taxYearOf(document: SourceDocument): number {
  if (document.document_type === "ITA34") return document.year_of_assessment;
  const txnYear = document.transactions.find((t) => t.tax_year != null)?.tax_year;
  return txnYear ?? new Date(document.issue_date).getFullYear();
}

function patchAssessment(assessments: Assessment[], id: string, patch: Partial<Assessment>): Assessment[] {
  return assessments.map((a) => (a.id === id ? { ...a, ...patch } : a));
}

export const useAssessmentStore = create<AssessmentStore>()((set, get) => ({
  assessments: [],
  loading: false,

  loadAssessments: async (userId) => {
    set({ loading: true });
    const [{ data: assessmentRows, error: assessmentsError }, { data: freelanceRows, error: freelanceError }] =
      await Promise.all([
        supabase.from("assessments").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase
          .from("freelance_entries")
          .select("*, assessments!inner(user_id)")
          .eq("assessments.user_id", userId),
      ]);

    if (assessmentsError || freelanceError) {
      console.error(assessmentsError ?? freelanceError);
      set({ loading: false });
      return;
    }

    const assessments = (assessmentRows as AssessmentRow[]).map((row) =>
      rowToAssessment(row, (freelanceRows as FreelanceRow[]) ?? []),
    );
    set({ assessments, loading: false });
  },

  clear: () => set({ assessments: [], loading: false }),

  addAssessment: async (userId, document, sourceFilePath) => {
    const { data, error } = await supabase
      .from("assessments")
      .insert({
        user_id: userId,
        tax_year: taxYearOf(document),
        stage: "uploaded",
        document,
        confirmed_fields: [],
        gap_check_responses: {},
        source_file_path: sourceFilePath ?? null,
      })
      .select()
      .single();

    if (error || !data) throw error ?? new Error("Failed to create assessment");

    const assessment = rowToAssessment(data as AssessmentRow, []);
    set((state) => ({ assessments: [assessment, ...state.assessments] }));
    return assessment.id;
  },

  confirmField: async (id, fieldKey) => {
    const current = get().assessments.find((a) => a.id === id);
    if (!current || current.confirmedFields.includes(fieldKey)) return;
    const confirmedFields = [...current.confirmedFields, fieldKey];
    set((state) => ({ assessments: patchAssessment(state.assessments, id, { confirmedFields }) }));
    await supabase.from("assessments").update({ confirmed_fields: confirmedFields }).eq("id", id);
  },

  updateDocument: async (id, document) => {
    set((state) => ({ assessments: patchAssessment(state.assessments, id, { document }) }));
    await supabase.from("assessments").update({ document }).eq("id", id);
  },

  markReviewed: async (id) => {
    const current = get().assessments.find((a) => a.id === id);
    if (!current || current.stage !== "uploaded") return;
    set((state) => ({ assessments: patchAssessment(state.assessments, id, { stage: "reviewed" }) }));
    await supabase.from("assessments").update({ stage: "reviewed" }).eq("id", id);
  },

  setGapCheckResponse: async (id, code, response) => {
    const current = get().assessments.find((a) => a.id === id);
    if (!current) return;
    const gapCheckResponses = { ...current.gapCheckResponses, [code]: response };
    set((state) => ({ assessments: patchAssessment(state.assessments, id, { gapCheckResponses }) }));
    await supabase.from("assessments").update({ gap_check_responses: gapCheckResponses }).eq("id", id);
  },

  markGapChecked: async (id) => {
    const current = get().assessments.find((a) => a.id === id);
    if (!current || (current.stage !== "reviewed" && current.stage !== "uploaded")) return;
    set((state) => ({ assessments: patchAssessment(state.assessments, id, { stage: "gap_checked" }) }));
    await supabase.from("assessments").update({ stage: "gap_checked" }).eq("id", id);
  },

  addFreelanceEntry: async (id, entry) => {
    const { data, error } = await supabase
      .from("freelance_entries")
      .insert({
        assessment_id: id,
        description: entry.description,
        income_amount: entry.incomeAmount,
        expense_amount: entry.expenseAmount,
      })
      .select()
      .single();

    if (error || !data) {
      console.error(error);
      return;
    }

    const row = data as FreelanceRow;
    const newEntry: FreelanceEntry = {
      id: row.id,
      description: row.description,
      incomeAmount: row.income_amount,
      expenseAmount: row.expense_amount,
    };
    set((state) => ({
      assessments: state.assessments.map((a) =>
        a.id === id ? { ...a, freelanceEntries: [...a.freelanceEntries, newEntry] } : a,
      ),
    }));
  },

  removeFreelanceEntry: async (id, entryId) => {
    set((state) => ({
      assessments: state.assessments.map((a) =>
        a.id === id ? { ...a, freelanceEntries: a.freelanceEntries.filter((e) => e.id !== entryId) } : a,
      ),
    }));
    await supabase.from("freelance_entries").delete().eq("id", entryId);
  },

  markExported: async (id) => {
    set((state) => ({ assessments: patchAssessment(state.assessments, id, { stage: "exported" }) }));
    await supabase.from("assessments").update({ stage: "exported" }).eq("id", id);
  },
}));
