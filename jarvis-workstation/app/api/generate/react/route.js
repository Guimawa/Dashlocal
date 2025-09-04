// app/api/generate/react/route.js
import ReactGenerator from "@/src/generators/react-gen.js";
import { saveToMemory } from "@/src/core/memory.js";

export async function POST(request) {
  try {
    const { prompt, config } = await request.json();

    // Créer une spécification à partir du prompt
    const spec = {
      name: "GeneratedComponent",
      description: prompt,
      type: "functional",
    };

    const generator = new ReactGenerator();
    const result = await generator.generateComponent(spec, config);

    // Sauvegarder dans la mémoire
    if (result.success && result.component?.code) {
      saveToMemory({
        prompt: prompt,
        code: result.component.code,
        title: `Composant généré - ${new Date().toLocaleDateString()}`,
      });
    }

    return Response.json({
      code: result.component?.code || "// Erreur de génération",
      success: result.success,
    });
  } catch (error) {
    console.error("[API Error]", error);
    return new Response(
      JSON.stringify({
        error: "Erreur génération",
        details: error.message,
      }),
      {
        status: 500,
      },
    );
  }
}
