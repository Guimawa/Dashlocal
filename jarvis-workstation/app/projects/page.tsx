"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FolderOpen, Eye, Code, Download } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Simuler le chargement des projets
    setProjects([
      {
        id: "handshake-react-pure",
        name: "Handshake Dashboard",
        description:
          "React Dashboard UI full frontend avec graphiques et mode sombre",
        type: "template",
        status: "ready",
        tech: [
          "React 19.1.1",
          "TypeScript",
          "Tailwind CSS 4.1.12",
          "Recharts",
          "Lucide React",
        ],
        preview: "/projects/handshake-react-pure/preview",
        source: "/projects/handshake-react-pure/source",
      },
      {
        id: "my-custom-dashboard",
        name: "Mon Dashboard Personnalisé",
        description: "Dashboard généré par Jarvis avec mes composants",
        type: "generated",
        status: "in-progress",
        tech: ["React", "Tailwind CSS", "Jarvis Generated"],
        preview: "/projects/my-custom-dashboard/preview",
        source: "/projects/my-custom-dashboard/source",
      },
    ]);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projets & Templates</h1>
        <div className="flex gap-2">
          <Link href="/generate-handshake">
            <button className="bg-accent-2 text-bg px-4 py-2 rounded-lg font-medium hover:shadow-glow-warning transition-all">
              🚀 Générer avec Handshake
            </button>
          </Link>
          <button className="bg-accent-1 text-bg px-4 py-2 rounded-lg font-medium hover:shadow-glow-accent transition-all">
            + Nouveau Projet
          </button>
        </div>
      </div>

      {/* Templates disponibles */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-accent-3">
          📦 Templates Disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects
            .filter((p) => p.type === "template")
            .map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
        </div>
      </div>

      {/* Projets générés */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-accent-2">
          🚀 Mes Projets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects
            .filter((p) => p.type === "generated")
            .map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project }) {
  const getStatusColor = () => {
    switch (project.status) {
      case "ready":
        return "text-accent-1";
      case "in-progress":
        return "text-accent-2";
      case "error":
        return "text-accent-4";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-glow hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <FolderOpen size={20} className="text-accent-3" />
          <h3 className="font-semibold text-lg">{project.name}</h3>
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor()}`}
        >
          {project.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1 mb-4">
        {project.tech.slice(0, 3).map((tech, index) => (
          <span
            key={index}
            className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded"
          >
            {tech}
          </span>
        ))}
        {project.tech.length > 3 && (
          <span className="text-xs text-gray-500">
            +{project.tech.length - 3}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Link href={project.preview}>
          <button className="flex items-center gap-1 text-sm text-accent-3 hover:text-accent-3/80 font-medium transition-colors">
            <Eye size={16} />
            Preview
          </button>
        </Link>
        <Link href={project.source}>
          <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors">
            <Code size={16} />
            Code
          </button>
        </Link>
        <button className="flex items-center gap-1 text-sm text-accent-1 hover:text-accent-1/80 font-medium transition-colors">
          <Download size={16} />
          Export
        </button>
      </div>
    </div>
  );
}
