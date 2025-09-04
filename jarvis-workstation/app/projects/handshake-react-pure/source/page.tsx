"use client";

import { useState } from "react";
import { ArrowLeft, Copy, Download, Eye } from "lucide-react";
import Link from "next/link";

export default function HandshakeSourcePage() {
  const [activeTab, setActiveTab] = useState("package.json");
  const [copied, setCopied] = useState("");

  const files = {
    "package.json": {
      content: `{
  "name": "handshake-react-pure",
  "version": "1.0.0",
  "description": "React Dashboard UI full frontend",
  "main": "index.tsx",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "recharts": "^2.8.0",
    "react-force-graph": "^1.25.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5",
    "tailwindcss": "^4.1.12",
    "@tailwindcss/postcss": "^4.1.12"
  }
}`,
      language: "json",
    },
    "tailwind.config.js": {
      content: `module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#e8eaf6',
        bg: '#0b1020',
        panel: '#0f152b',
        accent: {
          1: '#79ffe1', // vert fluo
          2: '#ffd166', // jaune
          3: '#5cb3ff', // bleu
          4: '#f78fb3'  // rose
        }
      },
      boxShadow: {
        glow: '0 0 12px rgba(124, 198, 255, 0.25)'
      },
      borderRadius: {
        '2xl': '1.25rem'
      }
    }
  },
  plugins: []
}`,
      language: "javascript",
    },
    "src/App.tsx": {
      content: `import React from 'react';
import HandshakeDashboardTemplate from './components/HandshakeDashboardTemplate';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <HandshakeDashboardTemplate />
    </div>
  );
}

export default App;`,
      language: "tsx",
    },
    "src/components/HandshakeDashboardTemplate.tsx": {
      content: `import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Filter, TrendingUp, Users, Activity, Zap } from 'lucide-react';

const HandshakeDashboardTemplate: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const data = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 700 }
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-panel border-b border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-accent-1">Handshake Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-accent-1 focus:outline-none"
              />
            </div>
            <button className="bg-accent-1 text-bg px-4 py-2 rounded-lg hover:shadow-glow-accent transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-panel p-6 rounded-2xl border border-gray-800 shadow-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-accent-1">1,234</p>
              </div>
              <Users className="text-accent-1" size={24} />
            </div>
          </div>
          
          <div className="bg-panel p-6 rounded-2xl border border-gray-800 shadow-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Sessions</p>
                <p className="text-2xl font-bold text-accent-2">567</p>
              </div>
              <Activity className="text-accent-2" size={24} />
            </div>
          </div>
          
          <div className="bg-panel p-6 rounded-2xl border border-gray-800 shadow-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Projects</p>
                <p className="text-2xl font-bold text-accent-3">89</p>
              </div>
              <TrendingUp className="text-accent-3" size={24} />
            </div>
          </div>
          
          <div className="bg-panel p-6 rounded-2xl border border-gray-800 shadow-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Alerts</p>
                <p className="text-2xl font-bold text-accent-4">12</p>
              </div>
              <Zap className="text-accent-4" size={24} />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-panel p-6 rounded-2xl border border-gray-800 shadow-glow">
            <h3 className="text-lg font-semibold mb-4 text-white">Activity Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#79ffe1" 
                  strokeWidth={2}
                  dot={{ fill: '#79ffe1', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-panel p-6 rounded-2xl border border-gray-800 shadow-glow">
            <h3 className="text-lg font-semibold mb-4 text-white">Network Connections</h3>
            <div className="h-[300px] bg-gradient-to-br from-accent-2/10 to-accent-4/10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🕸️</div>
                <p className="text-gray-400">React Force Graph</p>
                <p className="text-sm text-gray-500">Connexions interactives</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HandshakeDashboardTemplate;`,
      language: "tsx",
    },
  };

  const copyToClipboard = (content: string, filename: string) => {
    navigator.clipboard.writeText(content);
    setCopied(filename);
    setTimeout(() => setCopied(""), 2000);
  };

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
            <h1 className="text-2xl font-bold">
              Code Source - Handshake Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              React 19.1.1 + TypeScript + Tailwind CSS 4.1.12
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/projects/handshake-react-pure/preview">
            <button className="flex items-center gap-2 bg-accent-3 text-white px-4 py-2 rounded-lg hover:shadow-glow transition-all">
              <Eye size={16} />
              Preview
            </button>
          </Link>
          <button className="flex items-center gap-2 bg-accent-1 text-bg px-4 py-2 rounded-lg hover:shadow-glow-accent transition-all">
            <Download size={16} />
            Télécharger ZIP
          </button>
        </div>
      </div>

      {/* File Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {Object.keys(files).map((filename) => (
          <button
            key={filename}
            onClick={() => setActiveTab(filename)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === filename
                ? "border-accent-1 text-accent-1"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
            }`}
          >
            {filename}
          </button>
        ))}
      </div>

      {/* Code Content */}
      <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-glow">
        <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
          <span className="text-sm text-gray-400">{activeTab}</span>
          <button
            onClick={() => copyToClipboard(files[activeTab].content, activeTab)}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Copy size={16} />
            {copied === activeTab ? "Copié!" : "Copier"}
          </button>
        </div>

        <div className="p-4">
          <pre className="text-sm text-gray-300 overflow-x-auto">
            <code className={`language-${files[activeTab].language}`}>
              {files[activeTab].content}
            </code>
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <button className="flex items-center gap-2 bg-accent-1 text-bg px-6 py-3 rounded-lg hover:shadow-glow-accent transition-all">
          <Download size={16} />
          Générer avec Jarvis
        </button>
        <button className="flex items-center gap-2 bg-accent-2 text-bg px-6 py-3 rounded-lg hover:shadow-glow-warning transition-all">
          <Copy size={16} />
          Copier tout le projet
        </button>
      </div>
    </div>
  );
}
