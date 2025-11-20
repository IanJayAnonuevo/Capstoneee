import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import PickupSimple from '../admin/PickupSimple';

export default function ForemanSpecialPickup() {
  const navigate = useNavigate();

  return (
    <div className="h-full">
      <div className="p-6 max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <IoChevronBack className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
      </div>
      <PickupSimple />
    </div>
  );
}
