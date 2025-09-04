"use client";

import { ReactNode } from "react";
import TopMenu from "../ui/TopMenu";
import SidePanel from "../ui/SidePanel";
import MainPanel from "../ui/MainPanel";
import BottomPanel from "../ui/BottomPanel";
import { AppProvider } from "../../context/AppContext";

interface JarvisLayoutProps {
  children: ReactNode;
}

export default function JarvisLayout({ children }: JarvisLayoutProps) {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen bg-gray-50">
        <TopMenu />
        <div className="flex flex-1 overflow-hidden">
          <SidePanel />
          <MainPanel />
        </div>
        <BottomPanel />
      </div>
    </AppProvider>
  );
}
