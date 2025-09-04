"use client";

import { useEffect, useState } from "react";
import TestResultItem from "@/components/ui/TestResultItem";

export default function TestsScreen() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tests")
      .then((res) => res.json())
      .then((data) => {
        setTests(data || []);
        setLoading(false);
      });
  }, []);

  const handleRerun = async (id) => {
    await fetch(`/api/tests/${id}/rerun`, { method: "POST" });
    // Optionnel : refetch ou update local
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tests Automatisés</h1>

      {loading && <p>Chargement des tests...</p>}

      {!loading && tests.length === 0 && (
        <p className="text-gray-500">Aucun test trouvé.</p>
      )}

      <ul className="space-y-4">
        {tests.map((test) => (
          <TestResultItem key={test.id} test={test} onRerun={handleRerun} />
        ))}
      </ul>
    </div>
  );
}
