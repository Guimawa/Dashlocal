export default function ProjectList({ projects }) {
  if (!projects.length)
    return <p className="text-gray-500">Aucun projet pour l'instant.</p>;

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {projects.map((p, i) => (
        <li key={i} className="py-2">
          <strong>{p.name}</strong> – {p.path}
        </li>
      ))}
    </ul>
  );
}
