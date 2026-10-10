import {
  Student,
  SubjectGrade,
  ViolationRecord,
  AwardRecord,
  ConcernStudent,
  ClassInfo,
  NotificationItem,
  DailyAttendance
} from '../types';

export const INITIAL_CLASS_INFO: ClassInfo = {
  className: 'Lớp 10A1',
  academicYear: 'Năm học 2026–2027',
  homeroomTeacher: 'Thầy Nguyễn Văn Xuyên',
  room: '02 – Nhà B',
  track: 'Khoa học Tự nhiên',
  totalStudents: 42,
  monitorName: 'Nguyễn Minh An',
  viceMonitorName: 'Đỗ Phương Linh',
};

// 10 mock students strictly for Grade 10 THPT
export const INITIAL_STUDENTS: Student[] = [
  {
    id: '1',
    code: 'HS1001',
    fullName: 'Nguyễn Minh An',
    gender: 'Nam',
    dob: '2011-03-15',
    group: 1,
    phone: '0912 345 601',
    parentName: 'Nguyễn Văn Hùng (Bố)',
    parentPhone: '0988 123 451',
    address: 'Số 18, Ngõ 42 Phố Kim Mã, Ba Đình, Hà Nội',
    role: 'Lớp trưởng',
    status: 'Đang học',
    notes: 'Nhiệt tình, có tinh thần trách nhiệm cao, gương mẫu trong học tập và nề nếp.',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    conduct: 'Tốt',
    gpa: 8.9,
  },
  {
    id: '2',
    code: 'HS1002',
    fullName: 'Trần Gia Bảo',
    gender: 'Nam',
    dob: '2011-07-22',
    group: 1,
    phone: '0912 345 602',
    parentName: 'Trần Văn Mạnh (Bố)',
    parentPhone: '0988 123 452',
    address: 'Số 45, Đường Giải Phóng, Hai Bà Trưng, Hà Nội',
    role: 'Học sinh',
    status: 'Đang học',
    notes: 'Điểm Toán tốt nhưng môn Tiếng Anh còn yếu, hay mất tập trung trong tiết Văn.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    conduct: 'Khá',
    gpa: 6.8,
  },
  {
    id: '3',
    code: 'HS1003',
    fullName: 'Lê Hoàng Anh',
    gender: 'Nam',
    dob: '2011-11-05',
    group: 2,
    phone: '0912 345 603',
    parentName: 'Lê Văn Tuấn (Bố)',
    parentPhone: '0988 123 453',
    address: 'Số 72, Đội Cấn, Ba Đình, Hà Nội',
    role: 'Tổ trưởng Tổ 2',
    status: 'Đang học',
    notes: 'Học lực khá, tham gia tích cực hoạt động Đoàn và phong trào thể thao.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    conduct: 'Tốt',
    gpa: 7.8,
  },
  {
    id: '4',
    code: 'HS1004',
    fullName: 'Phạm Minh Đức',
    gender: 'Nam',
    dob: '2011-05-18',
    group: 2,
    phone: '0912 345 604',
    parentName: 'Nguyễn Thị Loan (Mẹ)',
    parentPhone: '0988 123 454',
    address: 'Số 104, Phố Huế, Hai Bà Trưng, Hà Nội',
    role: 'Học sinh',
    status: 'Đang học',
    notes: 'Thường xuyên đi muộn tuần qua, điểm kiểm tra giữa kỳ môn Hóa giảm sút. Cần nhắc nhở.',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    conduct: 'Khá',
    gpa: 5.4,
  },
  {
    id: '5',
    code: 'HS1005',
    fullName: 'Võ Gia Huy',
    gender: 'Nam',
    dob: '2011-09-30',
    group: 3,
    phone: '0912 345 605',
    parentName: 'Võ Thành Đạt (Bố)',
    parentPhone: '0988 123 455',
    address: 'Tập thể Nghĩa Tân, Cầu Giấy, Hà Nội',
    role: 'Học sinh',
    status: 'Đang học',
    notes: 'Đã nghỉ 2 buổi không phép trong tháng, điểm số các môn tự nhiên đạt mức trung bình.',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    conduct: 'Đạt',
    gpa: 4.8,
  },
  {
    id: '6',
    code: 'HS1006',
    fullName: 'Đỗ Phương Linh',
    gender: 'Nữ',
    dob: '2011-01-12',
    group: 3,
    phone: '0912 345 606',
    parentName: 'Đỗ Quốc Việt (Bố)',
    parentPhone: '0988 123 456',
    address: 'Số 29, Phố Tràng Thi, Hoàn Kiếm, Hà Nội',
    role: 'Lớp phó học tập',
    status: 'Đang học',
    notes: 'Học sinh giỏi toàn diện, đạt giải Khuyến khích HSG Toán cấp thành phố.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    conduct: 'Tốt',
    gpa: 9.3,
  },
  {
    id: '7',
    code: 'HS1007',
    fullName: 'Hoàng Thảo My',
    gender: 'Nữ',
    dob: '2011-08-19',
    group: 4,
    phone: '0912 345 607',
    parentName: 'Hoàng Kim Sơn (Bố)',
    parentPhone: '0988 123 457',
    address: 'Số 85, Nguyễn Trãi, Thanh Xuân, Hà Nội',
    role: 'Bí thư Chi đoàn',
    status: 'Đang học',
    notes: 'Năng động, quản lý tốt các buổi sinh hoạt chuyên đề và văn nghệ của lớp.',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    conduct: 'Tốt',
    gpa: 8.6,
  },
  {
    id: '8',
    code: 'HS1008',
    fullName: 'Vũ Tuấn Kiệt',
    gender: 'Nam',
    dob: '2011-12-04',
    group: 4,
    phone: '0912 345 608',
    parentName: 'Vũ Đình Cường (Bố)',
    parentPhone: '0988 123 458',
    address: 'Số 63, Khâm Thiên, Đống Đa, Hà Nội',
    role: 'Tổ phó Tổ 4',
    status: 'Đang học',
    notes: 'Có chuyển biến tích cực trong kỳ thi giữa kỳ môn Lý và Hóa.',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    conduct: 'Tốt',
    gpa: 7.4,
  },
  {
    id: '9',
    code: 'HS1009',
    fullName: 'Bùi Khánh Huyền',
    gender: 'Nữ',
    dob: '2011-04-28',
    group: 1,
    phone: '0912 345 609',
    parentName: 'Bùi Thị Thanh (Mẹ)',
    parentPhone: '0988 123 459',
    address: 'Số 12, Láng Hạ, Đống Đa, Hà Nội',
    role: 'Học sinh',
    status: 'Đang học',
    notes: 'Trầm tính, học lực khá, cần khuyến khích giơ tay phát biểu nhiều hơn.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    conduct: 'Tốt',
    gpa: 7.7,
  },
  {
    id: '10',
    code: 'HS1010',
    fullName: 'Phan Bảo Ngọc',
    gender: 'Nữ',
    dob: '2011-10-09',
    group: 2,
    phone: '0912 345 610',
    parentName: 'Phan Thị Mai (Mẹ)',
    parentPhone: '0988 123 460',
    address: 'Số 33, Phố Chùa Bộc, Đống Đa, Hà Nội',
    role: 'Tổ trưởng Tổ 2',
    status: 'Đang học',
    notes: 'Chăm chỉ, ghi chép bài đầy đủ, giúp đỡ bạn bè trong tổ ôn thi môn Văn.',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    conduct: 'Tốt',
    gpa: 8.4,
  },
];

