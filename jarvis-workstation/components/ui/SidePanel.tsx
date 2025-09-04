"use client";

import ChatBox from "./ChatBox";
import QuickActions from "./QuickActions";

export default function SidePanel() {
  return (
    <div className="w-80 border-r bg-white flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
        <p className="text-sm text-gray-600">
          Generate code with AI assistance
        </p>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatBox />
        <QuickActions />
      </div>
    </div>
  );
}
