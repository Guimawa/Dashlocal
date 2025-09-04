"use client";

import { useState, useEffect } from "react";

export default function CodeEditor({ onCodeChange }) {
  const [code, setCode] = useState(`
export default function Hello() {
  return <h1>Hello World!</h1>;
}
  `);

  useEffect(() => {
    onCodeChange(code);
  }, [code]);

  return (
    <textarea
      value={code}
      onChange={(e) => setCode(e.target.value)}
      className="w-full h-96 font-mono border border-gray-300 p-4 rounded-lg bg-white dark:bg-gray-900 dark:text-white resize-none"
    />
  );
}
