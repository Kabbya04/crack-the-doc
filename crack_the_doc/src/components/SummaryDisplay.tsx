type Props = { summary: string };

const SummaryDisplay = ({ summary }: Props) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-deep-moss dark:text-dark-moss">
        Document summary
      </h3>
      <p className="leading-relaxed text-deep-moss/90 dark:text-dark-moss/90">
        {summary}
      </p>
    </div>
  );
};

export default SummaryDisplay;
