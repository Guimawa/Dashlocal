// app/layout.tsx
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("bg-background text-foreground", inter.className)}>
        {children}
      </body>
    </html>
  );
}

// app/page.tsx
import { JarvisLayout } from "@/components/layout/JarvisLayout";

export default function Home() {
  return <JarvisLayout />;
}

// components/layout/JarvisLayout.tsx
import { TopMenu } from "@/components/ui/TopMenu";
import { SidePanel } from "@/components/ui/SidePanel";
import { MainPanel } from "@/components/ui/MainPanel";
import { BottomPanel } from "@/components/ui/BottomPanel";

export const JarvisLayout = () => {
  return (
    <div className="flex flex-col h-screen w-screen">
      <TopMenu />
      <div className="flex flex-1 overflow-hidden">
        <SidePanel />
        <MainPanel />
      </div>
      <BottomPanel />
    </div>
  );
};

// components/ui/TopMenu.tsx
export const TopMenu = () => (
  <div className="bg-zinc-900 text-zinc-100 px-4 py-2 border-b border-zinc-800 flex gap-6 text-sm">
    <span>File</span>
    <span>Edit</span>
    <span>View</span>
    <span>Settings</span>
  </div>
);

// components/ui/SidePanel.tsx
import { ChatBox } from "@/components/ui/ChatBox";
import { QuickActions } from "@/components/ui/QuickActions";

export const SidePanel = () => (
  <div className="w-80 bg-zinc-950 p-4 flex flex-col border-r border-zinc-800">
    <ChatBox />
    <QuickActions />
  </div>
);

// components/ui/ChatBox.tsx
export const ChatBox = () => (
  <div className="mb-4">
    <div className="text-sm text-zinc-400 mb-2">AI Assistant</div>
    <textarea
      className="w-full h-24 p-2 rounded bg-zinc-800 text-zinc-100 resize-none"
      placeholder="Type or speak your command..."
    />
    <button className="mt-2 w-full py-1 text-sm rounded bg-blue-600 hover:bg-blue-700">
      Send
    </button>
  </div>
);

// components/ui/QuickActions.tsx
export const QuickActions = () => (
  <div className="space-y-2">
    <button className="w-full py-2 text-sm rounded bg-zinc-800 hover:bg-zinc-700 text-left px-2">
      Create a React component
    </button>
    <button className="w-full py-2 text-sm rounded bg-zinc-800 hover:bg-zinc-700 text-left px-2">
      Add a button
    </button>
    <button className="w-full py-2 text-sm rounded bg-zinc-800 hover:bg-zinc-700 text-left px-2">
      Fetch data from API
    </button>
  </div>
);

// components/ui/MainPanel.tsx
import { CodeTabs } from "@/components/ui/CodeTabs";
import { CodeEditor } from "@/components/ui/CodeEditor";
import { LivePreview } from "@/components/ui/LivePreview";

export const MainPanel = () => (
  <div className="flex-1 bg-zinc-900 p-4 flex flex-col gap-4 overflow-auto">
    <CodeTabs />
    <CodeEditor />
    <LivePreview />
  </div>
);

// components/ui/CodeTabs.tsx
export const CodeTabs = () => (
  <div className="flex gap-4 text-sm text-zinc-400">
    <div className="px-3 py-1 bg-zinc-800 rounded-t">App.tsx</div>
    <div className="px-3 py-1 bg-zinc-700 rounded-t">AnotherFile.tsx</div>
  </div>
);

// components/ui/CodeEditor.tsx
export const CodeEditor = () => (
  <div className="bg-zinc-800 rounded p-4 text-sm text-zinc-100 font-mono h-64">
    {/* Editor or Monaco would be here */}
    <pre>{`function App() {
  return <h1>Hello, world!</h1>;
}`}</pre>
  </div>
);

// components/ui/LivePreview.tsx
export const LivePreview = () => (
  <div className="bg-zinc-950 rounded p-4 text-white">
    <h1 className="text-xl font-bold mb-2">Hello, world!</h1>
    <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">Click me</button>
  </div>
);

// components/ui/BottomPanel.tsx
export const BottomPanel = () => (
  <div className="h-16 bg-zinc-900 text-zinc-300 text-sm border-t border-zinc-800 px-4 py-2">
    Logs and metrics will appear here...
  </div>
);
