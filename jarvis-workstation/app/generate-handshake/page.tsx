"use client";

import { useState } from "react";
import { ArrowLeft, Sparkles, Download, Eye } from "lucide-react";
import Link from "next/link";

export default function GenerateHandshakePage() {
  const [userPrompt, setUserPrompt] = useState("");
  const [generatedProject, setGeneratedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    name: "handshake-custom",
    type: "dashboard",
    includeCharts: true,
    includeNetwork: true,
    darkMode: true,
  });

  const handleGenerate = async () => {
    if (!userPrompt.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/generate/handshake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userPrompt,
          config: config,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedProject(data.project);
      } else {
        console.error("Erreur génération:", data.error);
      }
    } catch (error) {
      console.error("Erreur API:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
            <ArrowLeft size={20} />
            Retour aux projets
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Générer avec Handshake</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Créez un dashboard basé sur handshake-react-pure
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-glow">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="text-accent-1" size={20} />
              Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom du projet
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) =>
                    setConfig({ ...config, name: e.target.value })
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="mon-dashboard"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de projet
                </label>
                <select
                  value={config.type}
                  onChange={(e) =>
                    setConfig({ ...config, type: e.target.value })
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="analytics">Analytics</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="admin">Admin Panel</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.includeCharts}
                    onChange={(e) =>
                      setConfig({ ...config, includeCharts: e.target.checked })
                    }
                    className="rounded border-gray-300 text-accent-1 focus:ring-accent-1"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Inclure les graphiques (Recharts)
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.includeNetwork}
                    onChange={(e) =>
                      setConfig({ ...config, includeNetwork: e.target.checked })
                    }
                    className="rounded border-gray-300 text-accent-1 focus:ring-accent-1"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Inclure le réseau de connexions
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.darkMode}
                    onChange={(e) =>
                      setConfig({ ...config, darkMode: e.target.checked })
                    }
                    className="rounded border-gray-300 text-accent-1 focus:ring-accent-1"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Mode sombre par défaut
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Prompt */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-glow">
            <h2 className="text-xl font-semibold mb-4">
              Description du projet
            </h2>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Ex: Créez un dashboard de monitoring pour une application e-commerce avec des métriques de vente, des graphiques de performance et un système d'alertes..."
              className="w-full h-40 border border-gray-300 dark:border-gray-600 p-4 rounded-lg resize-none font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />

            <button
              onClick={handleGenerate}
              disabled={loading || !userPrompt.trim()}
              className="w-full mt-4 bg-accent-1 text-bg px-6 py-3 rounded-lg font-medium hover:shadow-glow-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-bg"></div>
                  Génération en cours...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles size={16} />
                  Générer le projet
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Résultat */}
        <div className="space-y-6">
          {generatedProject ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-glow">
              <h2 className="text-xl font-semibold mb-4 text-accent-1">
                ✅ Projet généré !
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {generatedProject.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {generatedProject.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {generatedProject.tech.map((tech, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Link href={generatedProject.preview}>
                    <button className="flex items-center gap-2 bg-accent-3 text-white px-4 py-2 rounded-lg hover:shadow-glow transition-all">
                      <Eye size={16} />
                      Preview
                    </button>
                  </Link>
                  <Link href={generatedProject.source}>
                    <button className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      <Download size={16} />
                      Code Source
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-glow">
              <h2 className="text-xl font-semibold mb-4">Résultat</h2>
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🚀</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Votre projet handshake sera généré ici
                </p>
              </div>
            </div>
          )}

          {/* Aperçu des fonctionnalités */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-glow">
            <h2 className="text-xl font-semibold mb-4">
              Fonctionnalités incluses
            </h2>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <span className="text-accent-1">✓</span>
                React 19.1.1 + TypeScript
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-1">✓</span>
                Tailwind CSS 4.1.12 avec design tokens
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-1">✓</span>
                Graphiques dynamiques (Recharts)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-1">✓</span>
                Réseau de connexions (React Force Graph)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-1">✓</span>
                Mode sombre intégré
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-1">✓</span>
                Icônes Lucide React
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
