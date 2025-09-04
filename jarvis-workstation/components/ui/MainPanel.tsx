"use client";

import CodeTabs from "./CodeTabs";
import CodeEditor from "./CodeEditor";
import LivePreview from "./LivePreview";
import { useAppContext } from "../../context/AppContext";

export default function MainPanel() {
  const { tabs, activeTab, isLoading } = useAppContext();
  const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <CodeTabs />
      <div className="flex flex-1 overflow-hidden">
        <CodeEditor />
        <LivePreview code={currentTab?.content || ""} />
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Generating Code
                </h3>
                <p className="text-sm text-gray-600">
                  Please wait while AI creates your code...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
