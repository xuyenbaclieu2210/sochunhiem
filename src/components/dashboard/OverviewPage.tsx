import React from 'react';
import {
  Users,
  UserCheck,
  AlertTriangle,
  Award,
  HeartHandshake,
  CalendarCheck,
  ArrowRight,
  Eye,
  Medal
} from 'lucide-react';
import {
  ATTENDANCE_7DAYS_DATA,
  MONTHLY_VIOLATIONS_DATA,
  INITIAL_COMPETITION_WEEKS,
  INITIAL_COMPETITION_RECORDS,
  calculateStudentWeekScore
} from '../../data/mockData';
import {
  ConcernStudent,
  Student,
  CompetitionRecord,
  CompetitionWeek,
  CompetitionSettings
} from '../../types';

interface OverviewPageProps {
  concernStudents: ConcernStudent[];
  allStudents: Student[];
  onViewStudentProfile: (studentId: string) => void;
  onNavigateToTab: (tab: any) => void;
  competitionRecords?: CompetitionRecord[];
  competitionWeeks?: CompetitionWeek[];
  competitionSettings?: CompetitionSettings;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  concernStudents,
  allStudents,
  onViewStudentProfile,
  onNavigateToTab,
  competitionRecords = INITIAL_COMPETITION_RECORDS,
  competitionWeeks = INITIAL_COMPETITION_WEEKS,
  competitionSettings,
}) => {
  // Compute live Weekly Competition stats for current week (w5)
  const currentWeek = competitionWeeks.find((w) => w.isCurrent) || competitionWeeks[competitionWeeks.length - 1];
  const weeklyScores = allStudents.map((st) => calculateStudentWeekScore(st.id, currentWeek.id, competitionRecords));
  const weekAvg = (weeklyScores.reduce((acc, s) => acc + s.finalScore, 0) / (weeklyScores.length || 1)).toFixed(1);
  const weekGoodCount = weeklyScores.filter((s) => s.rank === 'Tốt').length;
  const weekFairCount = weeklyScores.filter((s) => s.rank === 'Khá').length;
  const weekPassCount = weeklyScores.filter((s) => s.rank === 'Đạt').length;
  const weekFailCount = weeklyScores.filter((s) => s.rank === 'Chưa đạt').length;

  // Trend for 6 weeks
  const competition6WeeksTrend = competitionWeeks.map((w) => {
    const scores = allStudents.map((st) => calculateStudentWeekScore(st.id, w.id, competitionRecords).finalScore);
    const avg = Number((scores.reduce((a, b) => a + b, 0) / (scores.length || 1)).toFixed(1));
    return {
      weekName: w.name,
      avg,
      isCurrent: w.isCurrent,
    };
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
            Tổng quan
          </h2>
          <p className="text-xs sm:text-sm text-[#66788A] mt-1">
            Báo cáo tổng hợp số liệu học tập, nề nếp và rèn luyện năm học 2026–2027
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('attendance')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#08A67A] bg-[#08A67A]/10 hover:bg-[#08A67A]/15 rounded-lg border border-[#08A67A]/25 transition-colors"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Điểm danh</span>
          </button>
          <button
            onClick={() => onNavigateToTab('competition')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#16324F] bg-[#16324F]/10 hover:bg-[#16324F]/15 rounded-lg border border-[#16324F]/25 transition-colors"
          >
            <Medal className="w-4 h-4 text-[#08A67A]" />
            <span>Thi đua tuần</span>
          </button>
        </div>
      </div>

      {/* 7 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* Total Students */}
        <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] flex flex-col justify-between h-full min-w-0">
          <div>
            <div className="flex items-center justify-between text-[#66788A] mb-1.5">
              <span className="text-xs font-medium truncate">Tổng số HS</span>
              <Users className="w-4 h-4 text-[#9FB3C8] shrink-0 ml-1" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#172B4D] leading-tight">42</div>
          </div>
          <div className="text-[11px] text-[#66788A] mt-2 truncate">Sĩ số ổn định</div>
        </div>

        {/* Male */}
        <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] flex flex-col justify-between h-full min-w-0">
          <div>
            <div className="flex items-center justify-between text-[#66788A] mb-1.5">
              <span className="text-xs font-medium truncate">Nam</span>
              <span className="text-[11px] text-[#3182CE] font-semibold bg-[#3182CE]/10 px-1.5 py-0.2 rounded shrink-0 ml-1">47.6%</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#172B4D] leading-tight">20</div>
          </div>
          <div className="text-[11px] text-[#66788A] mt-2 truncate">Học sinh nam</div>
        </div>

        {/* Female */}
        <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] flex flex-col justify-between h-full min-w-0">
          <div>
            <div className="flex items-center justify-between text-[#66788A] mb-1.5">
              <span className="text-xs font-medium truncate">Nữ</span>
              <span className="text-[11px] text-[#08A67A] font-semibold bg-[#08A67A]/10 px-1.5 py-0.2 rounded shrink-0 ml-1">52.4%</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#172B4D] leading-tight">22</div>
          </div>
          <div className="text-[11px] text-[#66788A] mt-2 truncate">Học sinh nữ</div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] flex flex-col justify-between h-full min-w-0">
          <div>
            <div className="flex items-center justify-between text-[#66788A] mb-1.5">
              <span className="text-xs font-medium truncate">Chuyên cần</span>
              <UserCheck className="w-4 h-4 text-[#08A67A] shrink-0 ml-1" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#08A67A] leading-tight">96,4%</div>
          </div>
          <div className="text-[11px] text-[#08A67A] font-medium mt-2 truncate">Đạt mức Tốt</div>
        </div>

        {/* Violations */}
        <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] flex flex-col justify-between h-full min-w-0">
          <div>
            <div className="flex items-center justify-between text-[#66788A] mb-1.5">
              <span className="text-xs font-medium truncate">Vi phạm/tháng</span>
              <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 ml-1" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#F59E0B] leading-tight">3</div>
          </div>
          <div className="text-[11px] text-[#66788A] mt-2 truncate">Giảm so với T9</div>
        </div>

        {/* Concern */}
        <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] flex flex-col justify-between h-full min-w-0">
          <div>
            <div className="flex items-center justify-between text-[#66788A] mb-1.5">
              <span className="text-xs font-medium truncate">Cần quan tâm</span>
              <HeartHandshake className="w-4 h-4 text-[#E5484D] shrink-0 ml-1" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#E5484D] leading-tight">4</div>
          </div>
          <div className="text-[11px] text-[#E5484D] font-medium mt-2 truncate">Cần hỗ trợ học tập</div>
        </div>

        {/* Awards */}
        <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] flex flex-col justify-between h-full min-w-0">
          <div>
            <div className="flex items-center justify-between text-[#66788A] mb-1.5">
              <span className="text-xs font-medium truncate">Khen thưởng</span>
              <Award className="w-4 h-4 text-[#08A67A] shrink-0 ml-1" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#08A67A] leading-tight">6</div>
          </div>
          <div className="text-[11px] text-[#66788A] mt-2 truncate">Trong tháng 10</div>
        </div>
      </div>

      {/* Card "Thi đua tuần" Dashboard Widget */}
      <div className="bg-white p-5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#08A67A]/15 border border-[#08A67A]/25 flex items-center justify-center text-[#08A67A] shrink-0 font-bold">
            <Medal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-[#172B4D]">
                Thi đua tuần ({currentWeek.name}: {currentWeek.formattedRange})
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#08A67A]/10 text-[#08A67A] border border-[#08A67A]/20">
                100 điểm xuất phát
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#16324F]/10 text-[#16324F] border border-[#16324F]/20 font-mono">
                Thứ 2 → Thứ 7
              </span>
            </div>
            <p className="text-xs text-[#66788A] mt-0.5">
              Tự động cộng/trừ điểm và xếp hạng rèn luyện học sinh theo tiêu chuẩn nội bộ của lớp (Chủ nhật 11/10 nghỉ)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Điểm TB tuần */}
          <div className="px-3.5 py-2 bg-[#F5F8FC] rounded-lg border border-[#D9E2EC] text-center min-w-[90px]">
            <span className="text-[#66788A] block text-[11px] font-medium">Điểm TB tuần</span>
            <span className="text-lg font-bold font-mono text-[#08A67A]">{weekAvg}</span>
          </div>

          {/* Số HS Tốt */}
          <div className="px-3 py-2 bg-[#08A67A]/5 rounded-lg border border-[#08A67A]/20 text-center min-w-[70px]">
            <span className="text-[#08A67A] block text-[11px] font-semibold">Tốt</span>
            <span className="text-base font-bold text-[#08A67A]">{weekGoodCount} HS</span>
          </div>

          {/* Số HS Khá */}
          <div className="px-3 py-2 bg-[#3182CE]/5 rounded-lg border border-[#3182CE]/20 text-center min-w-[70px]">
            <span className="text-[#3182CE] block text-[11px] font-semibold">Khá</span>
            <span className="text-base font-bold text-[#3182CE]">{weekFairCount} HS</span>
          </div>

          {/* Số HS Đạt */}
          <div className="px-3 py-2 bg-[#16324F]/5 rounded-lg border border-[#16324F]/20 text-center min-w-[70px]">
            <span className="text-[#16324F] block text-[11px] font-semibold">Đạt</span>
            <span className="text-base font-bold text-[#172B4D]">{weekPassCount} HS</span>
          </div>

          {/* Số HS Chưa đạt */}
          <div className="px-3 py-2 bg-[#E5484D]/5 rounded-lg border border-[#E5484D]/20 text-center min-w-[75px]">
            <span className="text-[#E5484D] block text-[11px] font-semibold">Chưa đạt</span>
            <span className={`text-base font-bold ${weekFailCount > 0 ? 'text-[#E5484D]' : 'text-[#66788A]'}`}>
              {weekFailCount} HS
            </span>
          </div>

          <button
            onClick={() => onNavigateToTab('competition')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#08A67A] hover:bg-[#07966F] rounded-lg shadow-xs transition-colors cursor-pointer ml-auto sm:ml-0"
          >
            <span>Vào sổ thi đua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Charts Grid: Chuyên cần, Vi phạm và Xu hướng thi đua */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Tình hình chuyên cần trong tuần */}
        <div className="bg-white p-5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#172B4D]">
                  1. Chuyên cần các ngày học Tuần 5 (05/10 – 10/10)
                </h3>
                <p className="text-xs text-[#66788A] mt-0.5">
                  Thứ Hai → Thứ Bảy là ngày học · Chủ nhật nghỉ
                </p>
              </div>
              <span className="text-xs font-semibold text-[#08A67A] bg-[#08A67A]/10 px-2.5 py-1 rounded border border-[#08A67A]/25">
                TB Tuần: 97.7%
              </span>
            </div>

            {/* Bar chart visualization */}
            <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-1 border-b border-[#D9E2EC]">
              {ATTENDANCE_7DAYS_DATA.map((item, index) => {
                const heightPct = Math.max(15, (item.rate - 80) * 5);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#16324F] text-white text-[11px] px-2 py-0.5 rounded shadow whitespace-nowrap z-10 pointer-events-none">
                      {item.rate}% ({item.present}/42 HS)
                    </div>
                    <span className="text-[11px] font-semibold text-[#172B4D] mb-1">
                      {item.rate}%
                    </span>
                    <div
                      className="w-full max-w-[36px] bg-[#08A67A] group-hover:bg-[#07966F] rounded-t-md transition-all duration-200"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between gap-2 mt-2 px-1 text-center">
              {ATTENDANCE_7DAYS_DATA.map((item, idx) => (
                <div key={idx} className="flex-1 text-[11px] text-[#66788A] font-medium truncate">
                  {item.day}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#D9E2EC]/60 flex items-center justify-between text-xs text-[#66788A]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#08A67A] inline-block" />
              Sĩ số 42 học sinh
            </span>
            <span>Số vắng trung bình: 1 - 2 HS/ngày</span>
          </div>
        </div>

        {/* Chart 2: Số vi phạm theo tháng */}
        <div className="bg-white p-5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#172B4D]">
                2. Số vi phạm nề nếp theo tháng
              </h3>
              <p className="text-xs text-[#66788A] mt-0.5">
                Theo dõi xu hướng thực hiện nội quy học sinh
              </p>
            </div>
            <span className="text-xs font-semibold text-[#08A67A] bg-[#08A67A]/10 px-2 py-0.5 rounded border border-[#08A67A]/25">
              Xu hướng giảm (-40%)
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3 py-4">
            {MONTHLY_VIOLATIONS_DATA.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#F5F8FC] p-3 rounded-lg border border-[#D9E2EC] text-center flex flex-col justify-between"
              >
                <div className="text-xs text-[#66788A] font-medium">{item.month}</div>
                <div className="my-2">
                  <span
                    className={`text-2xl font-bold ${
                      item.count > 4
                        ? 'text-[#E5484D]'
                        : item.count > 0
                        ? 'text-[#F59E0B]'
                        : 'text-[#66788A]/50'
                    }`}
                  >
                    {item.count}
                  </span>
                  <span className="text-xs text-[#66788A] block">vụ việc</span>
                </div>
                <div className="text-[10px] text-[#66788A]/80">
                  {idx === 0
                    ? 'Đầu năm học'
                    : idx === 1
                    ? 'Đang diễn ra'
                    : 'Mục tiêu: 0'}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#D9E2EC]/60 flex items-center justify-between text-xs text-[#66788A]">
            <span>Chủ yếu: Quên BTVN (2), Đi muộn (3), Đồng phục (1)</span>
            <button
              onClick={() => onNavigateToTab('violations')}
              className="text-[#08A67A] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Xem sổ vi phạm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Chart 3: Xu hướng điểm thi đua 6 tuần gần nhất */}
        <div className="bg-white p-5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
                <Medal className="w-4 h-4 text-[#08A67A]" />
                <span>3. Xu hướng điểm thi đua 6 tuần gần nhất (Học kỳ I)</span>
              </h3>
              <p className="text-xs text-[#66788A] mt-0.5">
                Điểm rèn luyện trung bình toàn lớp qua từng tuần (thang điểm 100)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#08A67A] bg-[#08A67A]/10 px-2.5 py-1 rounded border border-[#08A67A]/25">
                Hiện tại ({currentWeek.name}): {weekAvg} điểm
              </span>
              <button
                onClick={() => onNavigateToTab('competition')}
                className="text-xs font-semibold text-[#08A67A] hover:underline flex items-center gap-1"
              >
                <span>Sổ thi đua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-44 flex items-end justify-between gap-4 pt-6 pb-2 px-4 border-b border-[#D9E2EC]">
            {competition6WeeksTrend.map((item, index) => {
              const heightPct = Math.max(25, (item.avg - 70) * 3.3);
              return (
                <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#16324F] text-white text-[11px] px-2 py-0.5 rounded shadow whitespace-nowrap z-10 pointer-events-none">
                    {item.weekName}: {item.avg} điểm {item.isCurrent ? '(Đang diễn ra)' : ''}
                  </div>
                  <span className="text-xs font-bold font-mono text-[#172B4D] mb-1">
                    {item.avg}
                  </span>
                  <div
                    className={`w-full max-w-[48px] rounded-t-md transition-all duration-200 ${
                      item.isCurrent
                        ? 'bg-[#08A67A] group-hover:bg-[#07966F]'
                        : 'bg-[#3182CE] group-hover:bg-[#2563EB]'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between gap-4 mt-2 px-4 text-center">
            {competition6WeeksTrend.map((item, idx) => (
              <div key={idx} className="flex-1 text-xs text-[#66788A] font-medium">
                {item.weekName} {item.isCurrent ? <strong className="text-[#08A67A]">(Nay)</strong> : ''}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#D9E2EC]/60 flex items-center justify-between text-xs text-[#66788A]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#08A67A] inline-block" />
              Điểm duy trì mức Tốt (&ge; 90 điểm) qua tất cả các tuần đầu năm học
            </span>
            <span className="font-medium text-[#172B4D]">
              Tổ dẫn đầu hiện tại: <strong>Tổ 1 (94,2)</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Học sinh cần quan tâm Section */}
      <div className="bg-white rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] overflow-hidden">
        <div className="p-5 border-b border-[#D9E2EC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5484D] animate-pulse" />
              <h3 className="text-base font-bold text-[#172B4D]">
                Học sinh cần quan tâm đặc biệt ({concernStudents.length})
              </h3>
            </div>
            <p className="text-xs text-[#66788A] mt-1">
              Dựa trên dữ liệu điểm số, chuyên cần và nề nếp cần GVCN theo dõi sát sao
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('concern')}
            className="text-xs font-semibold text-[#08A67A] hover:text-[#07966F] flex items-center gap-1 self-start sm:self-auto transition-colors"
          >
            <span>Xem danh sách đầy đủ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-[#D9E2EC]/60">
          {concernStudents.map((item) => {
            const student = allStudents.find((s) => s.id === item.studentId);
            return (
              <div
                key={item.studentId}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#F5F8FC] transition-colors"
              >
                {/* Left info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#16324F]/10 border border-[#16324F]/15 flex items-center justify-center font-bold text-[#16324F] shrink-0 text-sm overflow-hidden">
                    {student?.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt={item.studentName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      item.studentName.slice(-2)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#172B4D] text-sm">
                        {item.studentName}
                      </span>
                      <span className="text-xs text-[#66788A]">· {item.code}</span>
                      <span className="text-xs text-[#66788A]">· Tổ {student?.group || 1}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          item.level === 'high'
                            ? 'text-[#E5484D] bg-[#E5484D]/10 border border-[#E5484D]/25'
                            : 'text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/25'
                        }`}
                      >
                        {item.level === 'high' ? '🔴 Cần quan tâm cao' : '🟡 Cần theo dõi'}
                      </span>
                    </div>

                    {/* Reasons */}
                    <div className="mt-2 space-y-1">
                      {item.reasons.map((r, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-[#66788A]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#9FB3C8] shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 text-xs text-[#172B4D] bg-[#08A67A]/5 px-2.5 py-1.5 rounded border border-[#08A67A]/20 inline-block">
                      <strong className="text-[#08A67A]">Hướng xử lý của GVCN:</strong> {item.suggestedAction}
                    </div>
                  </div>
                </div>

                {/* Right button */}
                <div className="flex items-center gap-2 lg:self-center shrink-0">
                  <button
                    onClick={() => onViewStudentProfile(item.studentId)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#172B4D] bg-white hover:bg-[#F5F8FC] rounded-lg border border-[#D9E2EC] shadow-xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#66788A]" />
                    <span>Xem hồ sơ</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
