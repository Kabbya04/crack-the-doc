import { useState } from "react";
import { streamExplainToChild } from "../lib/groq";
import { Sparkles } from "lucide-react";

type KeyPoint = { point: string; definition: string };
type Props = { points: KeyPoint[] };

const KeyPoints = ({ points }: Props) => {
  const [explainingIndex, setExplainingIndex] = useState<number | null>(null);
  const [simpleTextForIndex, setSimpleTextForIndex] = useState<number | null>(null);
  const [simpleText, setSimpleText] = useState<string>("");
  const [explainErrorIndex, setExplainErrorIndex] = useState<number | null>(null);

  const handleExplain = async (kp: KeyPoint, index: number) => {
    setExplainingIndex(index);
    setSimpleText("");
    setSimpleTextForIndex(null);
    setExplainErrorIndex(null);
    const concept = `${kp.point}. ${kp.definition}`;
    try {
      for await (const chunk of streamExplainToChild(concept)) {
        setSimpleText((prev) => prev + chunk);
      }
      setSimpleTextForIndex(index);
    } catch (e) {
      setExplainErrorIndex(index);
    }
    setExplainingIndex(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-title font-semibold text-deep-moss dark:text-dark-moss">
        Key points
      </h3>
      <ol className="space-y-3 list-decimal list-inside">
        {points.map((kp, i) => (
          <li
            key={i}
            className="rounded-xl border border-deep-moss/10 bg-pale-sage/60 p-4 dark:border-dark-moss/15 dark:bg-dark-sage/60"
          >
            <h4 className="font-semibold text-soft-clay dark:text-dark-clay text-body">
              {kp.point}
            </h4>
            <p className="mt-1.5 text-body leading-relaxed text-deep-moss/88 dark:text-dark-moss/88">
              {kp.definition}
            </p>
            <button
              type="button"
              onClick={() => handleExplain(kp, i)}
              disabled={explainingIndex !== null}
              className="mt-3 flex items-center gap-2 rounded-lg border border-deep-moss/15 bg-white px-3 py-2 text-caption font-medium text-deep-moss/80 transition-colors hover:bg-deep-moss/5 disabled:opacity-50 dark:border-dark-moss/20 dark:bg-dark-sage dark:text-dark-moss/80 dark:hover:bg-dark-moss/10"
            >
              <Sparkles className="h-4 w-4" />
              {explainingIndex === i ? "Explaining…" : "Explain to a 10-year-old"}
            </button>
            {(explainingIndex === i && simpleText) || (simpleTextForIndex === i && simpleText) ? (
              <div className="mt-3 rounded-lg border border-soft-clay/30 bg-soft-clay/10 p-3 dark:border-dark-clay/30 dark:bg-dark-clay/10">
                <p className="text-caption font-medium text-deep-moss/70 dark:text-dark-moss/70">
                  Simple version:
                </p>
                <p className="mt-1 text-body leading-relaxed text-deep-moss dark:text-dark-moss">
                  {simpleText}
                </p>
              </div>
            ) : null}
            {explainErrorIndex === i && (
              <p className="mt-2 text-caption text-red-600 dark:text-red-400">
                Could not get explanation. Try again.
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default KeyPoints;
