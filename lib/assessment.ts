export const MULTIPLE_CHOICE_INSTRUCTION =
  "Choose the best answer and briefly explain why it is best. If useful, mention why one plausible alternative is weaker.";

export type QuestionId =
  | "Q01"
  | "Q02"
  | "Q03"
  | "Q04"
  | "Q05"
  | "Q06"
  | "Q07"
  | "Q08"
  | "Q09"
  | "Q10"
  | "Q11"
  | "Q12"
  | "Q13"
  | "Q14"
  | "Q15"
  | "Q16";

export type Choice = {
  label: "A" | "B" | "C" | "D";
  text: string;
};

export type AssessmentQuestion = {
  id: QuestionId;
  responseType: "multiple-choice" | "short-answer" | "choice-and-explanation";
  difficulty: string;
  stem: string;
  choices?: Choice[];
};

export type AssessmentAnswer = {
  choice: string | null;
  explanation: string;
};

export const questions: AssessmentQuestion[] = [
  {
    id: "Q01",
    responseType: "multiple-choice",
    difficulty: "Very easy",
    stem: "A university finds that students who attend office hours earn higher grades than students who do not. Which conclusion is best supported?",
    choices: [
      { label: "A", text: "Office hours directly cause higher grades" },
      { label: "B", text: "Students attending office hours are more intelligent" },
      {
        label: "C",
        text: "Office-hour attendance is associated with higher grades, but other factors may explain the relationship",
      },
      { label: "D", text: "Every student should attend office hours" },
    ],
  },
  {
    id: "Q02",
    responseType: "short-answer",
    difficulty: "Easy",
    stem: `A university finds that students who attend optional review sessions score, on average, 12 points higher on the final exam than students who do not attend.

A professor concludes:
“The review sessions improve exam scores by 12 points.”

What additional evidence would you want before accepting that conclusion?`,
  },
  {
    id: "Q03",
    responseType: "multiple-choice",
    difficulty: "Easy",
    stem: "A study reports that students who sleep at least 8 hours score 12% higher on exams. Which additional information would be most important before concluding that more sleep improves exam performance?",
    choices: [
      { label: "A", text: "Whether the students like sleeping" },
      {
        label: "B",
        text: "Whether the two groups differed in study habits, health, or course difficulty",
      },
      { label: "C", text: "Whether the exams were multiple choice" },
      { label: "D", text: "Whether students slept in dormitories" },
    ],
  },
  {
    id: "Q04",
    responseType: "short-answer",
    difficulty: "Easy to moderate",
    stem: `A company notices that employees who receive promotions are much more likely to stay with the company for at least three more years.

Management concludes:
“Giving employees promotions makes them stay longer.”

What is the strongest alternative explanation you can think of?`,
  },
  {
    id: "Q05",
    responseType: "multiple-choice",
    difficulty: "Moderate",
    stem: "A researcher observes that countries with higher coffee consumption tend to have higher life expectancy. Which explanation best demonstrates why correlation alone is insufficient?",
    choices: [
      { label: "A", text: "Coffee tastes different across countries" },
      {
        label: "B",
        text: "Wealthier countries may both consume more coffee and have better healthcare",
      },
      { label: "C", text: "Coffee contains caffeine" },
      { label: "D", text: "People drink coffee at different times of day" },
    ],
  },
  {
    id: "Q06",
    responseType: "short-answer",
    difficulty: "Moderate",
    stem: `A company notices that employees who work from home three or more days per week are 20% more productive than employees who work primarily from the office.

The CEO concludes:
“Working from home causes employees to become more productive, so we should require everyone to work from home at least three days per week.”

Do you agree with the CEO’s reasoning? Why or why not?

Explain your reasoning rather than just answering yes or no.`,
  },
  {
    id: "Q07",
    responseType: "multiple-choice",
    difficulty: "Moderate",
    stem: "A company claims: “90% of users improved their productivity after using our software.” Which fact would most seriously weaken the claim?",
    choices: [
      { label: "A", text: "The software has a monthly fee" },
      {
        label: "B",
        text: "Only users who continued using the software for six months were surveyed",
      },
      { label: "C", text: "Some users preferred another interface" },
      { label: "D", text: "Productivity was measured electronically" },
    ],
  },
  {
    id: "Q08",
    responseType: "short-answer",
    difficulty: "Moderate",
    stem: `A city installs more streetlights in neighborhoods with high crime rates. One year later, those neighborhoods still have more crime than neighborhoods with fewer streetlights.

A politician says:
“This proves that streetlights do not reduce crime.”

Is that conclusion justified? Explain why or why not.`,
  },
  {
    id: "Q09",
    responseType: "multiple-choice",
    difficulty: "Moderate",
    stem: `A professor argues:

“Students who genuinely understand statistics can explain statistical concepts clearly. Daniel can explain statistical concepts clearly. Therefore, Daniel genuinely understands statistics.”

What is the logical problem?`,
    choices: [
      { label: "A", text: "The first premise must be false" },
      {
        label: "B",
        text: "The argument incorrectly assumes that explaining concepts clearly can only result from genuine understanding",
      },
      { label: "C", text: "Statistics cannot be explained clearly" },
      { label: "D", text: "Daniel may dislike statistics" },
    ],
  },
  {
    id: "Q10",
    responseType: "short-answer",
    difficulty: "Moderate to hard",
    stem: `A news article says:
“90% of people who died in a particular accident were wearing seat belts.”

Someone concludes:
“Seat belts clearly make accidents more deadly.”

Is that conclusion justified?

Explain what missing information you would need before deciding whether seat belts increase or decrease the risk of death.`,
  },
  {
    id: "Q11",
    responseType: "multiple-choice",
    difficulty: "Hard",
    stem: "Researchers compare two teaching methods. Method A produces an average score of 84 and Method B produces an average score of 80. Which fact would most strongly challenge the conclusion that Method A is superior?",
    choices: [
      { label: "A", text: "Method A uses newer textbooks" },
      { label: "B", text: "Students were allowed to choose which teaching method they received" },
      { label: "C", text: "Method B classes started earlier" },
      { label: "D", text: "Both groups completed the same exam" },
    ],
  },
  {
    id: "Q12",
    responseType: "choice-and-explanation",
    difficulty: "Hard",
    stem: `A disease affects 1% of the population.

A test has:
- 99% sensitivity: if you have the disease, it gives a positive result 99% of the time.
- 95% specificity: if you do not have the disease, it gives a negative result 95% of the time.

You test positive.

Without doing exact mathematics if you don’t want to, do you think the probability that you actually have the disease is:`,
    choices: [
      { label: "A", text: "Around 95–99%" },
      { label: "B", text: "Around 50%" },
      { label: "C", text: "Much lower than 50%" },
    ],
  },
  {
    id: "Q13",
    responseType: "multiple-choice",
    difficulty: "Hard",
    stem: `A university introduces an AI tutoring system. After one year, failure rates fall from 20% to 14%. During the same period, admission standards become significantly more selective.

Which conclusion is most reasonable?`,
    choices: [
      { label: "A", text: "AI tutoring caused the entire reduction" },
      { label: "B", text: "Admission changes caused the entire reduction" },
      {
        label: "C",
        text: "The observed improvement cannot confidently be attributed to AI without separating the effects of the two changes",
      },
      { label: "D", text: "AI tutoring probably had no effect" },
    ],
  },
  {
    id: "Q14",
    responseType: "multiple-choice",
    difficulty: "Hard",
    stem: `A study finds:
- Students using AI daily: average GPA = 2.9
- Students rarely using AI: average GPA = 3.4

The researchers conclude that frequent AI use harms academic performance.

Which evidence would most strengthen their causal claim?`,
    choices: [
      { label: "A", text: "Students reporting that they enjoy AI" },
      {
        label: "B",
        text: "The relationship remains after controlling for prior GPA, course difficulty, study time, and socioeconomic factors",
      },
      { label: "C", text: "AI users spend more time online" },
      { label: "D", text: "More universities are adopting AI tools" },
    ],
  },
  {
    id: "Q15",
    responseType: "multiple-choice",
    difficulty: "Very hard",
    stem: `A policy reduces tuition for low-income students. Enrollment subsequently rises by 15%. However, the economy also enters a recession, historically associated with increased university enrollment.

Which research design would best estimate the policy's actual effect?`,
    choices: [
      { label: "A", text: "Ask enrolled students whether they liked the policy" },
      { label: "B", text: "Compare enrollment before and after the policy" },
      {
        label: "C",
        text: "Compare affected students with a similar unaffected group over the same period",
      },
      { label: "D", text: "Compare the university with enrollment data from ten years earlier" },
    ],
  },
  {
    id: "Q16",
    responseType: "multiple-choice",
    difficulty: "Very hard",
    stem: `Researchers discover that students who use generative AI heavily perform worse on independent reasoning tasks.

Three explanations are proposed:

- H1: AI use weakens independent reasoning.
- H2: Students with weaker reasoning skills are more likely to depend heavily on AI.
- H3: A third factor, such as low academic motivation, causes both heavy AI use and weaker reasoning.

Which study would provide the strongest evidence for distinguishing among these explanations?`,
    choices: [
      { label: "A", text: "A survey asking students whether they believe AI affects thinking" },
      { label: "B", text: "A larger cross-sectional correlation study" },
      {
        label: "C",
        text: "A longitudinal study measuring reasoning ability before AI adoption, AI usage over time, motivation, and subsequent changes in reasoning performance",
      },
      { label: "D", text: "Interviews with students who frequently use AI" },
    ],
  },
];

