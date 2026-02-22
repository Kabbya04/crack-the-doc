import { useState } from "react";
import {
  getTodayQuizQuestions,
  getYesterdayStudiedDocs,
  getStoredRatings,
  setStoredRatings,
  recordActivity,
  type QuizQuestionItem,
} from "../lib/storage";
import type { RecallRating } from "../types/session";
import { CheckCircle2, MinusCircle, XCircle, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";

type TodayQuizCardProps = {
  onQuizActivity?: () => void;
  onAllRated?: () => void;
};

export default function TodayQuizCard({ onQuizActivity, onAllRated }: TodayQuizCardProps) {
  const [questions] = useState<QuizQuestionItem[]>(() => getTodayQuizQuestions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [rating, setRating] = useState<RecallRating | null>(null);
  const [ratedForQuestion, setRatedForQuestion] = useState<Set<number>>(new Set());

  if (questions.length === 0) return null;

  const item = questions[currentIndex]!;
  const storedRatings = getStoredRatings()[item.docKey] ?? {};
  const displayRating = rating ?? storedRatings[item.id] ?? null;

  const handleReveal = () => {
    setRevealed(true);
    onQuizActivity?.();
  };

  const handleRate = (r: RecallRating) => {
    setRating(r);
    setRatedForQuestion((prev) => {
      const next = new Set(prev).add(currentIndex);
      if (next.size === questions.length) onAllRated?.();
      return next;
    });
    const next = { ...storedRatings, [item.id]: r };
    setStoredRatings(item.docKey, next);
    recordActivity();
    onQuizActivity?.();
  };

  const goPrev = () => {
    setCurrentIndex((i) => Math.max(0, i - 1));
    setRevealed(false);
    setRating(null);
  };

  const goNext = () => {
    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
    setRevealed(false);
    setRating(null);
  };

  const gotItCount = questions.filter((q) => getStoredRatings()[q.docKey]?.[q.id] === "got_it").length;
  const almostCount = questions.filter((q) => getStoredRatings()[q.docKey]?.[q.id] === "almost").length;
  const missedCount = questions.filter((q) => getStoredRatings()[q.docKey]?.[q.id] === "missed").length;

  return (
    <div className="rounded-2xl border border-deep-moss/12 bg-white p-4 shadow-soft-md dark:border-dark-moss/20 dark:bg-dark-sage-surface">
      <div className="flex items-center gap-2 text-caption font-medium uppercase tracking-wider text-deep-moss/50 dark:text-dark-moss/50">
        <ClipboardList className="h-4 w-4" />
        Today&apos;s quiz
      </div>
      <p className="mt-1 text-caption text-deep-moss/60 dark:text-dark-moss/60">
        {getYesterdayStudiedDocs().length > 0
          ? "Based on documents you studied yesterday."
          : "Based on your last document. Study something today to get a quiz from it tomorrow."}
      </p>

      <p className="mt-3 text-body font-medium text-deep-moss dark:text-dark-moss">
        {item.question}
      </p>
      {!revealed ? (
        <button
          type="button"
          onClick={handleReveal}
          className="mt-3 rounded-xl bg-deep-moss/10 px-4 py-2 text-caption font-medium text-deep-moss hover:bg-deep-moss/15 dark:bg-dark-moss/15 dark:text-dark-moss dark:hover:bg-dark-moss/20"
        >
          Reveal answer
        </button>
      ) : (
        <>
          <p className="mt-3 text-body leading-relaxed text-deep-moss/90 dark:text-dark-moss/90">
            {item.answer}
          </p>
          {!ratedForQuestion.has(currentIndex) && (
            <p className="mt-3 text-caption font-medium text-deep-moss/70 dark:text-dark-moss/70">
              How did you do?
            </p>
          )}
          {(!ratedForQuestion.has(currentIndex) || displayRating) && (
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleRate("got_it")}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-caption font-medium ${
                  displayRating === "got_it"
                    ? "border-green-600 text-green-700 dark:text-green-400"
                    : "border-deep-moss/15 text-deep-moss/70 dark:border-dark-moss/20 dark:text-dark-moss/70"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" /> Got it
              </button>
              <button
                type="button"
                onClick={() => handleRate("almost")}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-caption font-medium ${
                  displayRating === "almost"
                    ? "border-amber-600 text-amber-700 dark:text-amber-400"
                    : "border-deep-moss/15 text-deep-moss/70 dark:border-dark-moss/20 dark:text-dark-moss/70"
                }`}
              >
                <MinusCircle className="h-4 w-4" /> Almost
              </button>
              <button
                type="button"
                onClick={() => handleRate("missed")}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-caption font-medium ${
                  displayRating === "missed"
                    ? "border-red-600 text-red-700 dark:text-red-400"
                    : "border-deep-moss/15 text-deep-moss/70 dark:border-dark-moss/20 dark:text-dark-moss/70"
                }`}
              >
                <XCircle className="h-4 w-4" /> Missed
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-deep-moss/[0.08] pt-3 dark:border-dark-moss/15">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="rounded-lg p-1.5 text-deep-moss/70 hover:bg-deep-moss/10 disabled:opacity-40 dark:text-dark-moss/70 dark:hover:bg-dark-moss/15"
            aria-label="Previous question"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-caption font-medium text-deep-moss/80 dark:text-dark-moss/80">
            {currentIndex + 1} of {questions.length}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={currentIndex === questions.length - 1}
            className="rounded-lg p-1.5 text-deep-moss/70 hover:bg-deep-moss/10 disabled:opacity-40 dark:text-dark-moss/70 dark:hover:bg-dark-moss/15"
            aria-label="Next question"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        {(gotItCount > 0 || almostCount > 0 || missedCount > 0) && (
          <span className="text-caption text-deep-moss/50 dark:text-dark-moss/50">
            ✓{gotItCount} · ~{almostCount} · ✗{missedCount}
          </span>
        )}
      </div>
      <p className="mt-2 text-caption text-deep-moss/50 dark:text-dark-moss/50">
        From: {item.docName}
      </p>
    </div>
  );
}
