import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import ManageSchedule from '../admin/ManageSchedule';

export default function ForemanSchedule() {
  const navigate = useNavigate();

  return (
    <div className="h-full">
      <div className="p-3 max-w-full mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-2 transition-colors"
        >
          <IoChevronBack className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>
      <ManageSchedule />
    </div>
  );
}
