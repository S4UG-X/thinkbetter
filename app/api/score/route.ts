import { env } from "cloudflare:workers";
import { z } from "zod";

import {
  type AssessmentReport,
  type MultipleChoiceQuestionId,
  multipleChoiceQuestionIds,
  questionIds,
  questions,
  reportAspectTitles,
  writtenQuestionIds,
} from "@/lib/assessment";
import { ASPECT_CROSSWALK, SCORING_INSTRUCTIONS } from "@/lib/scoring-rubric";

const noStoreHeaders = { "Cache-Control": "no-store" };

const answerSchema = z.object({
  questionId: z.enum(questionIds),
  choice: z.string().max(1).nullable(),
  explanation: z.string().max(8_000),
});

const requestSchema = z
  .object({
    answers: z.array(answerSchema).length(16),
  })
  .strict()
  .superRefine((value, context) => {
    const submitted = new Set(value.answers.map((answer) => answer.questionId));
    if (submitted.size !== questionIds.length || questionIds.some((id) => !submitted.has(id))) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["answers"],
        message: "Submit each assessment item exactly once.",
      });
    }
  });

const writtenItemResultSchema = z.object({
  questionId: z.enum(writtenQuestionIds),
  status: z.enum(["rated", "not_rated"]),
  score: z.number().int().min(0).max(4).nullable(),
  feedback: z.string().min(1).max(600),
});

const evidenceSchema = z.object({
  questionId: z.enum(questionIds),
  excerpt: z.string().max(240),
  observation: z.string().min(1).max(600),
});

const modelOutputSchema = z.object({
  writtenItemResults: z.array(writtenItemResultSchema).length(6),
  previewObservations: z.array(z.string().min(1).max(500)).min(1).max(2),
  aspects: z
    .array(
      z.object({
        title: z.enum(reportAspectTitles),
        evidenceSufficient: z.boolean(),
        summary: z.string().min(1).max(1_200),
        evidence: z.array(evidenceSchema).max(3),
        practiceOpportunity: z.string().min(1).max(800),
      }),
    )
    .length(5),
  demonstratedStrengths: z.array(z.string().min(1).max(500)).max(3),
  nextSteps: z.array(z.string().min(1).max(500)).max(2),
  confidence: z.enum(["high", "moderate", "low"]),
  confidenceReason: z.string().min(1).max(600),
});

const structuredOutputSchema = {
  type: "object",
  properties: {
    writtenItemResults: {
      type: "array",
      minItems: 6,
      maxItems: 6,
      items: {
        type: "object",
        properties: {
          questionId: { type: "string", enum: writtenQuestionIds },
          status: { type: "string", enum: ["rated", "not_rated"] },
          score: { anyOf: [{ type: "integer", minimum: 0, maximum: 4 }, { type: "null" }] },
          feedback: { type: "string" },
        },
        required: ["questionId", "status", "score", "feedback"],
        additionalProperties: false,
      },
    },
    previewObservations: {
      type: "array",
      minItems: 1,
      maxItems: 2,
      items: { type: "string" },
    },
    aspects: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          title: { type: "string", enum: reportAspectTitles },
          evidenceSufficient: { type: "boolean" },
          summary: { type: "string" },
          evidence: {
            type: "array",
            maxItems: 3,
            items: {
              type: "object",
              properties: {
                questionId: { type: "string", enum: questionIds },
                excerpt: { type: "string" },
                observation: { type: "string" },
              },
              required: ["questionId", "excerpt", "observation"],
              additionalProperties: false,
            },
          },
          practiceOpportunity: { type: "string" },
        },
        required: ["title", "evidenceSufficient", "summary", "evidence", "practiceOpportunity"],
        additionalProperties: false,
      },
    },
    demonstratedStrengths: {
      type: "array",
      maxItems: 3,
      items: { type: "string" },
    },
    nextSteps: {
      type: "array",
      maxItems: 2,
      items: { type: "string" },
    },
    confidence: { type: "string", enum: ["high", "moderate", "low"] },
    confidenceReason: { type: "string" },
  },
  required: [
    "writtenItemResults",
    "previewObservations",
    "aspects",
    "demonstratedStrengths",
    "nextSteps",
    "confidence",
    "confidenceReason",
  ],
  additionalProperties: false,
} as const;

