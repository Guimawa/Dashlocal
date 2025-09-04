// app/api/memory/route.js
import { getMemoryHistory } from "@/src/core/memory.js";

export async function GET() {
  try {
    const history = await getMemoryHistory(); // fonction à créer si non existante
    return Response.json(history);
  } catch (err) {
    return new Response(JSON.stringify({ error: "Erreur mémoire" }), {
      status: 500,
    });
  }
}
