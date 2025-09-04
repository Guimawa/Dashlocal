"use client";

import { useEffect, useState } from "react";
import MemoryItem from "@/components/ui/MemoryItem";

export default function MemoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const res = await fetch("/api/memory");
        const data = await res.json();
        setHistory(data || []);
      } catch (err) {
        console.error("Erreur mémoire", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemory();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mémoire des Générations</h1>

      {loading && <p>Chargement...</p>}

      {!loading && history.length === 0 && (
        <p className="text-gray-500">Aucune génération trouvée.</p>
      )}

      <ul className="space-y-4">
        {history.map((item, index) => (
          <MemoryItem key={index} item={item} />
        ))}
      </ul>
    </div>
  );
}
