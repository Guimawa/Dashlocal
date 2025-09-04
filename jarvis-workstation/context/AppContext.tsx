"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  fetchGroqResponse,
  generatePrompt,
  validateGeneratedCode,
  formatCodeForPreview,
} from "../lib/groqClient";
import { generateId, formatTime } from "../lib/utils";

export interface Tab {
  id: string;
  name: string;
  content: string;
  language: "javascript" | "typescript" | "jsx" | "tsx";
  isDirty: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: "info" | "success" | "warning" | "error";
  message: string;
  details?: string;
}

export interface AppContextType {
  // Tabs management
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
  addTab: (name?: string, content?: string) => void;
  closeTab: (id: string) => void;
  renameTab: (id: string, newName: string) => void;

  // Code generation
  generateCode: (prompt: string, action?: string) => Promise<void>;
  isLoading: boolean;

  // Logs
  logs: LogEntry[];
  addLog: (
    message: string,
    level?: LogEntry["level"],
    details?: string,
  ) => void;
  clearLogs: () => void;

  // Settings
  settings: {
    autoSave: boolean;
    theme: "light" | "dark";
    fontSize: number;
    tabSize: number;
  };
  updateSettings: (settings: Partial<AppContextType["settings"]>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "1",
      name: "App.jsx",
      content: `import React from 'react';

export default function App() {
  return (
    <div className="app">
      <h1>Welcome to Jarvis Workstation</h1>
      <p>Start by typing a prompt in the chat to generate code!</p>
    </div>
  );
}`,
      language: "jsx",
      isDirty: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const [activeTab, setActiveTab] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: generateId(),
      timestamp: new Date(),
      level: "info",
      message: "System initialized",
    },
  ]);

  const [settings, setSettings] = useState<AppContextType["settings"]>({
    autoSave: true,
    theme: "light",
    fontSize: 14,
    tabSize: 2,
  });

  const addLog = useCallback(
    (message: string, level: LogEntry["level"] = "info", details?: string) => {
      const logEntry: LogEntry = {
        id: generateId(),
        timestamp: new Date(),
        level,
        message,
        details,
      };
      setLogs((prev) => [...prev, logEntry]);
    },
    [],
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const updateTabContent = useCallback((id: string, content: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === id
          ? {
              ...tab,
              content,
              isDirty: true,
              updatedAt: new Date(),
            }
          : tab,
      ),
    );
  }, []);

  const addTab = useCallback(
    (name?: string, content?: string) => {
      const newTab: Tab = {
        id: generateId(),
        name: name || `File-${tabs.length + 1}.jsx`,
        content: content || "",
        language: "jsx",
        isDirty: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTab(newTab.id);
      addLog(`Added new tab: ${newTab.name}`);
    },
    [tabs.length, addLog],
  );

  const closeTab = useCallback(
    (id: string) => {
      if (tabs.length <= 1) {
        addLog("Cannot close the last tab", "warning");
        return;
      }

      const tabToClose = tabs.find((tab) => tab.id === id);
      if (tabToClose) {
        addLog(`Closed tab: ${tabToClose.name}`);
      }

      setTabs((prev) => prev.filter((tab) => tab.id !== id));

      if (activeTab === id) {
        const remainingTabs = tabs.filter((tab) => tab.id !== id);
        setActiveTab(remainingTabs[0]?.id || "");
      }
    },
    [tabs, activeTab, addLog],
  );

  const renameTab = useCallback(
    (id: string, newName: string) => {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === id
            ? { ...tab, name: newName, updatedAt: new Date() }
            : tab,
        ),
      );
      addLog(`Renamed tab to: ${newName}`);
    },
    [addLog],
  );

  const generateCode = useCallback(
    async (prompt: string, action?: string) => {
      setIsLoading(true);
      addLog(`Generating code with prompt: ${prompt}`, "info");

      try {
        const finalPrompt = action ? generatePrompt(action, prompt) : prompt;
        const generatedCode = await fetchGroqResponse(finalPrompt);

        // Validate the generated code
        const validation = validateGeneratedCode(generatedCode);
        if (!validation.isValid) {
          addLog(
            "Generated code has validation issues",
            "warning",
            validation.errors.join(", "),
          );
        }

        // Format the code for preview
        const formattedCode = formatCodeForPreview(generatedCode);

        // Update the active tab with the generated code
        updateTabContent(activeTab, formattedCode);

        addLog("Code generated successfully", "success");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        addLog(`Error generating code: ${errorMessage}`, "error");
        console.error("Error generating code:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, updateTabContent, addLog],
  );

  const updateSettings = useCallback(
    (newSettings: Partial<AppContextType["settings"]>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
      addLog("Settings updated");
    },
    [addLog],
  );

  const value: AppContextType = {
    tabs,
    activeTab,
    setActiveTab,
    updateTabContent,
    addTab,
    closeTab,
    renameTab,
    generateCode,
    isLoading,
    logs,
    addLog,
    clearLogs,
    settings,
    updateSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
