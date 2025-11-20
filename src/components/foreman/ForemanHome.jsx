import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPeople, MdCalendarToday, MdAssignment, MdLocalShipping, MdReportProblem } from 'react-icons/md';

export default function ForemanHome() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Monitor Attendance',
      description: 'Handle your tasks in just few taps.',
      icon: MdPeople,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      to: '/foreman/attendance'
    },
    {
      title: 'Manage Schedule',
      description: 'Organize team schedules.',
      icon: MdCalendarToday,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      to: '/foreman/schedule'
    },
    {
      title: 'Task Management',
      description: 'Assign and track tasks.',
      icon: MdAssignment,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      to: '/foreman/tasks'
    },
    {
      title: 'Truck Status',
      description: 'Monitor vehicle conditions.',
      icon: MdLocalShipping,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      to: '/foreman/trucks'
    },
    {
      title: 'Special Pick-up',
      description: 'Handle special requests.',
      icon: MdReportProblem,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      to: '/foreman/special-pickup'
    },
    {
      title: 'Manage Issues',
      description: 'Resolve team issues.',
      icon: MdReportProblem,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      to: '/foreman/issues'
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
        <p className="text-gray-600">Manage your team and operations efficiently.</p>
      </div>

      {/* Quick Actions Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <p className="text-gray-600 mb-6">Handle your tasks in just few taps.</p>
        
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.to)}
              className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left group"
            >
              <div className={`w-12 h-12 ${action.iconBg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className={`w-6 h-6 ${action.iconColor}`} />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-gray-600 text-xs">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="text-sm font-medium opacity-90 mb-2">Team Members</h3>
          <p className="text-3xl font-bold mb-1">24</p>
          <p className="text-sm opacity-80">Active today</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="text-sm font-medium opacity-90 mb-2">Tasks Completed</h3>
          <p className="text-3xl font-bold mb-1">18/25</p>
          <p className="text-sm opacity-80">Today's progress</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="text-sm font-medium opacity-90 mb-2">Trucks Active</h3>
          <p className="text-3xl font-bold mb-1">5/6</p>
          <p className="text-sm opacity-80">On the road</p>
        </div>
      </div>
    </div>
  );
}
