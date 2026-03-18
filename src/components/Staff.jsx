import React, { useState } from 'react';
import { Upload, Download, Trash2 } from 'lucide-react';
import { addStaff } from '../firebase/firestore';
import { readCSVFile, exportToCSV } from '../utils/csvHelper';

const Staff = ({ staff, onRefresh, showNotification }) => {
  const [form, setForm] = useState({
    name: '', staffId: '', department: '', email: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.staffId) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    const result = await addStaff(form);
    if (result.success) {
      showNotification('Staff added successfully');
      setForm({ name: '', staffId: '', department: '', email: '' });
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
      const promises = data.map(staff => addStaff(staff));
      await Promise.all(promises);
      showNotification(`${data.length} staff members imported successfully`);
      onRefresh();
    } catch (error) {
      showNotification('Error importing CSV', 'error');
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
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
            onClick={() => exportToCSV(staff, 'staff.csv')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Add Staff</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Staff Name *"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="text"
            placeholder="Staff ID *"
            value={form.staffId}
            onChange={(e) => setForm({...form, staffId: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="text"
            placeholder="Department"
            value={form.department}
            onChange={(e) => setForm({...form, department: e.target.value})}
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
            Add Staff
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Staff List ({staff.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Staff ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{member.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{member.staffId}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{member.department}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{member.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      member.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {member.available ? 'Available' : 'On Duty'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {staff.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No staff members added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Staff;
