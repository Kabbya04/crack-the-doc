type KeyPoint = { point: string; definition: string };
type Props = { points: KeyPoint[] };

const KeyPoints = ({ points }: Props) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-deep-moss dark:text-dark-moss">
        Key points
      </h3>
      <ol className="space-y-3 list-decimal list-inside">
        {points.map((kp, i) => (
          <li
            key={i}
            className="rounded-xl border border-deep-moss/15 bg-pale-sage/50 p-4 dark:border-dark-moss/20 dark:bg-dark-sage/50"
          >
            <h4 className="font-semibold text-soft-clay dark:text-dark-clay">
              {kp.point}
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-deep-moss/90 dark:text-dark-moss/90">
              {kp.definition}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default KeyPoints;
