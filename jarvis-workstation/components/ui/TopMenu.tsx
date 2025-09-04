"use client";

import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  Settings,
  FileText,
  Download,
  Upload,
  Play,
  Square,
} from "lucide-react";

export default function TopMenu() {
  const { settings, updateSettings, addLog } = useAppContext();
  const [showSettings, setShowSettings] = useState(false);

  const handleNewFile = () => {
    addLog("Creating new file");
    // This would be handled by the context
  };

  const handleSave = () => {
    addLog("Saving file");
    // This would be handled by the context
  };

  const handleExport = () => {
    addLog("Exporting project");
    // This would be handled by the context
  };

  const handleRun = () => {
    addLog("Running code");
    // This would be handled by the context
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
      {/* Left side - File operations */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleNewFile}
            className="flex items-center space-x-1 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
            title="New File"
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm">File</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
            title="Save"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Save</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-1 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
            title="Export"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRun}
            className="flex items-center space-x-1 px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
            title="Run Code"
          >
            <Play className="w-4 h-4" />
            <span className="text-sm">Run</span>
          </button>
        </div>
      </div>

      {/* Center - App title */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">J</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Jarvis Workstation</h1>
      </div>

      {/* Right side - Settings and user */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Theme:</span>
          <select
            value={settings.theme}
            onChange={(e) =>
              updateSettings({ theme: e.target.value as "light" | "dark" })
            }
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Font:</span>
          <select
            value={settings.fontSize}
            onChange={(e) =>
              updateSettings({ fontSize: parseInt(e.target.value) })
            }
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value={12}>12px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
          </select>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 px-3 py-1 rounded bg-gray-100">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">U</span>
          </div>
          <span className="text-sm font-medium">User</span>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64 z-50">
          <h3 className="font-semibold mb-3">Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm">Auto Save</label>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => updateSettings({ autoSave: e.target.checked })}
                className="rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm">Tab Size</label>
              <select
                value={settings.tabSize}
                onChange={(e) =>
                  updateSettings({ tabSize: parseInt(e.target.value) })
                }
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
