import { useState } from "react";
import { useSession } from "../contexts/SessionContext";
import type { Question, RecallRating } from "../types/session";
import { streamTeachMeBackFeedback } from "../lib/groq";
import { recordActivity } from "../lib/storage";
import {
  ListChecks,
  Target,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  MinusCircle,
  XCircle,
  Crosshair,
} from "lucide-react";

type Tab = "recall" | "weak-spots" | "teach";

type Props = { onEnterFocus: () => void };

export default function Library({ onEnterFocus }: Props) {
  const { document, analysis, recallRatings, setRecallRating, recordStudiedToday } = useSession();
  const [tab, setTab] = useState<Tab>("recall");
  const [teachInput, setTeachInput] = useState("");
  const [teachFeedback, setTeachFeedback] = useState("");
  const [isTeachLoading, setIsTeachLoading] = useState(false);
  const [expandedRecall, setExpandedRecall] = useState<number | null>(null);

  if (!document || (!analysis.summary && analysis.keyPoints.length === 0)) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12 text-center">
        <p className="text-title font-semibold text-deep-moss dark:text-dark-moss">
          No document loaded
        </p>
        <p className="mt-2 max-w-sm text-body text-deep-moss/80 dark:text-dark-moss/80">
          Upload a document in Study and wait for analysis. Then you can use Active Recall, Weak Spots, and Teach Me Back here.
        </p>
      </div>
    );
  }

  const missedOrAlmost = analysis.questions.filter(
    (q) => recallRatings[q.id] === "missed" || recallRatings[q.id] === "almost"
  );
  const weakSpotTopics = missedOrAlmost.length > 0
    ? [...new Set(missedOrAlmost.map((q) => q.question.slice(0, 60) + (q.question.length > 60 ? "…" : "")))]
    : [];

  const handleTeachSubmit = async () => {
    const trimmed = teachInput.trim();
    if (!trimmed || isTeachLoading) return;
    setIsTeachLoading(true);
    setTeachFeedback("");
    try {
      let text = "";
      for await (const chunk of streamTeachMeBackFeedback(
        analysis.summary,
        analysis.keyPoints,
        trimmed
      )) {
        text += chunk;
        setTeachFeedback(text);
      }
      recordActivity();
    } catch (e) {
      setTeachFeedback("Sorry, there was an error getting feedback. Please try again.");
    }
    setIsTeachLoading(false);
  };

  const tabClass = (t: Tab) =>
    `flex items-center gap-2 rounded-lg px-4 py-2.5 text-caption font-medium transition-colors ${
      tab === t
        ? "bg-deep-moss text-pale-sage dark:bg-dark-moss dark:text-deep-moss"
        : "text-deep-moss/80 hover:bg-deep-moss/10 dark:text-dark-moss/80 dark:hover:bg-dark-moss/15"
    }`;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-display-sm font-semibold text-deep-moss dark:text-dark-moss">
          Self-Assessment Center
        </h1>
        <button
          type="button"
          onClick={onEnterFocus}
          className="flex items-center gap-2 rounded-xl bg-soft-clay px-4 py-2.5 text-caption font-semibold text-deep-moss shadow-soft transition-colors hover:bg-soft-clay-hover dark:bg-dark-clay dark:text-deep-moss dark:hover:opacity-90"
        >
          <Crosshair className="h-4 w-4" />
          Enter Focus mode
        </button>
      </div>

      <nav className="mb-6 flex flex-wrap gap-2" aria-label="Library tabs">
        <button type="button" onClick={() => setTab("recall")} className={tabClass("recall")}>
          <ListChecks className="h-4 w-4" />
          Active Recall
        </button>
        <button type="button" onClick={() => setTab("weak-spots")} className={tabClass("weak-spots")}>
          <Target className="h-4 w-4" />
          Weak Spots
        </button>
        <button type="button" onClick={() => setTab("teach")} className={tabClass("teach")}>
          <MessageCircle className="h-4 w-4" />
          Teach Me Back
        </button>
      </nav>

      {tab === "recall" && (
        <section className="space-y-4" aria-label="Active Recall">
          <p className="text-body text-deep-moss/80 dark:text-dark-moss/80">
            Answer in your head or on paper, then reveal the answer and rate yourself.
          </p>
          <div className="space-y-3">
            {analysis.questions.map((q) => (
              <RecallCard
                key={q.id}
                question={q}
                rating={recallRatings[q.id]}
                onRate={(r) => {
                  setRecallRating(q.id, r);
                  recordStudiedToday();
                }}
                isExpanded={expandedRecall === q.id}
                onToggle={() => setExpandedRecall((prev) => (prev === q.id ? null : q.id))}
              />
            ))}
          </div>
          {analysis.questions.length === 0 && (
            <p className="rounded-xl border border-deep-moss/15 bg-pale-sage/50 p-6 text-body text-deep-moss/70 dark:border-dark-moss/20 dark:bg-dark-sage-elevated/50 dark:text-dark-moss/70">
            No questions generated for this document. Use Study to get a full analysis first.
          </p>
          )}
        </section>
      )}

      {tab === "weak-spots" && (
        <section className="space-y-4" aria-label="Weak Spots">
          <p className="text-body text-deep-moss/80 dark:text-dark-moss/80">
            Topics you marked as &quot;Almost&quot; or &quot;Missed&quot; in Active Recall. Focus revision here.
          </p>
          {weakSpotTopics.length > 0 ? (
            <ul className="space-y-2">
              {weakSpotTopics.map((topic, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-deep-moss/12 bg-white px-4 py-3 dark:border-dark-moss/20 dark:bg-dark-sage-surface"
                >
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-soft-clay dark:text-dark-clay" />
                  <span className="text-body text-deep-moss dark:text-dark-moss">{topic}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-deep-moss/15 bg-pale-sage/50 p-6 text-body text-deep-moss/70 dark:border-dark-moss/20 dark:bg-dark-sage-elevated/50 dark:text-dark-moss/70">
              No weak spots yet. Use Active Recall and rate questions as &quot;Almost&quot; or &quot;Missed&quot; to see them here.
            </p>
          )}
        </section>
      )}

      {tab === "teach" && (
        <section className="max-w-2xl space-y-4" aria-label="Teach Me Back">
          <p className="text-body text-deep-moss/80 dark:text-dark-moss/80">
            Explain a concept from the document in your own words. You&apos;ll get gentle feedback on what you missed or got wrong (Feynman technique).
          </p>
          <textarea
            value={teachInput}
            onChange={(e) => setTeachInput(e.target.value)}
            placeholder="Explain a concept from the document in your own words..."
            rows={5}
            className="w-full rounded-xl border border-deep-moss/15 bg-white px-4 py-3 text-body text-deep-moss placeholder:text-deep-moss/45 focus:border-deep-moss/30 focus:outline-none focus:ring-2 focus:ring-soft-clay/25 dark:border-dark-moss/20 dark:bg-dark-sage dark:text-dark-moss dark:placeholder:text-dark-moss/45"
            disabled={isTeachLoading}
          />
          <button
            type="button"
            onClick={handleTeachSubmit}
            disabled={!teachInput.trim() || isTeachLoading}
            className="rounded-xl bg-soft-clay px-5 py-2.5 text-caption font-semibold text-deep-moss shadow-soft transition-colors hover:bg-soft-clay-hover disabled:opacity-50 dark:bg-dark-clay dark:text-deep-moss dark:hover:opacity-90"
          >
            {isTeachLoading ? "Getting feedback…" : "Get feedback"}
          </button>
          {teachFeedback && (
            <div className="rounded-xl border border-deep-moss/12 bg-white p-4 dark:border-dark-moss/20 dark:bg-dark-sage-surface">
              <p className="text-caption font-medium uppercase tracking-wider text-deep-moss/60 dark:text-dark-moss/60">
                Feedback
              </p>
              <p className="mt-2 whitespace-pre-wrap text-body leading-relaxed text-deep-moss dark:text-dark-moss">
                {teachFeedback}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function RecallCard({
  question,
  rating,
  onRate,
  isExpanded,
  onToggle,
}: {
  question: Question;
  rating?: RecallRating | null;
  onRate: (r: RecallRating) => void;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-xl border border-deep-moss/12 bg-white dark:border-dark-moss/20 dark:bg-dark-sage-surface overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="text-body font-medium text-deep-moss dark:text-dark-moss">
          {question.question}
        </span>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-deep-moss/60 dark:text-dark-moss/60" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-deep-moss/60 dark:text-dark-moss/60" />
        )}
      </button>
      {isExpanded && (
        <div className="border-t border-deep-moss/[0.08] px-4 py-3 dark:border-dark-moss/15">
          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="rounded-lg bg-deep-moss/10 px-4 py-2 text-caption font-medium text-deep-moss transition-colors hover:bg-deep-moss/15 dark:bg-dark-moss/15 dark:text-dark-moss dark:hover:bg-dark-moss/20"
            >
              Reveal answer
            </button>
          ) : (
            <>
              <p className="text-body leading-relaxed text-deep-moss/90 dark:text-dark-moss/90">
                {question.answer}
              </p>
              <p className="mt-3 text-caption font-medium text-deep-moss/70 dark:text-dark-moss/70">
                How did you do?
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <RatingBtn
                  label="Got it"
                  icon={CheckCircle2}
                  active={rating === "got_it"}
                  onClick={() => onRate("got_it")}
                  className="text-green-700 dark:text-green-400"
                />
                <RatingBtn
                  label="Almost"
                  icon={MinusCircle}
                  active={rating === "almost"}
                  onClick={() => onRate("almost")}
                  className="text-amber-700 dark:text-amber-400"
                />
                <RatingBtn
                  label="Missed"
                  icon={XCircle}
                  active={rating === "missed"}
                  onClick={() => onRate("missed")}
                  className="text-red-700 dark:text-red-400"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function RatingBtn({
  label,
  icon: Icon,
  active,
  onClick,
  className,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-caption font-medium transition-colors ${
        active
          ? `border-current ${className} opacity-100`
          : "border-deep-moss/15 text-deep-moss/70 hover:border-deep-moss/25 dark:border-dark-moss/20 dark:text-dark-moss/70 dark:hover:border-dark-moss/30"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
