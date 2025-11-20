import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import { MdSettings } from 'react-icons/md';

export default function ForemanSettings() {
  const navigate = useNavigate();

  return (
    <div className="p-3 max-w-full mx-auto">
      <div className="mb-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-2 transition-colors"
        >
          <IoChevronBack className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-xs text-gray-600">Manage your account settings.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col items-center justify-center py-8">
          <MdSettings className="w-16 h-16 text-gray-300 mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Settings</h2>
          <p className="text-sm text-gray-600 text-center max-w-md">
            This feature is under development. You'll be able to manage your account settings here.
          </p>
        </div>
      </div>
    </div>
  );
}
