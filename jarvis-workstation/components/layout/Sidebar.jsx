'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Code, FileText, FolderOpen, History, Brain, FlaskConical } from 'lucide-react';

const nav = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Générer', href: '/generate', icon: Code },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Projets', href: '/projects', icon: FolderOpen },
  { name: 'Mémoire', href: '/memory', icon: History },
  { name: 'Apprentissage', href: '/learning', icon: Brain },
  { name: 'Tests', href: '/tests', icon: FlaskConical },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
      <h1 className="text-xl font-bold mb-6">🧠 Jarvis</h1>
      <nav className="space-y-2">
        {nav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition 
                  ${isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                <Icon size={18} />
                <span className="text-sm">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
