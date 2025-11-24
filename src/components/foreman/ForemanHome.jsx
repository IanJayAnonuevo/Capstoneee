import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPeople, MdCalendarToday, MdAssignment, MdLocalShipping, MdReportProblem, MdArrowForward } from 'react-icons/md';

export default function ForemanHome() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Monitor Attendance',
      description: 'Track team presence',
      icon: MdPeople,
      actionLabel: 'Check Now',
      to: '/foreman/attendance',
      gradient: 'from-emerald-500 to-emerald-700'
    },
    {
      title: 'Manage Schedule',
      description: 'Organize shifts',
      icon: MdCalendarToday,
      actionLabel: 'Update',
      to: '/foreman/schedule',
      gradient: 'from-blue-500 to-blue-700'
    },
    {
      title: 'Task Management',
      description: 'Assign duties',
      icon: MdAssignment,
      actionLabel: 'View Tasks',
      to: '/foreman/tasks',
      gradient: 'from-violet-500 to-violet-700'
    },
    {
      title: 'Truck Status',
      description: 'Vehicle health',
      icon: MdLocalShipping,
      actionLabel: 'Inspect',
      to: '/foreman/trucks',
      gradient: 'from-orange-500 to-orange-700'
    },
    {
      title: 'Special Pick-up',
      description: 'Ad-hoc requests',
      icon: MdReportProblem,
      actionLabel: 'Review',
      to: '/foreman/special-pickup',
      gradient: 'from-amber-500 to-amber-700'
    },
    {
      title: 'Manage Issues',
      description: 'Team concerns',
      icon: MdReportProblem,
      actionLabel: 'Resolve',
      to: '/foreman/issues',
      gradient: 'from-red-500 to-red-700'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section with Gradient */}
      <div className="bg-white border-b border-gray-200 px-6 py-8 mb-6 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            Welcome Back!
          </h1>
          <p className="text-lg text-gray-500">
            Manage your team and operations efficiently.
          </p>
        </div>
      </div>

      <div className="px-6 max-w-7xl mx-auto pb-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Team Members</h3>
              <p className="text-4xl font-bold text-gray-900">24</p>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 font-medium bg-green-50 w-fit px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Active today
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Tasks Completed</h3>
              <p className="text-4xl font-bold text-gray-900">18<span className="text-xl text-gray-400 font-normal">/25</span></p>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600 font-medium bg-blue-50 w-fit px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              72% Progress
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Trucks Active</h3>
              <p className="text-4xl font-bold text-gray-900">5<span className="text-xl text-gray-400 font-normal">/6</span></p>
            </div>
            <div className="mt-4 flex items-center text-sm text-orange-600 font-medium bg-orange-50 w-fit px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              On the road
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            Quick Actions
            <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Dashboard</span>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.to)}
                className={`relative overflow-hidden rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left group bg-gradient-to-br ${action.gradient}`}
              >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>

                <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 tracking-tight">{action.title}</h3>
                    <p className="text-white/80 text-xs mb-4 font-medium">{action.description}</p>

                    <div className="inline-flex items-center bg-white/20 backdrop-blur-md rounded-lg px-3 py-1.5 text-xs font-bold text-white uppercase tracking-wide group-hover:bg-white group-hover:text-gray-900 transition-colors duration-300">
                      {action.actionLabel}
                      <MdArrowForward className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
