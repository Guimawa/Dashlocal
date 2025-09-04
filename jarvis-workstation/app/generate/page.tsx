"use client";

import { useState } from "react";

export default function GeneratorScreen() {
  const [userPrompt, setUserPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!userPrompt.trim()) return;
    setLoading(true);

    const res = await fetch("/api/generate/react", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: userPrompt,
        config: { typescript: true, storybook: true }, // ou selon tes besoins
      }),
    });

    const data = await res.json();
    setGeneratedCode(data.code || "// Aucun code généré");
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Générateur de Composants</h1>

      <textarea
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
        placeholder="Ex: Crée un bouton primaire avec icône et action de clic"
        className="w-full h-40 border border-gray-300 p-4 rounded-lg resize-none font-mono"
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Génération en cours..." : "Générer"}
      </button>

      <pre className="bg-gray-100 p-4 rounded whitespace-pre overflow-x-auto">
        {generatedCode}
      </pre>
    </div>
  );
}
