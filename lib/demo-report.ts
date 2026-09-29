import type { AssessmentReport } from "@/lib/assessment";

export const demoAssessmentReport: AssessmentReport = {
  mcqAccuracy: {
    score: 8,
    ratedItems: 10,
    maximumScore: 10,
    totalItems: 10,
  },
  writtenReasoning: {
    score: 18,
    ratedItems: 6,
    maximumScore: 24,
    totalItems: 6,
  },
  writtenItemResults: [
    {
      questionId: "Q02",
      status: "rated",
      score: 3,
      feedback: "Identified self-selection as a possible explanation and asked for a comparable control group.",
    },
    {
      questionId: "Q04",
      status: "rated",
      score: 3,
      feedback: "Recognized that strong employees may be both more likely to receive promotions and remain at the company.",
    },
    {
      questionId: "Q06",
      status: "rated",
      score: 4,
      feedback: "Separated correlation from causation and proposed a fair test before changing company policy.",
    },
    {
      questionId: "Q08",
      status: "rated",
      score: 2,
      feedback: "Questioned the comparison, but could more clearly explain why the neighborhoods were different at baseline.",
    },
    {
      questionId: "Q10",
      status: "rated",
      score: 3,
      feedback: "Correctly requested the overall seat-belt usage rate and outcomes for comparable crashes.",
    },
    {
      questionId: "Q12",
      status: "rated",
      score: 3,
      feedback: "Showed a solid intuitive understanding of base rates and false positives.",
    },
  ],
  previewObservations: [
    "You consistently look for hidden variables before accepting a causal claim.",
    "Your strongest responses compare plausible explanations and ask what evidence would distinguish between them.",
  ],
  aspects: [
    {
      title: "Identifying assumptions",
      questionIds: ["Q03", "Q09", "Q11"],
      evidenceSufficient: true,
      summary: "You readily spot assumptions that are doing unspoken work inside an argument.",
      evidence: [
        {
          questionId: "Q09",
          excerpt: "Explaining a concept clearly can have more than one cause.",
          observation: "Correctly identified the reversed logical implication.",
        },
      ],
      practiceOpportunity: "Before accepting a conclusion, write down the one assumption that must be true for it to hold.",
      caveat: "This result reflects a small set of structured questions.",
    },
    {
      title: "Evaluating evidence",
      questionIds: ["Q01", "Q07", "Q14"],
      evidenceSufficient: true,
      summary: "You distinguish credible comparisons from impressive-sounding statistics with missing context.",
      evidence: [
        {
          questionId: "Q07",
          excerpt: "The survey excludes people who stopped using the product.",
          observation: "Detected survivorship bias in the supporting evidence.",
        },
      ],
      practiceOpportunity: "For each claim, check who was measured, who was excluded, and how the outcome was defined.",
      caveat: "Performance may vary with unfamiliar subject matter.",
    },
    {
      title: "Alternative explanations",
      questionIds: ["Q04", "Q05", "Q08"],
      evidenceSufficient: true,
      summary: "You generate realistic competing explanations instead of settling on the first plausible story.",
      evidence: [
        {
          questionId: "Q04",
          excerpt: "High performers may receive promotions and already be more committed to staying.",
          observation: "Proposed a clear selection-based alternative explanation.",
        },
      ],
      practiceOpportunity: "Practice naming two rival explanations and one observation that would separate them.",
      caveat: "Open-ended answers were evaluated from a single session.",
    },
    {
      title: "Conflicting or competing evidence",
      questionIds: ["Q06", "Q13", "Q15"],
      evidenceSufficient: false,
      summary: "You notice major confounders, but sometimes weigh competing evidence too quickly.",
      evidence: [
        {
          questionId: "Q13",
          excerpt: "The admission change could account for part of the improvement.",
          observation: "Recognized that two simultaneous changes prevent a confident attribution.",
        },
      ],
      practiceOpportunity: "Create a short evidence table and rate how strongly each fact supports every explanation.",
      caveat: "More varied examples are needed for a firm conclusion in this area.",
    },
    {
      title: "Decision under uncertainty",
      questionIds: ["Q10", "Q12", "Q16"],
      evidenceSufficient: false,
      summary: "You account for missing information, with room to be more explicit about probabilities and confidence.",
      evidence: [
        {
          questionId: "Q12",
          excerpt: "A positive test can still be a false positive when the condition is rare.",
          observation: "Applied the base-rate idea correctly without relying on exact arithmetic.",
        },
      ],
      practiceOpportunity: "State a confidence range, then name the new evidence most likely to change your decision.",
      caveat: "The assessment samples only a few uncertainty scenarios.",
    },
  ],
  demonstratedStrengths: [
    "Separating correlation from causation",
    "Finding hidden assumptions in arguments",
    "Generating plausible alternative explanations",
  ],
  nextSteps: [
    "Compare competing explanations before deciding which one is strongest",
    "Use base rates when interpreting risk, tests, and percentages",
    "State your confidence level and what evidence could change it",
  ],
  confidence: "moderate",
  confidenceReason: "The sample contains complete answers across all 16 questions, with consistent evidence in several related reasoning skills.",
};
