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
  const pending = useRef<AbortController | null>(null);

  useEffect(() => () => pending.current?.abort(), []);

  async function generate() {
    if (!input || pending.current) return;
    const request = new AbortController();
    pending.current = request;
    setState({ status: "loading" });

    try {
      const response = await fetch("./api/recruiting-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: request.signal,
      });
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
      {input ? (
        <>
          <p className="record-caption">
            Zobacz, które wymagania mają potwierdzenie w aplikacji lub CV i na jakich fragmentach
            opiera się porównanie. Jeśli brakuje informacji, dostaniesz propozycje pytań do
            kandydata.
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
      ) : (
        <p className="record-caption">Brak opisu oferty do porównania.</p>
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
