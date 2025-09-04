"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink, Code, Download } from "lucide-react";
import Link from "next/link";

export default function HandshakePreviewPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement du projet
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-1 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Chargement du projet Handshake...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
              <ArrowLeft size={20} />
              Retour aux projets
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Handshake Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              React Dashboard UI full frontend
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-accent-3 text-white px-4 py-2 rounded-lg hover:shadow-glow transition-all">
            <ExternalLink size={16} />
            Ouvrir dans un nouvel onglet
          </button>
          <button className="flex items-center gap-2 bg-accent-1 text-bg px-4 py-2 rounded-lg hover:shadow-glow-accent transition-all">
            <Download size={16} />
            Télécharger
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-glow overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
              handshake-dashboard.local:3000
            </span>
          </div>
        </div>

        <div className="p-8">
          {/* Simuler le contenu du dashboard handshake */}
          <div className="space-y-8">
            {/* Header du dashboard */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-accent-1 mb-2">
                Handshake Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                React 19.1.1 + TypeScript + Tailwind CSS 4.1.12
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-accent-1/20 to-accent-1/5 p-6 rounded-2xl border border-accent-1/20">
                <div className="text-2xl font-bold text-accent-1 mb-1">
                  1,234
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Users
                </div>
              </div>
              <div className="bg-gradient-to-br from-accent-2/20 to-accent-2/5 p-6 rounded-2xl border border-accent-2/20">
                <div className="text-2xl font-bold text-accent-2 mb-1">567</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Active Sessions
                </div>
              </div>
              <div className="bg-gradient-to-br from-accent-3/20 to-accent-3/5 p-6 rounded-2xl border border-accent-3/20">
                <div className="text-2xl font-bold text-accent-3 mb-1">89</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Projects
                </div>
              </div>
              <div className="bg-gradient-to-br from-accent-4/20 to-accent-4/5 p-6 rounded-2xl border border-accent-4/20">
                <div className="text-2xl font-bold text-accent-4 mb-1">12</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Alerts
                </div>
              </div>
            </div>

            {/* Graphique simulé */}
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4">Activity Overview</h3>
              <div className="h-64 bg-gradient-to-r from-accent-1/10 to-accent-3/10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Recharts Graphique
                  </p>
                  <p className="text-sm text-gray-500">
                    Données dynamiques avec animations
                  </p>
                </div>
              </div>
            </div>

            {/* Force Graph simulé */}
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4">
                Network Connections
              </h3>
              <div className="h-64 bg-gradient-to-r from-accent-2/10 to-accent-4/10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🕸️</div>
                  <p className="text-gray-600 dark:text-gray-400">
                    React Force Graph
                  </p>
                  <p className="text-sm text-gray-500">
                    Connexions interactives
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Link href="/projects/handshake-react-pure/source">
          <button className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Code size={16} />
            Voir le Code Source
          </button>
        </Link>
        <button className="flex items-center gap-2 bg-accent-1 text-bg px-6 py-3 rounded-lg hover:shadow-glow-accent transition-all">
          <Download size={16} />
          Générer avec Jarvis
        </button>
      </div>
    </div>
  );
}
