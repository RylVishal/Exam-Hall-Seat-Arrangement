import React from 'react';
import { Users, BookOpen, MapPin, Calendar } from 'lucide-react';

const Dashboard = ({ stats, onNavigate }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Students</p>
              <p className="text-3xl font-bold text-gray-800">{stats.students}</p>
            </div>
            <Users className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Staff Members</p>
              <p className="text-3xl font-bold text-gray-800">{stats.staff}</p>
            </div>
            <Users className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Available Rooms</p>
              <p className="text-3xl font-bold text-gray-800">{stats.rooms}</p>
            </div>
            <MapPin className="text-purple-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Scheduled Exams</p>
              <p className="text-3xl font-bold text-gray-800">{stats.exams}</p>
            </div>
            <Calendar className="text-orange-500" size={40} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('students')}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors"
          >
            <Users className="text-blue-600 mb-2" size={24} />
            <h4 className="font-semibold text-gray-800">Manage Students</h4>
            <p className="text-sm text-gray-600">Add or import student data</p>
          </button>

          <button
            onClick={() => onNavigate('rooms')}
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors"
          >
            <MapPin className="text-purple-600 mb-2" size={24} />
            <h4 className="font-semibold text-gray-800">Setup Rooms</h4>
            <p className="text-sm text-gray-600">Configure exam halls</p>
          </button>

          <button
            onClick={() => onNavigate('exams')}
            className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors"
          >
            <Calendar className="text-orange-600 mb-2" size={24} />
            <h4 className="font-semibold text-gray-800">Schedule Exams</h4>
            <p className="text-sm text-gray-600">Create exam schedules</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;