
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from "./config";


// ========== STUDENTS ==========
export const addStudent = async (studentData) => {
  try {
    const docRef = await addDoc(collection(db, "students"), {
      ...studentData,
      createdAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getStudents = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "students"));
    const students = [];
    querySnapshot.forEach((doc) => {
      students.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: students };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateStudent = async (id, data) => {
  try {
    const docRef = doc(db, "students", id);
    await updateDoc(docRef, data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteStudent = async (id) => {
  try {
    await deleteDoc(doc(db, "students", id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ========== STAFF ==========
export const addStaff = async (staffData) => {
  try {
    const docRef = await addDoc(collection(db, "staff"), {
      ...staffData,
      available: true,
      createdAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getStaff = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "staff"));
    const staff = [];
    querySnapshot.forEach((doc) => {
      staff.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: staff };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
export const updateStaff = async (id, data) => {
  try {
    const docRef = doc(db, "staff", id);
    await updateDoc(docRef, data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
// ========== ROOMS ==========
export const addRoom = async (roomData) => {
  try {
    const docRef = await addDoc(collection(db, "rooms"), {
      ...roomData,
      createdAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getRooms = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "rooms"));
    const rooms = [];
    querySnapshot.forEach((doc) => {
      rooms.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: rooms };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ========== EXAMS ==========
export const addExam = async (examData) => {
  try {
    const docRef = await addDoc(collection(db, "exams"), {
      ...examData,
      createdAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getExams = async () => {
  try {
    const q = query(collection(db, "exams"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    const exams = [];
    querySnapshot.forEach((doc) => {
      exams.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: exams };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateExam = async (id, data) => {
  try {
    const docRef = doc(db, "exams", id);
    await updateDoc(docRef, data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
export const deleteExam = async (id) => {
  try {
    await deleteDoc(doc(db, "exams", id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteAllocationsByExamId = async (examId) => {
  try {
    const q = query(collection(db, "allocations"), where("examId", "==", examId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = [];
    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ========== ALLOCATIONS ==========
export const addAllocation = async (allocationData) => {
  try {
    const docRef = await addDoc(collection(db, "allocations"), {
      ...allocationData,
      createdAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const addBulkAllocations = async (allocationsArray) => {
  try {
    const promises = allocationsArray.map(allocation => 
      addDoc(collection(db, "allocations"), {
        ...allocation,
        createdAt: Timestamp.now()
      })
    );
    await Promise.all(promises);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAllocations = async (examId = null) => {
  try {
    let q;
    if (examId) {
      q = query(collection(db, "allocations"), where("examId", "==", examId));
    } else {
      q = collection(db, "allocations");
    }
    const querySnapshot = await getDocs(q);
    const allocations = [];
    querySnapshot.forEach((doc) => {
      allocations.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: allocations };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