export const SUBJECTS_LIST = [
  { id: 'math', name: 'Toán học' },
  { id: 'lit', name: 'Ngữ văn' },
  { id: 'eng', name: 'Tiếng Anh' },
  { id: 'phys', name: 'Vật lí' },
  { id: 'chem', name: 'Hóa học' },
  { id: 'bio', name: 'Sinh học' },
  { id: 'hist', name: 'Lịch sử' },
  { id: 'geog', name: 'Địa lí' },
  { id: 'it', name: 'Tin học' },
  { id: 'econ', name: 'GDKT & Pháp luật' },
];

export const INITIAL_STUDENT_GRADES: Record<string, SubjectGrade[]> = {
  '1': [
    { subjectId: 'math', subjectName: 'Toán học', regularScores: [9.0, 9.5, 9.0], midtermScore: 9.0, finalScore: 9.2, averageScore: 9.1 },
    { subjectId: 'lit', subjectName: 'Ngữ văn', regularScores: [8.0, 8.5, 8.0], midtermScore: 8.5, finalScore: 8.0, averageScore: 8.2 },
    { subjectId: 'eng', subjectName: 'Tiếng Anh', regularScores: [9.0, 8.5, 9.5], midtermScore: 9.0, finalScore: 9.0, averageScore: 9.0 },
    { subjectId: 'phys', subjectName: 'Vật lí', regularScores: [8.5, 9.0, 9.0], midtermScore: 8.8, finalScore: 9.0, averageScore: 8.9 },
    { subjectId: 'chem', subjectName: 'Hóa học', regularScores: [9.0, 9.0, 8.5], midtermScore: 9.0, finalScore: 8.8, averageScore: 8.8 },
  ],
  '2': [
    { subjectId: 'math', subjectName: 'Toán học', regularScores: [8.0, 7.5, 8.0], midtermScore: 7.8, finalScore: 7.5, averageScore: 7.7 },
    { subjectId: 'lit', subjectName: 'Ngữ văn', regularScores: [6.0, 6.5, 6.0], midtermScore: 6.2, finalScore: 6.5, averageScore: 6.3 },
    { subjectId: 'eng', subjectName: 'Tiếng Anh', regularScores: [5.5, 5.0, 6.0], midtermScore: 5.5, finalScore: 5.8, averageScore: 5.6 },
    { subjectId: 'phys', subjectName: 'Vật lí', regularScores: [7.0, 7.5, 7.0], midtermScore: 7.2, finalScore: 7.0, averageScore: 7.1 },
    { subjectId: 'chem', subjectName: 'Hóa học', regularScores: [7.5, 7.0, 7.5], midtermScore: 7.0, finalScore: 7.2, averageScore: 7.2 },
  ],
  '4': [
    { subjectId: 'math', subjectName: 'Toán học', regularScores: [5.5, 5.0, 5.5], midtermScore: 5.0, finalScore: 5.5, averageScore: 5.3 },
    { subjectId: 'lit', subjectName: 'Ngữ văn', regularScores: [6.0, 5.5, 6.0], midtermScore: 5.8, finalScore: 5.5, averageScore: 5.7 },
    { subjectId: 'eng', subjectName: 'Tiếng Anh', regularScores: [5.0, 5.5, 4.5], midtermScore: 5.0, finalScore: 5.2, averageScore: 5.0 },
    { subjectId: 'phys', subjectName: 'Vật lí', regularScores: [5.5, 5.0, 4.8], midtermScore: 5.0, finalScore: 5.2, averageScore: 5.1 },
    { subjectId: 'chem', subjectName: 'Hóa học', regularScores: [4.5, 4.0, 4.8], midtermScore: 4.5, finalScore: 4.2, averageScore: 4.4 },
  ],
  '5': [
    { subjectId: 'math', subjectName: 'Toán học', regularScores: [5.0, 4.5, 4.8], midtermScore: 4.5, finalScore: 4.6, averageScore: 4.6 },
    { subjectId: 'lit', subjectName: 'Ngữ văn', regularScores: [5.5, 5.0, 5.5], midtermScore: 5.2, finalScore: 5.0, averageScore: 5.2 },
    { subjectId: 'eng', subjectName: 'Tiếng Anh', regularScores: [4.0, 4.5, 4.0], midtermScore: 4.2, finalScore: 4.5, averageScore: 4.3 },
    { subjectId: 'phys', subjectName: 'Vật lí', regularScores: [5.0, 4.8, 5.0], midtermScore: 4.7, finalScore: 5.0, averageScore: 4.9 },
    { subjectId: 'chem', subjectName: 'Hóa học', regularScores: [4.8, 4.5, 5.0], midtermScore: 4.5, finalScore: 4.8, averageScore: 4.7 },
  ],
  '6': [
    { subjectId: 'math', subjectName: 'Toán học', regularScores: [9.8, 9.5, 10.0], midtermScore: 9.8, finalScore: 9.6, averageScore: 9.7 },
    { subjectId: 'lit', subjectName: 'Ngữ văn', regularScores: [8.5, 9.0, 8.8], midtermScore: 8.8, finalScore: 8.5, averageScore: 8.7 },
    { subjectId: 'eng', subjectName: 'Tiếng Anh', regularScores: [9.5, 9.0, 9.5], midtermScore: 9.5, finalScore: 9.4, averageScore: 9.4 },
    { subjectId: 'phys', subjectName: 'Vật lí', regularScores: [9.2, 9.5, 9.0], midtermScore: 9.2, finalScore: 9.5, averageScore: 9.3 },
    { subjectId: 'chem', subjectName: 'Hóa học', regularScores: [9.5, 9.2, 9.6], midtermScore: 9.4, finalScore: 9.5, averageScore: 9.4 },
  ]
};

