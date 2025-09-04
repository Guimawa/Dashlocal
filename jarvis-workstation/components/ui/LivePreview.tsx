"use client";

import { Sandpack } from "@codesandbox/sandpack-react";
import { useState } from "react";
import { RefreshCw, Maximize2, Minimize2, ExternalLink } from "lucide-react";

interface LivePreviewProps {
  code: string;
}

export default function LivePreview({ code }: LivePreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const openInNewTab = () => {
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Jarvis Workstation - Live Preview</title>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>
            body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .error { color: red; background: #ffe6e6; padding: 10px; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            ${code}
          </script>
        </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <div
      className={`flex flex-col ${isFullscreen ? "fixed inset-0 z-50" : "w-1/2"} bg-white`}
    >
      {/* Preview header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">
            Live Preview
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openInNewTab}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-hidden">
        <Sandpack
          key={key}
          template="react"
          files={{
            "/App.js":
              code ||
              `import React from 'react';

export default function App() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Welcome to Jarvis Workstation</h1>
      <p>Your code will appear here when you generate it!</p>
    </div>
  );
}`,
          }}
          options={{
            visibleFiles: ["/App.js"],
            activeFile: "/App.js",
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
            showNavigator: false,
            showRefreshButton: false,
            showTabs: false,
            showConsole: true,
            showConsoleButton: true,
            editorHeight: "100%",
            editorWidthPercentage: 0,
            previewHeight: "100%",
          }}
          theme="light"
          customSetup={{
            dependencies: {
              react: "^18.0.0",
              "react-dom": "^18.0.0",
            },
          }}
        />
      </div>

      {/* Preview footer */}
      <div className="flex items-center justify-between p-2 border-t bg-gray-50 text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <span>React 18</span>
          <span>Sandpack</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Live Preview</span>
        </div>
      </div>
    </div>
  );
}
