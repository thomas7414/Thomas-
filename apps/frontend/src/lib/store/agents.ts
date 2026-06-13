import { create } from 'zustand';

interface AgentTask {
  id: string;
  agent: string;
  task: string;
  response: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  timestamp: Date;
}

interface AgentStore {
  tasks: AgentTask[];
  selectedAgent: string | null;
  addTask: (task: AgentTask) => void;
  updateTask: (id: string, updates: Partial<AgentTask>) => void;
  setSelectedAgent: (agent: string) => void;
  clearTasks: () => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  tasks: [],
  selectedAgent: null,
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
  clearTasks: () => set({ tasks: [] }),
}));