export const INITIAL_TODAY_ATTENDANCE: DailyAttendance = {
  date: '2026-10-08',
  records: [
    { studentId: '1', studentName: 'Nguyễn Minh An', group: 1, status: 'present' },
    { studentId: '2', studentName: 'Trần Gia Bảo', group: 1, status: 'present' },
    { studentId: '3', studentName: 'Lê Hoàng Anh', group: 2, status: 'present' },
    { studentId: '4', studentName: 'Phạm Minh Đức', group: 2, status: 'late', note: 'Đến muộn 15 phút tiết 1 (hỏng xe)' },
    { studentId: '5', studentName: 'Võ Gia Huy', group: 3, status: 'unexcused', note: 'Chưa thấy phụ huynh liên hệ xin phép' },
    { studentId: '6', studentName: 'Đỗ Phương Linh', group: 3, status: 'present' },
    { studentId: '7', studentName: 'Hoàng Thảo My', group: 4, status: 'present' },
    { studentId: '8', studentName: 'Vũ Tuấn Kiệt', group: 4, status: 'present' },
    { studentId: '9', studentName: 'Bùi Khánh Huyền', group: 1, status: 'excused', note: 'Gia đình có việc xin nghỉ 1 ngày' },
    { studentId: '10', studentName: 'Phan Bảo Ngọc', group: 2, status: 'present' },
  ]
};

