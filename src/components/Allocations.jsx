import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { exportToCSV } from '../utils/csvHelper';

const Allocations = ({ allocations, exams, showNotification }) => {
  const [selectedExam, setSelectedExam] = useState('');

  const filteredAllocations = selectedExam
    ? allocations.filter(a => a.examId === selectedExam)
    : allocations;

  const studentAllocations = filteredAllocations.filter(a => !a.type);
  const staffAllocations = filteredAllocations.filter(a => a.type === 'staff');

  const handleExport = () => {
    if (studentAllocations.length === 0) {
      showNotification('No allocations to export', 'error');
      return;
    }
    exportToCSV(studentAllocations, 'seating_allocations.csv');
    showNotification('Allocations exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Seating Allocations</h2>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Download size={20} />
          Export Allocations
        </button>
      </div>

      {exams.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Filter by Exam</h3>
          <select 
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="px-4 py-2 border rounded-lg w-full md:w-auto"
          >
            <option value="">All Exams</option>
            {exams.map(exam => (
              <option key={exam.id} value={exam.id}>{exam.examName}</option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Student Allocations ({studentAllocations.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reg. No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Branch</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Room</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Block</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Seat No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Position</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {studentAllocations.map((allocation) => (
                <tr key={allocation.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{allocation.regNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{allocation.studentName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{allocation.branch}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{allocation.roomNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{allocation.block}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{allocation.seatNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Row {allocation.row}, Col {allocation.col}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {studentAllocations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No allocations generated yet. Schedule an exam and generate allocation.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Invigilator Allocations ({staffAllocations.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Staff Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Room</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Duty</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Exam</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {staffAllocations.map((allocation) => (
                <tr key={allocation.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{allocation.staffName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{allocation.roomNo}</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {allocation.duty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{allocation.examName}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {staffAllocations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No invigilator allocations yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Allocations;