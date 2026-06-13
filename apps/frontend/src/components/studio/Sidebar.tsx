'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { api } from '@/lib/api';

interface SidebarProps {
  projectId: string;
  files: any[];
  activeFile: string | null;
  onSelectFile: (file: string) => void;
}

const SIDEBAR_TABS = [
  { id: 'files', label: 'Files', icon: '📁' },
  { id: 'assets', label: 'Assets', icon: '🎨' },
  { id: 'components', label: 'Components', icon: '🧩' },
  { id: 'apis', label: 'APIs', icon: '🔌' },
  { id: 'database', label: 'Database', icon: '🗄️' },
  { id: 'agents', label: 'AI Agents', icon: '🤖' },
  { id: 'git', label: 'Git', icon: '🔗' },
  { id: 'deploy', label: 'Deploy', icon: '🚀' },
];

export function Sidebar({
  projectId,
  files,
  activeFile,
  onSelectFile,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState('files');

  return (
    <div className="w-64 bg-dark-card border-r border-gray-700 flex flex-col">
      {/* Tab Buttons */}
      <div className="border-b border-gray-700 p-2 flex overflow-x-auto space-x-1">
        {SIDEBAR_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
            title={tab.label}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs text-gray-400 font-semibold mb-3">PROJECT FILES</div>
          {files && files.length > 0 ? (
            <div className="space-y-1">
              {files.map((file: any) => (
                <button
                  key={file.id}
                  onClick={() => onSelectFile(file.path)}
                  className={`w-full text-left px-2 py-1 rounded text-sm transition ${
                    activeFile === file.path
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  📄 {file.path}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-xs">No files yet</p>
          )}
        </div>
      )}

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs text-gray-400 font-semibold mb-3">ASSETS</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-700 rounded p-2 text-center">
              <div className="text-2xl mb-1">🖼️</div>
              <p className="text-xs text-gray-300">Images</p>
            </div>
            <div className="bg-gray-700 rounded p-2 text-center">
              <div className="text-2xl mb-1">🎵</div>
              <p className="text-xs text-gray-300">Audio</p>
            </div>
          </div>
        </div>
      )}

      {/* Components Tab */}
      {activeTab === 'components' && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs text-gray-400 font-semibold mb-3">COMPONENTS</div>
          <div className="space-y-2">
            <div className="bg-gray-700 rounded p-2 cursor-pointer hover:bg-gray-600">
              <p className="text-sm text-white">Button</p>
            </div>
            <div className="bg-gray-700 rounded p-2 cursor-pointer hover:bg-gray-600">
              <p className="text-sm text-white">Input</p>
            </div>
            <div className="bg-gray-700 rounded p-2 cursor-pointer hover:bg-gray-600">
              <p className="text-sm text-white">Modal</p>
            </div>
          </div>
        </div>
      )}

      {/* APIs Tab */}
      {activeTab === 'apis' && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs text-gray-400 font-semibold mb-3">API ENDPOINTS</div>
          <div className="space-y-2">
            <div className="bg-gray-700 rounded p-2 cursor-pointer hover:bg-gray-600">
              <p className="text-xs text-blue-400">GET /api/users</p>
            </div>
            <div className="bg-gray-700 rounded p-2 cursor-pointer hover:bg-gray-600">
              <p className="text-xs text-green-400">POST /api/projects</p>
            </div>
          </div>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs text-gray-400 font-semibold mb-3">DATABASE</div>
          <div className="space-y-1 text-xs text-gray-300">
            <p>📊 Tables: 8</p>
            <p>🔑 Connections: 1</p>
            <p>💾 Size: 2.5 MB</p>
          </div>
        </div>
      )}

      {/* AI Agents Tab */}
      {activeTab === 'agents' && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs text-gray-400 font-semibold mb-3">AI AGENTS</div>
          <button className="w-full bg-primary hover:bg-primary/90 text-white text-xs py-2 rounded transition">
            + Assign Task
          </button>
        </div>
      )}
    </div>
  );
}
