import { useState } from "react";
import SummaryDisplay from "./SummaryDisplay";
import KeyPoints from "./KeyPoints";
import Questions from "./Questions";
import TTSPanel from "./TTSPanel";
import ConfidenceHeatmap from "./ConfidenceHeatmap";
import { BookOpen, HelpCircle, ListChecks, Download, Target, Lightbulb } from "lucide-react";
import { getTakeawayForDoc, addTakeaway, recordActivity } from "../lib/storage";
import { useSession } from "../contexts/SessionContext";
import type { RecallRating } from "../types/session";

type KeyPoint = { id: number; point: string; definition: string };
type Question = { id: number; question: string; answer: string };
type Analysis = {
  summary: string;
  keyPoints: KeyPoint[];
  questions: Question[];
};

type Props = {
  analysis: Analysis;
  isLoading: boolean;
  recallRatings: Record<number, RecallRating>;
  docKey: string | null;
  docName: string;
};
type Tab = "summary" | "key-points" | "questions" | "confidence";

const AnalysisPanel = ({ analysis, isLoading, recallRatings, docKey, docName }: Props) => {
  const { recordStudiedToday } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [takeawayInput, setTakeawayInput] = useState("");
  const [savedTakeawayText, setSavedTakeawayText] = useState<string | null>(null);
  const existingTakeaway = docKey ? getTakeawayForDoc(docKey) : null;
  const displayTakeaway = savedTakeawayText ?? existingTakeaway?.takeaway ?? null;

  const getTabContent = () => {
    switch (activeTab) {
      case "summary":
        return analysis.summary;
      case "key-points":
        return analysis.keyPoints.map((kp) => `${kp.point}. ${kp.definition}`).join("\n\n");
      case "questions":
        return analysis.questions
          .map((q) => `Question: ${q.question}\nAnswer: ${q.answer}`)
          .join("\n\n");
      case "confidence":
        return analysis.questions
          .map((q) => {
            const r = recallRatings[q.id];
            return `Q: ${q.question} — ${r ?? "not rated"}`;
          })
          .join("\n\n");
      default:
        return "";
    }
  };

  const handleSaveTakeaway = () => {
    const trimmed = takeawayInput.trim();
    if (!trimmed || !docKey) return;
    addTakeaway({
      docKey,
      docName,
      takeaway: trimmed,
      date: new Date().toISOString(),
    });
    recordActivity();
    recordStudiedToday();
    setSavedTakeawayText(trimmed);
    setTakeawayInput("");
  };

  const tabClass = (tab: Tab) =>
    `flex items-center gap-2 whitespace-nowrap border-b-2 py-3 px-1 text-caption font-medium transition-colors duration-150 ${
      activeTab === tab
        ? "border-soft-clay text-soft-clay dark:border-dark-clay dark:text-dark-clay"
        : "border-transparent text-deep-moss/55 hover:border-deep-moss/25 hover:text-deep-moss dark:text-dark-moss/55 dark:hover:border-dark-moss/25 dark:hover:text-dark-moss"
    }`;

  if (isLoading) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center rounded-2xl border border-deep-moss/12 bg-white p-10 shadow-soft-md dark:border-dark-moss/20 dark:bg-dark-sage-surface dark:shadow-soft-dark">
        <div className="h-11 w-11 animate-spin rounded-full border-2 border-soft-clay border-t-transparent dark:border-dark-clay dark:border-t-transparent" />
        <p className="mt-5 text-title font-semibold text-deep-moss dark:text-dark-moss">
          Generating analysis
        </p>
        <p className="mt-1.5 text-body text-deep-moss/65 dark:text-dark-moss/65">
          Please wait a moment
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* Section label */}
      <p className="shrink-0 text-caption font-medium uppercase tracking-wider text-deep-moss/50 dark:text-dark-moss/50">
        Analysis & tools
      </p>

      {/* Tabs + TTS card — fixed height */}
      <div className="shrink-0 overflow-hidden rounded-2xl border border-deep-moss/12 bg-white shadow-soft-md dark:border-dark-moss/20 dark:bg-dark-sage-surface dark:shadow-soft-dark">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-deep-moss/[0.08] px-4 dark:border-dark-moss/15">
          <nav className="-mb-px flex shrink-0 space-x-1 sm:space-x-4" aria-label="Analysis tabs">
            <button type="button" onClick={() => setActiveTab("summary")} className={tabClass("summary")}>
              <BookOpen className="h-5 w-5 shrink-0" />
              <span>Summary</span>
            </button>
            <button type="button" onClick={() => setActiveTab("key-points")} className={tabClass("key-points")}>
              <ListChecks className="h-5 w-5 shrink-0" />
              <span>Key Points</span>
            </button>
            <button type="button" onClick={() => setActiveTab("questions")} className={tabClass("questions")}>
              <HelpCircle className="h-5 w-5 shrink-0" />
              <span>Questions</span>
            </button>
            <button type="button" onClick={() => setActiveTab("confidence")} className={tabClass("confidence")}>
              <Target className="h-5 w-5 shrink-0" />
              <span>Confidence</span>
            </button>
          </nav>
          <button
            type="button"
            className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-caption font-medium text-deep-moss/70 transition-colors duration-150 hover:bg-deep-moss/10 dark:text-dark-moss/70 dark:hover:bg-dark-moss/15"
            title="Download (coming soon)"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>

        <div className="px-4 py-3">
          <TTSPanel textToRead={getTabContent()} />
        </div>
      </div>

      {/* Tab content — fills remaining space, scrolls inside */}
      <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-deep-moss/12 bg-white p-6 shadow-soft scrollbar-thin dark:border-dark-moss/20 dark:bg-dark-sage-surface dark:shadow-soft-dark">
        {activeTab === "summary" && <SummaryDisplay summary={analysis.summary} />}
        {activeTab === "key-points" && <KeyPoints points={analysis.keyPoints} />}
        {activeTab === "questions" && <Questions questions={analysis.questions} />}
        {activeTab === "confidence" && (
          <ConfidenceHeatmap questions={analysis.questions} ratings={recallRatings} />
        )}
      </div>

      {/* One-line takeaway */}
      {docKey && (
        <div className="shrink-0 rounded-2xl border border-deep-moss/12 bg-white p-4 shadow-soft dark:border-dark-moss/20 dark:bg-dark-sage-surface">
          <p className="flex items-center gap-2 text-caption font-medium text-deep-moss/70 dark:text-dark-moss/70">
            <Lightbulb className="h-4 w-4" />
            One thing you&apos;ll remember
          </p>
          {displayTakeaway ? (
            <p className="mt-2 text-body italic text-deep-moss dark:text-dark-moss">
              &quot;{displayTakeaway}&quot;
            </p>
          ) : (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={takeawayInput}
                onChange={(e) => setTakeawayInput(e.target.value)}
                placeholder="In one line..."
                className="min-w-0 flex-1 rounded-lg border border-deep-moss/15 bg-pale-sage px-3 py-2 text-body text-deep-moss placeholder:text-deep-moss/45 dark:border-dark-moss/20 dark:bg-dark-sage dark:text-dark-moss dark:placeholder:text-dark-moss/45"
              />
              <button
                type="button"
                onClick={handleSaveTakeaway}
                disabled={!takeawayInput.trim()}
                className="rounded-lg bg-soft-clay px-3 py-2 text-caption font-semibold text-deep-moss disabled:opacity-50 dark:bg-dark-clay dark:text-deep-moss"
              >
                Save
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;
