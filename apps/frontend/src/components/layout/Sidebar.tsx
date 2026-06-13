'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Projects', href: '/projects', icon: '📁' },
  { name: 'Team', href: '/team', icon: '👥' },
  { name: 'Hosting', href: '/hosting', icon: '🚀' },
  { name: 'Billing', href: '/billing', icon: '💳' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-dark-card border-r border-gray-700 transition-all duration-300`}>
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!collapsed && <h1 className="text-xl font-bold text-white">OpenDev</h1>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-2 rounded-lg transition ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
