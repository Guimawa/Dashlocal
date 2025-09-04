"use client";

import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Plus, X, Edit2, Check, X as XIcon } from "lucide-react";

export default function CodeTabs() {
  const { tabs, activeTab, setActiveTab, addTab, closeTab, renameTab } =
    useAppContext();
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAddTab = () => {
    addTab();
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    closeTab(tabId);
  };

  const handleRenameStart = (e: React.MouseEvent, tab: any) => {
    e.stopPropagation();
    setEditingTab(tab.id);
    setEditValue(tab.name);
  };

  const handleRenameConfirm = () => {
    if (editingTab && editValue.trim()) {
      renameTab(editingTab, editValue.trim());
    }
    setEditingTab(null);
    setEditValue("");
  };

  const handleRenameCancel = () => {
    setEditingTab(null);
    setEditValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRenameConfirm();
    } else if (e.key === "Escape") {
      handleRenameCancel();
    }
  };

  return (
    <div className="border-b bg-gray-50">
      <div className="flex items-center">
        {/* Tabs */}
        <div className="flex-1 flex overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center min-w-0 group ${
                activeTab === tab.id
                  ? "bg-white border-b-2 border-primary"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <div
                className="flex items-center min-w-0 px-4 py-2 cursor-pointer"
                onClick={() => setActiveTab(tab.id)}
              >
                {editingTab === tab.id ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleRenameConfirm}
                    onKeyDown={handleKeyPress}
                    className="bg-transparent border-none outline-none text-sm font-medium min-w-0"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center min-w-0">
                    <span className="text-sm font-medium truncate">
                      {tab.name}
                    </span>
                    {tab.isDirty && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full ml-2 flex-shrink-0" />
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-1 px-2">
                {editingTab === tab.id ? (
                  <>
                    <button
                      onClick={handleRenameConfirm}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleRenameCancel}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(e) => handleRenameStart(e, tab)}
                      className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleCloseTab(e, tab.id)}
                      className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add tab button */}
        <button
          onClick={handleAddTab}
          className="p-2 hover:bg-gray-200 transition-colors"
          title="Add new tab"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
