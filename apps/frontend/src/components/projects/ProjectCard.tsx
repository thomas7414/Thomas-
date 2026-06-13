'use client';

import Link from 'next/link';

export function ProjectCard({ project }: { project: any }) {
  const typeIcons: any = {
    'website': '🌐',
    'web-app': '💻',
    'ios-app': '🍎',
    'android-app': '🤖',
    'api': '🔌',
    'saas': '☁️',
    'ai-app': '🤖',
    'game': '🎮',
  };

  const statusColors: any = {
    'initializing': 'bg-yellow-500/20 text-yellow-400',
    'building': 'bg-blue-500/20 text-blue-400',
    'deployed': 'bg-green-500/20 text-green-400',
    'archived': 'bg-gray-500/20 text-gray-400',
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-dark-card rounded-lg p-6 hover:bg-gray-700/50 transition cursor-pointer border border-gray-700 hover:border-primary">
        <div className="flex items-start justify-between mb-4">
          <span className="text-4xl">{typeIcons[project.type] || '📦'}</span>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[project.status] || 'bg-gray-500/20 text-gray-400'}`}>
            {project.status}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">{project.name}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>

        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>{project.type}</span>
          <span>•</span>
          <span>{project.language || 'N/A'}</span>
        </div>
      </div>
    </Link>
  );
}
