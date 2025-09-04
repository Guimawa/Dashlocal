export default function FeedbackItem({ item }) {
  return (
    <li className="border border-gray-300 p-4 rounded bg-white dark:bg-gray-900">
      <div className="flex justify-between items-center mb-1">
        <span className="text-blue-600 font-medium">{item.source}</span>
        <span className="text-xs text-gray-400">{item.date}</span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
        {item.message}
      </p>
    </li>
  );
}
