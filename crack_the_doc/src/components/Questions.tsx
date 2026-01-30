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
    <li className="border-b border-deep-moss/10 py-4 last:border-0 dark:border-dark-moss/20">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="font-medium text-deep-moss dark:text-dark-moss">
          {index + 1}. {question}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-deep-moss/60 transition-transform dark:text-dark-moss/60 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="mt-3 rounded-lg bg-pale-sage/70 p-3 text-sm leading-relaxed text-deep-moss/90 dark:bg-dark-sage/70 dark:text-dark-moss/90">
          {answer}
        </div>
      )}
    </li>
  );
};

const Questions = ({ questions }: Props) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-deep-moss dark:text-dark-moss">
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
