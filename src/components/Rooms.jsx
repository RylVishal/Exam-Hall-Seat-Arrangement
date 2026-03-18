import React, { useState, useEffect } from 'react';
import { MapPin, Trash2 } from 'lucide-react';
import { addRoom } from '../firebase/firestore';

const Rooms = ({ rooms, onRefresh, showNotification }) => {
  const [form, setForm] = useState({
    roomNo: '', block: '', rows: '', cols: '', capacity: 0
  });

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      capacity: (parseInt(prev.rows) || 0) * (parseInt(prev.cols) || 0)
    }));
  }, [form.rows, form.cols]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.roomNo || !form.rows || !form.cols) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    const result = await addRoom(form);
    if (result.success) {
      showNotification('Room added successfully');
      setForm({ roomNo: '', block: '', rows: '', cols: '', capacity: 0 });
      onRefresh();
    } else {
      showNotification(result.error, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Room Configuration</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Add Room</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Room Number *"
            value={form.roomNo}
            onChange={(e) => setForm({...form, roomNo: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="text"
            placeholder="Block (e.g., A, B, C)"
            value={form.block}
            onChange={(e) => setForm({...form, block: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            placeholder="Rows *"
            value={form.rows}
            onChange={(e) => setForm({...form, rows: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="number"
            placeholder="Columns *"
            value={form.cols}
            onChange={(e) => setForm({...form, cols: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Total Capacity: <span className="font-bold text-indigo-600">{form.capacity} seats</span>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Add Room
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Available Rooms ({rooms.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-lg text-gray-800">Room {room.roomNo}</h4>
                  <p className="text-sm text-gray-600">Block {room.block}</p>
                </div>
                <MapPin className="text-indigo-600" size={24} />
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-sm text-gray-600">Rows: {room.rows} | Columns: {room.cols}</p>
                <p className="text-sm font-semibold text-indigo-600">Capacity: {room.capacity} seats</p>
              </div>
            </div>
          ))}
        </div>
        {rooms.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No rooms configured yet. Add rooms to begin allocation.
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;