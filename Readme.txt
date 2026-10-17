TAXASSIST (working name) - tax-assistant
========================================

A planned South African tax explainer and checklist tool. Taxpayers upload their SARS
assessment; the app explains it in plain language and prompts them to check commonly missed
deductions before they file on eFiling themselves.

THE FULL SCOPE DOCUMENT IS tax-assistant-v1-scope.md. SUMMARY:

- Audience: the "almost-simple" taxpayer (salaried with RA/pension, medical aid, some
  freelance or rental income).
- Positioning: an explainer and checklist tool, not a registered tax practitioner service.
  It does not file on the user's behalf. Confirm this with a tax attorney before launch.
- MVP: assessment import (PDF text extraction first, vision fallback for screenshots),
  plain-language explainer, rules-based deduction gap-check, light freelance income capture,
  and a filing-day checklist PDF.
- Handles both the ITA34 (Notice of Assessment) and ITSA (Statement of Account), with a
  document-type classifier and an anomaly pass (for example R0 income, withheld refunds).
- Never guesses figures: uncertain fields are flagged for the user to confirm.
- Suggested stack: Vite + React on Vercel, Supabase (Postgres, Auth, Storage).
- POPIA compliance and a dedicated row-level-security audit are required before launch.

REPOSITORY CONTENTS
-------------------
  tax-assistant-v1-scope.md   Product scope, schemas and research notes
  app/                        Application code (early stage)
