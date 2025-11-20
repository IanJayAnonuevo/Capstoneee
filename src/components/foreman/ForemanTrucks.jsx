import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import { MdLocalShipping } from 'react-icons/md';

export default function ForemanTrucks() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <IoChevronBack className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Truck Status</h1>
        <p className="text-gray-600">Monitor vehicle conditions and availability.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <MdLocalShipping className="w-24 h-24 text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Truck Status</h2>
          <p className="text-gray-600 text-center max-w-md">
            This feature is under development. You'll be able to monitor truck status and conditions here.
          </p>
        </div>
      </div>
    </div>
  );
}
