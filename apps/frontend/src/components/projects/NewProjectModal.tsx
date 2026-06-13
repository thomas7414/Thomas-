'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

const PROJECT_TYPES = [
  { id: 'website', name: 'Website', icon: '🌐' },
  { id: 'web-app', name: 'Web App', icon: '💻' },
  { id: 'ios-app', name: 'iOS App', icon: '🍎' },
  { id: 'android-app', name: 'Android App', icon: '🤖' },
  { id: 'api', name: 'API', icon: '🔌' },
  { id: 'saas', name: 'SaaS', icon: '☁️' },
  { id: 'ai-app', name: 'AI App', icon: '⚡' },
  { id: 'game', name: 'Game', icon: '🎮' },
];

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C#'];

export function NewProjectModal({ isOpen, onClose, onProjectCreated }: NewProjectModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    language: '',
    framework: '',
    database: '',
  });

  const handleCreate = async () => {
    if (!formData.name || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await api.post('/projects', formData);
      toast.success('Project created successfully!');
      onProjectCreated();
      setStep(1);
      setFormData({
        name: '',
        description: '',
        type: '',
        language: '',
        framework: '',
        database: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-card rounded-lg p-8 max-w-2xl w-full mx-4 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Project Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-dark rounded border border-gray-600 text-white focus:border-primary focus:outline-none"
                placeholder="My Awesome Project"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-dark rounded border border-gray-600 text-white focus:border-primary focus:outline-none"
                placeholder="What is your project about?"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Project Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {PROJECT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFormData({ ...formData, type: type.id })}
                    className={`p-3 rounded border-2 transition ${
                      formData.type === type.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <p className="text-sm text-white mt-1">{type.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-4 py-2 bg-dark rounded border border-gray-600 text-white focus:border-primary focus:outline-none"
              >
                <option value="">Select a language</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Database</label>
              <select
                value={formData.database}
                onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                className="w-full px-4 py-2 bg-dark rounded border border-gray-600 text-white focus:border-primary focus:outline-none"
              >
                <option value="">Select a database</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="mongodb">MongoDB</option>
                <option value="mysql">MySQL</option>
                <option value="firebase">Firebase</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>

          <div className="space-x-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
              >
                Back
              </button>
            )}

            {step === 1 ? (
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded transition"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={loading}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
