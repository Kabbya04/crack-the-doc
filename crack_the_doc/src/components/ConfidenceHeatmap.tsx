import type { Question, RecallRating } from "../types/session";
import { CheckCircle2, MinusCircle, XCircle, HelpCircle } from "lucide-react";

type Props = {
  questions: Question[];
  ratings: Record<number, RecallRating | undefined>;
};

export default function ConfidenceHeatmap({ questions, ratings }: Props) {
  const gotIt = questions.filter((q) => ratings[q.id] === "got_it").length;
  const almost = questions.filter((q) => ratings[q.id] === "almost").length;
  const missed = questions.filter((q) => ratings[q.id] === "missed").length;
  const unanswered = questions.length - gotIt - almost - missed;
  const total = questions.length;

  const getColor = (r: RecallRating | undefined) => {
    if (!r) return "bg-deep-moss/10 text-deep-moss/60 dark:bg-dark-moss/10 dark:text-dark-moss/60";
    if (r === "got_it") return "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30";
    if (r === "almost") return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
    return "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30";
  };

  const getIcon = (r: RecallRating | undefined) => {
    if (r === "got_it") return <CheckCircle2 className="h-4 w-4 shrink-0" />;
    if (r === "almost") return <MinusCircle className="h-4 w-4 shrink-0" />;
    if (r === "missed") return <XCircle className="h-4 w-4 shrink-0" />;
    return <HelpCircle className="h-4 w-4 shrink-0" />;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-title font-semibold text-deep-moss dark:text-dark-moss">
        Confidence
      </h3>
      {total > 0 && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-deep-moss/10 bg-pale-sage/40 p-3 dark:border-dark-moss/15 dark:bg-dark-sage/40">
          <span className="text-caption font-medium text-deep-moss/70 dark:text-dark-moss/70">
            Summary:
          </span>
          <span className="rounded-lg bg-green-500/15 px-2 py-1 text-caption font-medium text-green-700 dark:text-green-400">
            Got it {gotIt}
          </span>
          <span className="rounded-lg bg-amber-500/15 px-2 py-1 text-caption font-medium text-amber-700 dark:text-amber-400">
            Almost {almost}
          </span>
          <span className="rounded-lg bg-red-500/15 px-2 py-1 text-caption font-medium text-red-700 dark:text-red-400">
            Missed {missed}
          </span>
          {unanswered > 0 && (
            <span className="rounded-lg bg-deep-moss/10 px-2 py-1 text-caption font-medium text-deep-moss/60 dark:bg-dark-moss/10 dark:text-dark-moss/60">
              Not yet {unanswered}
            </span>
          )}
        </div>
      )}
      <ul className="space-y-2">
        {questions.map((q) => {
          const r = ratings[q.id];
          return (
            <li
              key={q.id}
              className={`flex items-start gap-2 rounded-lg border p-3 text-body ${getColor(r)}`}
            >
              {getIcon(r)}
              <span className="min-w-0 flex-1">{q.question}</span>
            </li>
          );
        })}
      </ul>
      {questions.length === 0 && (
        <p className="text-body text-deep-moss/60 dark:text-dark-moss/60">
          No questions yet. Rate yourself in Active Recall (Library) to see confidence here.
        </p>
      )}
    </div>
  );
}