const MCQ_ANSWER_KEYS = {
  Q01: "C",
  Q03: "B",
  Q05: "B",
  Q07: "B",
  Q09: "B",
  Q11: "B",
  Q13: "C",
  Q14: "B",
  Q15: "C",
  Q16: "C",
} as const satisfies Record<MultipleChoiceQuestionId, string>;

type OpenAIResponse = {
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string; refusal?: string }>;
  }>;
  error?: { message?: string };
};

function extractOutputText(response: OpenAIResponse) {
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && content.text) return content.text;
    }
  }
  return null;
}

function normalizeExcerpt(value: string) {
  return value
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function validateModelOutput(value: unknown) {
  const parsed = modelOutputSchema.parse(value);
  const seenQuestions = new Set(parsed.writtenItemResults.map((item) => item.questionId));
  const seenAspects = new Set(parsed.aspects.map((aspect) => aspect.title));

  if (
    seenQuestions.size !== writtenQuestionIds.length ||
    writtenQuestionIds.some((id) => !seenQuestions.has(id)) ||
    seenAspects.size !== reportAspectTitles.length ||
    reportAspectTitles.some((title) => !seenAspects.has(title))
  ) {
    throw new Error("The scoring response did not cover the complete assessment.");
  }

  for (const item of parsed.writtenItemResults) {
    if ((item.status === "not_rated") !== (item.score === null)) {
      throw new Error("The scoring response used an inconsistent item status.");
    }
  }

  return parsed;
}

export async function POST(request: Request) {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        code: "SCORING_NOT_CONFIGURED",
        message:
          "Scoring is not active yet. Your answers are still in this browser, so you can retry after the evaluator is configured.",
      },
      { status: 503, headers: noStoreHeaders },
    );
  }

  try {
    const payload = requestSchema.safeParse(await request.json());
    if (!payload.success) {
      return Response.json(
        { code: "INVALID_RESPONSES", message: "The assessment responses could not be read." },
        { status: 422, headers: noStoreHeaders },
      );
    }

    const answerByQuestion = new Map(
      payload.data.answers.map((answer) => [answer.questionId, answer]),
    );
    const scoringRecord = payload.data.answers.map((answer) => {
      const question = questions.find((item) => item.id === answer.questionId)!;
      const selected = question.choices?.find((choice) => choice.label === answer.choice);

      return {
        questionId: answer.questionId,
        responseType: question.responseType,
        question: question.stem,
        selectedChoice: selected ? `${selected.label}. ${selected.text}` : null,
        explanation:
          question.responseType === "multiple-choice" ? "" : answer.explanation.trim(),
      };
    });

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.OPENAI_SCORING_MODEL || "gpt-6-astra",
        store: false,
        max_output_tokens: 9_000,
        instructions: `${SCORING_INSTRUCTIONS}\n\nReturn only the requested structured evaluation. Preserve the item and aspect order. Public feedback must be concise, specific, and suitable for the test taker; do not reveal answer keys or evaluator-only notes.`,
        input: JSON.stringify({
          purpose:
            "Score the six written-reasoning items and produce response-grounded qualitative feedback using the fixed evaluator rubric.",
          responses: scoringRecord,
        }),
        text: {
          format: {
            type: "json_schema",
            name: "critical_thinking_report",
            strict: true,
            schema: structuredOutputSchema,
          },
        },
      }),
      signal: AbortSignal.timeout(60_000),
    });

    const responseBody = (await response.json().catch(() => null)) as OpenAIResponse | null;
    if (!response.ok) {
      console.error("Assessment scoring request failed", response.status, responseBody?.error?.message);
      return Response.json(
        {
          code: "SCORING_UNAVAILABLE",
          message: "The report could not be calculated right now. Your answers are still here; please retry.",
        },
        { status: 502, headers: noStoreHeaders },
      );
    }

    const outputText = responseBody && extractOutputText(responseBody);
    if (!outputText) throw new Error("The evaluator returned no structured report.");

    const evaluated = validateModelOutput(JSON.parse(outputText));
    const answeredMcqIds = multipleChoiceQuestionIds.filter((id) => {
      const answer = answerByQuestion.get(id)!;
      const question = questions.find((item) => item.id === id)!;
      return question.choices?.some((choice) => choice.label === answer.choice);
    });
    const mcqScore = answeredMcqIds.filter(
      (id) => answerByQuestion.get(id)!.choice === MCQ_ANSWER_KEYS[id],
    ).length;
    const submittedWrittenIds = new Set(
      writtenQuestionIds.filter((id) => {
        const record = scoringRecord.find((item) => item.questionId === id)!;
        return Boolean(record.selectedChoice || record.explanation);
      }),
    );
    const writtenItemResults = writtenQuestionIds.map((id) => {
      const item = evaluated.writtenItemResults.find((result) => result.questionId === id)!;
      return !submittedWrittenIds.has(id)
        ? {
            questionId: id,
            status: "not_rated" as const,
            score: null,
            feedback: "No response was submitted, so this item was not rated.",
          }
        : item;
    });
    const ratedWrittenItems = writtenItemResults.filter(
      (item): item is typeof item & { score: number } => item.status === "rated" && item.score !== null,
    );
    const writtenScore = ratedWrittenItems.reduce((sum, item) => sum + item.score, 0);
    const responseText = new Map(
      scoringRecord.map((record) => [
        record.questionId,
        normalizeExcerpt(`${record.selectedChoice ?? ""} ${record.explanation}`),
      ]),
    );
    const observableQuestions = new Set<string>(answeredMcqIds);
    for (const item of ratedWrittenItems) observableQuestions.add(item.questionId);

    const aspects = reportAspectTitles.map((title) => {
      const modelAspect = evaluated.aspects.find((aspect) => aspect.title === title)!;
      const crosswalk = [...ASPECT_CROSSWALK[title]];
      const ratedInAspect = crosswalk.some((questionId) =>
        observableQuestions.has(questionId),
      );
      const evidence = modelAspect.evidence
        .filter(
          (item) =>
            crosswalk.includes(item.questionId) && observableQuestions.has(item.questionId),
        )
        .map((item) => {
          const normalized = normalizeExcerpt(item.excerpt);
          const excerptIsGrounded =
            normalized.length > 0 &&
            normalized.split(" ").length <= 18 &&
            responseText.get(item.questionId)?.includes(normalized);

          return { ...item, excerpt: excerptIsGrounded ? item.excerpt : "" };
        });

      return {
        ...modelAspect,
        evidenceSufficient: ratedInAspect && modelAspect.evidenceSufficient,
        summary: ratedInAspect
          ? modelAspect.summary
          : "The responses assigned to this area were skipped or could not be rated, so there is too little evidence for a useful judgment.",
        evidence: ratedInAspect ? evidence : [],
        practiceOpportunity: ratedInAspect
          ? modelAspect.practiceOpportunity
          : "Try one of these questions again and state the conclusion, the evidence that supports it, and what would change your view.",
        questionIds: crosswalk,
        caveat:
          title === "Conflicting or competing evidence"
            ? "This area is covered indirectly through questions about simultaneous changes and comparison groups; it is not fully measured by this question set."
            : "",
      };
    });

    const report: AssessmentReport = {
      mcqAccuracy: {
        score: mcqScore,
        ratedItems: answeredMcqIds.length,
        maximumScore: answeredMcqIds.length,
        totalItems: multipleChoiceQuestionIds.length,
      },
      writtenReasoning: {
        score: writtenScore,
        ratedItems: ratedWrittenItems.length,
        maximumScore: ratedWrittenItems.length * 4,
        totalItems: writtenQuestionIds.length,
      },
      writtenItemResults,
      previewObservations: evaluated.previewObservations,
      aspects,
      demonstratedStrengths: evaluated.demonstratedStrengths,
      nextSteps: evaluated.nextSteps,
      confidence: evaluated.confidence,
      confidenceReason: evaluated.confidenceReason,
    };

    return Response.json({ report }, { status: 200, headers: noStoreHeaders });
  } catch (error) {
    console.error(
      "Unable to calculate assessment report",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json(
      {
        code: "SCORING_UNAVAILABLE",
        message: "The report could not be calculated right now. Your answers are still here; please retry.",
      },
      { status: 502, headers: noStoreHeaders },
    );
  }
}
