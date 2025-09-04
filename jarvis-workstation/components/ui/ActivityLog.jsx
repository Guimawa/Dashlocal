export default function ActivityLog({ entries }) {
  if (!entries.length)
    return <p className="text-gray-500">Aucune activité récente.</p>;

  return (
    <ul className="space-y-2">
      {entries.map((log, i) => (
        <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
          <span className="text-blue-500">[{log.date}]</span> {log.message}
        </li>
      ))}
    </ul>
  );
}
