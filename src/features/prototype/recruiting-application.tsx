import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApplicationRecord } from "./application-record";
import { nextStages, stageLabels, type Application } from "./model";
import { RecruitingComparison } from "./recruiting-comparison";
import { usePrototype } from "./store";

const noteLimit = 12000;
const emptyNote = { text: "", generatedBlock: "", overflow: false };

function addQuestions(note: typeof emptyNote, questions: string[]) {
  const hasUntouchedBlock = note.generatedBlock && note.text.endsWith(note.generatedBlock);
  const existing = hasUntouchedBlock ? note.text.slice(0, -note.generatedBlock.length) : note.text;
  const existingLines = new Set(existing.split(/\r?\n/).map((line) => line.trim()));
  const lines = questions
    .map((question) => `- ${question}`)
    .filter((line) => !existingLines.has(line));
  const separator =
    existing && !existing.endsWith("\n\n") ? (existing.endsWith("\n") ? "\n" : "\n\n") : "";
  const generatedBlock = lines.length
    ? `${separator}Pytania do kandydata\n${lines.join("\n")}`
    : "";
  const text = existing + generatedBlock;
  return text.length <= noteLimit
    ? { text, generatedBlock, overflow: false }
    : { ...note, overflow: true };
}

export function RecruitingApplication({ application }: { application: Application }) {
  const { state, run } = usePrototype();
  const [note, setNote] = useState(emptyNote);
  const [announcement, setAnnouncement] = useState("");
  const statusRef = useRef<HTMLSpanElement>(null);
  const pendingFocus = useRef(false);
  const company = state.companies.find((item) => item.id === application.companyId);
  const job = state.jobs.find((item) => item.id === application.jobId);
  const availableStages = nextStages[application.stage];

  useLayoutEffect(() => {
    if (pendingFocus.current) {
      statusRef.current?.focus();
      pendingFocus.current = false;
    }
  }, [application.stage]);

  return (
    <>
      <ApplicationRecord
        application={application}
        companyName={company?.name ?? ""}
        audience="employer"
        history={application.events}
        statusRef={statusRef}
        footer={
          availableStages.length > 0 ? (
            <>
              <p className="record-caption">Notatka zapisze się w historii po zmianie etapu.</p>
              <div className="record-actions">
                {availableStages.map((stage) => (
                  <Button
                    key={stage}
                    variant={stage === "rejected" ? "outline" : "default"}
                    onClick={() => {
                      if (
                        run({
                          type: "stage",
                          applicationId: application.id,
                          stage,
                          note: note.text,
                        })
                      ) {
                        setNote(emptyNote);
                        setAnnouncement(`Zapisano etap: ${stageLabels[stage]}.`);
                        pendingFocus.current = true;
                      }
                    }}
                  >
                    {stageLabels[stage]}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <p className="record-caption">
              {stageLabels[application.stage]}. Brak kolejnych działań w tym procesie.
            </p>
          )
        }
      >
        <RecruitingComparison
          input={
            job ? { offer: job.description, answer: application.answer, cv: application.cv } : null
          }
          onQuestions={
            availableStages.length > 0
              ? (questions) => setNote((current) => addQuestions(current, questions))
              : undefined
          }
        />
        {availableStages.length > 0 && (
          <div className="record-note">
            <h3>
              <label htmlFor="recruiting-note">Notatka rekrutacyjna</label>
            </h3>
            <p className="record-caption" id="recruiting-note-hint">
              Widoczna tylko pracodawcy w tym scenariuszu.
            </p>
            <Textarea
              id="recruiting-note"
              aria-label="Notatka rekrutacyjna (widoczna pracodawcy)"
              aria-describedby="recruiting-note-hint"
              maxLength={noteLimit}
              rows={4}
              value={note.text}
              onChange={(event) => {
                const text = event.target.value;
                setNote((current) => ({ ...current, text }));
              }}
              placeholder="Co warto sprawdzić w rozmowie?"
            />
            {note.overflow && (
              <p className="record-caption" role="status">
                W notatce brakuje miejsca na wszystkie pytania. Znajdziesz je w sekcji Porównanie.
              </p>
            )}
          </div>
        )}
      </ApplicationRecord>
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
