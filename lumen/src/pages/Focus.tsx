import { useState } from "react";
import { useSession } from "../contexts/SessionContext";
import type { Question, RecallRating } from "../types/session";
import { streamTeachMeBackFeedback } from "../lib/groq";
import { recordActivity } from "../lib/storage";
import { ListChecks, MessageCircle, CheckCircle2, MinusCircle, XCircle } from "lucide-react";

type Mode = "recall" | "teach";

export default function Focus() {
  const { document, analysis, recallRatings, setRecallRating, recordStudiedToday } = useSession();
  const [mode, setMode] = useState<Mode>("recall");
  const [teachInput, setTeachInput] = useState("");
  const [teachFeedback, setTeachFeedback] = useState("");
  const [isTeachLoading, setIsTeachLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!document || (!analysis.summary && analysis.keyPoints.length === 0)) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 text-center">
        <p className="text-body text-deep-moss/80 dark:text-dark-moss/80">
          No document loaded. Upload one in Study first.
        </p>
      </div>
    );
  }

  const questions = analysis.questions;
  const currentQ = questions[currentIndex] ?? null;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col py-6">
      <div className="mb-4 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setMode("recall")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-caption font-medium transition-colors ${
            mode === "recall"
              ? "bg-deep-moss text-pale-sage dark:bg-dark-moss dark:text-deep-moss"
              : "text-deep-moss/80 hover:bg-deep-moss/10 dark:text-dark-moss/80 dark:hover:bg-dark-moss/15"
          }`}
        >
          <ListChecks className="h-4 w-4" />
          Recall
        </button>
        <button
          type="button"
          onClick={() => setMode("teach")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-caption font-medium transition-colors ${
            mode === "teach"
              ? "bg-deep-moss text-pale-sage dark:bg-dark-moss dark:text-deep-moss"
              : "text-deep-moss/80 hover:bg-deep-moss/10 dark:text-dark-moss/80 dark:hover:bg-dark-moss/15"
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          Teach Me Back
        </button>
      </div>

      {mode === "recall" && (
        <div className="flex flex-1 flex-col items-center">
          {questions.length === 0 ? (
            <p className="text-body text-deep-moss/70 dark:text-dark-moss/70">
              No questions yet. Get analysis in Study first.
            </p>
          ) : (
            <>
              <div className="mb-4 text-caption text-deep-moss/60 dark:text-dark-moss/60">
                {currentIndex + 1} of {questions.length}
              </div>
              <div className="w-full max-w-xl">
                <FocusRecallCard
                  question={currentQ!}
                  rating={recallRatings[currentQ!.id]}
                  onRate={(r) => {
                    setRecallRating(currentQ!.id, r);
                    recordStudiedToday();
                  }}
                />
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="rounded-xl border border-deep-moss/20 px-4 py-2 text-caption font-medium text-deep-moss disabled:opacity-40 dark:border-dark-moss/30 dark:text-dark-moss"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                  disabled={currentIndex === questions.length - 1}
                  className="rounded-xl border border-deep-moss/20 px-4 py-2 text-caption font-medium text-deep-moss disabled:opacity-40 dark:border-dark-moss/30 dark:text-dark-moss"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {mode === "teach" && (
        <div className="mx-auto w-full max-w-xl space-y-4">
          <textarea
            value={teachInput}
            onChange={(e) => setTeachInput(e.target.value)}
            placeholder="Explain a concept in your own words..."
            rows={6}
            className="w-full rounded-xl border border-deep-moss/15 bg-white px-4 py-3 text-body text-deep-moss placeholder:text-deep-moss/45 focus:border-deep-moss/30 focus:outline-none focus:ring-2 focus:ring-soft-clay/25 dark:border-dark-moss/20 dark:bg-dark-sage dark:text-dark-moss dark:placeholder:text-dark-moss/45"
            disabled={isTeachLoading}
          />
          <button
            type="button"
            onClick={async () => {
              const t = teachInput.trim();
              if (!t || isTeachLoading) return;
              setIsTeachLoading(true);
              setTeachFeedback("");
              try {
                let text = "";
                for await (const chunk of streamTeachMeBackFeedback(
                  analysis.summary,
                  analysis.keyPoints,
                  t
                )) {
                  text += chunk;
                  setTeachFeedback(text);
                }
                recordActivity();
              } catch {
                setTeachFeedback("Error getting feedback. Try again.");
              }
              setIsTeachLoading(false);
            }}
            disabled={!teachInput.trim() || isTeachLoading}
            className="rounded-xl bg-soft-clay px-5 py-2.5 text-caption font-semibold text-deep-moss shadow-soft hover:bg-soft-clay-hover dark:bg-dark-clay dark:text-deep-moss dark:hover:opacity-90"
          >
            {isTeachLoading ? "Getting feedback…" : "Get feedback"}
          </button>
          {teachFeedback && (
            <div className="rounded-xl border border-deep-moss/12 bg-white p-4 dark:border-dark-moss/20 dark:bg-dark-sage-surface">
              <p className="whitespace-pre-wrap text-body leading-relaxed text-deep-moss dark:text-dark-moss">
                {teachFeedback}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FocusRecallCard({
  question,
  rating,
  onRate,
}: {
  question: Question;
  rating?: RecallRating | null;
  onRate: (r: RecallRating) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-2xl border border-deep-moss/12 bg-white p-6 dark:border-dark-moss/20 dark:bg-dark-sage-surface">
      <p className="text-title font-medium text-deep-moss dark:text-dark-moss">
        {question.question}
      </p>
      <div className="mt-4 border-t border-deep-moss/[0.08] pt-4 dark:border-dark-moss/15">
        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="rounded-xl bg-deep-moss/10 px-5 py-2.5 text-caption font-medium text-deep-moss hover:bg-deep-moss/15 dark:bg-dark-moss/15 dark:text-dark-moss dark:hover:bg-dark-moss/20"
          >
            Reveal answer
          </button>
        ) : (
          <>
            <p className="text-body leading-relaxed text-deep-moss/90 dark:text-dark-moss/90">
              {question.answer}
            </p>
            <p className="mt-4 text-caption font-medium text-deep-moss/70 dark:text-dark-moss/70">
              How did you do?
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onRate("got_it")}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-caption font-medium ${
                  rating === "got_it"
                    ? "border-green-600 text-green-700 dark:text-green-400"
                    : "border-deep-moss/15 text-deep-moss/70 dark:border-dark-moss/20 dark:text-dark-moss/70"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" /> Got it
              </button>
              <button
                type="button"
                onClick={() => onRate("almost")}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-caption font-medium ${
                  rating === "almost"
                    ? "border-amber-600 text-amber-700 dark:text-amber-400"
                    : "border-deep-moss/15 text-deep-moss/70 dark:border-dark-moss/20 dark:text-dark-moss/70"
                }`}
              >
                <MinusCircle className="h-4 w-4" /> Almost
              </button>
              <button
                type="button"
                onClick={() => onRate("missed")}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-caption font-medium ${
                  rating === "missed"
                    ? "border-red-600 text-red-700 dark:text-red-400"
                    : "border-deep-moss/15 text-deep-moss/70 dark:border-dark-moss/20 dark:text-dark-moss/70"
                }`}
              >
                <XCircle className="h-4 w-4" /> Missed
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
