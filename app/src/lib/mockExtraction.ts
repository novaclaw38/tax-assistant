import { SAMPLE_ITA34, SAMPLE_ITSA } from "./sampleDocuments";
import type { SourceDocument } from "./types";

export type SampleKey = "itsa-refund" | "ita34-withheld";

export interface ExtractionStage {
  label: string;
  delayMs: number;
}

export const EXTRACTION_STAGES: ExtractionStage[] = [
  { label: "Reading document", delayMs: 500 },
  { label: "Classifying document type", delayMs: 650 },
  { label: "Extracting fields", delayMs: 800 },
];

const SAMPLES: Record<SampleKey, SourceDocument> = {
  "itsa-refund": SAMPLE_ITSA,
  "ita34-withheld": SAMPLE_ITA34,
};

export const SAMPLE_LABELS: Record<SampleKey, { title: string; description: string }> = {
  "itsa-refund": {
    title: "Statement of Account (ITSA)",
    description:
      "A running ledger showing a refund due for the 2021 tax year, with one entry dated after the statement was issued.",
  },
  "ita34-withheld": {
    title: "Notice of Assessment (ITA34)",
    description:
      "An assessment showing R0 assessed income and a refund the summary table doesn't mention is being withheld.",
  },
};

/**
 * Stands in for the real pipeline (PDF text extraction / vision fallback +
 * document-type classifier) described in the product scope doc. There is no
 * backend or OCR/vision API wired up yet, so any uploaded file resolves to
 * one of the two seeded, schema-accurate sample documents. Real files are
 * inspected only enough to pick a plausible sample (PDF vs image).
 */
export async function classifyAndExtract(
  input: { kind: "sample"; sample: SampleKey } | { kind: "file"; file: File },
): Promise<SourceDocument> {
  for (const stage of EXTRACTION_STAGES) {
    await wait(stage.delayMs);
  }

  if (input.kind === "sample") {
    return clone(SAMPLES[input.sample]);
  }

  // Demo fallback for a real uploaded file: pick the ITA34 sample, since
  // it's the richer document type to review.
  return clone(SAMPLE_ITA34);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
