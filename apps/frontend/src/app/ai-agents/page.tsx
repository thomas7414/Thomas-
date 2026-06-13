'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from 'react-query';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function AIAgentsPage() {
  const router = useRouter();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: agents } = useQuery('ai-agents', () =>
    api.get('/ai-agents/available').then((res) => res.data)
  );

  const handleAssignTask = async () => {
    if (!selectedAgent || !task) {
      alert('Please select an agent and enter a task');
      return;
    }

    setLoading(true);
    try {
      await api.post('/ai-agents/assign-task', {
        agentId: selectedAgent,
        task,
      });
      setTask('');
      alert('Task assigned successfully!');
    } catch (error) {
      alert('Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header user={null} onLogout={() => {}} />
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">AI Agents</h1>
              <p className="text-gray-400">Assign development tasks to specialized AI agents</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Agents List */}
              <div className="lg:col-span-1 space-y-3">
                <h2 className="text-lg font-semibold text-white mb-4">Available Agents</h2>
                {agents &&
                  agents.map((agent: any) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        selectedAgent === agent.id
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <p className="font-semibold text-white">{agent.name}</p>
                      <p className="text-sm text-gray-400 mt-1">{agent.description}</p>
                    </button>
                  ))}
              </div>

              {/* Task Assignment */}
              <div className="lg:col-span-2">
                {selectedAgent ? (
                  <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      {agents?.find((a: any) => a.id === selectedAgent)?.name}
                    </h3>

                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Capabilities</h4>
                      <div className="flex flex-wrap gap-2">
                        {agents
                          ?.find((a: any) => a.id === selectedAgent)
                          ?.capabilities.map((cap: string) => (
                            <span
                              key={cap}
                              className="px-3 py-1 bg-primary/20 text-primary rounded text-sm"
                            >
                              {cap}
                            </span>
                          ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Describe your task
                      </label>
                      <textarea
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        className="w-full px-4 py-3 bg-dark rounded border border-gray-600 text-white focus:border-primary focus:outline-none"
                        placeholder="E.g., Create a login form component with email and password fields"
                        rows={6}
                      />
                    </div>

                    <button
                      onClick={handleAssignTask}
                      disabled={loading}
                      className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                    >
                      {loading ? 'Assigning...' : 'Assign Task'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-dark-card rounded-lg p-12 border border-gray-700 text-center">
                    <p className="text-gray-400">Select an agent to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
