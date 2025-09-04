"use client";

import { useEffect, useState } from "react";
import FeedbackItem from "@/components/ui/FeedbackItem";

export default function LearningScreen() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/learning")
      .then((res) => res.json())
      .then((data) => {
        setFeedbacks(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Apprentissage de Jarvis</h1>

      {loading && <p>Chargement...</p>}

      {!loading && feedbacks.length === 0 && (
        <p className="text-gray-500">Aucun feedback enregistré.</p>
      )}

      <ul className="space-y-4">
        {feedbacks.map((f, i) => (
          <FeedbackItem key={i} item={f} />
        ))}
      </ul>
    </div>
  );
}
