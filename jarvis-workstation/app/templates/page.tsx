"use client";

import { useState } from "react";
import LivePreview from "@/components/ui/LivePreview";
import CodeEditor from "@/components/ui/CodeEditor";

export default function TemplatesScreen() {
  const [compiledCode, setCompiledCode] = useState("");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section>
        <h2 className="text-xl font-semibold mb-4">Éditeur de Template</h2>
        <CodeEditor onCodeChange={setCompiledCode} />
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-4">Aperçu Live</h2>
        <LivePreview component={compiledCode} />
      </section>
    </div>
  );
}