export const INITIAL_VIOLATIONS: ViolationRecord[] = [
  {
    id: 'V1',
    date: '2026-10-07',
    studentId: '5',
    studentName: 'Võ Gia Huy',
    description: 'Nghỉ học không phép buổi sáng thứ Tư',
    severity: 'Cảnh cáo',
    resolution: 'GVCN gọi điện cho phụ huynh, hẹn gặp trao đổi vào chiều thứ Sáu',
    status: 'Chờ gặp PH',
  },
  {
    id: 'V2',
    date: '2026-10-05',
    studentId: '4',
    studentName: 'Phạm Minh Đức',
    description: 'Đi học muộn lần thứ 2 trong tuần (tiết 1 môn Toán)',
    severity: 'Nhắc nhở',
    resolution: 'Nhắc nhở trước lớp, yêu cầu đi học đúng giờ và trực nhật 2 ngày',
    status: 'Đang theo dõi',
  },
  {
    id: 'V3',
    date: '2026-10-02',
    studentId: '8',
    studentName: 'Vũ Tuấn Kiệt',
    description: 'Sử dụng điện thoại trong giờ Sinh học',
    severity: 'Khiển trách',
    resolution: 'Tạm giữ điện thoại đến hết buổi, học sinh viết bản cam kết',
    status: 'Đã xử lý',
  },
  {
    id: 'V4',
    date: '2026-09-26',
    studentId: '2',
    studentName: 'Trần Gia Bảo',
    description: 'Không làm bài tập về nhà môn Ngữ văn',
    severity: 'Nhắc nhở',
    resolution: 'Yêu cầu hoàn thành bài tập nộp lại cho Tổ trưởng vào sáng hôm sau',
    status: 'Đã xử lý',
  },
];

export const INITIAL_AWARDS: AwardRecord[] = [
  {
    id: 'A1',
    date: '2026-10-06',
    studentId: '6',
    studentName: 'Đỗ Phương Linh',
    title: 'Giải Khuyến khích kỳ thi Học sinh giỏi Toán cấp Cụm trường',
    form: 'Giấy khen cấp trường',
    note: 'Được tuyên dương trong lễ chào cờ đầu tuần của trường',
  },
  {
    id: 'A2',
    date: '2026-10-03',
    studentId: '1',
    studentName: 'Nguyễn Minh An',
    title: 'Gương mẫu điều hành xuất sắc nề nếp lớp và hỗ trợ các bạn ôn tập',
    form: 'Tuyên dương trước lớp',
    note: 'Cộng 10 điểm thi đua cá nhân tháng 10',
  },
  {
    id: 'A3',
    date: '2026-09-30',
    studentId: '7',
    studentName: 'Hoàng Thảo My',
    title: 'Tổ chức thành công diễn đàn thanh niên chủ đề "Học tập thời số hóa"',
    form: 'Khen thưởng phong trào',
    note: 'Đoàn trường khen thưởng tập thể Chi đoàn 10A1',
  },
  {
    id: 'A4',
    date: '2026-09-25',
    studentId: '3',
    studentName: 'Lê Hoàng Anh',
    title: 'Huy chương Bạc giải Cầu lông Hội khỏe Phù Đổng cấp trường',
    form: 'Giấy khen cấp trường',
    note: 'Góp phần vào thành tích thi đua thể dục thể thao của lớp',
  },
  {
    id: 'A5',
    date: '2026-09-22',
    studentId: '10',
    studentName: 'Phan Bảo Ngọc',
    title: 'Đôi bạn cùng tiến: Hướng dẫn bạn vượt khó nâng điểm môn Văn',
    form: 'Tuyên dương trước lớp',
    note: 'Tinh thần tương thân tương ái, vì tập thể',
  },
  {
    id: 'A6',
    date: '2026-09-18',
    studentId: '9',
    studentName: 'Bùi Khánh Huyền',
    title: 'Tích cực tham gia trang trí bảng tin nề nếp và môi trường lớp học',
    form: 'Điểm cộng rèn luyện',
    note: 'Khen ngợi tinh thần trách nhiệm',
  },
];

