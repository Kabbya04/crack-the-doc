import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Question = { question: string; answer: string };
type Props = { questions: Question[] };

const QuestionItem = ({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li className="border-b border-deep-moss/[0.08] py-4 last:border-0 dark:border-dark-moss/15">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 text-left transition-colors duration-150"
      >
        <span className="text-body font-medium text-deep-moss dark:text-dark-moss">
          {index + 1}. {question}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-deep-moss/55 transition-transform duration-200 dark:text-dark-moss/55 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="mt-3 rounded-xl bg-pale-sage/70 p-4 text-body leading-relaxed text-deep-moss/90 dark:bg-dark-sage-elevated/80 dark:text-dark-moss/90">
          {answer}
        </div>
      )}
    </li>
  );
};

const Questions = ({ questions }: Props) => {
  return (
    <div className="space-y-2">
      <h3 className="text-title font-semibold text-deep-moss dark:text-dark-moss">
        Generated questions
      </h3>
      <ol className="space-y-0">
        {questions.map((q, i) => (
          <QuestionItem
            key={i}
            question={q.question}
            answer={q.answer}
            index={i}
          />
        ))}
      </ol>
    </div>
  );
};

export default Questions;
