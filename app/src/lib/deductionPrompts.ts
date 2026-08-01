import type { DeductionPrompt } from "./types";

export const DEDUCTION_PROMPTS: DeductionPrompt[] = [
  {
    code: "ra_topup",
    question: "Did you make any retirement annuity or pension top-up contributions this tax year?",
    explanation:
      "Contributions to a retirement annuity, pension, or provident fund are deductible up to 27.5% of your taxable income (capped at R350,000/year). If you topped up outside of payroll deductions, SARS may not have this on record yet.",
    appliesTo: ["salaried", "freelance", "mixed"],
  },
  {
    code: "medical_credit",
    question: "Did you pay medical aid contributions or out-of-pocket medical expenses not covered by your scheme?",
    explanation:
      "Medical scheme contributions earn a fixed monthly tax credit, and qualifying out-of-pocket medical expenses above a threshold can add an additional credit. Check that both are reflected.",
    appliesTo: ["salaried", "freelance", "mixed"],
  },
  {
    code: "home_office",
    question: "Did you regularly work from a dedicated home office space this tax year?",
    explanation:
      "If part of your home was used regularly and exclusively for work, a portion of costs like rent, interest, utilities, and repairs may be deductible. The space must be specifically set up and used for work — a couch with a laptop doesn't qualify.",
    appliesTo: ["salaried", "freelance", "mixed"],
  },
  {
    code: "travel_logbook",
    question: "Did you use your own vehicle for work travel and keep a logbook?",
    explanation:
      "Business travel (not your regular commute) can be claimed against a travel allowance or as a deduction, but SARS requires a logbook recording dates, distances, and purpose — without one, a claim is very hard to defend if queried.",
    appliesTo: ["salaried", "freelance", "mixed"],
  },
  {
    code: "donations_18a",
    question: "Did you donate to a registered public benefit organisation and get a section 18A certificate?",
    explanation:
      "Donations to organisations with section 18A status are deductible up to 10% of your taxable income, but only with a valid s18A certificate — SARS won't accept a bank statement alone.",
    appliesTo: ["salaried", "freelance", "mixed"],
  },
  {
    code: "income_protection",
    question: "Do you pay premiums on an income protection policy?",
    explanation:
      "Premiums on a qualifying income protection policy (one that pays out based on inability to earn income, not a lump-sum life policy) are generally deductible.",
    appliesTo: ["salaried", "freelance", "mixed"],
  },
];
