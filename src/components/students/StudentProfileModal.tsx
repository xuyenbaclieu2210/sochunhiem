import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Home,
  Calendar,
  GraduationCap,
  AlertTriangle,
  Award,
  History,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Medal,
  TrendingUp
} from 'lucide-react';
import {
  Student,
  SubjectGrade,
  ViolationRecord,
  AwardRecord,
  CompetitionRecord,
  CompetitionWeek
} from '../../types';
import {
  INITIAL_COMPETITION_WEEKS,
  calculateStudentWeekScore
} from '../../data/mockData';

interface StudentProfileModalProps {
  student: Student | null;
  onClose: () => void;
  grades?: SubjectGrade[];
  violations: ViolationRecord[];
  awards: AwardRecord[];
  competitionRecords?: CompetitionRecord[];
  competitionWeeks?: CompetitionWeek[];
}

type TabType = 'overview' | 'conduct' | 'attendance' | 'violations' | 'awards' | 'history';

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  onClose,
  violations,
  awards,
  competitionRecords = [],
  competitionWeeks = INITIAL_COMPETITION_WEEKS,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!student) return null;

  const studentViolations = violations.filter((v) => v.studentId === student.id);
  const studentAwards = awards.filter((a) => a.studentId === student.id);
  const studentCompetitionRecords = competitionRecords.filter((r) => r.studentId === student.id);

  // Compute current week conduct score
  const currentWeek = competitionWeeks.find((w) => w.isCurrent) || competitionWeeks.find((w) => w.id === 'w5') || competitionWeeks[0];
  const currentWeekScore = calculateStudentWeekScore(student.id, currentWeek.id, competitionRecords);
  const totalAllBonus = studentCompetitionRecords.filter((r) => r.type === 'bonus').reduce((acc, r) => acc + r.points, 0);
  const totalAllPenalty = studentCompetitionRecords.filter((r) => r.type === 'penalty').reduce((acc, r) => acc + r.points, 0);

  // Weekly trend for 6 weeks
  const weeklyTrends = competitionWeeks.map((w) => {
    const sc = calculateStudentWeekScore(student.id, w.id, competitionRecords);
    return {
      weekId: w.id,
      weekName: w.name,
      score: sc.finalScore,
      rank: sc.rank,
      isCurrent: w.isCurrent,
    };
  });

  // Mock attendance history for this student
  const mockAttendanceHistory = [
    { date: '08/10/2026', status: 'Có mặt', note: 'Đi học đúng giờ, chuẩn bị bài đầy đủ' },
    { date: '07/10/2026', status: student.id === '5' ? 'Nghỉ không phép' : 'Có mặt', note: student.id === '5' ? 'Vắng không phép buổi sáng' : 'Đúng giờ' },
    { date: '06/10/2026', status: 'Có mặt', note: 'Phát biểu xây dựng bài' },
    { date: '05/10/2026', status: student.id === '4' ? 'Đi muộn' : 'Có mặt', note: student.id === '4' ? 'Muộn 15 phút tiết 1' : 'Đúng giờ' },
    { date: '04/10/2026', status: 'Có mặt', note: 'Trực nhật tổ chu đáo' },
    { date: '03/10/2026', status: student.id === '9' ? 'Nghỉ phép' : 'Có mặt', note: student.id === '9' ? 'Có đơn xin phép của gia đình' : 'Đúng giờ' },
  ];

  // Mock teacher timeline log
  const mockTeacherLogs = [
    {
      date: '05/10/2026',
      author: 'Thầy Nguyễn Văn Xuyên (GVCN)',
      content: `Trao đổi với phụ huynh ${student.parentName} về tình hình học tập đầu tháng 10. Phụ huynh cam kết phối hợp nhắc nhở thêm ở nhà.`,
    },
    {
      date: '25/09/2026',
      author: 'Thầy Trần Đình Trọng (Bộ môn Toán)',
      content: 'Học sinh nắm vững phần Tập hợp và Bất phương trình bậc nhất hai ẩn, tích cực chữa bài tập.',
    },
    {
      date: '05/09/2026',
      author: 'Thầy Nguyễn Văn Xuyên (GVCN)',
      content: 'Nhận lớp đầu năm học 2026–2027. Học sinh hoàn tất hồ sơ nhập học lớp 10, đăng ký ban KHTN.',
    },
  ];

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'conduct', label: 'Rèn luyện', count: studentCompetitionRecords.length },
    { id: 'attendance', label: 'Chuyên cần' },
    { id: 'violations', label: 'Vi phạm', count: studentViolations.length },
    { id: 'awards', label: 'Khen thưởng', count: studentAwards.length },
    { id: 'history', label: 'Lịch sử & Nhật ký' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#16324F]/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#D9E2EC] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-[#D9E2EC] flex items-center justify-between bg-[#F5F8FC]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#66788A]">
              Hồ sơ học sinh THPT
            </span>
            <span className="text-[#D9E2EC]">·</span>
            <span className="text-xs font-bold text-[#08A67A] bg-[#08A67A]/10 px-2 py-0.5 rounded border border-[#08A67A]/25">
              {student.code}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#66788A] hover:text-[#172B4D] hover:bg-[#D9E2EC]/50 rounded-lg transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Info Card Header */}
        <div className="p-5 sm:p-6 border-b border-[#D9E2EC] bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-20 h-20 rounded-2xl bg-[#16324F]/10 border border-[#D9E2EC] overflow-hidden shrink-0 flex items-center justify-center text-[#16324F] font-bold text-xl shadow-xs">
              {student.avatarUrl ? (
                <img
                  src={student.avatarUrl}
                  alt={student.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                student.fullName.slice(-2)
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-[#172B4D] tracking-tight">
                  {student.fullName}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded font-semibold text-[#172B4D] bg-[#F5F8FC] border border-[#D9E2EC]">
                  {student.gender}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-semibold text-[#08A67A] bg-[#08A67A]/10 border border-[#08A67A]/25">
                  Tổ {student.group} · {student.role}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-medium text-[#66788A] bg-[#F5F8FC] border border-[#D9E2EC]">
                  {student.status}
                </span>
              </div>

              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-[#66788A]">
                <div className="flex items-center gap-1.5 truncate">
                  <Calendar className="w-3.5 h-3.5 text-[#9FB3C8] shrink-0" />
                  <span>Ngày sinh: <strong className="text-[#172B4D]">{student.dob}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3.5 h-3.5 text-[#9FB3C8] shrink-0" />
                  <span>SĐT: <strong className="text-[#172B4D]">{student.phone}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3.5 h-3.5 text-[#9FB3C8] shrink-0" />
                  <span>Phụ huynh: <strong className="text-[#172B4D]">{student.parentName}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3.5 h-3.5 text-[#9FB3C8] shrink-0" />
                  <span>SĐT PH: <strong className="text-[#172B4D]">{student.parentPhone}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 truncate sm:col-span-2">
                  <Home className="w-3.5 h-3.5 text-[#9FB3C8] shrink-0" />
                  <span className="truncate">Địa chỉ: <strong className="text-[#172B4D]">{student.address}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Note on Student */}
          {student.notes && (
            <div className="mt-4 p-3 bg-[#F5F8FC] rounded-lg border border-[#D9E2EC] text-xs text-[#172B4D] flex items-start gap-2">
              <FileText className="w-4 h-4 text-[#08A67A] mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-[#172B4D]">Nhận xét của GVCN: </span>
                <span className="text-[#66788A]">{student.notes}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-[#D9E2EC] flex overflow-x-auto gap-2 bg-[#F5F8FC]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'border-[#08A67A] text-[#08A67A]'
                    : 'border-transparent text-[#66788A] hover:text-[#172B4D]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-[#08A67A]/15 text-[#08A67A]' : 'bg-[#D9E2EC] text-[#66788A]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-[#172B4D] text-sm">
          {/* TAB 1: TỔNG QUAN */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-[#D9E2EC] bg-[#F5F8FC]">
                  <div className="text-xs text-[#66788A] font-medium">Điểm thi đua tuần này</div>
                  <div className="text-2xl font-bold text-[#08A67A] mt-1 font-mono">{currentWeekScore.finalScore}</div>
                  <div className="text-[11px] text-[#08A67A] mt-0.5 font-medium">
                    Xếp loại: {currentWeekScore.rank}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[#D9E2EC] bg-[#F5F8FC]">
                  <div className="text-xs text-[#66788A] font-medium">Kết quả Rèn luyện</div>
                  <div className="text-2xl font-bold text-[#16324F] mt-1">{student.conduct}</div>
                  <div className="text-[11px] text-[#66788A] mt-0.5">Theo Thông tư 22/BGDĐT</div>
                </div>

                <div className="p-3.5 rounded-xl border border-[#D9E2EC] bg-[#F5F8FC]">
                  <div className="text-xs text-[#66788A] font-medium">Khen thưởng</div>
                  <div className="text-2xl font-bold text-[#172B4D] mt-1">{studentAwards.length}</div>
                  <div className="text-[11px] text-[#66788A] mt-0.5">Lượt khen thưởng</div>
                </div>

                <div className="p-3.5 rounded-xl border border-[#D9E2EC] bg-[#F5F8FC]">
                  <div className="text-xs text-[#66788A] font-medium">Vi phạm nề nếp</div>
                  <div className={`text-2xl font-bold mt-1 ${studentViolations.length > 0 ? 'text-[#F59E0B]' : 'text-[#172B4D]'}`}>
                    {studentViolations.length}
                  </div>
                  <div className="text-[11px] text-[#66788A] mt-0.5">Lượt ghi nhận</div>
                </div>
              </div>

              {/* General Highlights */}
              <div className="p-4 rounded-xl border border-[#D9E2EC] bg-white">
                <h4 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider mb-3">
                  Thông tin tổ chức lớp học
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-[#D9E2EC]/50">
                    <span className="text-[#66788A]">Phân công nhiệm vụ:</span>
                    <span className="font-semibold text-[#172B4D]">{student.role}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#D9E2EC]/50">
                    <span className="text-[#66788A]">Sinh hoạt tại:</span>
                    <span className="font-semibold text-[#172B4D]">Tổ {student.group}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#D9E2EC]/50">
                    <span className="text-[#66788A]">Ban học tập:</span>
                    <span className="font-semibold text-[#172B4D]">Khoa học Tự nhiên</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#D9E2EC]/50">
                    <span className="text-[#66788A]">Trạng thái hồ sơ:</span>
                    <span className="font-semibold text-[#08A67A]">Đã nộp đầy đủ học bạ THCS</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: RÈN LUYỆN (THI ĐUA TUẦN) */}
          {activeTab === 'conduct' && (
            <div className="space-y-5">
              {/* Top 4 KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-[#D9E2EC] bg-[#F5F8FC]">
                  <span className="text-xs text-[#66788A] block font-medium">Điểm tuần hiện tại</span>
                  <div className="text-2xl font-bold font-mono text-[#08A67A] mt-1">
                    {currentWeekScore.finalScore} <span className="text-xs font-normal text-[#66788A]">/100</span>
                  </div>
                  <span className="text-[11px] text-[#08A67A] font-medium block mt-0.5">
                    {currentWeek.name} ({currentWeek.formattedRange})
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#D9E2EC] bg-[#F5F8FC]">
                  <span className="text-xs text-[#66788A] block font-medium">Xếp loại hiện tại</span>
                  <div className="mt-1">
                    <span
                      className={`text-sm font-bold px-2.5 py-1 rounded-md inline-block ${
                        currentWeekScore.rank === 'Tốt'
                          ? 'bg-[#08A67A]/15 text-[#08A67A] border border-[#08A67A]/30'
                          : currentWeekScore.rank === 'Khá'
                          ? 'bg-[#3182CE]/15 text-[#3182CE] border border-[#3182CE]/30'
                          : currentWeekScore.rank === 'Đạt'
                          ? 'bg-[#16324F]/15 text-[#16324F] border border-[#16324F]/30'
                          : 'bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30'
                      }`}
                    >
                      {currentWeekScore.rank}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#66788A] block mt-1.5">Tiêu chuẩn nội bộ lớp</span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#D9E2EC] bg-[#F5F8FC]">
                  <span className="text-xs text-[#66788A] block font-medium">Tổng điểm cộng</span>
                  <div className="text-2xl font-bold font-mono text-[#08A67A] mt-1">
                    +{totalAllBonus} <span className="text-xs font-normal text-[#66788A]">điểm</span>
                  </div>
                  <span className="text-[11px] text-[#66788A] block mt-0.5">Tích cực, bài tập, phong trào</span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#D9E2EC] bg-[#F5F8FC]">
                  <span className="text-xs text-[#66788A] block font-medium">Tổng điểm trừ</span>
                  <div className="text-2xl font-bold font-mono text-[#E5484D] mt-1">
                    -{totalAllPenalty} <span className="text-xs font-normal text-[#66788A]">điểm</span>
                  </div>
                  <span className="text-[11px] text-[#66788A] block mt-0.5">Muộn, quên bài, nội quy</span>
                </div>
              </div>

              {/* Biểu đồ điểm theo từng tuần (6 tuần) */}
              <div className="p-4 rounded-xl border border-[#D9E2EC] bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#08A67A]" />
                    <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                      Biểu đồ điểm rèn luyện theo từng tuần (Học kỳ I)
                    </span>
                  </div>
                  <span className="text-xs text-[#66788A]">Mức chuẩn: 100 điểm</span>
                </div>

                <div className="h-40 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-[#D9E2EC]">
                  {weeklyTrends.map((item, idx) => {
                    const heightPct = Math.max(20, (item.score / 100) * 100);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        <span className="text-[11px] font-bold font-mono text-[#172B4D] mb-1">
                          {item.score}
                        </span>
                        <div
                          className={`w-full max-w-[42px] rounded-t-md transition-all duration-200 ${
                            item.score >= 90
                              ? 'bg-[#08A67A] group-hover:bg-[#07966F]'
                              : item.score >= 80
                              ? 'bg-[#3182CE]'
                              : item.score >= 65
                              ? 'bg-[#16324F]'
                              : 'bg-[#E5484D]'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between gap-3 px-2 text-center">
                  {weeklyTrends.map((item, idx) => (
                    <div key={idx} className="flex-1 text-[11px] text-[#66788A] font-medium">
                      {item.weekName} {item.isCurrent ? '•' : ''}
                    </div>
                  ))}
                </div>
              </div>

              {/* Lịch sử ghi nhận cộng / trừ điểm */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                    Lịch sử ghi nhận sự kiện rèn luyện & thi đua
                  </span>
                  <span className="text-xs text-[#66788A]">Tổng số sự kiện: {studentCompetitionRecords.length}</span>
                </div>

                <div className="border border-[#D9E2EC] rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5F8FC] border-b border-[#D9E2EC] font-semibold text-[#172B4D]">
                      <tr>
                        <th className="py-2.5 px-3">Ngày</th>
                        <th className="py-2.5 px-4 min-w-[200px]">Nội dung & Lý do</th>
                        <th className="py-2.5 px-3 text-center text-[#08A67A]">Cộng</th>
                        <th className="py-2.5 px-3 text-center text-[#E5484D]">Trừ</th>
                        <th className="py-2.5 px-3 text-center font-bold">Điểm sau cập nhật</th>
                        <th className="py-2.5 px-3">Người ghi nhận / Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D9E2EC]/60 text-[#172B4D]">
                      {studentCompetitionRecords.length > 0 ? (
                        studentCompetitionRecords.map((r, i) => {
                          const wScore = calculateStudentWeekScore(student.id, r.weekId, competitionRecords).finalScore;
                          return (
                            <tr key={r.id || i} className="hover:bg-[#F5F8FC] transition-colors">
                              <td className="py-2.5 px-3 font-mono text-[#66788A]">{r.date}</td>
                              <td className="py-2.5 px-4">
                                <span className="font-semibold text-[#172B4D]">{r.reason}</span>
                                {r.note && <p className="text-[11px] text-[#66788A] mt-0.5">{r.note}</p>}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-[#08A67A]">
                                {r.type === 'bonus' ? `+${r.points}` : '—'}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-[#E5484D]">
                                {r.type === 'penalty' ? `-${r.points}` : '—'}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-sm text-[#16324F]">
                                {wScore}
                              </td>
                              <td className="py-2.5 px-3 text-[#66788A]">
                                <span className="font-medium text-[#172B4D]">{r.createdBy}</span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-[#66788A]">
                            Học sinh chưa có vi phạm hoặc cộng điểm riêng trong các tuần qua (duy trì mức 100 điểm xuất phát).
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHUYÊN CẦN */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                  Nhật ký chuyên cần tuần qua
                </span>
                <span className="text-xs text-[#66788A]">Tỷ lệ chuyên cần tháng: 96%</span>
              </div>

              <div className="border border-[#D9E2EC] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F8FC] border-b border-[#D9E2EC] font-semibold text-[#172B4D]">
                    <tr>
                      <th className="py-2.5 px-3">Ngày</th>
                      <th className="py-2.5 px-3">Trạng thái</th>
                      <th className="py-2.5 px-3">Ghi chú của GVCN / Lớp phó</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9E2EC]/60">
                    {mockAttendanceHistory.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F5F8FC]">
                        <td className="py-2.5 px-3 font-mono font-medium text-[#172B4D]">{item.date}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                              item.status === 'Có mặt'
                                ? 'text-[#08A67A] bg-[#08A67A]/10 border border-[#08A67A]/25'
                                : item.status === 'Nghỉ phép'
                                ? 'text-[#3182CE] bg-[#3182CE]/10 border border-[#3182CE]/25'
                                : item.status === 'Đi muộn'
                                ? 'text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/25'
                                : 'text-[#E5484D] bg-[#E5484D]/10 border border-[#E5484D]/25'
                            }`}
                          >
                            {item.status === 'Có mặt' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {item.status === 'Nghỉ phép' && <Clock className="w-3.5 h-3.5" />}
                            {item.status === 'Đi muộn' && <AlertCircle className="w-3.5 h-3.5" />}
                            {item.status === 'Nghỉ không phép' && <XCircle className="w-3.5 h-3.5" />}
                            <span>{item.status}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#66788A]">{item.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: VI PHẠM */}
          {activeTab === 'violations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                  Các vụ việc vi phạm nề nếp đã ghi nhận
                </span>
                <span className="text-xs text-[#66788A]">Tổng cộng: {studentViolations.length}</span>
              </div>

              {studentViolations.length > 0 ? (
                <div className="space-y-3">
                  {studentViolations.map((v) => (
                    <div
                      key={v.id}
                      className="p-3.5 rounded-xl border border-[#D9E2EC] bg-[#F5F8FC] flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[#66788A]">{v.date}</span>
                          <span className="font-bold text-[#172B4D]">{v.description}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-semibold text-[11px] ${
                              v.severity === 'Cảnh cáo'
                                ? 'text-[#E5484D] bg-[#E5484D]/10 border border-[#E5484D]/25'
                                : v.severity === 'Khiển trách'
                                ? 'text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/25'
                                : 'text-[#66788A] bg-[#D9E2EC]'
                            }`}
                          >
                            {v.severity}
                          </span>
                        </div>
                        <div className="text-[#66788A]">
                          <strong className="text-[#172B4D]">Hướng xử lý:</strong> {v.resolution}
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-white border border-[#D9E2EC] text-[#172B4D] self-start sm:self-auto">
                        {v.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-[#D9E2EC] rounded-xl bg-[#F5F8FC]">
                  <ShieldCheck className="w-8 h-8 text-[#08A67A] mx-auto mb-2" />
                  <p className="font-semibold text-[#172B4D] text-sm">Không có ghi nhận vi phạm</p>
                  <p className="text-xs text-[#66788A] mt-1">Học sinh luôn chấp hành tốt nội quy nhà trường và nề nếp lớp học.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: KHEN THƯỞNG */}
          {activeTab === 'awards' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                  Thành tích & Khen thưởng đạt được
                </span>
                <span className="text-xs text-[#66788A]">Tổng cộng: {studentAwards.length}</span>
              </div>

              {studentAwards.length > 0 ? (
                <div className="space-y-3">
                  {studentAwards.map((a) => (
                    <div
                      key={a.id}
                      className="p-3.5 rounded-xl border border-[#08A67A]/25 bg-[#08A67A]/5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[#66788A]">{a.date}</span>
                          <span className="font-bold text-[#172B4D]">{a.title}</span>
                        </div>
                        <div className="text-[#08A67A] font-medium">
                          <strong>Hình thức:</strong> {a.form}
                        </div>
                        <div className="text-[#66788A]">{a.note}</div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-[#08A67A]/15 text-[#08A67A] self-start sm:self-auto shrink-0">
                        Đã công nhận
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-[#D9E2EC] rounded-xl bg-[#F5F8FC]">
                  <Award className="w-8 h-8 text-[#9FB3C8] mx-auto mb-2" />
                  <p className="font-semibold text-[#172B4D] text-sm">Chưa có khen thưởng riêng</p>
                  <p className="text-xs text-[#66788A] mt-1">Học sinh đang trong quá trình phấn đấu thi đua học kỳ I.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: LỊCH SỬ & NHẬT KÝ */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                  Nhật ký theo dõi & Liên hệ của GVCN
                </span>
                <span className="text-xs text-[#66788A]">Được bảo mật nội bộ</span>
              </div>

              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D9E2EC]">
                {mockTeacherLogs.map((log, idx) => (
                  <div key={idx} className="relative text-xs">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#08A67A] ring-4 ring-white" />
                    <div className="flex items-center gap-2 text-[#66788A] mb-1">
                      <span className="font-mono font-semibold text-[#172B4D]">{log.date}</span>
                      <span>·</span>
                      <span className="font-medium text-[#08A67A]">{log.author}</span>
                    </div>
                    <div className="p-3 bg-[#F5F8FC] rounded-lg border border-[#D9E2EC] text-[#172B4D]">
                      {log.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#D9E2EC] bg-[#F5F8FC] flex items-center justify-between">
          <div className="text-xs text-[#66788A]">
            Dữ liệu quản lý nội bộ lớp học · Cập nhật ngày 08/10/2026
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#172B4D] bg-white hover:bg-[#F5F8FC] rounded-lg border border-[#D9E2EC] shadow-xs transition-colors cursor-pointer"
          >
            Đóng hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
};
