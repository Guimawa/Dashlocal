"use client";

import { useEffect, useState } from "react";
import StatWidget from "@/components/ui/StatWidget";
import ProjectList from "@/components/ui/ProjectList";
import ActivityLog from "@/components/ui/ActivityLog";

export default function DashboardHome() {
  const [stats, setStats] = useState({});
  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats || {});
        setProjects(data.projects || []);
        setLogs(data.logs || []);
      });
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Jarvis Dashboard</h1>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatWidget
          title="Générations"
          value={stats.generations}
          type="success"
        />
        <StatWidget
          title="Composants uniques"
          value={stats.components}
          type="info"
        />
        <StatWidget
          title="Projets créés"
          value={stats.projects}
          type="warning"
        />
      </div>

      {/* Projets */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Projets récents</h2>
        <ProjectList projects={projects} />
      </div>

      {/* Logs récents */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Activité récente</h2>
        <ActivityLog entries={logs} />
      </div>
    </div>
  );
}
