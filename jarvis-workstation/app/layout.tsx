import "./globals.css";
import { Inter } from "next/font/google";
import Sidebar from "@/components/layout/Sidebar";
import ThemeToggle from "@/components/ui/ThemeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Jarvis Dashboard",
  description: "IA générative de composants React",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white`}
      >
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>

        <div className="fixed bottom-4 right-4 z-50">
          <ThemeToggle />
        </div>
      </body>
    </html>
  );
}
