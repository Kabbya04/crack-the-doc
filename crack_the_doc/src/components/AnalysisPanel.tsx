import { useState } from "react";
import SummaryDisplay from "./SummaryDisplay";
import KeyPoints from "./KeyPoints";
import Questions from "./Questions";
import TTSPanel from "./TTSPanel";
import { BookOpen, HelpCircle, ListChecks, Download } from "lucide-react";

type KeyPoint = { id: number; point: string; definition: string };
type Question = { id: number; question: string; answer: string };
type Analysis = {
  summary: string;
  keyPoints: KeyPoint[];
  questions: Question[];
};

type Props = { analysis: Analysis; isLoading: boolean };
type Tab = "summary" | "key-points" | "questions";

const AnalysisPanel = ({ analysis, isLoading }: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>("summary");

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
      default:
        return "";
    }
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
      </div>
    </div>
  );
};

export default AnalysisPanel;
