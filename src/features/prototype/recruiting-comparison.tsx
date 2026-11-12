import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  comparisonQuestions,
  validateComparison,
  type ComparisonInput,
  type ComparisonResult,
} from "./comparison-schema";

type ComparisonState =
  { status: "idle" | "loading" | "ready" } | { status: "error"; message: string };

const comparisonUrl = "./api/recruiting-comparison";
const localHostnames = new Set(["127.0.0.1", "localhost", "[::1]"]);

export function RecruitingComparison({
  input,
  onQuestions,
}: {
  input: ComparisonInput | null;
  onQuestions?: (questions: string[]) => void;
}) {
  const heading = useId();
  const [state, setState] = useState<ComparisonState>({ status: "idle" });
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const local = localHostnames.has(window.location.hostname);
  const hasInput = input !== null;
  const [availability, setAvailability] = useState<"checking" | "available" | "unavailable">(
    local ? "checking" : "unavailable",
  );
  const pending = useRef<AbortController | null>(null);

  useEffect(() => () => pending.current?.abort(), []);
  useEffect(() => {
    if (!local || !hasInput) return;
    const request = new AbortController();
    async function checkAvailability() {
      try {
        const response = await fetch(comparisonUrl, {
          cache: "no-store",
          redirect: "error",
          signal: AbortSignal.any([request.signal, AbortSignal.timeout(5000)]),
        });
        const available = response.ok && (await response.json())?.available === true;
        if (!request.signal.aborted) setAvailability(available ? "available" : "unavailable");
      } catch {
        if (!request.signal.aborted) setAvailability("unavailable");
      }
    }
    void checkAvailability();
    return () => request.abort();
  }, [hasInput, local]);

  async function generate() {
    if (!local || !input || availability !== "available" || pending.current) return;
    const request = new AbortController();
    pending.current = request;
    setState({ status: "loading" });

    try {
      const response = await fetch(comparisonUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        redirect: "error",
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(50000)]),
      });
      if (response.status === 429) {
        const wait = Number(response.headers.get("Retry-After"));
        const duration = wait < 60 ? `${Math.ceil(wait)} s` : `${Math.ceil(wait / 60)} min`;
        setState({
          status: "error",
          message:
            Number.isFinite(wait) && wait > 0
              ? `Inne porównanie trwa lub limit został osiągnięty. Spróbuj ponownie za co najmniej ${duration}.`
              : "Inne porównanie trwa lub limit został osiągnięty. Spróbuj ponownie później.",
        });
        return;
      }
      if (response.status === 503 || response.status === 404 || response.status === 405) {
        setState({
          status: "error",
          message: "Porównanie wymaga lokalnego serwera z kluczem Google Gemini.",
        });
        return;
      }
      if (!response.ok) throw new Error("Comparison request failed");
      const nextResult = validateComparison(input, await response.json());
      if (request.signal.aborted) return;
      setResult(nextResult);
      onQuestions?.(comparisonQuestions(nextResult).map(({ text }) => text));
      setState({ status: "ready" });
    } catch {
      if (!request.signal.aborted) {
        setState({
          status: "error",
          message: "Nie udało się przygotować porównania. Spróbuj ponownie.",
        });
      }
    } finally {
      pending.current = null;
    }
  }

  return (
    <section className="record-comparison" aria-labelledby={heading}>
      <h3 id={heading}>Porównanie</h3>
      {!input ? (
        <p className="record-caption">Brak opisu oferty do porównania.</p>
      ) : availability === "checking" ? (
        <p className="record-caption" role="status">
          Sprawdzamy dostępność lokalnego porównania…
        </p>
      ) : availability === "unavailable" ? (
        <p className="record-caption">
          Porównanie jest dostępne po uruchomieniu projektu lokalnie z włączonym Google Gemini.
        </p>
      ) : (
        <>
          <p className="record-caption">
            Zobacz, które wymagania mają potwierdzenie w aplikacji lub CV i na jakich fragmentach
            opiera się porównanie. Jeśli brakuje informacji, dostaniesz propozycje pytań do
            kandydata.
          </p>
          <p className="record-caption">
            Porównanie wysyła do Google Gemini opis oferty, odpowiedź i tekst CV. Używaj wyłącznie
            fikcyjnych danych.
          </p>
          <div className="record-actions">
            <Button
              variant="outline"
              disabled={state.status === "loading"}
              focusableWhenDisabled
              onClick={() => void generate()}
            >
              {result ? "Wygeneruj ponownie" : "Porównaj z wymaganiami"}
            </Button>
          </div>
        </>
      )}
      <p role="status" className={state.status === "loading" ? "record-caption" : "sr-only"}>
        {state.status === "loading" && "Trwa porównywanie materiałów…"}
        {state.status === "ready" && "Porównanie jest gotowe."}
      </p>
      {state.status === "error" && (
        <p className="record-caption" role="alert">
          {state.message}
          {result && " Poniżej widzisz ostatni poprawny wynik."}
        </p>
      )}
      {result && <ComparisonDetails result={result} />}
    </section>
  );
}

function ComparisonDetails({ result }: { result: ComparisonResult }) {
  const confirmed = result.requirements.filter(({ evidence }) => evidence.length > 0);
  const unconfirmed = result.requirements.filter(({ evidence }) => evidence.length === 0);
  const questions = comparisonQuestions(result);

  return (
    <div className="record-comparison-details">
      <div>
        <h4>Potwierdzone w materiałach</h4>
        {confirmed.length ? (
          <ul>
            {confirmed.map(({ requirement, evidence }) => (
              <li key={requirement}>
                <strong>{requirement}</strong>
                <ComparisonQuotes evidence={evidence} />
              </li>
            ))}
          </ul>
        ) : (
          <p>Brak wymagań z potwierdzeniem w aplikacji lub CV.</p>
        )}
      </div>
      <div>
        <h4>Bez potwierdzenia w materiałach</h4>
        {unconfirmed.length ? (
          <ul>
            {unconfirmed.map(({ requirement }) => (
              <li key={requirement}>
                {/^(?:i\s+|znajomość\s+)?procesów\s+operacyjnych[.,;]?$/i.test(requirement.trim())
                  ? "Znajomość procesów operacyjnych"
                  : requirement}
              </li>
            ))}
          </ul>
        ) : (
          <p>Brak wymagań bez potwierdzenia.</p>
        )}
      </div>
      {result.inconsistencies.length > 0 && (
        <div>
          <h4>Niespójności w materiałach</h4>
          <ul>
            {result.inconsistencies.map(({ summary, evidence, question }) => (
              <li key={question}>
                <strong>{summary}</strong>
                <ComparisonQuotes evidence={evidence} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <h4>Pytania do kandydata</h4>
        {questions.length ? (
          <>
            <p className="record-caption">Sprawdź pytania przed wysłaniem.</p>
            <ol>
              {questions.map(({ context, text }) => (
                <li key={text}>
                  <p>{text}</p>
                  <p className="record-caption">Dotyczy „{context}”</p>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p>Brak pytań do uzupełnienia na podstawie ogłoszenia.</p>
        )}
      </div>
    </div>
  );
}

function ComparisonQuotes({
  evidence,
}: {
  evidence: ComparisonResult["requirements"][number]["evidence"];
}) {
  return evidence.map(({ source, quote }, index) => (
    <blockquote key={index}>
      <span className="record-caption">{source === "cv" ? "CV" : "Aplikacja"}</span>
      <p>„{quote}”</p>
    </blockquote>
  ));
}
