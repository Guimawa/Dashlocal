export default function TestResultItem({ test, onRerun }) {
  const getStatusStyles = () => {
    switch (test.status) {
      case "passed":
        return "text-accent-1 shadow-glow-accent";
      case "failed":
        return "text-accent-4 shadow-glow-error";
      case "pending":
        return "text-accent-2 shadow-glow-warning";
      default:
        return "text-gray-600";
    }
  };

  return (
    <li className="border border-gray-300 dark:border-gray-700 p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-glow hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">{test.name}</h3>
        <span
          className={`text-sm font-bold px-3 py-1 rounded-full ${getStatusStyles()}`}
        >
          {test.status.toUpperCase()}
        </span>
      </div>

      <pre className="bg-gray-100 dark:bg-gray-800 p-4 text-xs rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700">
        {test.content}
      </pre>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onRerun(test.id)}
          className="text-sm text-accent-3 hover:text-accent-3/80 font-medium transition-colors"
        >
          🔄 Relancer
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(test.content)}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
        >
          📋 Copier
        </button>
      </div>
    </li>
  );
}
