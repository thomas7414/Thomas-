'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Agent {
  id: string;
  name: string;
  emoji: string;
  description: string;
  capabilities: string[];
  status: string;
}

interface AgentMessage {
  id: string;
  agent: Agent;
  task: string;
  response: string;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export default function AgentChat() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: agents } = useQuery('agents', () =>
    api.get('/ai-agents/available').then((res) => res.data)
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAgent || !input.trim()) {
      toast.error('Please select an agent and enter a task');
      return;
    }

    setLoading(true);
    const userInput = input;
    setInput('');

    // Add message to UI
    const messageId = `msg-${Date.now()}`;
    const newMessage: AgentMessage = {
      id: messageId,
      agent: agents?.find((a: Agent) => a.id === selectedAgent),
      task: userInput,
      response: '',
      timestamp: new Date(),
      status: 'processing',
    };

    setMessages((prev) => [...prev, newMessage]);

    try {
      // Stream response from agent
      const response = await fetch(`/api/ai-agents/assign-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          agentId: selectedAgent,
          projectId,
          task: userInput,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullResponse += data.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === messageId
                      ? { ...msg, response: fullResponse }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, status: 'completed' }
            : msg
        )
      );
    } catch (error: any) {
      toast.error('Failed to process task');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, status: 'error', response: 'Failed to process task' }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-dark">
      {/* Agents Sidebar */}
      <div className="w-64 bg-dark-card border-r border-gray-700 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold text-white mb-4">AI Agents</h2>
        <div className="space-y-2">
          {agents?.map((agent: Agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`w-full text-left p-3 rounded-lg transition border-2 ${
                selectedAgent === agent.id
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{agent.emoji}</span>
                <div>
                  <p className="font-semibold text-white text-sm">{agent.name}</p>
                  <p className="text-xs text-gray-400">{agent.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-dark-card border-b border-gray-700 px-6 py-4">
          <h1 className="text-xl font-semibold text-white">
            {selectedAgent
              ? agents?.find((a: Agent) => a.id === selectedAgent)?.name
              : 'Select an Agent'}
          </h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-2xl mb-2">🤖</p>
                <p className="text-gray-400">
                  Select an agent and describe your task to get started
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="space-y-3">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-xl bg-primary text-white rounded-lg p-4">
                    <p className="text-sm">{msg.task}</p>
                  </div>
                </div>

                {/* Agent Response */}
                <div className="flex space-x-3">
                  <span className="text-3xl">{msg.agent?.emoji}</span>
                  <div className="max-w-xl bg-dark-card border border-gray-700 rounded-lg p-4 flex-1">
                    {msg.status === 'processing' && (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <p className="text-gray-400 text-sm">Processing...</p>
                      </div>
                    )}
                    {msg.status === 'error' && (
                      <p className="text-red-400 text-sm">{msg.response}</p>
                    )}
                    {(msg.status === 'completed' || msg.response) && (
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {msg.response}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="bg-dark-card border-t border-gray-700 p-6">
          <form onSubmit={handleSendMessage} className="space-y-3">
            {!selectedAgent && (
              <p className="text-sm text-yellow-400 mb-3">
                ⚠️ Please select an agent first
              </p>
            )}
            <div className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your task..."
                disabled={!selectedAgent || loading}
                className="flex-1 px-4 py-3 bg-dark rounded-lg border border-gray-600 text-white focus:border-primary focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!selectedAgent || loading}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳' : '📤'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
