"use client";

import { useAppContext } from "../../context/AppContext";
import {
  Component,
  Bug,
  Zap,
  Type,
  TestTube,
  BookOpen,
  Smartphone,
  Accessibility,
  RefreshCw,
  Code,
} from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: string;
  description: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: "generate-component",
    label: "Generate Component",
    icon: Component,
    action: "generate-component",
    description: "Create a new React component",
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  },
  {
    id: "refactor-code",
    label: "Refactor Code",
    icon: RefreshCw,
    action: "refactor-code",
    description: "Improve code structure and performance",
    color: "bg-green-100 text-green-700 hover:bg-green-200",
  },
  {
    id: "fix-bugs",
    label: "Fix Bugs",
    icon: Bug,
    action: "fix-bugs",
    description: "Identify and fix code issues",
    color: "bg-red-100 text-red-700 hover:bg-red-200",
  },
  {
    id: "optimize",
    label: "Optimize",
    icon: Zap,
    action: "optimize",
    description: "Optimize for performance",
    color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  },
  {
    id: "add-types",
    label: "Add Types",
    icon: Type,
    action: "add-types",
    description: "Add TypeScript types",
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  },
  {
    id: "add-tests",
    label: "Add Tests",
    icon: TestTube,
    action: "add-tests",
    description: "Generate unit tests",
    color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
  },
  {
    id: "add-storybook",
    label: "Add Storybook",
    icon: BookOpen,
    action: "add-storybook",
    description: "Generate Storybook stories",
    color: "bg-pink-100 text-pink-700 hover:bg-pink-200",
  },
  {
    id: "responsive-design",
    label: "Responsive",
    icon: Smartphone,
    action: "responsive-design",
    description: "Make component responsive",
    color: "bg-teal-100 text-teal-700 hover:bg-teal-200",
  },
  {
    id: "add-accessibility",
    label: "Accessibility",
    icon: Accessibility,
    action: "add-accessibility",
    description: "Add accessibility features",
    color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  },
];

export default function QuickActions() {
  const { generateCode, addLog } = useAppContext();

  const handleAction = async (action: QuickAction) => {
    addLog(`Executing action: ${action.label}`, "info");

    try {
      await generateCode(action.description, action.action);
    } catch (error) {
      addLog(`Failed to execute ${action.label}`, "error");
    }
  };

  return (
    <div className="border-t bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              className={`flex flex-col items-center p-3 rounded-lg transition-colors ${action.color}`}
              title={action.description}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium text-center leading-tight">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <Code className="w-4 h-4" />
          <span>Click any action to apply it to your current code</span>
        </div>
      </div>
    </div>
  );
}
