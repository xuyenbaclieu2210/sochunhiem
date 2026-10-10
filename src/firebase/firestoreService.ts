import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  writeBatch,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './config';
import { Student } from '../types';
import { INITIAL_STUDENTS } from '../data/mockData';

export const DEFAULT_CLASS_ID = '10A1';

export interface FirestoreClassData {
  id: string;
  name: string;
  academicYear: string;
  room: string;
  department: string;
  teacherName: string;
  ownerUid: string;
  avatarUrl?: string;
  avatarUpdatedAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

export interface FirestoreUserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'teacher' | 'admin' | 'subjectTeacher' | 'parent';
  classIds: string[];
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Synchronize user profile in Firestore
 */
export async function syncUserProfile(
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string
): Promise<FirestoreUserData> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const existing = userSnap.data() as FirestoreUserData;
    // ensure classIds includes DEFAULT_CLASS_ID
    if (!existing.classIds?.includes(DEFAULT_CLASS_ID)) {
      await updateDoc(userRef, {
        classIds: [...(existing.classIds || []), DEFAULT_CLASS_ID],
        updatedAt: serverTimestamp()
      });
    }
    return existing;
  }

  const newUserData: FirestoreUserData = {
    uid,
    displayName: displayName || 'Thầy Nguyễn Văn Xuyên',
    email,
    photoURL: photoURL || '',
    role: 'teacher',
    classIds: [DEFAULT_CLASS_ID],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(userRef, newUserData);
  return newUserData;
}

/**
 * Ensure default class document exists for the logged in teacher
 */
