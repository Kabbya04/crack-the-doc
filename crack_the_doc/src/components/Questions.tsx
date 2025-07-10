// src/components/Questions.tsx
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type Question = {
  question: string;
  answer: string;
};

type Props = {
  questions: Question[];
};

const QuestionItem = ({ question, answer, index }: { question: string, answer: string, index: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li className="border-b border-gray-200 dark:border-gray-700 py-4">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
        <span className="font-medium">{index + 1}. {question}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="mt-3 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          {answer}
        </div>
      )}
    </li>
  );
};

const Questions = ({ questions }: Props) => {
  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold mb-4">Generated Questions</h3>
      <ol className="space-y-2">
        {questions.map((q, index) => (
          <QuestionItem key={index} question={q.question} answer={q.answer} index={index} />
        ))}
      </ol>
    </div>
  );
};

export default Questions;
