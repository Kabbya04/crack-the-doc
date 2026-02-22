import TodayQuizCard from "../components/TodayQuizCard";
import { getTodayQuizQuestions } from "../lib/storage";

type Props = {
  onQuizStarted: () => void;
  onQuizCompleted: () => void;
};

export default function QuizPage({ onQuizStarted, onQuizCompleted }: Props) {
  const questions = getTodayQuizQuestions();

  return (
    <div className="min-h-[calc(100vh-4rem)] py-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-display-sm font-semibold text-deep-moss dark:text-dark-moss">
          Today&apos;s quiz
        </h1>
        <p className="mb-6 text-body text-deep-moss/70 dark:text-dark-moss/70">
          Answer from memory, reveal the answer, then rate yourself. Don&apos;t leave the page until you&apos;re done or the quiz will reset.
        </p>
        {questions.length > 0 ? (
          <TodayQuizCard
            onQuizActivity={onQuizStarted}
            onAllRated={onQuizCompleted}
          />
        ) : (
          <div className="rounded-2xl border border-deep-moss/12 bg-white p-8 text-center shadow-soft-md dark:border-dark-moss/20 dark:bg-dark-sage-surface">
            <p className="text-body text-deep-moss/80 dark:text-dark-moss/80">
              No quiz for today yet. Study a document and come back tomorrow, or study something now to get a quiz from it tomorrow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
