// app/api/tests/route.js
import { getAllTests } from "@/src/generators/test-gen";

export async function GET() {
  try {
    const tests = await getAllTests(); // fonction à écrire selon ton système
    return Response.json(tests);
  } catch (err) {
    return new Response(JSON.stringify({ error: "Erreur tests" }), {
      status: 500,
    });
  }
}
