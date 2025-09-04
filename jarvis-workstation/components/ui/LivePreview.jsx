"use client";

import { useEffect, useRef } from "react";
import * as ReactDOMClient from "react-dom/client";

export default function LivePreview({ component }) {
  const previewRef = useRef(null);

  useEffect(() => {
    if (!component || !previewRef.current) return;

    try {
      const code = `
        import React from 'react';
        ${component}
        const root = ReactDOMClient.createRoot(document.getElementById("live"));
        root.render(React.createElement(Hello));
      `;

      const blob = new Blob([code], { type: "text/javascript" });
      const url = URL.createObjectURL(blob);
      const script = document.createElement("script");
      script.src = url;
      script.type = "module";
      script.onload = () => URL.revokeObjectURL(url);
      previewRef.current.innerHTML = "";
      previewRef.current.appendChild(script);
    } catch (err) {
      previewRef.current.innerHTML = `<pre class="text-red-600">${err.toString()}</pre>`;
    }
  }, [component]);

  return (
    <div
      id="live"
      ref={previewRef}
      className="border rounded-lg p-4 bg-gray-50 min-h-[200px]"
    />
  );
}
