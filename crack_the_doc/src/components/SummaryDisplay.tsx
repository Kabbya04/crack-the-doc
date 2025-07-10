// src/components/SummaryDisplay.tsx
type Props = {
    summary: string;
  };
  
  const SummaryDisplay = ({ summary }: Props) => {
    return (
      <div className="space-y-3">
        <h3 className="text-xl font-semibold">Document Summary</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{summary}</p>
      </div>
    );
  };
  
  export default SummaryDisplay;