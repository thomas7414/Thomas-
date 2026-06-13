'use client';

import { useState } from 'react';

interface TopBarProps {
  project: any;
}

export function TopBar({ project }: TopBarProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-dark-card border-b border-gray-700 px-6 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-white">{project?.name}</h1>
        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
          {project?.type}
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <button className="px-3 py-2 text-gray-400 hover:text-white transition text-sm">
          📁 File
        </button>
        <button className="px-3 py-2 text-gray-400 hover:text-white transition text-sm">
          ✏️ Edit
        </button>
        <button className="px-3 py-2 text-gray-400 hover:text-white transition text-sm">
          👀 View
        </button>
        <button className="px-3 py-2 text-gray-400 hover:text-white transition text-sm">
          🧪 Build
        </button>
        <button className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition text-sm font-semibold">
          ▶️ Run
        </button>
        <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition text-sm font-semibold">
          🚀 Deploy
        </button>
      </div>
    </div>
  );
}
