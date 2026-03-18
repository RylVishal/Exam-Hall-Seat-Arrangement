// =====================================================
// FILE: src/components/Exams.jsx (FIXED STAFF AVAILABILITY)
// =====================================================
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, Trash2, AlertCircle } from 'lucide-react';
import { addExam, updateStaff, updateExam, deleteExam, deleteAllocationsByExamId, getAllocations, getStaff } from '../firebase/firestore';
import { GeneticSeatingAlgorithm } from '../algorithms/geneticSeating';
import { addBulkAllocations } from '../firebase/firestore';

const Exams = ({ exams, students, rooms, staff, onRefresh, showNotification }) => {
  const [form, setForm] = useState({
    examName: '', date: '', time: '', duration: '3', branches: []
  });
  const [allocating, setAllocating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [allAllocations, setAllAllocations] = useState([]);

  // Load all allocations
  useEffect(() => {
    const loadAllocations = async () => {
      const result = await getAllocations();
      if (result.success) {
        setAllAllocations(result.data);
      }
    };
    loadAllocations();
  }, [exams]);

  // 🔥 CHECK EXAM COMPLETION AND FREE UP STAFF
  useEffect(() => {
    const checkExamCompletion = async () => {
      const now = new Date();
      
      for (const exam of exams) {
        if (exam.allocated && !exam.completed && exam.date && exam.time && exam.duration) {
          const examDateTime = new Date(`${exam.date}T${exam.time}`);
          const examEndTime = new Date(examDateTime.getTime() + (parseFloat(exam.duration) * 60 * 60 * 1000));
          
          if (now >= examEndTime) {
            // Mark exam as completed
            await updateExam(exam.id, { completed: true });
            
            // 🔥 FREE UP STAFF ASSIGNED TO THIS EXAM
            const staffAllocations = allAllocations.filter(
              a => a.examId === exam.id && a.type === 'staff'
            );
            
            const staffReleasePromises = staffAllocations.map(allocation => 
              updateStaff(allocation.staffId, { available: true })
            );
            
            await Promise.all(staffReleasePromises);
            
            showNotification(
              `Exam "${exam.examName}" completed! ${staffAllocations.length} staff member(s) are now available.`,
              'success'
            );
            onRefresh();
          }
        }
      }
    };

    const interval = setInterval(checkExamCompletion, 60000);
    checkExamCompletion();

    return () => clearInterval(interval);
  }, [exams, allAllocations]);

  // 🔥 GET CONFLICTING EXAMS (overlapping time)
  const getConflictingExams = (currentExam) => {
    if (!currentExam.date || !currentExam.time || !currentExam.duration) {
      return [];
    }

    const currentStart = new Date(`${currentExam.date}T${currentExam.time}`);
    const currentEnd = new Date(currentStart.getTime() + (parseFloat(currentExam.duration) * 60 * 60 * 1000));

    return exams.filter(exam => {
      if (exam.id === currentExam.id || !exam.allocated || exam.completed) return false;
      if (!exam.date || !exam.time || !exam.duration) return false;

      const examStart = new Date(`${exam.date}T${exam.time}`);
      const examEnd = new Date(examStart.getTime() + (parseFloat(exam.duration) * 60 * 60 * 1000));

      // Check if time ranges overlap
      return (currentStart < examEnd && currentEnd > examStart);
    });
  };

  // 🔥 GET AVAILABLE ROOMS (excluding those used by conflicting exams)
  const getAvailableRooms = (currentExam, conflictingExams) => {
    if (conflictingExams.length === 0) {
      return rooms;
    }

    const usedRoomNos = new Set();
    conflictingExams.forEach(exam => {
      const examAllocations = allAllocations.filter(a => a.examId === exam.id && !a.type);
      examAllocations.forEach(allocation => {
        usedRoomNos.add(allocation.roomNo);
      });
    });

    return rooms.filter(room => !usedRoomNos.has(room.roomNo));
  };

  // 🔥 GET AVAILABLE STAFF (excluding those assigned to conflicting exams)
  const getAvailableStaff = (currentExam, conflictingExams) => {
    if (conflictingExams.length === 0) {
      // If no time conflicts, use all available staff
      return staff.filter(s => s.available);
    }

    // Get staff IDs that are busy with conflicting exams
    const busyStaffIds = new Set();
    conflictingExams.forEach(exam => {
      const staffAllocations = allAllocations.filter(
        a => a.examId === exam.id && a.type === 'staff'
      );
      staffAllocations.forEach(allocation => {
        busyStaffIds.add(allocation.staffId);
      });
    });

    // Return staff who are both available AND not assigned to conflicting exams
    return staff.filter(s => s.available && !busyStaffIds.has(s.id));
  };

  // 🔥 CHECK FOR STUDENT CONFLICTS
  const getConflictingStudents = (currentExam, conflictingExams) => {
    if (conflictingExams.length === 0) return [];

    const currentStudents = students.filter(s => currentExam.branches.includes(s.branch));
    const conflictingStudentIds = new Set();

    conflictingExams.forEach(exam => {
      const examAllocations = allAllocations.filter(a => a.examId === exam.id && !a.type);
      examAllocations.forEach(allocation => {
        conflictingStudentIds.add(allocation.studentId);
      });
    });

    return currentStudents.filter(s => conflictingStudentIds.has(s.id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.examName || !form.date || !form.time || !form.duration || form.branches.length === 0) {
      showNotification('Please fill all required fields including exam duration', 'error');
      return;
    }

    const result = await addExam({
      ...form,
      duration: parseFloat(form.duration)
    });
    
    if (result.success) {
      showNotification('Exam scheduled successfully');
      setForm({ examName: '', date: '', time: '', duration: '3', branches: [] });
      onRefresh();
    } else {
      showNotification(result.error, 'error');
    }
  };

  const handleBranchChange = (branch, checked) => {
    if (checked) {
      setForm({...form, branches: [...form.branches, branch]});
    } else {
      setForm({...form, branches: form.branches.filter(b => b !== branch)});
    }
  };

  const handleDeleteExam = async (examId) => {
    if (deleteConfirm !== examId) {
      setDeleteConfirm(examId);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      // Get staff allocations for this exam
      const staffAllocations = allAllocations.filter(
        a => a.examId === examId && a.type === 'staff'
      );

      // Free up staff first
      const staffReleasePromises = staffAllocations.map(allocation => 
        updateStaff(allocation.staffId, { available: true })
      );
      await Promise.all(staffReleasePromises);

      // Delete allocations
      await deleteAllocationsByExamId(examId);
      
      // Delete exam
      const result = await deleteExam(examId);
      
      if (result.success) {
        showNotification(
          `Exam deleted successfully. ${staffAllocations.length} staff member(s) freed up.`
        );
        onRefresh();
      } else {
        showNotification(result.error, 'error');
      }
    } catch (error) {
      showNotification('Error deleting exam: ' + error.message, 'error');
    }
    
    setDeleteConfirm(null);
  };

  const clearAllocations = async (exam) => {
    try {
      // Get staff allocations for this exam
      const staffAllocations = allAllocations.filter(
        a => a.examId === exam.id && a.type === 'staff'
      );

      // Free up staff
      const staffReleasePromises = staffAllocations.map(allocation => 
        updateStaff(allocation.staffId, { available: true })
      );
      await Promise.all(staffReleasePromises);

      // Delete allocations
      await deleteAllocationsByExamId(exam.id);
      
      // Mark exam as not allocated
      await updateExam(exam.id, { allocated: false, completed: false });
      
      showNotification(
        `Allocations cleared. ${staffAllocations.length} staff member(s) are now available.`
      );
      onRefresh();
    } catch (error) {
      showNotification('Error clearing allocations: ' + error.message, 'error');
    }
  };

  const generateAllocation = async (exam) => {
    if (exam.allocated && !exam.completed) {
      showNotification('This exam has already been allocated!', 'error');
      return;
    }

    setAllocating(true);

    try {
      // Check for conflicting exams
      const conflictingExams = getConflictingExams(exam);
      
      if (conflictingExams.length > 0) {
        const conflictNames = conflictingExams.map(e => e.examName).join(', ');
        console.log(`⚠️ Found ${conflictingExams.length} conflicting exam(s): ${conflictNames}`);
      }

      // Get available rooms
      const availableRooms = getAvailableRooms(exam, conflictingExams);
      
      if (availableRooms.length === 0) {
        showNotification(
          `⚠️ No rooms available! All rooms are being used by conflicting exams: ${conflictingExams.map(e => e.examName).join(', ')}`,
          'error'
        );
        setAllocating(false);
        return;
      }

      // Check for student conflicts
      const conflictingStudents = getConflictingStudents(exam, conflictingExams);
      
      if (conflictingStudents.length > 0) {
        showNotification(
          `⚠️ Student Conflict! ${conflictingStudents.length} student(s) are already allocated to other exams at the same time.`,
          'error'
        );
        setAllocating(false);
        return;
      }

      const eligibleStudents = students.filter(s => exam.branches.includes(s.branch));
      
      if (eligibleStudents.length === 0) {
        showNotification('No students found for selected branches', 'error');
        setAllocating(false);
        return;
      }

      // Check room capacity
      const totalAvailableCapacity = availableRooms.reduce((sum, room) => sum + parseInt(room.capacity), 0);
      
      if (eligibleStudents.length > totalAvailableCapacity) {
        const usedRooms = rooms.length - availableRooms.length;
        showNotification(
          `⚠️ Insufficient Available Room Capacity! Need ${eligibleStudents.length} seats but only ${totalAvailableCapacity} available. (${usedRooms} room(s) occupied by: ${conflictingExams.map(e => e.examName).join(', ')})`,
          'error'
        );
        setAllocating(false);
        return;
      }

      const avgRoomCapacity = totalAvailableCapacity / availableRooms.length;
      const roomsNeeded = Math.ceil(eligibleStudents.length / avgRoomCapacity);
      
      // 🔥 USE AVAILABLE STAFF (not busy with conflicting exams)
      const availableStaffMembers = getAvailableStaff(exam, conflictingExams);
      
      if (availableStaffMembers.length < roomsNeeded) {
        const busyStaff = staff.length - availableStaffMembers.length;
        showNotification(
          `⚠️ Not enough staff! Need ${roomsNeeded} invigilators but only ${availableStaffMembers.length} are available. (${busyStaff} staff busy with: ${conflictingExams.map(e => e.examName).join(', ')})`,
          'error'
        );
        setAllocating(false);
        return;
      }

      // Run algorithm with available rooms
      const algorithm = new GeneticSeatingAlgorithm(eligibleStudents, availableRooms);
      const bestSolution = algorithm.run();

      // 🔥 ALLOCATE INVIGILATORS FROM AVAILABLE STAFF ONLY
      const { allocations: invigilators, assignedStaffIds } = 
        algorithm.allocateInvigilators(bestSolution.assignments, availableStaffMembers);

      const studentAllocations = bestSolution.assignments.map(a => ({
        ...a,
        examId: exam.id,
        examName: exam.examName,
        examDate: exam.date,
        examTime: exam.time,
        examDuration: exam.duration
      }));

      const staffAllocations = invigilators.map(inv => ({
        ...inv,
        examId: exam.id,
        examName: exam.examName,
        examDate: exam.date,
        examTime: exam.time,
        examDuration: exam.duration
      }));

      const allAllocationsToSave = [...studentAllocations, ...staffAllocations];
      const result = await addBulkAllocations(allAllocationsToSave);

      if (result.success) {
        // Mark assigned staff as unavailable
        const updatePromises = assignedStaffIds.map(staffId => 
          updateStaff(staffId, { available: false })
        );
        await Promise.all(updatePromises);

        await updateExam(exam.id, { allocated: true, completed: false });

        const roomsUsed = new Set(bestSolution.assignments.map(a => a.roomNo)).size;
        const conflictInfo = conflictingExams.length > 0 
          ? ` (Avoided ${conflictingExams.length} conflicting exam(s))` 
          : '';
        
        showNotification(
          `✅ Success! Allocated ${eligibleStudents.length} students to ${roomsUsed} rooms. ${invigilators.length} staff assigned.${conflictInfo}`,
          'success'
        );
        onRefresh();
      } else {
        showNotification('Error saving allocations', 'error');
      }
    } catch (error) {
      showNotification('Error generating allocation: ' + error.message, 'error');
    } finally {
      setAllocating(false);
    }
  };

  const getExamStatus = (exam) => {
    if (exam.completed) return 'completed';
    if (exam.allocated) {
      if (exam.date && exam.time && exam.duration) {
        const now = new Date();
        const examDateTime = new Date(`${exam.date}T${exam.time}`);
        const examEndTime = new Date(examDateTime.getTime() + (parseFloat(exam.duration) * 60 * 60 * 1000));
        
        if (now >= examDateTime && now < examEndTime) {
          return 'ongoing';
        }
      }
      return 'allocated';
    }
    return 'scheduled';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Exam Scheduling</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Schedule New Exam</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Exam Name *"
            value={form.examName}
            onChange={(e) => setForm({...form, examName: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({...form, date: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm({...form, time: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <select
            value={form.duration}
            onChange={(e) => setForm({...form, duration: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Duration *</option>
            <option value="1">1 hour</option>
            <option value="1.5">1.5 hours</option>
            <option value="2">2 hours</option>
            <option value="2.5">2.5 hours</option>
            <option value="3">3 hours</option>
            <option value="4">4 hours</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Branches *</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {['IT', 'CT', 'AIDS', 'BT', 'CS'].map(branch => (
              <label key={branch} className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={form.branches.includes(branch)}
                  onChange={(e) => handleBranchChange(branch, e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span className="text-sm">{branch}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          Schedule Exam
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Scheduled Exams ({exams.length})</h3>
        <div className="space-y-4">
          {exams.map((exam) => {
            const conflictingExams = getConflictingExams(exam);
            const availableRooms = getAvailableRooms(exam, conflictingExams);
            const availableStaffMembers = getAvailableStaff(exam, conflictingExams);
            const eligibleStudentCount = students.filter(s => exam.branches.includes(s.branch)).length;
            const totalAvailableCapacity = availableRooms.reduce((sum, room) => sum + parseInt(room.capacity), 0);
            const avgRoomCapacity = totalAvailableCapacity / (availableRooms.length || 1);
            const roomsNeeded = Math.ceil(eligibleStudentCount / avgRoomCapacity);
            
            const hasEnoughCapacity = eligibleStudentCount <= totalAvailableCapacity;
            const hasEnoughStaff = availableStaffMembers.length >= roomsNeeded;
            const hasConflicts = conflictingExams.length > 0;
            const canAllocate = hasEnoughCapacity && hasEnoughStaff && roomsNeeded > 0 && !exam.allocated;
            const status = getExamStatus(exam);

            return (
              <div key={exam.id} className={`border rounded-lg p-4 transition-all ${
                status === 'completed' ? 'bg-gray-50 border-gray-300' : 'hover:shadow-md'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-lg text-gray-800">{exam.examName}</h4>
                      
                      {status === 'completed' && (
                        <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle size={14} />
                          Completed
                        </span>
                      )}
                      {status === 'ongoing' && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1 animate-pulse">
                          <Clock size={14} />
                          Ongoing
                        </span>
                      )}
                      {status === 'allocated' && !exam.completed && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle size={14} />
                          Allocated
                        </span>
                      )}
                      {hasConflicts && !exam.allocated && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <AlertCircle size={14} />
                          {conflictingExams.length} Conflict{conflictingExams.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        {exam.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        {exam.time || 'Not set'}
                      </div>
                      {exam.duration && (
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          {exam.duration} hour{exam.duration > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      {exam.branches.map(branch => (
                        <span key={branch} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                          {branch}
                        </span>
                      ))}
                    </div>

                    {!exam.completed && (
                      <>
                        <div className="mt-3 text-sm">
                          <div className="text-gray-600">
                            📊 Students: <span className="font-semibold">{eligibleStudentCount}</span> | 
                            Available Rooms: <span className="font-semibold">{availableRooms.length}/{rooms.length}</span> | 
                            Capacity: <span className="font-semibold">{totalAvailableCapacity}</span> | 
                            Rooms Needed: <span className="font-semibold">{roomsNeeded}</span> | 
                            Staff Available: <span className="font-semibold">{availableStaffMembers.length}/{staff.length}</span>
                          </div>
                        </div>

                        {hasConflicts && !exam.allocated && (
                          <div className="mt-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded">
                            ⚠️ Time conflict with: {conflictingExams.map(e => e.examName).join(', ')}. 
                            {availableRooms.length} room(s) and {availableStaffMembers.length} staff available.
                          </div>
                        )}
                      </>
                    )}

                    {!exam.allocated && !hasEnoughCapacity && (
                      <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                        ⚠️ Insufficient capacity! Need {eligibleStudentCount} seats but only {totalAvailableCapacity} available.
                      </div>
                    )}
                    {!exam.allocated && hasEnoughCapacity && !hasEnoughStaff && (
                      <div className="mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded">
                        ⚠️ Need {roomsNeeded} staff, only {availableStaffMembers.length} available
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex gap-2">
                    {exam.completed ? (
                      <button
                        onClick={() => clearAllocations(exam)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm whitespace-nowrap"
                      >
                        Clear & Re-allocate
                      </button>
                    ) : exam.allocated ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg font-medium text-sm whitespace-nowrap cursor-not-allowed flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Already Allocated
                      </button>
                    ) : (
                      <button
                        onClick={() => generateAllocation(exam)}
                        disabled={!canAllocate || allocating}
                        className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                          canAllocate && !allocating
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {allocating ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Allocating...
                          </span>
                        ) : (
                          'Generate Allocation'
                        )}
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        deleteConfirm === exam.id
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                      title={deleteConfirm === exam.id ? 'Click again to confirm' : 'Delete exam'}
                    >
                      {deleteConfirm === exam.id ? (
                        <AlertCircle size={20} />
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {exams.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No exams scheduled yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Exams;