'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery } from 'react-query';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/studio/Sidebar';
import { CodeEditor } from '@/components/studio/CodeEditor';
import { Preview } from '@/components/studio/Preview';
import { Terminal } from '@/components/studio/Terminal';
import { TopBar } from '@/components/studio/TopBar';

interface StudioProps {
  params: {
    projectId: string;
  };
}

export default function StudioPage({ params }: StudioProps) {
  const { projectId } = params;
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [layout, setLayout] = useState<'split' | 'editor' | 'preview'>('split');
  const [showTerminal, setShowTerminal] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);

  const { data: project, isLoading: projectLoading } = useQuery(
    ['project', projectId],
    () => api.get(`/projects/${projectId}`).then((res) => res.data)
  );

  const { data: files, isLoading: filesLoading } = useQuery(
    ['projectFiles', projectId],
    () => api.get(`/projects/${projectId}/files`).then((res) => res.data)
  );

  if (projectLoading || filesLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-dark">
      <TopBar project={project} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          projectId={projectId}
          files={files}
          activeFile={activeFile}
          onSelectFile={setActiveFile}
        />
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex overflow-hidden">
            {(layout === 'split' || layout === 'editor') && (
              <CodeEditor
                file={activeFile}
                content={editorContent}
                onChange={setEditorContent}
              />
            )}
            {(layout === 'split' || layout === 'preview') && (
              <Preview projectId={projectId} />
            )}
          </div>
          {showTerminal && (
            <Terminal ref={terminalRef} projectId={projectId} />
          )}
        </div>
      </div>
    </div>
  );
}