export const INITIAL_CONCERN_STUDENTS: ConcernStudent[] = [
  {
    studentId: '5',
    studentName: 'Võ Gia Huy',
    code: 'HS1005',
    level: 'high',
    reasons: [
      'Nghỉ học 2 buổi không phép trong tháng 10',
      'Điểm kiểm tra Toán (4.6) và Anh (4.3) dưới trung bình',
      'Có 1 vi phạm nề nếp chưa giải quyết xong với phụ huynh'
    ],
    metrics: {
      gpa: 4.8,
      unexcusedAbsence: 2,
      lateCount: 1,
      violationCount: 1,
    },
    suggestedAction: 'Gặp trực tiếp phụ huynh chiều thứ Sáu, lập kế hoạch phụ đạo môn Toán và Anh.',
    lastUpdated: '08/10/2026'
  },
  {
    studentId: '4',
    studentName: 'Phạm Minh Đức',
    code: 'HS1004',
    level: 'high',
    reasons: [
      'Đi muộn 2 lần liên tiếp trong tuần này',
      'Điểm Hóa học giảm từ 6.5 xuống 4.4 ở bài kiểm tra định kỳ',
      'Thường xuyên mất tập trung trong các tiết đầu giờ'
    ],
    metrics: {
      gpa: 5.4,
      unexcusedAbsence: 0,
      lateCount: 3,
      violationCount: 1,
    },
    suggestedAction: 'Nhắc nhở gia đình phối hợp đôn đốc giờ giấc thức dậy, chuyển đổi chỗ ngồi lên bàn 2.',
    lastUpdated: '07/10/2026'
  },
  {
    studentId: '8',
    studentName: 'Vũ Tuấn Kiệt',
    code: 'HS1008',
    level: 'medium',
    reasons: [
      'Điểm môn Ngữ văn đạt 5.4, cần nâng cao kỹ năng viết đoạn văn',
      'Có 1 lần nhắc nhở về việc sử dụng điện thoại trong giờ học'
    ],
    metrics: {
      gpa: 7.4,
      unexcusedAbsence: 0,
      lateCount: 1,
      violationCount: 1,
    },
    suggestedAction: 'Giao bạn tổ trưởng kèm cặp kiểm tra vở bài tập, động viên phát biểu bài.',
    lastUpdated: '06/10/2026'
  },
  {
    studentId: '2',
    studentName: 'Trần Gia Bảo',
    code: 'HS1002',
    level: 'medium',
    reasons: [
      'Điểm Tiếng Anh thường xuyên ở mức 5.0 - 5.5, giảm so với đầu năm',
      'Từng bị nhắc nhở quên làm bài tập Ngữ văn'
    ],
    metrics: {
      gpa: 6.8,
      unexcusedAbsence: 0,
      lateCount: 1,
      violationCount: 1,
    },
    suggestedAction: 'Động viên tham gia câu lạc bộ Tiếng Anh của trường, theo dõi tiến độ làm bài tập.',
    lastUpdated: '05/10/2026'
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Học sinh Võ Gia Huy vắng học không phép hôm nay (08/10)',
    time: '07:45 - Hôm nay',
    type: 'warning',
    read: false,
  },
  {
    id: 'n2',
    title: 'Em Đỗ Phương Linh nhận giải Khuyến khích HSG Toán',
    time: '14:30 - Hôm qua',
    type: 'success',
    read: false,
  },
  {
    id: 'n3',
    title: 'Hạn nộp bảng điểm kiểm tra giữa kỳ 1: Ngày 15/10/2026',
    time: '09:00 - 06/10',
    type: 'info',
    read: true,
  },
  {
    id: 'n4',
    title: 'Lịch họp Ban đại diện cha mẹ học sinh Lớp 10A1 vào Chủ Nhật này',
    time: '16:00 - 05/10',
    type: 'info',
    read: true,
  },
];

// Mock chart data
export const SUBJECT_AVERAGES_DATA = [
  { subject: 'Toán', score: 7.8 },
  { subject: 'Ngữ văn', score: 7.2 },
  { subject: 'Tiếng Anh', score: 6.9 },
  { subject: 'Vật lí', score: 7.5 },
  { subject: 'Hóa học', score: 7.1 },
  { subject: 'Sinh học', score: 7.9 },
  { subject: 'Lịch sử', score: 7.4 },
  { subject: 'Địa lí', score: 7.6 },
  { subject: 'Tin học', score: 8.3 },
  { subject: 'GDKT&PL', score: 7.8 },
];

export const ATTENDANCE_7DAYS_DATA = [
  { day: 'T2 (05/10)', rate: 100, present: 42, absent: 0 },
  { day: 'T3 (06/10)', rate: 95.2, present: 40, absent: 2 },
  { day: 'T4 (07/10)', rate: 97.6, present: 41, absent: 1 },
  { day: 'T5 (08/10)', rate: 95.2, present: 40, absent: 2 }, // Hôm nay
  { day: 'T6 (09/10)', rate: 97.6, present: 41, absent: 1 }, // Dự kiến
  { day: 'T7 (10/10)', rate: 100, present: 42, absent: 0 }, // Dự kiến
];

export const MONTHLY_VIOLATIONS_DATA = [
  { month: 'Tháng 9', count: 5 },
  { month: 'Tháng 10', count: 3 },
  { month: 'Tháng 11 (Dự kiến)', count: 0 },
  { month: 'Tháng 12 (Dự kiến)', count: 0 },
];

