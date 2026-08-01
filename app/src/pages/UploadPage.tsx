import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Loader2, UploadCloud } from "lucide-react";
import { classifyAndExtract, EXTRACTION_STAGES, SAMPLE_LABELS, type SampleKey } from "../lib/mockExtraction";
import { useAssessmentStore } from "../store/useAssessmentStore";
import { useSession } from "../auth/SessionProvider";
import { uploadAssessmentFile } from "../lib/uploadDocument";

type Status = "idle" | "processing" | "dragging";

export function UploadPage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const addAssessment = useAssessmentStore((s) => s.addAssessment);
  const [status, setStatus] = useState<Status>("idle");
  const [stageIndex, setStageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function runPipeline(input: { kind: "sample"; sample: SampleKey } | { kind: "file"; file: File }) {
    if (!session) return;
    setStatus("processing");
    setStageIndex(0);
    const timers = EXTRACTION_STAGES.map((_stage, i) =>
      setTimeout(() => setStageIndex(i), EXTRACTION_STAGES.slice(0, i).reduce((a, s) => a + s.delayMs, 0)),
    );

    const [document, sourceFilePath] = await Promise.all([
      classifyAndExtract(input),
      input.kind === "file" ? uploadAssessmentFile(session.user.id, input.file) : Promise.resolve(undefined),
    ]);
    timers.forEach(clearTimeout);
    const id = await addAssessment(session.user.id, document, sourceFilePath);
    navigate(`/review/${id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink-950">Upload your assessment</h1>
      <p className="mt-3 text-ink-600">
        A SARS Notice of Assessment (ITA34) or Statement of Account (ITSA), downloaded from
        eFiling as a PDF, or a clear photo/screenshot.
      </p>

      {status === "processing" ? (
        <div className="mt-8 rounded-2xl border border-line bg-white p-8">
          <div className="flex flex-col items-center text-center">
            <Loader2 className="h-8 w-8 animate-spin text-ink-500" />
            <p className="mt-4 font-medium text-ink-900">{EXTRACTION_STAGES[stageIndex].label}…</p>
            <div className="mt-6 w-full max-w-xs space-y-2">
              {EXTRACTION_STAGES.map((stage, i) => (
                <div key={stage.label} className="flex items-center gap-2 text-sm">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${i <= stageIndex ? "bg-teal-600" : "bg-ink-300"}`}
                  />
                  <span className={i <= stageIndex ? "text-ink-800" : "text-ink-400"}>{stage.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setStatus("dragging");
            }}
            onDragLeave={() => setStatus("idle")}
            onDrop={(e) => {
              e.preventDefault();
              setStatus("idle");
              const file = e.dataTransfer.files[0];
              if (file) void runPipeline({ kind: "file", file });
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-8 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
              status === "dragging" ? "border-ink-900 bg-ink-900/5" : "border-line bg-white hover:border-ink-400"
            }`}
          >
            <UploadCloud className="h-8 w-8 text-ink-400" strokeWidth={1.5} />
            <p className="mt-3 font-medium text-ink-900">Drag a file here, or click to browse</p>
            <p className="mt-1 text-sm text-ink-500">PDF, PNG, or JPG</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void runPipeline({ kind: "file", file });
              }}
            />
          </div>
          <p className="mt-2 text-xs text-ink-400">
            Real files are securely stored, but field extraction is still simulated (resolves to a
            sample below) — OCR/vision extraction isn't wired up yet.
          </p>

          <div className="mt-10">
            <p className="text-sm font-medium text-ink-500">Or try a sample document</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(Object.keys(SAMPLE_LABELS) as SampleKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => void runPipeline({ kind: "sample", sample: key })}
                  className="rounded-xl border border-line bg-white p-4 text-left transition-colors hover:border-ink-400"
                >
                  <FileText className="h-5 w-5 text-ink-500" strokeWidth={1.75} />
                  <p className="mt-2 font-medium text-ink-950">{SAMPLE_LABELS[key].title}</p>
                  <p className="mt-1 text-sm text-ink-500">{SAMPLE_LABELS[key].description}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
