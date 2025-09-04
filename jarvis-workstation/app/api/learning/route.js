// app/api/learning/route.js
import { getLearningLogs } from "@/src/core/learning.js";

export async function GET() {
  try {
    const logs = await getLearningLogs(); // fonction à définir ou simuler
    return Response.json(logs);
  } catch (err) {
    return new Response(JSON.stringify({ error: "Erreur apprentissage" }), {
      status: 500,
    });
  }
}
