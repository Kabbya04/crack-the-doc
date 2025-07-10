import { useState } from 'react';
import SummaryDisplay from './SummaryDisplay';
import KeyPoints from './KeyPoints';
import Questions from './Questions';
import TTSPanel from './TTSPanel';
import { BookOpen, HelpCircle, ListChecks } from 'lucide-react';

// Define types for the analysis data
type KeyPoint = { id: number; point: string; definition: string; };
type Question = { id: number; question: string; answer: string; };
type Analysis = {
  summary: string;
  keyPoints: KeyPoint[];
  questions: Question[];
};

type Props = {
  analysis: Analysis;
  isLoading: boolean;
};

type Tab = 'summary' | 'key-points' | 'questions';

const AnalysisPanel = ({ analysis, isLoading }: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>('summary');

  const getTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return analysis.summary;
      case 'key-points':
        return analysis.keyPoints.map(kp => `${kp.point}. ${kp.definition}`).join('\n\n');
      case 'questions':
        return analysis.questions.map(q => `Question: ${q.question}\nAnswer: ${q.answer}`).join('\n\n');
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <p className="text-lg font-semibold">Generating analysis...</p>
          <p className="text-sm text-gray-500">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs and Download Button */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-0">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button onClick={() => setActiveTab('summary')} className={`flex items-center space-x-2 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium ${activeTab === 'summary' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
            <BookOpen className="w-5 h-5" /> <span>Summary</span>
          </button>
          <button onClick={() => setActiveTab('key-points')} className={`flex items-center space-x-2 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium ${activeTab === 'key-points' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
            <ListChecks className="w-5 h-5" /> <span>Key Points</span>
          </button>
          <button onClick={() => setActiveTab('questions')} className={`flex items-center space-x-2 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium ${activeTab === 'questions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
            <HelpCircle className="w-5 h-5" /> <span>Questions</span>
          </button>
        </nav>
        {/* Download Button */}
        <button
          className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Download
        </button>
      </div>

      {/* TTS Panel */}
      <TTSPanel textToRead={getTabContent()} />

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'summary' && <SummaryDisplay summary={analysis.summary} />}
        {activeTab === 'key-points' && <KeyPoints points={analysis.keyPoints} />}
        {activeTab === 'questions' && <Questions questions={analysis.questions} />}
      </div>
    </div>
  );
};

export default AnalysisPanel;
