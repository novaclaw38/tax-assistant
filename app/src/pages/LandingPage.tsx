import { FileSearch, ShieldCheck, ListChecks, Upload } from "lucide-react";
import { LinkButton } from "../components/Button";

export function LandingPage() {
  return (
    <div>
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-5xl px-6 pb-20 pt-16 sm:pt-24">
          <p className="text-sm font-medium uppercase tracking-widest text-gold-600">
            For the almost-simple tax return
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink-950 sm:text-5xl">
            SARS auto-assessed you. That doesn't mean it's right.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600">
            About 6 million South Africans get auto-assessed every year, built from data your
            employer, bank, and medical scheme sent SARS. TaxAssist reads your assessment in
            plain language, flags what SARS's own summary buries in fine print, and tells you
            what's worth checking before you touch eFiling.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <LinkButton to="/upload" size="lg">
              <Upload className="h-4 w-4" />
              Upload your assessment
            </LinkButton>
            <LinkButton to="/upload" variant="secondary" size="lg">
              Try it with a sample document
            </LinkButton>
          </div>
          <p className="mt-5 text-sm text-ink-500">
            We don't guarantee a refund, and we don't file anything on your behalf. If someone
            promises that, be wary — that's exactly the instinct this product is built around.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-display text-2xl font-semibold text-ink-950">How it works</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <Step
            icon={Upload}
            step="1"
            title="Upload your assessment"
            body="A SARS ITA34 or Statement of Account (ITSA) — as a PDF from eFiling, or a photo."
          />
          <Step
            icon={FileSearch}
            step="2"
            title="Read it in plain language"
            body="We translate SARS's own numbers and sign conventions into a summary you'd actually understand — anomalies first, not buried on page five."
          />
          <Step
            icon={ListChecks}
            step="3"
            title="Get your filing-day checklist"
            body="A one-page PDF of what to verify, what deductions to check you've claimed, and anything that needs resolving before you file."
          />
        </div>
      </section>

      <section className="border-t border-line bg-ink-950">
        <div className="mx-auto max-w-5xl px-6 py-16 text-paper">
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-gold-500" strokeWidth={1.75} />
            <div>
              <h2 className="font-display text-2xl font-semibold">
                We found a refund that wasn't actually coming.
              </h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-ink-300">
                In one real assessment we tested, the top-line summary showed a clean R3,297.05
                refund — no flags, nothing to do. A careful read of the full document told a
                different story: assessed income of R0 (a sign the employer's IRP5 never
                matched), and a refund SARS explicitly said it couldn't pay out because it didn't
                have valid banking details on file. Both facts were in the document. Neither was
                in the headline. That gap is the whole point of this product.
              </p>
              <LinkButton to="/upload" variant="secondary" className="mt-6 border-paper/30 text-paper hover:bg-paper/10">
                See this example
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-display text-2xl font-semibold text-ink-950">Who this is for</h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-600">
          Salaried taxpayers with one or two complicating factors — retirement annuity
          contributions, medical aid, a bit of freelance or rental income, maybe a home office.
          Not complex enough to justify hiring an accountant, too complex to trust an
          auto-assessment blindly. If you run a business with complex structures, trusts, or
          capital gains events, this isn't built for you yet — talk to a registered practitioner.
        </p>
      </section>
    </div>
  );
}

function Step({
  icon: Icon,
  step,
  title,
  body,
}: {
  icon: typeof Upload;
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 font-tabular text-sm font-semibold text-paper">
          {step}
        </span>
        <Icon className="h-5 w-5 text-ink-500" strokeWidth={1.75} />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink-950">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-600">{body}</p>
    </div>
  );
}
