'use client';

import { forwardRef, useState, useRef, useEffect } from 'react';

interface TerminalProps {
  projectId: string;
}

export const Terminal = forwardRef<HTMLDivElement, TerminalProps>((
  { projectId },
  ref
) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLogs([
      '$ OpenDev Build System',
      '$ Ready for commands',
    ]);
  }, [projectId]);

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setLogs([...logs, `$ ${input}`, 'Command executed...']);
      setInput('');
      inputRef.current?.focus();
    }
  };

  return (
    <div
      ref={ref}
      className="h-48 bg-black border-t border-gray-700 flex flex-col"
    >
      <div className="px-4 py-2 border-b border-gray-700 flex justify-between items-center bg-dark-card">
        <span className="text-sm text-gray-400">Terminal</span>
        <button className="text-gray-400 hover:text-white text-xl">×</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 terminal text-green-400 text-sm">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
      <div className="border-t border-gray-700 px-4 py-2 flex items-center bg-dark-card">
        <span className="text-green-400">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className="flex-1 ml-2 bg-transparent outline-none text-green-400 terminal"
          placeholder="Enter command..."
        />
      </div>
    </div>
  );
});

Terminal.displayName = 'Terminal';
