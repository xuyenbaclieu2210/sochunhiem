export type Gender = 'Nam' | 'Nữ';

export type AcademicRank = 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt';
export type ConductRank = 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt';

export type StudentStatus = 'Đang học' | 'Nghỉ học dài hạn' | 'Chuyển trường';

export interface SubjectGrade {
  subjectId: string;
  subjectName: string;
  regularScores: number[]; // Điểm thường xuyên (1-3 cột)
  midtermScore: number;    // Điểm giữa kỳ (hệ số 2)
  finalScore: number;      // Điểm cuối kỳ (hệ số 3)
  averageScore: number;    // Điểm trung bình môn
}

export interface Student {
  id: string; // STT / UUID
  code: string; // Mã HS, e.g. HS1001
  fullName: string;
  gender: Gender;
  dob: string; // YYYY-MM-DD
  group: number; // Tổ 1, 2, 3, 4
  phone: string;
  parentName: string;
  parentPhone: string;
  address: string;
  role: string; // Lớp trưởng, Bí thư, Tổ trưởng Tổ 1, Học sinh...
  status: StudentStatus;
  notes: string;
  avatarUrl?: string;
  conduct: ConductRank;
  gpa: number;
}

export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late' | 'early_leave';

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  group: number;
  status: AttendanceStatus;
  note?: string;
}

export interface DailyAttendance {
  date: string; // YYYY-MM-DD
  records: AttendanceRecord[];
}

export interface ViolationRecord {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  description: string;
  severity: 'Nhắc nhở' | 'Khiển trách' | 'Cảnh cáo';
  resolution: string; // Hướng xử lý: Nhắc nhở tại lớp, Viết tường trình, Mời phụ huynh...
  status: 'Đã xử lý' | 'Đang theo dõi' | 'Chờ gặp PH';
}

export interface AwardRecord {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  title: string;
  form: 'Tuyên dương trước lớp' | 'Giấy khen cấp trường' | 'Điểm cộng rèn luyện' | 'Khen thưởng phong trào';
  note: string;
}

export type ConcernLevel = 'high' | 'medium' | 'normal'; // 🔴 Cần quan tâm | 🟡 Cần theo dõi | 🟢 Bình thường

export interface ConcernStudent {
  studentId: string;
  studentName: string;
  code: string;
  level: ConcernLevel;
  reasons: string[];
  metrics: {
    gpa: number;
    unexcusedAbsence: number;
    lateCount: number;
    violationCount: number;
  };
  suggestedAction: string;
  lastUpdated: string;
}

export interface ClassInfo {
  className: string;
  academicYear: string;
  homeroomTeacher: string;
  room: string;
  track: string; // Ban KHTN / KHXH
  totalStudents: number;
  monitorName: string; // Lớp trưởng
  viceMonitorName: string; // Lớp phó học tập
  avatarUrl?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
}

// ================= THI ĐUA TUẦN =================
export type CompetitionRecordType = 'bonus' | 'penalty'; // 'bonus' (Cộng điểm) | 'penalty' (Trừ điểm)

export interface CompetitionCriteria {
  id: string;
  name: string;
  type: CompetitionRecordType;
  defaultPoints: number;
  category?: string;
}

export interface CompetitionRecord {
  id: string;
  studentId: string;
  studentName?: string;
  weekId: string; // e.g. 'w1', 'w2', 'w3', 'w4', 'w5'
  date: string; // YYYY-MM-DD
  type: CompetitionRecordType;
  reason: string;
  points: number; // Positive number (e.g. 2, 3, 5)
  note?: string;
  createdAt: string;
  createdBy: string;
}

export interface CompetitionWeek {
  id: string;
  weekNumber: number; // 1, 2, 3, 4, 5, ...
  name: string; // 'Tuần 1', 'Tuần 2', ... 'Tuần 5'
  startDate: string; // YYYY-MM-DD (Thứ Hai)
  endDate: string; // YYYY-MM-DD (Thứ Bảy)
  formattedRange: string; // '05/10/2026 – 10/10/2026'
  displayRange: string; // '05/10/2026 → 10/10/2026'
  shortRange: string; // '05/10 - 10/10'
  month: string; // 'Tháng 10/2026'
  semester: 'HK1' | 'HK2';
  isCurrent?: boolean;
}

export interface ConductRankThresholds {
  good: number; // default: 90
  fair: number; // default: 80
  pass: number; // default: 65
}

export interface CompetitionSettings {
  initialPoints: number; // default: 100
  thresholds: ConductRankThresholds;
  monthlyCalcMethod: 'average' | 'weighted';
  criteria: CompetitionCriteria[];
}

export interface StudentWeeklyCompetition {
  studentId: string;
  weekId: string;
  initialPoints: number;
  totalBonus: number;
  totalPenalty: number;
  finalScore: number;
  rank: ConductRank;
}
