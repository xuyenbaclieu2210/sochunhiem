/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewPage } from './components/dashboard/OverviewPage';
import { StudentsPage } from './components/students/StudentsPage';
import { StudentProfileModal } from './components/students/StudentProfileModal';
import { AttendancePage } from './components/attendance/AttendancePage';
import { ViolationsPage } from './components/violations/ViolationsPage';
import { AwardsPage } from './components/awards/AwardsPage';
import { ConcernPage } from './components/concern/ConcernPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { CompetitionPage } from './components/competition/CompetitionPage';
import { WorkspacePage } from './components/workspace/WorkspacePage';

import { useAuth } from './firebase/AuthContext';
import { LoginPage } from './firebase/LoginPage';
import {
  getStudentsFromFirestore,
  seedInitialStudentsIfEmpty,
  addStudentToFirestore,
  updateStudentInFirestore,
  deleteStudentFromFirestore,
  batchAddOrUpdateStudentsToFirestore,
  getClassInfoFromFirestore,
  updateClassAvatarInFirestore,
  deleteClassAvatarFromFirestore,
  DEFAULT_CLASS_ID
} from './firebase/firestoreService';

import {
  INITIAL_CLASS_INFO,
  INITIAL_STUDENTS,
  INITIAL_STUDENT_GRADES,
  INITIAL_TODAY_ATTENDANCE,
  INITIAL_VIOLATIONS,
  INITIAL_AWARDS,
  INITIAL_CONCERN_STUDENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_COMPETITION_WEEKS,
  INITIAL_COMPETITION_RECORDS,
  INITIAL_COMPETITION_SETTINGS,
  calculateStudentWeekScore
} from './data/mockData';
import {
  Student,
  ClassInfo,
  DailyAttendance,
  ViolationRecord,
  AwardRecord,
  ConcernStudent,
  SubjectGrade,
  NotificationItem,
  CompetitionRecord,
  CompetitionWeek,
  CompetitionSettings
} from './types';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { currentUser, loading: authLoading } = useAuth();

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<NavItemKey>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // App Data States
  const [classInfo, setClassInfo] = useState<ClassInfo>(INITIAL_CLASS_INFO);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [firestoreLoading, setFirestoreLoading] = useState<boolean>(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  const [gradesMap, setGradesMap] = useState<Record<string, SubjectGrade[]>>(INITIAL_STUDENT_GRADES);
  const [attendance, setAttendance] = useState<DailyAttendance>(INITIAL_TODAY_ATTENDANCE);
  const [violations, setViolations] = useState<ViolationRecord[]>(INITIAL_VIOLATIONS);
  const [awards, setAwards] = useState<AwardRecord[]>(INITIAL_AWARDS);
  const [concerns, setConcerns] = useState<ConcernStudent[]>(INITIAL_CONCERN_STUDENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Competition (Thi đua tuần) Data States
  const [competitionWeeks, setCompetitionWeeks] = useState<CompetitionWeek[]>(INITIAL_COMPETITION_WEEKS);
  const [competitionRecords, setCompetitionRecords] = useState<CompetitionRecord[]>(INITIAL_COMPETITION_RECORDS);
  const [competitionSettings, setCompetitionSettings] = useState<CompetitionSettings>(INITIAL_COMPETITION_SETTINGS);

  // Student Profile Modal State
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Load students from Firestore when user logs in
  useEffect(() => {
    if (!currentUser) {
      setFirestoreLoading(false);
      return;
    }

    let isMounted = true;
    const fetchStudents = async () => {
      setFirestoreLoading(true);
      setFirestoreError(null);
      try {
        // Load class doc
        const classDoc = await getClassInfoFromFirestore(DEFAULT_CLASS_ID);
        // Clear avatar if requested
        if (classDoc?.avatarUrl) {
          await deleteClassAvatarFromFirestore(DEFAULT_CLASS_ID);
        }

        let loaded = await getStudentsFromFirestore(DEFAULT_CLASS_ID);
        // If Firestore collection is empty, automatically seed initial 10 demo students
        if (loaded.length === 0) {
          loaded = await seedInitialStudentsIfEmpty(DEFAULT_CLASS_ID);
        }
        if (isMounted) {
          setStudents(loaded);
          setClassInfo(prev => ({
            ...prev,
            totalStudents: loaded.length,
            avatarUrl: undefined,
          }));
        }
      } catch (err: any) {
        console.error('Lỗi tải dữ liệu học sinh từ Firestore:', err);
        if (isMounted) {
          setFirestoreError(err.message || 'Không thể tải dữ liệu học sinh từ Firestore.');
        }
      } finally {
        if (isMounted) {
          setFirestoreLoading(false);
        }
      }
    };

    fetchStudents();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Handlers
  const handleUpdateClassAvatar = async (avatarUrl: string) => {
    try {
      await updateClassAvatarInFirestore(avatarUrl, DEFAULT_CLASS_ID);
      setClassInfo(prev => ({ ...prev, avatarUrl }));
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          title: 'Đã cập nhật ảnh đại diện lớp thành công!',
          time: 'Vừa xong',
          type: 'success',
          read: false,
        },
        ...prev,
      ]);
    } catch (err: any) {
      console.error('Lỗi cập nhật ảnh đại diện lớp:', err);
      throw err;
    }
  };

  const handleDeleteClassAvatar = async () => {
    try {
      await deleteClassAvatarFromFirestore(DEFAULT_CLASS_ID);
      setClassInfo(prev => {
        const next = { ...prev };
        delete next.avatarUrl;
        return next;
      });
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          title: 'Đã xóa ảnh đại diện lớp, hiển thị lại huy hiệu mặc định.',
          time: 'Vừa xong',
          type: 'info',
          read: false,
        },
        ...prev,
      ]);
    } catch (err: any) {
      console.error('Lỗi xóa ảnh đại diện lớp:', err);
      throw err;
    }
  };

  const handleOpenStudentProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  const handleCloseStudentProfile = () => {
    setSelectedStudentId(null);
  };

  // Add Student to Firestore
  const handleAddStudent = async (newStudent: Student) => {
    try {
      const savedStudent = await addStudentToFirestore(newStudent, DEFAULT_CLASS_ID);
      setStudents(prev => [savedStudent, ...prev]);
      setClassInfo(prev => ({
        ...prev,
        totalStudents: prev.totalStudents + 1
      }));
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          title: `Đã lưu học sinh mới vào Firestore: ${savedStudent.fullName} (${savedStudent.code})`,
          time: 'Vừa xong',
          type: 'success',
          read: false,
        },
        ...prev,
      ]);
    } catch (err: any) {
      console.error('Lỗi thêm học sinh vào Firestore:', err);
      throw err;
    }
  };

  // Update Student in Firestore
  const handleUpdateStudent = async (updatedStudent: Student) => {
    try {
      await updateStudentInFirestore(updatedStudent, DEFAULT_CLASS_ID);
      setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          title: `Đã cập nhật hồ sơ Firestore: ${updatedStudent.fullName}`,
          time: 'Vừa xong',
          type: 'info',
          read: false,
        },
        ...prev,
      ]);
    } catch (err: any) {
      console.error('Lỗi cập nhật học sinh trong Firestore:', err);
      throw err;
    }
  };

  // Delete Student from Firestore
  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteStudentFromFirestore(studentId, DEFAULT_CLASS_ID);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      setConcerns((prev) => prev.filter((c) => c.studentId !== studentId));
      setClassInfo(prev => ({
        ...prev,
        totalStudents: Math.max(0, prev.totalStudents - 1)
      }));
    } catch (err: any) {
      console.error('Lỗi xóa học sinh khỏi Firestore:', err);
      throw err;
    }
  };

  // Batch Add or Update Students from Excel Import
  const handleBatchAddStudents = async (importedStudents: Student[]) => {
    try {
      await batchAddOrUpdateStudentsToFirestore(importedStudents, DEFAULT_CLASS_ID);
      setStudents((prev) => {
        const studentMap = new Map<string, Student>();
        prev.forEach((s) => studentMap.set(s.id, s));
        importedStudents.forEach((s) => studentMap.set(s.id, s));
        return Array.from(studentMap.values());
      });
      setClassInfo((prev) => {
        const existingIds = new Set(students.map((s) => s.id));
        const newCount = importedStudents.filter((s) => !existingIds.has(s.id)).length;
        return {
          ...prev,
          totalStudents: prev.totalStudents + newCount,
        };
      });
      setNotifications((prev) => [
        {
          id: `notif_${Date.now()}`,
          title: `Đã nhập thành công ${importedStudents.length} học sinh từ file Excel vào cơ sở dữ liệu!`,
          time: 'Vừa xong',
          type: 'success',
          read: false,
        },
        ...prev,
      ]);
    } catch (err: any) {
      console.error('Lỗi nhập học sinh hàng loạt từ Excel:', err);
      throw err;
    }
  };

  // Seed Initial Demo Students explicitly
  const handleSeedInitialData = async () => {
    try {
      const seeded = await seedInitialStudentsIfEmpty(DEFAULT_CLASS_ID);
      setStudents(seeded);
      setClassInfo(prev => ({
        ...prev,
        totalStudents: seeded.length
      }));
    } catch (err: any) {
      console.error('Lỗi khởi tạo dữ liệu mẫu:', err);
      throw err;
    }
  };

  const handleUpdateStudentGrade = (studentId: string, updatedGrade: SubjectGrade) => {
    setGradesMap((prev) => {
      const currentList = prev[studentId] || [];
      const index = currentList.findIndex((g) => g.subjectId === updatedGrade.subjectId);
      let nextList = [...currentList];
      if (index >= 0) {
        nextList[index] = updatedGrade;
      } else {
        nextList.push(updatedGrade);
      }
      return {
        ...prev,
        [studentId]: nextList,
      };
    });
  };

  const handleSaveAttendance = (newAttendance: DailyAttendance) => {
    setAttendance(newAttendance);
  };

  const handleAddViolation = (newViolation: ViolationRecord) => {
    setViolations((prev) => [newViolation, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: `Ghi nhận vi phạm mới: ${newViolation.studentName} (${newViolation.description})`,
        time: 'Vừa xong',
        type: 'warning',
        read: false,
      },
      ...prev,
    ]);
  };

  const handleUpdateViolationStatus = (id: string, status: ViolationRecord['status']) => {
    setViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v))
    );
  };

  const handleAddAward = (newAward: AwardRecord) => {
    setAwards((prev) => [newAward, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: `Khen thưởng mới: ${newAward.studentName} - ${newAward.title}`,
        time: 'Vừa xong',
        type: 'success',
        read: false,
      },
      ...prev,
    ]);
  };

  // Competition handlers
  const handleAddCompetitionRecord = (newRecord: CompetitionRecord) => {
    setCompetitionRecords((prev) => [newRecord, ...prev]);

    const student = students.find((s) => s.id === newRecord.studentId);
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: `Thi đua tuần: ${newRecord.type === 'bonus' ? 'Cộng' : 'Trừ'} ${newRecord.points} điểm em ${student?.fullName || newRecord.studentName} (${newRecord.reason})`,
        time: 'Vừa xong',
        type: newRecord.type === 'bonus' ? 'success' : 'warning',
        read: false,
      },
      ...prev,
    ]);

    const updatedRecords = [newRecord, ...competitionRecords];
    const weekScore = calculateStudentWeekScore(newRecord.studentId, newRecord.weekId, updatedRecords, competitionSettings.thresholds);
    const sRecords = updatedRecords.filter(r => r.studentId === newRecord.studentId && r.weekId === newRecord.weekId);
    const penaltyCount = sRecords.filter(r => r.type === 'penalty').length;
    const penaltyPoints = sRecords.filter(r => r.type === 'penalty').reduce((acc, r) => acc + r.points, 0);

    if (weekScore.finalScore < 65 || penaltyCount >= 3 || penaltyPoints >= 8) {
      setConcerns((prev) => {
        const existing = prev.find((c) => c.studentId === newRecord.studentId);
        const concernReason = `Cần theo dõi dữ liệu rèn luyện (Điểm thi đua tuần: ${weekScore.finalScore}/100, -${penaltyPoints} điểm trừ)`;
        if (existing) {
          if (!existing.reasons.some(r => r.includes('dữ liệu rèn luyện'))) {
            return prev.map((c) => c.studentId === newRecord.studentId ? {
              ...c,
              reasons: [concernReason, ...c.reasons],
              level: weekScore.finalScore < 65 ? 'high' : c.level,
              lastUpdated: new Date().toLocaleDateString('vi-VN'),
            } : c);
          }
          return prev;
        } else if (student) {
          return [
            {
              studentId: student.id,
              studentName: student.fullName,
              code: student.code,
              level: weekScore.finalScore < 65 ? 'high' : 'medium',
              reasons: [concernReason],
              metrics: {
                gpa: student.gpa,
                unexcusedAbsence: 0,
                lateCount: penaltyCount,
                violationCount: penaltyCount,
              },
              suggestedAction: 'Theo dõi chỉ số rèn luyện hàng tuần, nhắc nhở nề nếp và trao đổi với phụ huynh.',
              lastUpdated: new Date().toLocaleDateString('vi-VN'),
            },
            ...prev,
          ];
        }
        return prev;
      });
    }
  };

  const handleDeleteCompetitionRecord = (recordId: string) => {
    setCompetitionRecords((prev) => prev.filter((r) => r.id !== recordId));
  };

  const handleSaveCompetitionSettings = (newSettings: CompetitionSettings) => {
    setCompetitionSettings(newSettings);
  };

  const handleResetMockData = () => {
    setClassInfo(INITIAL_CLASS_INFO);
    setStudents(INITIAL_STUDENTS);
    setGradesMap(INITIAL_STUDENT_GRADES);
    setAttendance(INITIAL_TODAY_ATTENDANCE);
    setViolations(INITIAL_VIOLATIONS);
    setAwards(INITIAL_AWARDS);
    setConcerns(INITIAL_CONCERN_STUDENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCompetitionWeeks(INITIAL_COMPETITION_WEEKS);
    setCompetitionRecords(INITIAL_COMPETITION_RECORDS);
    setCompetitionSettings(INITIAL_COMPETITION_SETTINGS);
  };

  // Selected student for Profile modal
  const selectedStudentObj = selectedStudentId
    ? students.find((s) => s.id === selectedStudentId) || null
    : null;

  // 1. Loading state during initial Firebase Auth verification
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#08A67A] animate-spin" />
          <p className="text-sm font-semibold text-[#172B4D]">
            Đang tải dữ liệu...
          </p>
          <p className="text-xs text-[#66788A]">
            Đang kiểm tra phiên đăng nhập Firebase Authentication
          </p>
        </div>
      </div>
    );
  }

  // 2. Gatekeeper: If user is not authenticated, show Login page
  if (!currentUser) {
    return <LoginPage />;
  }

  // 3. Authenticated App Layout
  return (
    <div className="min-h-screen bg-[#F5F8FC] flex font-sans antialiased text-[#172B4D]">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        concernCount={concerns.length}
        violationCount={violations.filter((v) => v.status !== 'Đã xử lý').length}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          classInfo={classInfo}
          notifications={notifications}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenSettings={() => setActiveTab('settings')}
          onUpdateClassAvatar={handleUpdateClassAvatar}
          onDeleteClassAvatar={handleDeleteClassAvatar}
        />

        {/* Dynamic Main Body Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewPage
              concernStudents={concerns}
              allStudents={students}
              onViewStudentProfile={handleOpenStudentProfile}
              onNavigateToTab={setActiveTab}
              competitionRecords={competitionRecords}
              competitionWeeks={competitionWeeks}
              competitionSettings={competitionSettings}
            />
          )}

          {activeTab === 'students' && (
            <StudentsPage
              students={students}
              loading={firestoreLoading}
              error={firestoreError}
              onViewStudent={handleOpenStudentProfile}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onSeedInitialData={handleSeedInitialData}
              onBatchAddStudents={handleBatchAddStudents}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendancePage
              students={students}
              currentAttendance={attendance}
              weeks={competitionWeeks}
              onSaveAttendance={handleSaveAttendance}
            />
          )}

          {activeTab === 'competition' && (
            <CompetitionPage
              students={students}
              weeks={competitionWeeks}
              records={competitionRecords}
              criteria={competitionSettings.criteria}
              settings={competitionSettings}
              onAddRecord={handleAddCompetitionRecord}
              onDeleteRecord={handleDeleteCompetitionRecord}
              onViewStudentProfile={handleOpenStudentProfile}
            />
          )}

          {activeTab === 'violations' && (
            <ViolationsPage
              violations={violations}
              students={students}
              onAddViolation={handleAddViolation}
              onUpdateViolationStatus={handleUpdateViolationStatus}
            />
          )}

          {activeTab === 'awards' && (
            <AwardsPage
              awards={awards}
              students={students}
              onAddAward={handleAddAward}
            />
          )}

          {activeTab === 'concern' && (
            <ConcernPage
              allStudents={students}
              concernList={concerns}
              onViewStudentProfile={handleOpenStudentProfile}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPage
              classInfo={classInfo}
              students={students}
              attendance={attendance}
              concerns={concerns}
              gradesMap={gradesMap}
              violations={violations}
              awards={awards}
              competitionWeeks={competitionWeeks}
              competitionRecords={competitionRecords}
            />
          )}

          {activeTab === 'workspace' && (
            <WorkspacePage
              classInfo={classInfo}
              students={students}
              attendance={attendance}
              competitionWeeks={competitionWeeks}
              competitionRecords={competitionRecords}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              classInfo={classInfo}
              students={students}
              onSaveClassInfo={setClassInfo}
              onResetMockData={handleResetMockData}
              competitionSettings={competitionSettings}
              onSaveCompetitionSettings={handleSaveCompetitionSettings}
            />
          )}
        </main>
      </div>

      {/* Student Profile Modal */}
      {selectedStudentObj && (
        <StudentProfileModal
          student={selectedStudentObj}
          grades={gradesMap[selectedStudentObj.id] || []}
          violations={violations}
          awards={awards}
          competitionRecords={competitionRecords}
          competitionWeeks={competitionWeeks}
          onClose={handleCloseStudentProfile}
        />
      )}
    </div>
  );
}
