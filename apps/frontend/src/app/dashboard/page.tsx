'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { NewProjectModal } from '@/components/projects/NewProjectModal';

export default function DashboardPage() {
  const router = useRouter();
  const [showNewProject, setShowNewProject] = useState(false);
  const [user, setUser] = useState(null);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
    }
  }, [router]);

  const { data: projects, isLoading, refetch } = useQuery('projects', () =>
    api.get('/projects').then((res) => res.data)
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white">Projects</h1>
                <p className="text-gray-400 mt-2">Manage and create your projects</p>
              </div>
              <button
                onClick={() => setShowNewProject(true)}
                className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                + New Project
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="bg-dark-card rounded-lg p-12 text-center">
                <p className="text-gray-400 mb-4">No projects yet. Create your first project to get started!</p>
                <button
                  onClick={() => setShowNewProject(true)}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Create First Project
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <NewProjectModal
        isOpen={showNewProject}
        onClose={() => setShowNewProject(false)}
        onProjectCreated={() => {
          refetch();
          setShowNewProject(false);
        }}
      />
    </div>
  );
}
