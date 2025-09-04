// app/api/dashboard/route.js
import { getMemoryHistory } from "@/src/core/memory.js";

export async function GET() {
  const history = await getMemoryHistory();

  const stats = {
    generations: history.length,
    components: new Set(history.map((h) => h.title)).size,
    projects: 1, // À calculer dynamiquement si besoin
  };

  const projects = [
    { name: "my-app", path: "/projects/my-app" },
    // Dynamique si besoin
  ];

  const logs = history.slice(0, 5).map((h) => ({
    date: h.date,
    message: `Génération : ${h.title || "Composant"}`,
  }));

  return Response.json({ stats, projects, logs });
}
