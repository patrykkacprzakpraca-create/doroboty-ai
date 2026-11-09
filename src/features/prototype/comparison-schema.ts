import { z } from "zod";

const material = z.string().trim().min(1).max(12000);
const excerpt = z.string().trim().min(1).max(12000);

export const comparisonInput = z.strictObject({
  offer: material,
  answer: material,
  cv: material,
});

const evidenceItem = z.strictObject({
  source: z.enum(["answer", "cv"]),
  quote: excerpt,
});
const questionText = z.string().trim().min(1).max(1000);

export const comparisonResult = z.strictObject({
  requirements: z.array(
    z.strictObject({
      requirement: excerpt,
      evidence: z.array(evidenceItem),
    }),
  ),
  questions: z.array(
    z.strictObject({
      requirementIndex: z.number().int().nonnegative(),
      text: questionText,
    }),
  ),
  inconsistencies: z.array(
    z.strictObject({
      summary: z.string().trim().min(1).max(1000),
      evidence: z.array(evidenceItem).min(2),
      question: questionText,
    }),
  ),
});

export type ComparisonInput = z.infer<typeof comparisonInput>;
export type ComparisonResult = z.infer<typeof comparisonResult>;

export function comparisonQuestions(result: ComparisonResult) {
  return [
    ...result.questions.map(({ requirementIndex, text }) => ({
      text,
      context: result.requirements[requirementIndex].requirement,
    })),
    ...result.inconsistencies.map(({ summary, question }) => ({
      text: question,
      context: summary,
    })),
  ];
}

export function validateComparison(input: ComparisonInput, output: unknown) {
  const result = comparisonResult.parse(output);
  const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
  const offer = normalize(input.offer);
  const materials = { answer: normalize(input.answer), cv: normalize(input.cv) };
  const requirements = result.requirements.map(({ requirement }) => normalize(requirement));

  const askedRequirements = new Set(
    result.questions.map(({ requirementIndex }) => requirementIndex),
  );
  const issues: string[] = [];
  const seenQuestions = new Set<string>();

  function checkQuestion(question: string, path: string) {
    const normalized = normalize(question).toLowerCase();
    if (seenQuestions.has(normalized)) issues.push(`${path} repeats a question.`);
    seenQuestions.add(normalized);
  }

  function checkQuotes(evidence: z.infer<typeof evidenceItem>[], path: string) {
    evidence.forEach(({ source, quote }, index) => {
      if (!materials[source].includes(normalize(quote))) {
        issues.push(`${path}[${index}].quote must be copied verbatim from ${source}.`);
      }
    });
  }

  if (new Set(requirements).size !== requirements.length) {
    issues.push("requirements contains duplicate excerpts.");
  }
  result.requirements.forEach(({ evidence }, index) => {
    if (!offer.includes(requirements[index])) {
      issues.push(`requirements[${index}].requirement must be copied verbatim from offer.`);
    }
    if (!evidence.length && !askedRequirements.has(index)) {
      issues.push(
        `requirements[${index}] is unconfirmed and needs a question with requirementIndex ${index}.`,
      );
    }
    checkQuotes(evidence, `requirements[${index}].evidence`);
  });
  result.questions.forEach(({ requirementIndex, text }, index) => {
    const requirement = result.requirements[requirementIndex];
    if (!requirement || requirement.evidence.length > 0) {
      issues.push(
        `questions[${index}].requirementIndex must point to an existing unconfirmed requirement (zero-based).`,
      );
    }
    checkQuestion(text, `questions[${index}].text`);
  });
  result.inconsistencies.forEach(({ evidence, question }, index) => {
    const path = `inconsistencies[${index}]`;
    if (new Set(evidence.map(({ quote }) => normalize(quote))).size < 2) {
      issues.push(`${path}.evidence must contain at least two different quotes.`);
    }
    checkQuotes(evidence, `${path}.evidence`);
    checkQuestion(question, `${path}.question`);
  });
  if (issues.length) throw new Error(issues.join("\n"));

  return result;
}
