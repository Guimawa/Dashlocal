export default function MemoryItem({ item }) {
  return (
    <li className="border border-gray-300 p-4 rounded shadow-sm bg-white dark:bg-gray-900">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">
          {item.title || "Composant généré"}
        </h3>
        <span className="text-xs text-gray-500">{item.date}</span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
        {item.prompt}
      </p>
      {item.code && (
        <pre className="bg-gray-100 dark:bg-gray-800 p-2 mt-2 text-xs overflow-x-auto rounded">
          {item.code}
        </pre>
      )}
    </li>
  );
}