export const ACADEMIC_DISTRIBUTION_DATA = [
  { tier: 'Tốt (Giỏi)', count: 14, percent: 33.3, color: 'bg-emerald-600' },
  { tier: 'Khá', count: 21, percent: 50.0, color: 'bg-blue-600' },
  { tier: 'Đạt (TB)', count: 5, percent: 11.9, color: 'bg-amber-500' },
  { tier: 'Chưa đạt', count: 2, percent: 4.8, color: 'bg-rose-500' },
];

// ================= THI ĐUA TUẦN MOCK DATA =================
import {
  CompetitionWeek,
  CompetitionCriteria,
  CompetitionRecord,
  CompetitionSettings
} from '../types';
import { generateAcademicWeeks } from './academicWeeks';

export const INITIAL_COMPETITION_WEEKS: CompetitionWeek[] = generateAcademicWeeks();

export const INITIAL_COMPETITION_CRITERIA: CompetitionCriteria[] = [
  // Điểm cộng mặc định
  { id: 'c_b1', name: 'Hoàn thành nhiệm vụ', type: 'bonus', defaultPoints: 2, category: 'Nhiệm vụ' },
  { id: 'c_b2', name: 'Giúp đỡ bạn bè', type: 'bonus', defaultPoints: 2, category: 'Tinh thần tương trợ' },
  { id: 'c_b3', name: 'Tiến bộ trong học tập', type: 'bonus', defaultPoints: 3, category: 'Học tập' },
  { id: 'c_b4', name: 'Tham gia hoạt động tốt', type: 'bonus', defaultPoints: 3, category: 'Phong trào' },
  { id: 'c_b5', name: 'Có ý thức tốt', type: 'bonus', defaultPoints: 2, category: 'Nề nếp' },
  { id: 'c_b6', name: 'Hành động tích cực khác', type: 'bonus', defaultPoints: 2, category: 'Khác' },

  // Điểm trừ mặc định
  { id: 'c_p1', name: 'Đi học muộn', type: 'penalty', defaultPoints: 2, category: 'Chuyên cần' },
  { id: 'c_p2', name: 'Nghỉ không phép', type: 'penalty', defaultPoints: 5, category: 'Chuyên cần' },
  { id: 'c_p3', name: 'Không làm bài tập', type: 'penalty', defaultPoints: 3, category: 'Học tập' },
  { id: 'c_p4', name: 'Không mang sách vở', type: 'penalty', defaultPoints: 2, category: 'Học tập' },
  { id: 'c_p5', name: 'Sai trang phục / đồng phục', type: 'penalty', defaultPoints: 2, category: 'Nề nếp' },
  { id: 'c_p6', name: 'Mất trật tự trong giờ', type: 'penalty', defaultPoints: 2, category: 'Kỷ luật' },
  { id: 'c_p7', name: 'Vi phạm nội quy trường lớp', type: 'penalty', defaultPoints: 5, category: 'Kỷ luật' },
  { id: 'c_p8', name: 'Vi phạm khác', type: 'penalty', defaultPoints: 2, category: 'Khác' },
];

export const INITIAL_COMPETITION_SETTINGS: CompetitionSettings = {
  initialPoints: 100,
  thresholds: {
    good: 90,
    fair: 80,
    pass: 65,
  },
  monthlyCalcMethod: 'average',
  criteria: INITIAL_COMPETITION_CRITERIA,
};