export const questionIds = [
  "Q01",
  "Q02",
  "Q03",
  "Q04",
  "Q05",
  "Q06",
  "Q07",
  "Q08",
  "Q09",
  "Q10",
  "Q11",
  "Q12",
  "Q13",
  "Q14",
  "Q15",
  "Q16",
] as const satisfies readonly QuestionId[];

export const reportAspectTitles = [
  "Identifying assumptions",
  "Evaluating evidence",
  "Alternative explanations",
  "Conflicting or competing evidence",
  "Decision under uncertainty",
] as const;

export type ReportAspectTitle = (typeof reportAspectTitles)[number];

export type ItemResult = {
  questionId: QuestionId;
  status: "rated" | "not_rated";
  score: number | null;
  feedback: string;
};

export type ReportEvidence = {
  questionId: QuestionId;
  excerpt: string;
  observation: string;
};

export type ReportAspect = {
  title: ReportAspectTitle;
  questionIds: QuestionId[];
  evidenceSufficient: boolean;
  summary: string;
  evidence: ReportEvidence[];
  practiceOpportunity: string;
  caveat: string;
};

export type AssessmentReport = {
  itemResults: ItemResult[];
  totalScore: number;
  ratedItems: number;
  maximumScore: number;
  previewObservations: string[];
  aspects: ReportAspect[];
  demonstratedStrengths: string[];
  nextSteps: string[];
  confidence: "high" | "moderate" | "low";
  confidenceReason: string;
};

export function emptyAnswers(): Record<QuestionId, AssessmentAnswer> {
  return Object.fromEntries(
    questionIds.map((id) => [id, { choice: null, explanation: "" }]),
  ) as Record<QuestionId, AssessmentAnswer>;
}
