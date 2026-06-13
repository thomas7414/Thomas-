'use client';

import { useEffect, useRef } from 'react';

interface CodeEditorProps {
  file: string | null;
  content: string;
  onChange: (content: string) => void;
}

export function CodeEditor({ file, content, onChange }: CodeEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, [file]);

  const handleScroll = () => {
    if (editorRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
    }
  };

  const updateLineNumbers = () => {
    if (lineNumbersRef.current && editorRef.current) {
      const lines = editorRef.current.value.split('\n').length;
      const lineNumbers = Array.from({ length: lines }, (_, i) => i + 1)
        .map((num) => `<div>${num}</div>`)
        .join('');
      lineNumbersRef.current.innerHTML = lineNumbers;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-dark border-r border-gray-700">
      <div className="px-4 py-2 border-b border-gray-700 bg-dark-card">
        <p className="text-sm text-gray-400">{file || 'Select a file to edit'}</p>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div
          ref={lineNumbersRef}
          className="w-12 bg-dark-card border-r border-gray-700 text-right px-2 py-4 terminal text-gray-600 overflow-hidden select-none"
        >
          <div>1</div>
        </div>
        <textarea
          ref={editorRef}
          value={content}
          onChange={(e) => {
            onChange(e.target.value);
            updateLineNumbers();
          }}
          onScroll={handleScroll}
          className="flex-1 bg-dark text-white p-4 outline-none resize-none code-editor font-mono"
          spellCheck="false"
          placeholder="Select a file to start editing..."
        />
      </div>
    </div>
  );
}