export const INITIAL_COMPETITION_RECORDS: CompetitionRecord[] = [
  // Tuần 5 (Hiện tại: Thứ Hai 05/10/2026 → Thứ Bảy 10/10/2026)
  {
    id: 'cr-601',
    studentId: '1',
    studentName: 'Nguyễn Minh An',
    weekId: 'w5',
    date: '2026-10-06',
    type: 'bonus',
    reason: 'Hoàn thành nhiệm vụ',
    points: 2,
    note: 'Chuẩn bị phòng học và bảng viết chu đáo cho tiết Vật lí',
    createdAt: '2026-10-06 07:30',
    createdBy: 'Thầy Nguyễn Văn Xuyên (GVCN)'
  },
  {
    id: 'cr-602',
    studentId: '2',
    studentName: 'Trần Bảo Anh',
    weekId: 'w5',
    date: '2026-10-07',
    type: 'bonus',
    reason: 'Tham gia hoạt động tốt',
    points: 3,
    note: 'Tích cực dẫn dắt đội bóng bàn lớp 10A1 tại Hội thao trường',
    createdAt: '2026-10-07 16:00',
    createdBy: 'Thầy Nguyễn Văn Xuyên (GVCN)'
  },
  {
    id: 'cr-603',
    studentId: '3',
    studentName: 'Lê Hoàng Bách',
    weekId: 'w5',
    date: '2026-10-07',
    type: 'bonus',
    reason: 'Tiến bộ trong học tập',
    points: 3,
    note: 'Làm đúng 100% bài tập nâng cao Đại số và lên bảng hướng dẫn bạn',
    createdAt: '2026-10-07 09:15',
    createdBy: 'Thầy Nguyễn Văn Xuyên (GVCN)'
  },
  {
    id: 'cr-604',
    studentId: '4',
    studentName: 'Phạm Quỳnh Chi',
    weekId: 'w5',
    date: '2026-10-07',
    type: 'penalty',
    reason: 'Đi học muộn',
    points: 2,
    note: 'Muộn 10 phút tiết 1 buổi sáng thứ 4',
    createdAt: '2026-10-07 07:10',
    createdBy: 'Tổ trưởng Tổ 2'
  },
  {
    id: 'cr-605',
    studentId: '5',
    studentName: 'Hoàng Đức Dũng',
    weekId: 'w5',
    date: '2026-10-06',
    type: 'penalty',
    reason: 'Nghỉ không phép',
    points: 5,
    note: 'Vắng tiết 1-2 buổi sáng thứ 3 không có đơn phép',
    createdAt: '2026-10-06 08:00',
    createdBy: 'Thầy Nguyễn Văn Xuyên (GVCN)'
  },
  {
    id: 'cr-606',
    studentId: '5',
    studentName: 'Hoàng Đức Dũng',
    weekId: 'w5',
    date: '2026-10-08',
    type: 'penalty',
    reason: 'Không làm bài tập',
    points: 3,
    note: 'Chưa hoàn thành bài tập Sinh học được giao',
    createdAt: '2026-10-08 10:20',
    createdBy: 'Thầy Nguyễn Văn Xuyên (GVCN)'
  },
  {
    id: 'cr-607',
    studentId: '6',
    studentName: 'Vũ Thùy Dương',
    weekId: 'w5',
    date: '2026-10-07',
    type: 'bonus',
    reason: 'Giúp đỡ bạn bè',
    points: 2,
    note: 'Kèm cặp và hướng dẫn bạn Hà bài tập Hóa học nhóm',
    createdAt: '2026-10-07 15:00',
    createdBy: 'Thầy Nguyễn Văn Xuyên (GVCN)'
  },
  {
    id: 'cr-608',
    studentId: '7',
    studentName: 'Đặng Tuấn Hải',
    weekId: 'w5',
    date: '2026-10-08',
    type: 'bonus',
    reason: 'Có ý thức tốt',
    points: 2,
    note: 'Chủ động sắp xếp lại bàn ghế và tắt điện phòng học sau giờ ra về',
    createdAt: '2026-10-08 11:45',
    createdBy: 'Thầy Nguyễn Văn Xuyên (GVCN)'
  },
  {
    id: 'cr-609',
    studentId: '8',
    studentName: 'Bùi Mai Hương',
    weekId: 'w5',
    date: '2026-10-06',
    type: 'bonus',
    reason: 'Hoàn thành nhiệm vụ',
    points: 2,
    note: 'Soạn thảo biên bản sinh hoạt lớp đầy đủ và nộp đúng hạn',
    createdAt: '2026-10-06 16:30',
    createdBy: 'Thầy Nguyễn Văn Xuyên (GVCN)'
  },
  {
    id: 'cr-610',
    studentId: '10',
    studentName: 'Đỗ Gia Khiêm',
    weekId: 'w5',
    date: '2026-10-07',
    type: 'bonus',
    reason: 'Tiến bộ trong học tập',
    points: 3,
    note: 'Đạt điểm 9 bài kiểm tra 15 phút môn Tin học',
    createdAt: '2026-10-07 14:10',
    createdBy: 'Thầy Nguyễn Văn Xuyên (GVCN)'
  },

  // Tuần 4 (28/09/2026 → 03/10/2026)
  {
    id: 'cr-501',
    studentId: '5',
    studentName: 'Hoàng Đức Dũng',
    weekId: 'w4',
    date: '2026-10-01',
    type: 'penalty',
    reason: 'Đi học muộn',
    points: 2,
    note: 'Đi muộn tiết 1',
    createdAt: '2026-10-01 07:15',
    createdBy: 'Thầy Nguyễn Văn Xuyên (GVCN)'
  },
  {
    id: 'cr-502',
    studentId: '5',
    studentName: 'Hoàng Đức Dũng',
    weekId: 'w4',
    date: '2026-10-02',
    type: 'penalty',
    reason: 'Mất trật tự trong giờ',
    points: 2,
    note: 'Nói chuyện riêng nhiều lần trong tiết Lịch sử',
    createdAt: '2026-10-02 09:30',
    createdBy: 'Thầy Nguyễn Văn Xuyên (GVCN)'
  },
  {
    id: 'cr-503',
    studentId: '1',
    studentName: 'Nguyễn Minh An',
    weekId: 'w4',
    date: '2026-09-30',
    type: 'bonus',
    reason: 'Tham gia hoạt động tốt',
    points: 3,
    note: 'Đại diện lớp 10A1 thuyết trình chuyên đề An toàn giao thông',
    createdAt: '2026-09-30 08:00',
    createdBy: 'Thầy Nguyễn Văn Xuyên (GVCN)'
  },
  {
    id: 'cr-504',
    studentId: '9',
    studentName: 'Ngô Quang Huy',
    weekId: 'w4',
    date: '2026-10-03',
    type: 'penalty',
    reason: 'Không mang sách vở',
    points: 2,
    note: 'Quên sách giáo khoa Ngữ văn',
    createdAt: '2026-10-03 08:30',
    createdBy: 'Tổ trưởng Tổ 4'
  },

  // Tuần 3 (21/09/2026 → 26/09/2026)
  {
    id: 'cr-401',
    studentId: '3',
    studentName: 'Lê Hoàng Bách',
    weekId: 'w3',
    date: '2026-09-24',
    type: 'bonus',
    reason: 'Tham gia hoạt động tốt',
    points: 3,
    note: 'Đạt giải Nhì cuộc thi giải Toán nhanh cấp trường',
    createdAt: '2026-09-24 16:00',
    createdBy: 'Thầy Nguyễn Văn Xuyên (GVCN)'
  },
  {
    id: 'cr-402',
    studentId: '2',
    studentName: 'Trần Bảo Anh',
    weekId: 'w3',
    date: '2026-09-23',
    type: 'bonus',
    reason: 'Có ý thức tốt',
    points: 2,
    note: 'Tích cực phụ trách đội cổ vũ lớp 10A1',
    createdAt: '2026-09-23 15:00',
    createdBy: 'Thầy Nguyễn Văn Xuyên (GVCN)'
  },

  // Tuần 2 (14/09/2026 → 19/09/2026)
  {
    id: 'cr-301',
    studentId: '8',
    studentName: 'Bùi Mai Hương',
    weekId: 'w2',
    date: '2026-09-17',
    type: 'bonus',
    reason: 'Hoàn thành nhiệm vụ',
    points: 2,
    note: 'Điều phối xuất sắc hoạt động trực nhật tuần 2',
    createdAt: '2026-09-17 11:30',
    createdBy: 'Thầy Nguyễn Văn Xuyên (GVCN)'
  },
  {
    id: 'cr-302',
    studentId: '4',
    studentName: 'Phạm Quỳnh Chi',
    weekId: 'w2',
    date: '2026-09-16',
    type: 'penalty',
    reason: 'Sai trang phục / đồng phục',
    points: 2,
    note: 'Không đi giày có quai hậu thứ Hai đầu tuần',
    createdAt: '2026-09-16 07:15',
    createdBy: 'Tổ cờ đỏ'
  },

  // Tuần 1 (07/09/2026 → 12/09/2026)
  {
    id: 'cr-201',
    studentId: '1',
    studentName: 'Nguyễn Minh An',
    weekId: 'w1',
    date: '2026-09-10',
    type: 'bonus',
    reason: 'Giúp đỡ bạn bè',
    points: 2,
    note: 'Hỗ trợ bạn mới chuyển vào làm quen quy định lớp',
    createdAt: '2026-09-10 14:00',
    createdBy: 'Thầy Nguyễn Văn Xuyên (GVCN)'
  },
  {
    id: 'cr-101',
    studentId: '7',
    studentName: 'Đặng Tuấn Hải',
    weekId: 'w1',
    date: '2026-09-08',
    type: 'bonus',
    reason: 'Có ý thức tốt',
    points: 2,
    note: 'Tích cực tham gia vệ sinh lớp học đầu năm học',
    createdAt: '2026-09-08 15:30',
    createdBy: 'Thầy Nguyễn Văn Xuyên (GVCN)'
  }
];

// Helper to compute weekly score and rank according to formula:
// finalScore = Math.max(0, Math.min(100, 100 + bonus - penalty))
export function calculateStudentWeekScore(
  studentId: string,
  weekId: string,
  records: CompetitionRecord[],
  thresholds = INITIAL_COMPETITION_SETTINGS.thresholds
) {
  const weekRecords = records.filter(
    (r) => r.studentId === studentId && r.weekId === weekId
  );
  const bonus = weekRecords
    .filter((r) => r.type === 'bonus')
    .reduce((acc, r) => acc + r.points, 0);
  const penalty = weekRecords
    .filter((r) => r.type === 'penalty')
    .reduce((acc, r) => acc + r.points, 0);

  const finalScore = Math.max(0, Math.min(100, 100 + bonus - penalty));

  let rank: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt' = 'Chưa đạt';
  if (finalScore >= thresholds.good) rank = 'Tốt';
  else if (finalScore >= thresholds.fair) rank = 'Khá';
  else if (finalScore >= thresholds.pass) rank = 'Đạt';

  return {
    initialPoints: 100,
    totalBonus: bonus,
    totalPenalty: penalty,
    finalScore,
    rank,
    records: weekRecords,
  };
}
