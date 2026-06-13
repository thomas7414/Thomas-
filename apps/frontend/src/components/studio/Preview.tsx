'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { api } from '@/lib/api';

interface PreviewProps {
  projectId: string;
}

export function Preview({ projectId }: PreviewProps) {
  const [view, setView] = useState<'web' | 'mobile'>('web');

  const { data: preview } = useQuery(
    ['preview', projectId],
    () => api.get(`/projects/${projectId}/preview`).then((res) => res.data),
    { enabled: false }
  );

  return (
    <div className="flex-1 flex flex-col bg-dark-card border-l border-gray-700">
      <div className="px-4 py-2 border-b border-gray-700 flex justify-between items-center">
        <span className="text-sm text-gray-400">Preview</span>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('web')}
            className={`px-3 py-1 text-xs rounded ${
              view === 'web'
                ? 'bg-primary text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            🌐 Web
          </button>
          <button
            onClick={() => setView('mobile')}
            className={`px-3 py-1 text-xs rounded ${
              view === 'mobile'
                ? 'bg-primary text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            📱 Mobile
          </button>
        </div>
      </div>
      <div className="flex-1 bg-white flex items-center justify-center">
        {view === 'web' ? (
          <iframe
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms"
            srcDoc="<html><body style='margin:0;padding:20px;font-family:sans-serif'><h1>Live Preview</h1><p>Your app will appear here</p></body></html>"
          />
        ) : (
          <div className="bg-black rounded-3xl border-8 border-gray-900 p-4 h-5/6 aspect-video flex items-center justify-center">
            <iframe
              className="w-full h-full border-0 rounded-2xl"
              sandbox="allow-same-origin allow-scripts allow-forms"
              srcDoc="<html><body style='margin:0;padding:10px;font-family:sans-serif;font-size:14px'><h2>Mobile Preview</h2><p>Your mobile app will appear here</p></body></html>"
            />
          </div>
        )}
      </div>
    </div>
  );
}
