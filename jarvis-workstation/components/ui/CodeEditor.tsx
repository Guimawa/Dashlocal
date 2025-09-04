"use client";

import { useAppContext } from "../../context/AppContext";
import { useState, useEffect, useRef } from "react";
import { Copy, Download, Maximize2, Minimize2 } from "lucide-react";
import { copyToClipboard, downloadFile } from "../../lib/utils";

export default function CodeEditor() {
  const { tabs, activeTab, updateTabContent, settings } = useAppContext();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.fontSize = `${settings.fontSize}px`;
    }
  }, [settings.fontSize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateTabContent(activeTab, e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = " ".repeat(settings.tabSize);

      const newValue =
        textarea.value.substring(0, start) +
        spaces +
        textarea.value.substring(end);
      updateTabContent(activeTab, newValue);

      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          start + settings.tabSize;
      }, 0);
    }
  };

  const handleCopy = async () => {
    if (currentTab?.content) {
      try {
        await copyToClipboard(currentTab.content);
        // You could add a toast notification here
      } catch (error) {
        console.error("Failed to copy code:", error);
      }
    }
  };

  const handleDownload = () => {
    if (currentTab?.content) {
      downloadFile(currentTab.content, currentTab.name, "text/javascript");
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`flex flex-col ${isFullscreen ? "fixed inset-0 z-50" : "w-1/2"} border-r bg-white`}
    >
      {/* Editor header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">
            {currentTab?.name || "Untitled"}
          </span>
          {currentTab?.isDirty && (
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Copy code"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Download file"
          >
            <Download className="w-4 h-4" />
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

      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={currentTab?.content || ""}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full h-full p-4 border-none outline-none resize-none font-mono text-sm leading-relaxed"
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: "1.6",
            tabSize: settings.tabSize,
          }}
          placeholder="Start typing your code here or use the AI assistant to generate code..."
          spellCheck={false}
        />

        {/* Line numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-100 border-r text-gray-500 text-xs font-mono overflow-hidden">
          {currentTab?.content.split("\n").map((_, index) => (
            <div key={index} className="h-6 flex items-center justify-end pr-2">
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Editor footer */}
      <div className="flex items-center justify-between p-2 border-t bg-gray-50 text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Lines: {currentTab?.content.split("\n").length || 0}</span>
          <span>Chars: {currentTab?.content.length || 0}</span>
          <span>Language: {currentTab?.language || "jsx"}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Font: {settings.fontSize}px</span>
          <span>Tab: {settings.tabSize}</span>
        </div>
      </div>
    </div>
  );
}
