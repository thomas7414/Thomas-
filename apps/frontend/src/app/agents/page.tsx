'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';

export default function AIAgentsPage() {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  const { data: agents } = useQuery('ai-agents', () =>
    api.get('/ai-agents/available').then((res) => res.data)
  );

  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header user={null} onLogout={() => {}} />
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-white mb-2">AI Agents</h1>
              <p className="text-gray-400">
                Hire specialized AI agents to help with your development tasks
              </p>
            </div>

            {/* Agent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {agents?.map((agent: any) => (
                <div
                  key={agent.id}
                  onMouseEnter={() => setHoveredAgent(agent.id)}
                  onMouseLeave={() => setHoveredAgent(null)}
                  className="bg-dark-card rounded-lg p-6 border border-gray-700 hover:border-primary transition cursor-pointer h-full"
                >
                  <div className="text-5xl mb-4">{agent.emoji}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{agent.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{agent.description}</p>

                  <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-300 mb-2">CAPABILITIES</p>
                    <div className="flex flex-wrap gap-2">
                      {agent.capabilities.map((cap: string) => (
                        <span
                          key={cap}
                          className="px-2 py-1 bg-primary/20 text-primary rounded text-xs"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-400 font-semibold">
                      ✓ {agent.status}
                    </span>
                    <Link
                      href={`/agents/chat?agent=${agent.id}`}
                      className="text-primary hover:text-primary/90 text-sm font-semibold"
                    >
                      Chat →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Use Cases */}
            <div className="bg-dark-card rounded-lg p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Popular Use Cases</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-dark rounded-lg border border-gray-700">
                  <p className="text-lg font-semibold text-white mb-2">🎨 Build a Login Form</p>
                  <p className="text-gray-400 text-sm">
                    Get a fully functional login form with validation and styling
                  </p>
                </div>
                <div className="p-4 bg-dark rounded-lg border border-gray-700">
                  <p className="text-lg font-semibold text-white mb-2">⚙️ Setup REST API</p>
                  <p className="text-gray-400 text-sm">
                    Create a production-ready REST API with authentication
                  </p>
                </div>
                <div className="p-4 bg-dark rounded-lg border border-gray-700">
                  <p className="text-lg font-semibold text-white mb-2">✅ Write Unit Tests</p>
                  <p className="text-gray-400 text-sm">
                    Generate comprehensive test suites for your codebase
                  </p>
                </div>
                <div className="p-4 bg-dark rounded-lg border border-gray-700">
                  <p className="text-lg font-semibold text-white mb-2">🚀 Deploy to Production</p>
                  <p className="text-gray-400 text-sm">
                    Get step-by-step deployment guides for your project
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
