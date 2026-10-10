import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  ArrowRight,
  Save,
  CheckCheck,
  UserCheck,
  FileSpreadsheet,
  Coffee,
  Info
} from 'lucide-react';
import { Student, AttendanceRecord, AttendanceStatus, DailyAttendance, CompetitionWeek } from '../../types';
import { generateAcademicWeeks, getDaysInWeek, findWeekByDate } from '../../data/academicWeeks';

interface AttendancePageProps {
  students: Student[];
  currentAttendance: DailyAttendance;
  onSaveAttendance: (updated: DailyAttendance) => void;
  weeks?: CompetitionWeek[];
}

export const AttendancePage: React.FC<AttendancePageProps> = ({
  students,
  currentAttendance,
  onSaveAttendance,
  weeks = generateAcademicWeeks(),
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-10-08'); // Thứ Năm, 08/10/2026
  const [selectedWeekId, setSelectedWeekId] = useState('w5'); // Tuần 5
  const [selectedMonth, setSelectedMonth] = useState('Tháng 10/2026');
  const [restDayNotice, setRestDayNotice] = useState<string | null>(null);

  const currentWeek = weeks.find((w) => w.id === selectedWeekId) || weeks.find((w) => w.isCurrent) || weeks[4];
  const { schoolDays, sundayRestDay } = getDaysInWeek(currentWeek, selectedDate);

  // Maintain local records map for easy editing
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    return students.map((st) => {
      const existing = currentAttendance.records.find((r) => r.studentId === st.id);
      return (
        existing || {
          studentId: st.id,
          studentName: st.fullName,
          group: st.group,
          status: 'present' as AttendanceStatus,
          note: '',
        }
      );
    });
  });

  const [savedSuccessMessage, setSavedSuccessMessage] = useState(false);

  const updateStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    );
  };

  const updateStudentNote = (studentId: string, note: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, note } : r))
    );
  };

  const setAllPresent = () => {
    setRecords((prev) =>
      prev.map((r) => ({
        ...r,
        status: 'present',
      }))
    );
  };

  const handleSave = () => {
    onSaveAttendance({
      date: selectedDate,
      records,
    });
    setSavedSuccessMessage(true);
    setTimeout(() => setSavedSuccessMessage(false), 3000);
  };

  // Calculate live statistics
  const totalCount = records.length;
  const presentCount = records.filter((r) => r.status === 'present').length;
  const excusedCount = records.filter((r) => r.status === 'excused').length;
  const unexcusedCount = records.filter((r) => r.status === 'unexcused').length;
  const lateCount = records.filter((r) => r.status === 'late').length;
  const earlyLeaveCount = records.filter((r) => r.status === 'early_leave').length;

  return (
    <div className="space-y-5">
      {/* Page Title & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
            Sổ điểm danh & Chuyên cần
          </h2>
          <p className="text-xs sm:text-sm text-[#66788A] mt-1">
            Ghi nhận hiện diện từng buổi học · Cập nhật vào sổ theo dõi nề nếp
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={setAllPresent}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#172B4D] bg-white hover:bg-[#F5F8FC] rounded-lg border border-[#D9E2EC] transition-colors shadow-xs cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-[#08A67A]" />
            <span>Đánh dấu tất cả có mặt</span>
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#08A67A] hover:bg-[#07966F] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu điểm danh</span>
          </button>
        </div>
      </div>

      {savedSuccessMessage && (
        <div className="p-3 bg-[#08A67A]/10 border border-[#08A67A]/25 text-[#08A67A] text-xs rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#08A67A]" />
            <span>Đã lưu thành công dữ liệu điểm danh ngày {selectedDate} vào hệ thống.</span>
          </div>
        </div>
      )}

      {/* Academic Week Banner & Convention */}
      <div className="bg-[#16324F]/5 border border-[#16324F]/15 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#08A67A] text-white flex items-center justify-center font-bold text-xs shrink-0">
            T{currentWeek.weekNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#172B4D] text-sm">
                {currentWeek.name}: {currentWeek.formattedRange}
              </span>
              {currentWeek.isCurrent && (
                <span className="px-2 py-0.5 rounded bg-[#08A67A]/15 text-[#08A67A] text-[11px] font-bold border border-[#08A67A]/25">
                  Tuần hiện tại
                </span>
              )}
            </div>
            <p className="text-[#66788A] mt-0.5 text-[11px]">
              Tuần học gồm 6 ngày: Thứ Hai → Thứ Bảy. Chủ nhật là ngày nghỉ (không tính chuyên cần).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#66788A] bg-white px-3 py-1.5 rounded-lg border border-[#D9E2EC]">
          <Clock className="w-3.5 h-3.5 text-[#08A67A]" />
          <span>Hôm nay: Thứ Năm, 08/10/2026</span>
        </div>
      </div>

      {restDayNotice && (
        <div className="p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/25 text-[#172B4D] text-xs rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <Info className="w-4 h-4 text-[#F59E0B] shrink-0" />
            <span>{restDayNotice}</span>
          </div>
          <button
            onClick={() => setRestDayNotice(null)}
            className="text-[#66788A] hover:text-[#172B4D] text-xs underline font-medium cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* 6 School Days Selector Bar (Thứ Hai 05/10 -> Thứ Bảy 10/10 + CN Nghỉ) */}
      <div className="bg-white p-3 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)]">
        <div className="text-xs font-semibold text-[#172B4D] mb-2 flex items-center justify-between">
          <span>Lịch học trong tuần ({currentWeek.name}):</span>
          <span className="text-[11px] font-normal text-[#66788A]">Nhấp chọn ngày để điểm danh</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {schoolDays.map((day) => {
            const isSelected = selectedDate === day.date;
            return (
              <button
                key={day.date}
                type="button"
                onClick={() => {
                  setSelectedDate(day.date);
                  setRestDayNotice(null);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#08A67A] text-white border-[#08A67A] shadow-xs ring-2 ring-[#08A67A]/30'
                    : day.isToday
                    ? 'bg-[#08A67A]/5 border-[#08A67A]/30 text-[#172B4D] hover:bg-[#08A67A]/10'
                    : 'bg-[#F5F8FC] border-[#D9E2EC] text-[#172B4D] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold ${isSelected ? 'text-white' : 'text-[#66788A]'}`}>
                    {day.dayShort} ({day.dayOfWeek})
                  </span>
                  {day.isToday && (
                    <span className={`text-[9px] font-extrabold px-1 rounded ${
                      isSelected ? 'bg-white text-[#08A67A]' : 'bg-[#08A67A] text-white'
                    }`}>
                      HÔM NAY
                    </span>
                  )}
                </div>
                <div className={`text-sm font-extrabold mt-1 font-mono ${isSelected ? 'text-white' : 'text-[#172B4D]'}`}>
                  {day.shortDate}
                </div>
              </button>
            );
          })}

          {/* Sunday Rest Day Card */}
          <button
            type="button"
            onClick={() => {
              setRestDayNotice(`Chủ nhật (${sundayRestDay.fullDate}) là ngày nghỉ cuối tuần theo quy định của lớp. Không diễn ra buổi học, không tính điểm danh và không tính chuyên cần tuần.`);
            }}
            className="p-2.5 rounded-xl border border-dashed border-[#D9E2EC] bg-[#F5F8FC]/60 text-left hover:bg-[#F5F8FC] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#9FB3C8]">CN (Chủ Nhật)</span>
              <Coffee className="w-3 h-3 text-[#9FB3C8]" />
            </div>
            <div className="text-sm font-bold mt-1 font-mono text-[#66788A]">
              {sundayRestDay.shortDate}
            </div>
            <span className="text-[10px] text-[#66788A] block mt-0.5 font-medium">
              Ngày nghỉ
            </span>
          </button>
        </div>
      </div>

      {/* Date, Week, Month Filter Selectors */}
      <div className="bg-white p-4 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] flex flex-wrap gap-4 items-center justify-between text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#172B4D]">Chọn ngày:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                const newDate = e.target.value;
                setSelectedDate(newDate);
                const match = findWeekByDate(newDate, weeks);
                if (match.week) {
                  setSelectedWeekId(match.week.id);
                }
                if (match.isSunday) {
                  setRestDayNotice(`Ngày ${newDate} là Chủ nhật (ngày nghỉ), không tính chuyên cần tuần.`);
                } else {
                  setRestDayNotice(null);
                }
              }}
              className="p-1.5 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:outline-none focus:border-[#08A67A] bg-[#F5F8FC] focus:bg-white font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#172B4D]">Chọn tuần:</span>
            <select
              value={selectedWeekId}
              onChange={(e) => {
                const targetId = e.target.value;
                setSelectedWeekId(targetId);
                const w = weeks.find((item) => item.id === targetId);
                if (w) {
                  setSelectedDate(w.startDate);
                  setRestDayNotice(null);
                }
              }}
              className="p-1.5 border border-[#D9E2EC] rounded-lg text-[#172B4D] bg-[#F5F8FC] focus:bg-white focus:outline-none font-semibold"
            >
              {weeks.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.formattedRange}) {w.isCurrent ? '· Hiện tại' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#172B4D]">Chọn tháng:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-1.5 border border-[#D9E2EC] rounded-lg text-[#172B4D] bg-[#F5F8FC] focus:bg-white focus:outline-none"
            >
              <option value="Tháng 9/2026">Tháng 9/2026</option>
              <option value="Tháng 10/2026">Tháng 10/2026</option>
              <option value="Tháng 11/2026">Tháng 11/2026</option>
              <option value="Tháng 12/2026">Tháng 12/2026</option>
            </select>
          </div>
        </div>

        <div className="text-[#66788A] font-medium">
          Buổi học: <strong className="text-[#172B4D]">Buổi sáng (Tiết 1 - 5)</strong>
        </div>
      </div>

      {/* Summary KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Sĩ số */}
        <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)]">
          <div className="text-xs text-[#66788A] font-medium">Sĩ số danh sách</div>
          <div className="text-2xl font-bold text-[#172B4D] mt-1">{totalCount}</div>
          <div className="text-[11px] text-[#66788A]">100% học sinh</div>
        </div>

        {/* Có mặt */}
        <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)]">
          <div className="text-xs text-[#08A67A] font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#08A67A]" />
            <span>Có mặt</span>
          </div>
          <div className="text-2xl font-bold text-[#08A67A] mt-1">{presentCount}</div>
          <div className="text-[11px] text-[#08A67A] font-medium">
            {((presentCount / (totalCount || 1)) * 100).toFixed(1)}%
          </div>
        </div>

        {/* Nghỉ phép */}
        <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)]">
          <div className="text-xs text-[#3182CE] font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#3182CE]" />
            <span>Nghỉ phép</span>
          </div>
          <div className="text-2xl font-bold text-[#3182CE] mt-1">{excusedCount}</div>
          <div className="text-[11px] text-[#66788A]">Có phụ huynh xin</div>
        </div>

        {/* Nghỉ không phép */}
        <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)]">
          <div className="text-xs text-[#E5484D] font-medium flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-[#E5484D]" />
            <span>Nghỉ không phép</span>
          </div>
          <div className="text-2xl font-bold text-[#E5484D] mt-1">{unexcusedCount}</div>
          <div className="text-[11px] text-[#E5484D] font-medium">
            {unexcusedCount > 0 ? 'Cần liên hệ PH ngay' : 'Không có'}
          </div>
        </div>

        {/* Đi muộn */}
        <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)]">
          <div className="text-xs text-[#F59E0B] font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Đi muộn</span>
          </div>
          <div className="text-2xl font-bold text-[#F59E0B] mt-1">{lateCount}</div>
          <div className="text-[11px] text-[#66788A]">Ghi nhận tiết 1</div>
        </div>

        {/* Về sớm */}
        <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)]">
          <div className="text-xs text-[#805AD5] font-medium">Về sớm</div>
          <div className="text-2xl font-bold text-[#805AD5] mt-1">{earlyLeaveCount}</div>
          <div className="text-[11px] text-[#66788A]">Có lý do sức khỏe</div>
        </div>
      </div>

      {/* Main Attendance Table */}
      <div className="bg-white rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] border-b border-[#D9E2EC] font-semibold text-[#172B4D]">
              <tr>
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-4 min-w-[200px]">Học sinh</th>
                <th className="py-3 px-3 text-center">Có mặt</th>
                <th className="py-3 px-3 text-center">Nghỉ phép</th>
                <th className="py-3 px-3 text-center">Nghỉ K.phép</th>
                <th className="py-3 px-3 text-center">Đi muộn</th>
                <th className="py-3 px-3 text-center">Về sớm</th>
                <th className="py-3 px-4 min-w-[220px]">Ghi chú lý do / Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2EC]/60 text-[#172B4D]">
              {records.map((rec, idx) => {
                const student = students.find((s) => s.id === rec.studentId);
                return (
                  <tr
                    key={rec.studentId}
                    className={`hover:bg-[#F5F8FC] transition-colors ${
                      rec.status === 'unexcused'
                        ? 'bg-[#E5484D]/5'
                        : rec.status === 'late'
                        ? 'bg-[#F59E0B]/5'
                        : ''
                    }`}
                  >
                    {/* STT */}
                    <td className="py-3 px-3 text-center text-[#66788A] font-medium">
                      {idx + 1}
                    </td>

                    {/* Student Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#172B4D]">{rec.studentName}</span>
                        <span className="text-[10px] text-[#66788A] bg-[#F5F8FC] px-1.5 py-0.2 rounded border border-[#D9E2EC]">
                          Tổ {rec.group}
                        </span>
                        {student?.code && (
                          <span className="text-[10px] text-[#9FB3C8] font-mono">
                            {student.code}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Radio Options */}
                    {/* 1. Có mặt */}
                    <td className="py-3 px-3 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer p-1 rounded hover:bg-[#08A67A]/10">
                        <input
                          type="radio"
                          name={`att_${rec.studentId}`}
                          checked={rec.status === 'present'}
                          onChange={() => updateStudentStatus(rec.studentId, 'present')}
                          className="w-4 h-4 accent-[#08A67A] cursor-pointer"
                        />
                      </label>
                    </td>

                    {/* 2. Nghỉ phép */}
                    <td className="py-3 px-3 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer p-1 rounded hover:bg-[#3182CE]/10">
                        <input
                          type="radio"
                          name={`att_${rec.studentId}`}
                          checked={rec.status === 'excused'}
                          onChange={() => updateStudentStatus(rec.studentId, 'excused')}
                          className="w-4 h-4 accent-[#3182CE] cursor-pointer"
                        />
                      </label>
                    </td>

                    {/* 3. Nghỉ K.phép */}
                    <td className="py-3 px-3 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer p-1 rounded hover:bg-[#E5484D]/10">
                        <input
                          type="radio"
                          name={`att_${rec.studentId}`}
                          checked={rec.status === 'unexcused'}
                          onChange={() => updateStudentStatus(rec.studentId, 'unexcused')}
                          className="w-4 h-4 accent-[#E5484D] cursor-pointer"
                        />
                      </label>
                    </td>

                    {/* 4. Đi muộn */}
                    <td className="py-3 px-3 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer p-1 rounded hover:bg-[#F59E0B]/10">
                        <input
                          type="radio"
                          name={`att_${rec.studentId}`}
                          checked={rec.status === 'late'}
                          onChange={() => updateStudentStatus(rec.studentId, 'late')}
                          className="w-4 h-4 accent-[#F59E0B] cursor-pointer"
                        />
                      </label>
                    </td>

                    {/* 5. Về sớm */}
                    <td className="py-3 px-3 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer p-1 rounded hover:bg-[#805AD5]/10">
                        <input
                          type="radio"
                          name={`att_${rec.studentId}`}
                          checked={rec.status === 'early_leave'}
                          onChange={() => updateStudentStatus(rec.studentId, 'early_leave')}
                          className="w-4 h-4 accent-[#805AD5] cursor-pointer"
                        />
                      </label>
                    </td>

                    {/* Ghi chú */}
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={rec.note || ''}
                        onChange={(e) => updateStudentNote(rec.studentId, e.target.value)}
                        placeholder="Ghi chú nguyên nhân nếu có..."
                        className="w-full px-2.5 py-1 text-xs border border-[#D9E2EC] rounded-lg text-[#172B4D] bg-[#F5F8FC] focus:bg-white focus:outline-none focus:border-[#08A67A]"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#F5F8FC] border-t border-[#D9E2EC] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#66788A]">
          <span>* Quy định: Học sinh nghỉ học không phép quá 3 buổi trong tháng sẽ gửi giấy báo về phụ huynh.</span>
          <span className="font-semibold text-[#172B4D]">GVCN: Thầy Nguyễn Văn Xuyên đã ký xác nhận</span>
        </div>
      </div>
    </div>
  );
};
