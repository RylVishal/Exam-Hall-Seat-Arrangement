import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Staff from './components/Staff';
import Rooms from './components/Rooms';
import Exams from './components/Exams';
import Allocations from './components/Allocations';
import { 
  getStudents, 
  getStaff, 
  getRooms, 
  getExams, 
  getAllocations 
} from './firebase/firestore';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole] = useState('admin'); // Can be extended for auth
  const [notification, setNotification] = useState(null);
  
  // Data states
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [exams, setExams] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [studentsRes, staffRes, roomsRes, examsRes, allocationsRes] = await Promise.all([
        getStudents(),
        getStaff(),
        getRooms(),
        getExams(),
        getAllocations()
      ]);

      if (studentsRes.success) setStudents(studentsRes.data);
      if (staffRes.success) setStaff(staffRes.data);
      if (roomsRes.success) setRooms(roomsRes.data);
      if (examsRes.success) setExams(examsRes.data);
      if (allocationsRes.success) setAllocations(allocationsRes.data);
    } catch (error) {
      showNotification('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const stats = {
    students: students.length,
    staff: staff.length,
    rooms: rooms.length,
    exams: exams.length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-slide-in`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen size={32} />
              <div>
                <h1 className="text-2xl font-bold">Exam Hall Seat Arrangement System</h1>
                <p className="text-indigo-100 text-sm">Automated Seating Allocation with Genetic Algorithm</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg text-sm">
                Role: {userRole.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {['dashboard', 'students', 'staff', 'rooms', 'exams', 'allocations'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard stats={stats} onNavigate={setActiveTab} />
        )}
        {activeTab === 'students' && (
          <Students 
            students={students} 
            onRefresh={loadAllData} 
            showNotification={showNotification} 
          />
        )}
        {activeTab === 'staff' && (
          <Staff 
            staff={staff} 
            onRefresh={loadAllData} 
            showNotification={showNotification} 
          />
        )}
        {activeTab === 'rooms' && (
          <Rooms 
            rooms={rooms} 
            onRefresh={loadAllData} 
            showNotification={showNotification} 
          />
        )}
        {activeTab === 'exams' && (
          <Exams 
            exams={exams}
            students={students}
            rooms={rooms}
            staff={staff}
            onRefresh={loadAllData} 
            showNotification={showNotification} 
          />
        )}
        {activeTab === 'allocations' && (
          <Allocations 
            allocations={allocations}
            exams={exams}
            showNotification={showNotification} 
          />
        )}
      </div>
    </div>
  );
};

export default App;