export async function ensureClassDocument(ownerUid: string, classId: string = DEFAULT_CLASS_ID): Promise<FirestoreClassData> {
  const classRef = doc(db, 'classes', classId);
  const classSnap = await getDoc(classRef);

  if (classSnap.exists()) {
    const data = classSnap.data() as FirestoreClassData;
    if (ownerUid && data.ownerUid !== ownerUid) {
      await updateDoc(classRef, {
        ownerUid,
        updatedAt: serverTimestamp()
      }).catch((e) => console.warn('Could not update class ownerUid:', e));
    }
    return data;
  }

  const classData: FirestoreClassData = {
    id: classId,
    name: '10A1',
    academicYear: '2026–2027',
    room: '02 – Nhà B',
    department: 'Khoa học Tự nhiên',
    teacherName: 'Thầy Nguyễn Văn Xuyên',
    ownerUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(classRef, classData);
  return classData;
}

/**
 * Convert Firestore Student document to UI Student model
 */
function toUIStudent(docData: any, docId: string): Student {
  // Ensure backward compatibility between studentId/id and code/studentCode
  const groupNumber = typeof docData.group === 'number'
    ? docData.group
    : parseInt(String(docData.group).replace(/\D/g, '') || '1', 10);

  return {
    id: docId || docData.studentId || docData.id,
    code: docData.studentCode || docData.code || `HS${docId}`,
    fullName: docData.fullName || '',
    gender: (docData.gender === 'Nữ' ? 'Nữ' : 'Nam'),
    dob: docData.dateOfBirth || docData.dob || '2010-01-01',
    group: groupNumber,
    phone: docData.phone || '',
    parentName: docData.parentName || '',
    parentPhone: docData.parentPhone || '',
    address: docData.address || '',
    role: docData.position || docData.role || 'Học sinh',
    status: (docData.status as any) || 'Đang học',
    notes: docData.notes || '',
    avatarUrl: docData.avatarUrl,
    conduct: docData.conduct || 'Tốt',
    gpa: typeof docData.gpa === 'number' ? docData.gpa : 8.5
  };
}

/**
 * Convert UI Student model to Firestore Student document
 */
function toFirestoreStudent(student: Student) {
  return {
    studentId: student.id,
    studentCode: student.code,
    fullName: student.fullName,
    gender: student.gender,
    dateOfBirth: student.dob,
    group: `Tổ ${student.group}`,
    phone: student.phone || '',
    parentName: student.parentName || '',
    parentPhone: student.parentPhone || '',
    address: student.address || '',
    position: student.role || 'Học sinh',
    status: student.status || 'Đang học',
    notes: student.notes || '',
    avatarUrl: student.avatarUrl || '',
    conduct: student.conduct || 'Tốt',
    gpa: student.gpa || 8.0,
    updatedAt: serverTimestamp()
  };
}

/**
 * Fetch all students of a class from Firestore
 */
export async function getStudentsFromFirestore(classId: string = DEFAULT_CLASS_ID): Promise<Student[]> {
  const studentsCol = collection(db, 'classes', classId, 'students');
  const q = query(studentsCol, orderBy('studentCode', 'asc'));
  const querySnap = await getDocs(q);

  if (querySnap.empty) {
    // If empty query with orderBy, try raw collection get in case studentCode isn't indexed yet
    const rawSnap = await getDocs(studentsCol);
    return rawSnap.docs.map(d => toUIStudent(d.data(), d.id));
  }

  return querySnap.docs.map(d => toUIStudent(d.data(), d.id));
}

/**
 * Seed initial 10 students into Firestore (only if empty)
 */
export async function seedInitialStudentsIfEmpty(classId: string = DEFAULT_CLASS_ID): Promise<Student[]> {
  const studentsCol = collection(db, 'classes', classId, 'students');
  const existingSnap = await getDocs(studentsCol);

  if (!existingSnap.empty) {
    // Already has data, do not seed again!
    return existingSnap.docs.map(d => toUIStudent(d.data(), d.id));
  }

  // Seed batch
  const batch = writeBatch(db);
  INITIAL_STUDENTS.forEach((st) => {
    const studentRef = doc(studentsCol, st.id);
    const fsData = {
      ...toFirestoreStudent(st),
      createdAt: serverTimestamp()
    };
    batch.set(studentRef, fsData);
  });

  await batch.commit();
  return INITIAL_STUDENTS;
}

/**
 * Add a new student to Firestore
 */
export async function addStudentToFirestore(
  student: Omit<Student, 'id'> & { id?: string },
  classId: string = DEFAULT_CLASS_ID
): Promise<Student> {
  const studentId = student.id || `s${Date.now()}`;
  const fullStudent: Student = {
    ...student,
    id: studentId
  };

  const studentRef = doc(db, 'classes', classId, 'students', studentId);
  await setDoc(studentRef, {
    ...toFirestoreStudent(fullStudent),
    createdAt: serverTimestamp()
  });

  return fullStudent;
}

/**
 * Update an existing student in Firestore
 */
export async function updateStudentInFirestore(
  student: Student,
  classId: string = DEFAULT_CLASS_ID
): Promise<void> {
  const studentRef = doc(db, 'classes', classId, 'students', student.id);
  await setDoc(studentRef, {
    ...toFirestoreStudent(student),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

/**
 * Delete a student from Firestore
 */
export async function deleteStudentFromFirestore(
  studentId: string,
  classId: string = DEFAULT_CLASS_ID
): Promise<void> {
  const studentRef = doc(db, 'classes', classId, 'students', studentId);
  await deleteDoc(studentRef);
}

/**
 * Batch add or update multiple students in Firestore
 */
export async function batchAddOrUpdateStudentsToFirestore(
  students: Student[],
  classId: string = DEFAULT_CLASS_ID
): Promise<void> {
  if (!students.length) return;
  const chunkSize = 400;
  for (let i = 0; i < students.length; i += chunkSize) {
    const chunk = students.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    for (const student of chunk) {
      const studentRef = doc(db, 'classes', classId, 'students', student.id);
      batch.set(
        studentRef,
        {
          ...toFirestoreStudent(student),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    }
    await batch.commit();
  }
}

/**
 * Get class document data from Firestore
 */
export async function getClassInfoFromFirestore(classId: string = DEFAULT_CLASS_ID): Promise<FirestoreClassData | null> {
  try {
    const classRef = doc(db, 'classes', classId);
    const snap = await getDoc(classRef);
    if (snap.exists()) {
      return snap.data() as FirestoreClassData;
    }
    return null;
  } catch (err) {
    console.warn('Không thể tải thông tin lớp từ Firestore:', err);
    return null;
  }
}

/**
 * Update class avatar URL in Firestore
 */
export async function updateClassAvatarInFirestore(
  avatarUrl: string,
  classId: string = DEFAULT_CLASS_ID
): Promise<void> {
  const classRef = doc(db, 'classes', classId);
  await updateDoc(classRef, {
    avatarUrl,
    avatarUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

/**
 * Delete class avatar from Firestore
 */
export async function deleteClassAvatarFromFirestore(classId: string = DEFAULT_CLASS_ID): Promise<void> {
  const classRef = doc(db, 'classes', classId);
  await updateDoc(classRef, {
    avatarUrl: deleteField(),
    avatarUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

