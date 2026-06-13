import { create } from 'zustand';

interface EditorStore {
  activeFile: string | null;
  files: Map<string, string>;
  setActiveFile: (file: string) => void;
  setFileContent: (file: string, content: string) => void;
  getFileContent: (file: string) => string;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  activeFile: null,
  files: new Map(),
  setActiveFile: (file: string) => set({ activeFile: file }),
  setFileContent: (file: string, content: string) => {
    const { files } = get();
    files.set(file, content);
    set({ files: new Map(files) });
  },
  getFileContent: (file: string) => {
    const { files } = get();
    return files.get(file) || '';
  },
}));
