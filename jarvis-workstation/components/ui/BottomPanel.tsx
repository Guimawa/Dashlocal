"use client";

import { useAppContext } from "../../context/AppContext";
import { useState } from "react";
import {
  Terminal,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Trash2,
  Download,
  Filter,
} from "lucide-react";
import { formatTime } from "../../lib/utils";

export default function BottomPanel() {
  const { logs, clearLogs } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "info" | "success" | "warning" | "error"
  >("all");

  const filteredLogs = logs.filter(
    (log) => filter === "all" || log.level === filter,
  );

  const getLogIcon = (level: string) => {
    switch (level) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case "success":
        return "text-green-700 bg-green-50";
      case "warning":
        return "text-yellow-700 bg-yellow-50";
      case "error":
        return "text-red-700 bg-red-50";
      default:
        return "text-gray-700 bg-gray-50";
    }
  };

  const exportLogs = () => {
    const logText = logs
      .map(
        (log) =>
          `[${formatTime(log.timestamp)}] ${log.level.toUpperCase()}: ${log.message}${log.details ? ` - ${log.details}` : ""}`,
      )
      .join("\n");

    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jarvis-logs-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`border-t bg-white ${isExpanded ? "h-64" : "h-16"} transition-all duration-300`}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Logs</span>
          <span className="text-xs text-gray-500">({filteredLogs.length})</span>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>

          <button
            onClick={exportLogs}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Export logs"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={clearLogs}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs content */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No logs to display</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`flex items-start space-x-3 p-2 rounded ${getLogColor(log.level)}`}
              >
                {getLogIcon(log.level)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-gray-500">
                      {formatTime(log.timestamp)}
                    </span>
                    <span className="text-xs font-medium uppercase">
                      {log.level}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{log.message}</p>
                  {log.details && (
                    <p className="text-xs mt-1 opacity-75">{log.details}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Collapsed view */}
      {!isExpanded && (
        <div className="p-3">
          <div className="flex items-center space-x-4 text-xs text-gray-600">
            <span>Latest: {logs[logs.length - 1]?.message || "No logs"}</span>
            <span>Total: {logs.length}</span>
            <span>
              Errors: {logs.filter((log) => log.level === "error").length}
            </span>
            <span>
              Warnings: {logs.filter((log) => log.level === "warning").length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
