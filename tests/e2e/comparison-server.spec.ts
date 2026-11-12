import { test, expect } from "@playwright/test";
import { preview } from "vite";
import { recruitingComparison } from "../../server/recruiting-comparison";
import { initialState } from "../../src/features/prototype/model";

test("real comparison server blocks extra calls and the browser keeps its last result", async ({
  page,
  request,
}) => {
  const server = await preview({
    configFile: false,
    plugins: [recruitingComparison("synthetic-test-key")],
    preview: { host: "127.0.0.1", port: 0 },
  });
  const originalFetch = globalThis.fetch;
  let allowFirstResponse!: () => void;
  const firstResponse = new Promise<void>((resolve) => {
    allowFirstResponse = resolve;
  });
  try {
    const address = server.httpServer.address();
    if (!address || typeof address === "string") throw new Error("Expected a loopback HTTP port");
    const origin = `http://127.0.0.1:${address.port}`;
    const endpoint = `${origin}/api/recruiting-comparison`;
    const scenario = initialState();
    const application = scenario.applications[0];
    const offer = scenario.jobs.find((job) => job.id === application.jobId)!.description;
    const materials = { offer, answer: application.answer, cv: application.cv };
    const requirement = offer
      .split("\n")
      .find((line) => line.trim())!
      .trim();
    const question = "Czy możesz opowiedzieć o przykładzie z fikcyjnego projektu?";
    const result = {
      requirements: [{ requirement, evidence: [] }],
      questions: [{ requirementIndex: 0, text: question }],
      inconsistencies: [],
    };

    let providerCalls = 0;
    globalThis.fetch = async (input, options) => {
      expect(new URL(String(input)).origin).toBe("https://generativelanguage.googleapis.com");
      expect(new Headers(options?.headers).get("x-goog-api-key")).toBe("synthetic-test-key");
      providerCalls++;
      if (providerCalls === 1) await firstResponse;
      if (providerCalls === 2) return new Response(null, { status: 502 });
      return Response.json({
        candidates: [
          { finishReason: "STOP", content: { parts: [{ text: JSON.stringify(result) }] } },
        ],
      });
    };
    const post = (data: object, requestOrigin = origin) =>
      request.post(endpoint, {
        headers: { Origin: requestOrigin, "Content-Type": "application/json" },
        data,
      });

    expect((await post(materials, "https://other.example.test")).status()).toBe(403);
    expect((await post({ answer: "Niepełny przykład." })).status()).toBe(400);

    await page.goto(`${origin}/#/auth/sign-in`);
    await page.getByRole("button", { name: "Wejdź jako Karolina Wiśniewska", exact: true }).click();
    await page.goto(`${origin}/#/app/kandydaci/application-example`);
    const comparison = page.getByRole("region", { name: "Porównanie" });
    const note = page.getByLabel("Notatka rekrutacyjna (widoczna pracodawcy)");
    const manualNote = "Fikcyjna notatka do zachowania.";
    await note.fill(manualNote);
    expect(providerCalls).toBe(0);
    await comparison.getByRole("button", { name: "Porównaj z wymaganiami" }).click();
    await expect.poll(() => providerCalls).toBe(1);

    const concurrent = await post(materials);
    expect(concurrent.status()).toBe(429);
    expect(concurrent.headers()["retry-after"]).toBe("5");
    expect(providerCalls).toBe(1);
    allowFirstResponse();
    await expect(comparison.getByText(question, { exact: true })).toBeVisible();
    await expect(note).toHaveValue(new RegExp(manualNote));

    expect((await post(materials)).status()).toBe(502);
    for (let attempt = 0; attempt < 3; attempt++) {
      expect((await post(materials)).status()).toBe(200);
    }
    expect(providerCalls).toBe(5);

    const retry = comparison.getByRole("button", { name: "Wygeneruj ponownie" });
    await retry.focus();
    await page.keyboard.press("Enter");
    await expect(comparison.getByRole("alert")).toContainText("Spróbuj ponownie za co najmniej");
    await expect(comparison.getByText(question, { exact: true })).toBeVisible();
    await expect(note).toHaveValue(new RegExp(manualNote));
    await expect(retry).toBeFocused();
    expect(providerCalls).toBe(5);
  } finally {
    allowFirstResponse();
    try {
      await server.close();
    } finally {
      globalThis.fetch = originalFetch;
    }
  }
});
