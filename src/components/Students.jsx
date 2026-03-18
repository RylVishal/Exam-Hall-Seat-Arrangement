import React, { useState } from 'react';
import { Upload, Download, Trash2 } from 'lucide-react';
import { addStudent, deleteStudent } from '../firebase/firestore';
import { readCSVFile, exportToCSV } from '../utils/csvHelper';

const Students = ({ students, onRefresh, showNotification }) => {
  const [form, setForm] = useState({
    name: '', regNo: '', branch: '', semester: '', email: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.regNo || !form.branch) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    const result = await addStudent(form);
    if (result.success) {
      showNotification('Student added successfully');
      setForm({ name: '', regNo: '', branch: '', semester: '', email: '' });
      onRefresh();
    } else {
      showNotification(result.error, 'error');
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await readCSVFile(file);
      const promises = data.map(student => addStudent(student));
      await Promise.all(promises);
      showNotification(`${data.length} students imported successfully`);
      onRefresh();
    } catch (error) {
      showNotification('Error importing CSV', 'error');
    }
    e.target.value = '';
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this student?')) {
      const result = await deleteStudent(id);
      if (result.success) {
        showNotification('Student deleted');
        onRefresh();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Student Management</h2>
        <div className="flex gap-2">
          <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer flex items-center gap-2">
            <Upload size={20} />
            Import CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleBulkUpload}
            />
          </label>
          <button
            onClick={() => exportToCSV(students, 'students.csv')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Add Student</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Student Name *"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="text"
            placeholder="Registration Number *"
            value={form.regNo}
            onChange={(e) => setForm({...form, regNo: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <select
            value={form.branch}
            onChange={(e) => setForm({...form, branch: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Select Branch *</option>
            <option value="IT">Information Technology</option>
            <option value="CT">Computer Technology</option>
            <option value="AIDS">AI & Data Science</option>
            <option value="BT">Bio Technology</option>
            <option value="CS">Computer Science</option>
          </select>
          <input
            type="text"
            placeholder="Semester"
            value={form.semester}
            onChange={(e) => setForm({...form, semester: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Add Student
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Student List ({students.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reg. No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Branch</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Semester</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{student.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.regNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.branch}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.semester}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.email}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No students added yet. Add students manually or import from CSV.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Students;
