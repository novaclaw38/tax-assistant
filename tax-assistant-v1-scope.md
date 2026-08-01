# TaxAssist (working name) — V1 Product Scope

## Problem
SARS auto-assessment now covers ~6M taxpayers a year, using third-party data
(employers, banks, medical schemes, retirement funds). But:
- Auto-assessments are often wrong or incomplete (missing freelance income,
  rental income, deductions not yet reflected in SARS's data feed).
- Most taxpayers have no idea what to check, or what they're entitled to claim.
- Provisional taxpayers (freelancers, side-hustlers, small landlords) still
  have to file properly and get zero help doing it well.
- People are explicitly wary of "anyone who guarantees a refund" — so trust
  and transparency are core to the product, not an afterthought.

## Who this is for (v1)
Primary: the "almost-simple" taxpayer — salaried, but with one or two
complicating factors: RA/pension contributions, medical aid, some freelance
or rental income, maybe a home office. Not complex enough to justify hiring
an accountant, too complex to trust auto-assessment blindly.

Explicitly NOT v1: full provisional taxpayers with complex business structures,
trusts, CGT events. That's a v2/v3 expansion, not a v1 wedge.

## Core positioning (legal guardrail)
This is an **explainer + checklist tool**, not a registered tax practitioner
service. It does not file on the user's behalf and does not give personalized
tax advice framed as professional advice. It:
- explains SARS's own assessment in plain language
- flags commonly-missed deduction categories for the user to check themselves
- prepares the user with a clean checklist before they touch eFiling

This avoids RCB (Recognised Controlling Body) tax practitioner registration
requirements under the Tax Administration Act. **Get this confirmed by an
actual tax attorney or registered practitioner before launch** — this is a
product decision, not legal advice from me.

## MVP feature set

1. **Assessment import**
   - User uploads/photographs their SARS auto-assessment (PDF or screenshot)
   - OCR/parse into structured line items (income sources, deductions claimed,
     medical credits, RA contributions, refund/owing amount)

2. **Plain-language explainer**
   - Walks through the assessment section by section in normal language
   - "This is what SARS thinks you earned. This is what they think you can
     claim. Here's your bottom line and why."

3. **Gap-check / deduction prompts**
   - Rules-based checklist against common categories: RA/pension top-ups,
     medical aid credits, home office (if applicable), travel logbook,
     donations (s18A), income protection premiums
   - Each prompt is a yes/no question with a plain explanation of what
     qualifies — not a calculation, a "go check this" flag

4. **Freelance/side-income helper (light)**
   - Simple income + expense capture for users who need to manually declare
     extra income not covered by auto-assessment
   - Not full bookkeeping — a guided form, not a ledger

5. **Filing-day checklist export**
   - Generates a one-page summary/checklist the user takes into eFiling
     themselves (PDF export)

## Explicitly out of scope for v1
- Filing on the user's behalf / eFiling integration
- Provisional tax calculations (IRP6)
- CGT, trusts, multi-entity structures
- Tax practitioner marketplace/referral (could be v2 monetization, not v1)
- Payroll/PAYE for employers

## Suggested stack (matches your existing pattern)
- Frontend: Vite + React SPA, deployed on Vercel
- Backend: Supabase (Postgres + Auth + Storage for uploaded assessments)
- OCR: either a document AI API (Google Document AI / AWS Textract) for
  parsing SARS PDF/screenshot layouts, or a Claude-based extraction pipeline
  since SARS assessment formats are fairly structured
- POPIA is non-negotiable here — this touches income, medical aid data
  (special personal information under POPIA), and ID numbers. Higher bar
  than SkillsHouse's compliance work, not the same tier.

## Data model (draft)

```sql
-- users (via Supabase Auth)

create table taxpayer_profiles (
  id uuid primary key references auth.users(id),
  tax_year int not null,
  is_provisional boolean default false,
  created_at timestamptz default now()
);

create table assessments (
  id uuid primary key default gen_random_uuid(),
  taxpayer_id uuid references taxpayer_profiles(id),
  tax_year int not null,
  source_file_url text, -- Supabase Storage path
  raw_ocr_json jsonb,    -- unparsed extraction output
  status text default 'uploaded', -- uploaded, parsed, reviewed, exported
  created_at timestamptz default now()
);

create table assessment_line_items (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references assessments(id),
  category text not null, -- 'income', 'deduction', 'credit'
  subcategory text,        -- 'employer_income', 'medical_credit', 'ra_contribution', etc.
  label text,
  amount numeric,
  source text default 'sars', -- 'sars' vs 'user_added'
  created_at timestamptz default now()
);

create table deduction_prompts (
  id uuid primary key default gen_random_uuid(),
  code text unique not null, -- 'ra_topup', 'home_office', 'donations_18a', etc.
  question text not null,
  explanation text not null,
  applies_to text[] -- tags for filtering relevance e.g. 'salaried', 'freelance'
);

create table user_prompt_responses (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references assessments(id),
  prompt_id uuid references deduction_prompts(id),
  answer boolean, -- yes/no
  note text,
  created_at timestamptz default now()
);

create table freelance_income_entries (
  id uuid primary key default gen_random_uuid(),
  taxpayer_id uuid references taxpayer_profiles(id),
  tax_year int not null,
  description text,
  income_amount numeric,
  expense_amount numeric,
  created_at timestamptz default now()
);
```

RLS: every table scoped to `auth.uid() = taxpayer_id` (or joined via
assessment → taxpayer_id). Given the sensitivity of this data, this needs
its own dedicated RLS audit before launch — don't reuse the SkillsHouse
pattern without re-testing it against this schema specifically.

## Monetization options
- Freemium: explainer + checklist free, deduction gap-check + PDF export
  behind a small once-off fee (matches the seasonal nature — people pay once
  a year, not monthly)
- Seasonal pricing makes sense here more than SkillsHouse-style subscriptions
  — most usage will cluster around filing season (Jul–Oct)
- Later: referral fee to registered tax practitioners for complex cases the
  app flags as "you need a professional" (clean upsell, keeps you out of
  practitioner-registration territory)

## ITA34 extraction schema & prompt (draft)

This is the target schema both extraction paths (PDF text-match and vision
fallback) should produce, so downstream code doesn't care which path was
used.

```json
{
  "reference_number": "string",
  "document_number": "string",
  "date_of_assessment": "YYYY-MM-DD",
  "year_of_assessment": "integer",
  "assessment_type": "Original | Additional | Reduced | Original Estimate",
  "payment_due_date": "YYYY-MM-DD | null",
  "grace_period_until": "YYYY-MM-DD | null",
  "prn_number": "string | null",
  "balance": {
    "description": "string",
    "amount": "number",
    "direction": "refund_to_taxpayer | payable_by_taxpayer | zero"
  },
  "compliance": {
    "unprocessed_payments": "number",
    "provisional_taxpayer": "boolean",
    "selected_for_audit_or_verification": "boolean"
  },
  "assessment_summary": {
    "income": { "previous": "number", "current": "number", "adjustment": "number" },
    "deductions_allowed": { "previous": "number", "current": "number", "adjustment": "number" },
    "taxable_income": { "previous": "number", "current": "number", "adjustment": "number" },
    "calculated_tax_liability": { "previous": "number", "current": "number", "adjustment": "number" }
  },
  "extraction_confidence": "high | medium | low",
  "extraction_path": "pdf_text | vision_fallback",
  "raw_fields_needing_review": ["array of field names the model was unsure about"]
}
```

### Vision fallback prompt (draft, for screenshots/photos)

```
You are extracting structured data from a South African SARS ITA34
(Notice of Assessment) image. This is a fixed-template government form.

Extract ONLY the following fields, using the exact JSON schema below.
If a field is not visible or you are not confident in a value, set it to
null and add its name to "raw_fields_needing_review" — do NOT guess or
estimate any financial figure.

[schema pasted here]

Rules:
- Amounts must be extracted exactly as printed, including sign (negative
  for amounts owed by SARS vs owed to SARS — check context).
- Dates must be normalized to YYYY-MM-DD.
- If the image is not an ITA34 (wrong document type, illegible, cropped),
  return {"error": "reason"} instead of the schema.
- Never infer a value that isn't visibly printed on the document.
```

Note the explicit "don't guess" instruction — for a financial document,
a confident-sounding wrong extraction is worse than a flagged null. The
UI layer should force user confirmation on any field marked low-confidence
or in raw_fields_needing_review before it's used anywhere downstream.

## Document type detection (added after real-sample review, Aug 2026)

Real-world testing surfaced something the original scope missed: SARS issues
**multiple distinct document types**, not just the ITA34. At minimum:

- **ITA34** — Notice of Assessment. The per-year assessment result itself
  (income, deductions, taxable income, tax liability). This is what the
  original schema above targets.
- **ITSA** (Income Tax Statement of Account) — a running ledger/ledger
  statement covering a date range, showing transactions (assessments,
  payments, penalties, interest) posted to the account, plus a Refund
  Advice section when a refund is due.

These need to be handled as separate document types, not squeezed into one
schema. First extraction step for both paths (PDF text / vision fallback)
must be a **document type classifier** before field extraction runs.

### ITSA extraction schema (draft)

```json
{
  "document_type": "ITSA",
  "reference_number": "string",
  "issue_date": "YYYY-MM-DD",
  "statement_period": { "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" },
  "account_summary": {
    "balance_brought_forward": "number",
    "assessment": "number",
    "balance": "number"
  },
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "reference": "string",
      "description": "string",
      "tax_year": "integer | null",
      "value": "number",
      "running_balance": "number"
    }
  ],
  "compliance": {
    "unprocessed_payments": "number",
    "provisional_taxpayer": "boolean",
    "selected_for_audit_or_verification": "boolean",
    "outstanding_returns": "boolean"
  },
  "refund_advice": {
    "refund_amount": "number | null",
    "note": "string"
  },
  "sign_convention": "negative = credit owed to taxpayer, per SARS's own printed note",
  "extraction_confidence": "high | medium | low",
  "extraction_path": "pdf_text | vision_fallback",
  "raw_fields_needing_review": ["array"]
}
```

**Important quirk to encode explicitly**: SARS prints a negative sign for
credit balances (money owed *to* the taxpayer), which is the opposite of
how most people intuitively read a negative number in a financial context.
The app's plain-language explainer MUST translate sign into words
("this is a refund owed to you") rather than showing the taxpayer a raw
negative number — that's exactly the kind of confusion the product exists
to fix.

## Live gap-check walkthrough (real sample, Aug 2026)

Running the v1 concept against the real ITSA above, treating it the way
the app would for a user:

| Step | App behavior | Output on this document |
|---|---|---|
| 1. Document classification | Detect type | ITSA (Statement of Account), not an ITA34 |
| 2. Plain-language summary | Translate sign convention | "SARS owes you a refund of R3,297.05 for the 2021 tax year." |
| 3. Blocker check | Read compliance flags | No blockers — not a provisional taxpayer, not selected for audit/verification, no outstanding returns flagged |
| 4. Anomaly flag | Compare transaction dates to issue date | Flag: a second transaction ("Additional assessment 2021", R0.00) is dated 2026-09-01 — after this statement's issue date of 2026-08-01. App should surface this as "worth checking on eFiling, this looks like a scheduled or pending entry" rather than silently ignoring it or silently assuming it's fine |
| 5. Gap-check prompts | Since this is an ITSA (ledger), not an ITA34 (assessment detail) | App should prompt the user to also pull the actual ITA34 for the 2021 year if they want the deduction-level gap-check (RA top-up, medical credits, etc.) — the ITSA alone doesn't contain income/deduction line items to check against |

This is a useful real finding: **the ITSA and ITA34 serve different jobs**,
and the gap-check (deduction-level) logic only makes sense against the
ITA34. The ITSA's job is account-balance clarity and refund status. v1
scope should treat "explain my refund/balance" (ITSA) and "check my
deductions" (ITA34) as two distinct flows sharing one document-upload
entry point, not one flow.

## Worked example #2 — real ITA34, "the value prop in one document" (Aug 2026)

A real ITA34 test document (anonymized here) demonstrated exactly the gap
this product exists to close: the top-line summary and the actual account
status told two different stories, and the difference was buried in fine
print most people would skim past.

**What the top summary table said** (page 1, the part anyone would
actually read): a credit/refund of R3,297.05, no audit flag, no
outstanding returns, everything looking clean.

**What a careful read of the full document revealed:**

1. **Assessed income was R0.00.** The Income section (page 5) showed
   Employment income [IRP5/IT3(a)] as zero. For a salaried taxpayer, an
   R0 income assessment is a red flag that IRP5 data either didn't reach
   SARS or wasn't matched to the account — not something to accept at
   face value just because a refund is attached to it.
2. **The refund was actually withheld**, not incoming. Buried in a
   paragraph of boilerplate on page 3 of 5: SARS explicitly stated the
   refund could not be paid because they did not hold valid banking
   details, and it would remain withheld pending resolution. Nothing in
   the top-line summary table on page 1 hints at this.

**Why this matters for the product**: this is the app's core value prop
in one concrete example. A user skimming the summary table would walk
away thinking "refund coming, nothing to do." The actual situation needed
two follow-up actions (verify income data, update banking details) that
were both present in the document but not in the headline. This is a
strong argument for the plain-language explainer to always surface
fine-print blockers and unusual figures (R0 income for an employed
person, refunds marked as withheld, etc.) in the FIRST screen a user
sees — not as something they have to find by reading five pages closely.

This should directly shape the deduction/anomaly gap-check prompt design:
beyond the planned RA/medical/home-office deduction prompts, the app needs
a "does anything on this assessment look structurally off" pass — R0
income with an employed profile, refund/payment status contradicting the
top-line balance, dates inconsistent with the issue date (as seen in the
ITSA test earlier) — before it even gets to deduction-specific questions.

## Open questions before building
1. ~~Confirm with a tax professional: does "gap-check checklist" cross into
   practitioner-advice territory under SARS's rules?~~ **RESEARCHED** — see
   note below. Still get final sign-off from an actual tax attorney before
   launch, but the product shape looks defensible.
2. ~~OCR reliability — SARS assessment PDF layout needs testing~~
   **RESEARCHED** — see note below. Real-world testing against actual user
   documents (once available) still needed to confirm.
3. Given the seasonal spike (Jul–Oct), is the acquisition/marketing plan
   built around that window, or year-round positioning (e.g. "get ready
   early")?

### Note on Q2 — ITA34 structure & extraction approach (July 2026)

The SARS Notice of Assessment (ITA34) is a fixed-template government form,
not free-form text. Same field labels, same order, every year:

- **Header block**: reference number, document number, date of assessment,
  year of assessment, type of assessment (Original / Additional / Reduced /
  Estimate), payment due date, PRN
- **Balance section**: description + amount (refund owed / amount payable)
- **Compliance flags**: provisional taxpayer Y/N, selected for audit or
  verification Y/N
- **Assessment summary table**: 3 columns (Previous Assessment / Current
  Assessment / Account Adjustments) × 4 rows (Income, Deductions allowed,
  Taxable income / Assessed Loss, Calculated Tax Liability)

This is a much easier extraction problem than variable-format documents
(invoices, bank statements) because the schema is known and stable.

**Two extraction paths, branch on input type:**

1. **Text-native PDF** (downloaded from eFiling/MobiApp) — almost certainly
   has a real text layer, not a scanned image. Use direct PDF text
   extraction + label-matching against the known ITA34 field schema
   (e.g. pdfplumber). No OCR/vision API needed for this path — cheaper,
   faster, more reliable.
2. **Screenshot/photo** (no text layer) — needs vision-based extraction.
   Use a Claude vision call with the known ITA34 field schema as the
   extraction target (structured JSON out), rather than generic OCR — the
   fixed template means the model knows exactly what to look for.

**Decision for v1**: implement path 1 first (PDF text extraction) since
it's simpler and covers users who download from eFiling. Add path 2
(vision fallback for screenshots) once path 1 is validated. Either path:
always show the user the parsed fields before proceeding and let them
correct anything — never silently trust extraction on a document with
real financial consequences.

### Note on Q1 — Tax Administration Act s240 research (July 2026)

The registration trigger is a **natural person** who provides tax advice or
completes/assists in completing a return for **consideration** (the "free"
exemption doesn't apply since we're charging). Key implication: software that
explains an assessment and prompts the user to self-check deduction
categories — without a human at our company completing/assisting with the
actual return, and without submitting to SARS on the user's behalf — sits
outside the s240 trigger as currently understood.

TaxTim (SA market leader, 14M+ users) validates this split in practice: they
separate "guidance" (included in the base price, self-service) from "we do
it for you" (requires their in-house registered tax practitioners, priced
separately, only kicks in for audits/disputes/complex calculations). Their
free base product does NOT submit to SARS without a paid tier and does NOT
require registration for the explainer/checklist layer.

**Decision for v1**: stay entirely in the explainer + checklist lane. No
eFiling submission integration, no "we file for you" tier, in v1. That
keeps us on the unregistered-safe side of the line. A "human practitioner
does it for you" tier is a valid v2/v3 expansion, but it's a distinct
compliance and staffing decision — not a feature toggle.
