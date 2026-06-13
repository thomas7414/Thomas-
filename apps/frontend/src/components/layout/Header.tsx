'use client';

import { useState } from 'react';

export function Header({ user, onLogout }: any) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="bg-dark-card border-b border-gray-700 px-8 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Welcome back!</h2>
          <p className="text-gray-400 text-sm">Build amazing projects with AI</p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
          >
            <span className="text-white text-sm">Profile</span>
            <span>👤</span>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-dark-card rounded-lg shadow-xl border border-gray-700 z-50">
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
