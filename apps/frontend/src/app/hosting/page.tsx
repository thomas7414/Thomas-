'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import toast from 'react-hot-toast';

export default function HostingPage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<'staging' | 'production'>('production');
  const [domain, setDomain] = useState('');
  const [deploying, setDeploying] = useState(false);

  const { data: projects } = useQuery('projects', () =>
    api.get('/projects').then((res) => res.data)
  );

  const { data: deployments } = useQuery(
    ['deployments', selectedProject],
    () => api.get(`/hosting/${selectedProject}/deployments`).then((res) => res.data),
    { enabled: !!selectedProject }
  );

  const handleDeploy = async () => {
    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }

    setDeploying(true);
    try {
      await api.post('/hosting/deploy', {
        projectId: selectedProject,
        environment,
        domain,
      });
      toast.success('Deployment started!');
      setDomain('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Deployment failed');
    } finally {
      setDeploying(false);
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
              <h1 className="text-4xl font-bold text-white mb-2">Hosting & Deployment</h1>
              <p className="text-gray-400">Deploy your projects with one click</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Deployment Form */}
              <div className="lg:col-span-2">
                <div className="bg-dark-card rounded-lg p-6 border border-gray-700 mb-8">
                  <h2 className="text-xl font-semibold text-white mb-6">Deploy Project</h2>

                  <div className="space-y-6">
                    {/* Project Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select Project
                      </label>
                      <select
                        value={selectedProject || ''}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full px-4 py-2 bg-dark rounded border border-gray-600 text-white focus:border-primary focus:outline-none"
                      >
                        <option value="">Choose a project...</option>
                        {projects &&
                          projects.map((project: any) => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Environment Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Environment
                      </label>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => setEnvironment('staging')}
                          className={`flex-1 px-4 py-2 rounded border-2 transition ${
                            environment === 'staging'
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <p className="text-white font-semibold">Staging</p>
                          <p className="text-xs text-gray-400 mt-1">Test before production</p>
                        </button>
                        <button
                          onClick={() => setEnvironment('production')}
                          className={`flex-1 px-4 py-2 rounded border-2 transition ${
                            environment === 'production'
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <p className="text-white font-semibold">Production</p>
                          <p className="text-xs text-gray-400 mt-1">Live for users</p>
                        </button>
                      </div>
                    </div>

                    {/* Domain Configuration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Custom Domain (Optional)
                      </label>
                      <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="w-full px-4 py-2 bg-dark rounded border border-gray-600 text-white focus:border-primary focus:outline-none"
                        placeholder="example.com"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Leave empty for auto-generated domain
                      </p>
                    </div>

                    {/* Deploy Button */}
                    <button
                      onClick={handleDeploy}
                      disabled={deploying || !selectedProject}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deploying ? '🚀 Deploying...' : '🚀 Deploy Now'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Deployment History */}
              <div className="lg:col-span-1">
                <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
                  <h2 className="text-lg font-semibold text-white mb-4">Recent Deployments</h2>
                  {deployments && deployments.length > 0 ? (
                    <div className="space-y-3">
                      {deployments.slice(0, 5).map((deployment: any) => (
                        <div
                          key={deployment.id}
                          className="bg-gray-700/50 rounded p-3 text-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-semibold truncate">
                              {deployment.domain}
                            </p>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                deployment.status === 'deployed'
                                  ? 'bg-green-500/20 text-green-400'
                                  : deployment.status === 'building'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {deployment.status}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs">
                            {new Date(deployment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No deployments yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
                <p className="text-2xl mb-2">🔒</p>
                <h3 className="text-lg font-semibold text-white mb-2">SSL Certificates</h3>
                <p className="text-gray-400 text-sm">
                  Automatic HTTPS with trusted SSL certificates
                </p>
              </div>
              <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
                <p className="text-2xl mb-2">⚡</p>
                <h3 className="text-lg font-semibold text-white mb-2">Auto-Scaling</h3>
                <p className="text-gray-400 text-sm">
                  Automatically scale resources based on traffic
                </p>
              </div>
              <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
                <p className="text-2xl mb-2">🌍</p>
                <h3 className="text-lg font-semibold text-white mb-2">CDN</h3>
                <p className="text-gray-400 text-sm">
                  Global content delivery network for fast performance
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
