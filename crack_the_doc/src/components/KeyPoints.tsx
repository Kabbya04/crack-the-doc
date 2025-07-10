// src/components/KeyPoints.tsx
type KeyPoint = {
  point: string;
  definition: string;
};

type Props = {
  points: KeyPoint[];
};

const KeyPoints = ({ points }: Props) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Key Points</h3>
      <ol className="space-y-4 list-decimal list-inside">
        {points.map((kp, index) => (
          <li key={index} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h4 className="font-semibold text-blue-600 dark:text-blue-400">{kp.point}</h4>
            <p className="mt-1 text-gray-600 dark:text-gray-300">{kp.definition}</p>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default KeyPoints;
