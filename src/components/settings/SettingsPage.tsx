import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  School,
  UserCheck,
  RotateCcw,
  Sliders,
  Shield,
  Bell,
  BookOpen,
  Medal,
  Plus,
  Trash2,
  Info,
  Calendar,
  Coffee
} from 'lucide-react';
import {
  ClassInfo,
  Student,
  CompetitionSettings,
  CompetitionCriteria,
  CompetitionWeek
} from '../../types';
import { INITIAL_COMPETITION_SETTINGS, INITIAL_COMPETITION_WEEKS } from '../../data/mockData';
import { generateAcademicWeeks, DEFAULT_ACADEMIC_CONFIG } from '../../data/academicWeeks';

interface SettingsPageProps {
  classInfo: ClassInfo;
  students: Student[];
  competitionSettings?: CompetitionSettings;
  competitionWeeks?: CompetitionWeek[];
  onSaveClassInfo: (updated: ClassInfo) => void;
  onSaveCompetitionSettings?: (updated: CompetitionSettings) => void;
  onSaveCompetitionWeeks?: (updated: CompetitionWeek[]) => void;
  onResetMockData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  classInfo,
  students,
  competitionSettings = INITIAL_COMPETITION_SETTINGS,
  competitionWeeks = INITIAL_COMPETITION_WEEKS,
  onSaveClassInfo,
  onSaveCompetitionSettings,
  onSaveCompetitionWeeks,
  onResetMockData,
}) => {
  const [form, setForm] = useState<ClassInfo>({ ...classInfo });
  const [compSettings, setCompSettings] = useState<CompetitionSettings>({ ...competitionSettings });
  const [weeksList, setWeeksList] = useState<CompetitionWeek[]>([...competitionWeeks]);
  const [yearStartDate, setYearStartDate] = useState<string>(DEFAULT_ACADEMIC_CONFIG.academicYearStart);
  const [currentWeekNum, setCurrentWeekNum] = useState<number>(DEFAULT_ACADEMIC_CONFIG.currentWeekNumber);
  const [newCriteriaName, setNewCriteriaName] = useState('');
  const [newCriteriaType, setNewCriteriaType] = useState<'bonus' | 'penalty'>('bonus');
  const [newCriteriaPoints, setNewCriteriaPoints] = useState<number>(2);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Settings preferences
  const [gradeThreshold, setGradeThreshold] = useState(5.0);
  const [absenceWarningThreshold, setAbsenceWarningThreshold] = useState(2);

  const handleUpdateCriteriaPoints = (critId: string, pts: number) => {
    setCompSettings((prev) => ({
      ...prev,
      criteria: prev.criteria.map((c) => (c.id === critId ? { ...c, defaultPoints: pts } : c)),
    }));
  };

  const handleDeleteCriteria = (critId: string) => {
    setCompSettings((prev) => ({
      ...prev,
      criteria: prev.criteria.filter((c) => c.id !== critId),
    }));
  };

  const handleAddCriteria = () => {
    if (!newCriteriaName.trim()) return;
    const newCrit: CompetitionCriteria = {
      id: `c_custom_${Date.now()}`,
      name: newCriteriaName.trim(),
      type: newCriteriaType,
      defaultPoints: Number(newCriteriaPoints),
      category: 'Tùy chỉnh',
    };
    setCompSettings((prev) => ({
      ...prev,
      criteria: [...prev.criteria, newCrit],
    }));
    setNewCriteriaName('');
    setNewCriteriaPoints(2);
  };

  const handleRecalculateWeeks = (newStart: string, newCurrentNum: number) => {
    setYearStartDate(newStart);
    setCurrentWeekNum(newCurrentNum);
    const updated = generateAcademicWeeks(newStart, 18, newCurrentNum);
    setWeeksList(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveClassInfo(form);
    if (onSaveCompetitionSettings) {
      onSaveCompetitionSettings(compSettings);
    }
    if (onSaveCompetitionWeeks) {
      onSaveCompetitionWeeks(weeksList);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục lại dữ liệu mẫu ban đầu?')) {
      onResetMockData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#16324F]" />
          <span>Cài đặt hệ thống</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#66788A] mt-1">
          Quản lý thông tin chung của lớp học, ban cán sự và các thông số quản trị
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-[#08A67A]/10 border border-[#08A67A]/25 text-[#08A67A] text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#08A67A] shrink-0" />
          <span>Đã lưu thành công các thông tin thiết lập lớp học.</span>
        </div>
      )}

      {resetSuccess && (
        <div className="p-3.5 bg-[#3182CE]/10 border border-[#3182CE]/25 text-[#3182CE] text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#3182CE] shrink-0" />
          <span>Đã khôi phục toàn bộ dữ liệu mẫu ban đầu thành công.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Class Details Card */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D9E2EC]/60">
            <School className="w-5 h-5 text-[#08A67A]" />
            <h3 className="font-bold text-[#172B4D] text-sm">
              Thông tin hành chính lớp học
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-[#172B4D]">Tên lớp</label>
              <input
                type="text"
                required
                value={form.className}
                onChange={(e) => setForm({ ...form, className: e.target.value })}
                className="w-full p-2.5 border border-[#D9E2EC] bg-[#F5F8FC] focus:bg-white rounded-lg text-[#172B4D] font-semibold focus:ring-2 focus:ring-[#08A67A]/20 focus:border-[#08A67A] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#172B4D]">Năm học</label>
              <input
                type="text"
                required
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                className="w-full p-2.5 border border-[#D9E2EC] bg-[#F5F8FC] focus:bg-white rounded-lg text-[#172B4D] font-semibold focus:ring-2 focus:ring-[#08A67A]/20 focus:border-[#08A67A] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#172B4D]">Giáo viên chủ nhiệm</label>
              <input
                type="text"
                required
                value={form.homeroomTeacher}
                onChange={(e) => setForm({ ...form, homeroomTeacher: e.target.value })}
                className="w-full p-2.5 border border-[#D9E2EC] bg-[#F5F8FC] focus:bg-white rounded-lg text-[#172B4D] font-semibold focus:ring-2 focus:ring-[#08A67A]/20 focus:border-[#08A67A] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#172B4D]">Phòng học</label>
              <input
                type="text"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                className="w-full p-2.5 border border-[#D9E2EC] bg-[#F5F8FC] focus:bg-white rounded-lg text-[#172B4D] focus:border-[#08A67A] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Officers Assignment Card */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D9E2EC]/60">
            <UserCheck className="w-5 h-5 text-[#3182CE]" />
            <h3 className="font-bold text-[#172B4D] text-sm">
              Ban cán sự lớp & Cán bộ phụ trách
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-[#172B4D]">Lớp trưởng</label>
              <select
                value={form.monitorName}
                onChange={(e) => setForm({ ...form, monitorName: e.target.value })}
                className="w-full p-2.5 border border-[#D9E2EC] bg-[#F5F8FC] focus:bg-white rounded-lg text-[#172B4D] font-semibold focus:border-[#08A67A] focus:outline-none"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.fullName}>
                    {st.fullName} ({st.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#172B4D]">Lớp phó học tập</label>
              <select
                value={form.viceMonitorName}
                onChange={(e) => setForm({ ...form, viceMonitorName: e.target.value })}
                className="w-full p-2.5 border border-[#D9E2EC] bg-[#F5F8FC] focus:bg-white rounded-lg text-[#172B4D] font-semibold focus:border-[#08A67A] focus:outline-none"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.fullName}>
                    {st.fullName} ({st.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Warning Thresholds */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D9E2EC]/60">
            <Sliders className="w-5 h-5 text-[#F59E0B]" />
            <h3 className="font-bold text-[#172B4D] text-sm">
              Ngưỡng cảnh báo tự động
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-[#F5F8FC] rounded-lg border border-[#D9E2EC] space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#172B4D]">Ngưỡng cảnh báo điểm thấp:</span>
                <span className="font-bold text-[#E5484D] text-sm">{gradeThreshold.toFixed(1)}</span>
              </div>
              <p className="text-[11px] text-[#66788A]">
                Các bài kiểm tra thường xuyên và định kỳ có điểm &lt; {gradeThreshold.toFixed(1)} sẽ tự động kích hoạt cảnh báo đỏ.
              </p>
              <input
                type="range"
                min="4.0"
                max="6.0"
                step="0.5"
                value={gradeThreshold}
                onChange={(e) => setGradeThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#E5484D]"
              />
            </div>

            <div className="p-3 bg-[#F5F8FC] rounded-lg border border-[#D9E2EC] space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#172B4D]">Số buổi vắng không phép cảnh báo:</span>
                <span className="font-bold text-[#F59E0B] text-sm">{absenceWarningThreshold} buổi</span>
              </div>
              <p className="text-[11px] text-[#66788A]">
                Học sinh vắng không phép &ge; {absenceWarningThreshold} buổi sẽ được đưa vào danh sách cần liên hệ phụ huynh.
              </p>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={absenceWarningThreshold}
                onChange={(e) => setAbsenceWarningThreshold(parseInt(e.target.value))}
                className="w-full accent-[#F59E0B]"
              />
            </div>
          </div>
        </div>

        {/* Cấu hình Quy ước Tuần học Lớp 10A1 */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]/60">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#08A67A]" />
              <div>
                <h3 className="font-bold text-[#172B4D] text-sm">
                  Cấu hình Quy ước Tuần học
                </h3>
                <p className="text-[11px] text-[#66788A]">
                  Đánh số tuần theo năm học của lớp (Thứ Hai → Thứ Bảy, CN nghỉ, không dùng ISO week)
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#08A67A] bg-[#08A67A]/10 px-2.5 py-1 rounded border border-[#08A67A]/25">
              Tuần hiện tại: Tuần {currentWeekNum}
            </span>
          </div>

          {/* Explanation Box */}
          <div className="p-3 bg-[#16324F]/5 border border-[#16324F]/15 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#172B4D]">
              <Info className="w-4 h-4 text-[#08A67A]" />
              <span>Quy tắc tuần học của lớp:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-[#66788A] text-[11px]">
              <li><strong>Tuần 5:</strong> Thứ Hai 05/10/2026 → Thứ Bảy 10/10/2026 (05/10/2026 = Tuần 5, 08/10/2026 = Tuần 5).</li>
              <li><strong>Chủ nhật 11/10/2026:</strong> Không thuộc tuần học, là ngày nghỉ, không tính chuyên cần và không tính thi đua.</li>
              <li>Mỗi tuần học gồm đúng <strong>6 ngày học</strong> (Thứ Hai đến Thứ Bảy).</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Input Start Date */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#172B4D]">
                Ngày bắt đầu năm học (Thứ Hai Tuần 1)
              </label>
              <input
                type="date"
                value={yearStartDate}
                onChange={(e) => handleRecalculateWeeks(e.target.value, currentWeekNum)}
                className="w-full p-2 border border-[#D9E2EC] bg-[#F5F8FC] focus:bg-white rounded-lg text-[#172B4D] font-mono focus:border-[#08A67A] focus:outline-none"
              />
              <span className="text-[11px] text-[#66788A] block">
                Mặc định: 07/09/2026 (Thứ Hai tựu trường)
              </span>
            </div>

            {/* Input Current Week Number */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#172B4D]">
                Thiết lập số tuần hiện tại
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={currentWeekNum}
                  onChange={(e) => handleRecalculateWeeks(yearStartDate, Number(e.target.value))}
                  className="w-full p-2 border border-[#D9E2EC] bg-[#F5F8FC] focus:bg-white rounded-lg text-[#172B4D] font-bold focus:border-[#08A67A] focus:outline-none"
                >
                  {weeksList.slice(0, 10).map((w) => (
                    <option key={w.id} value={w.weekNumber}>
                      {w.name} ({w.formattedRange}) {w.weekNumber === 5 ? '· Quy ước chuẩn' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-[11px] text-[#08A67A] font-semibold block">
                Hiện đang chọn: Tuần {currentWeekNum} ({weeksList.find(w => w.weekNumber === currentWeekNum)?.formattedRange})
              </span>
            </div>
          </div>

          {/* Quick Schedule Preview Table */}
          <div className="border border-[#D9E2EC] rounded-xl overflow-hidden mt-2">
            <div className="bg-[#F5F8FC] px-3 py-2 text-xs font-semibold text-[#172B4D] border-b border-[#D9E2EC] flex items-center justify-between">
              <span>Bảng phân bổ tuần học Học kỳ 1 (2026–2027)</span>
              <span className="text-[11px] font-normal text-[#66788A]">Hiển thị 8 tuần đầu</span>
            </div>
            <div className="max-h-48 overflow-y-auto divide-y divide-[#D9E2EC]/60 text-xs">
              {weeksList.slice(0, 8).map((w) => (
                <div
                  key={w.id}
                  className={`px-3 py-2 flex items-center justify-between ${
                    w.weekNumber === currentWeekNum ? 'bg-[#08A67A]/10 font-bold' : 'hover:bg-[#F5F8FC]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-16 ${w.weekNumber === currentWeekNum ? 'text-[#08A67A]' : 'text-[#172B4D]'}`}>
                      {w.name}
                    </span>
                    <span className="text-[#66788A] font-mono">{w.formattedRange}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#66788A] hidden sm:inline">6 ngày học (T2–T7)</span>
                    {w.weekNumber === currentWeekNum ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#08A67A] text-white">
                        Hiện tại
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRecalculateWeeks(yearStartDate, w.weekNumber)}
                        className="text-[11px] text-[#3182CE] hover:underline cursor-pointer"
                      >
                        Đặt làm hiện tại
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Competition Settings Card */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]/60">
            <div className="flex items-center gap-2">
              <Medal className="w-5 h-5 text-[#08A67A]" />
              <h3 className="font-bold text-[#172B4D] text-sm">
                Thiết lập Thi đua & Rèn luyện tuần
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-[#08A67A] bg-[#08A67A]/10 px-2 py-0.5 rounded">
              Khởi điểm: 100 điểm/tuần
            </span>
          </div>

          {/* Internal assessment note */}
          <div className="p-3 bg-[#3182CE]/5 border border-[#3182CE]/20 rounded-lg text-xs text-[#66788A] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#3182CE] mt-0.5 shrink-0" />
            <p>
              Đây là hệ thống điểm thi đua/rèn luyện nội bộ của lớp. Không tự động khẳng định đây là kết quả đánh giá chính thức của nhà trường.
            </p>
          </div>

          {/* 1. Ngưỡng xếp loại rèn luyện */}
          <div className="space-y-3">
            <span className="font-bold text-[#172B4D] text-xs block">
              1. Ngưỡng điểm xếp loại rèn luyện:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#F5F8FC] rounded-lg border border-[#D9E2EC] space-y-1">
                <label className="font-semibold text-[#08A67A] block">Ngưỡng Tốt (&ge; điểm)</label>
                <input
                  type="number"
                  min={70}
                  max={100}
                  value={compSettings.thresholds.good}
                  onChange={(e) =>
                    setCompSettings({
                      ...compSettings,
                      thresholds: { ...compSettings.thresholds, good: Number(e.target.value) },
                    })
                  }
                  className="w-full p-2 border border-[#D9E2EC] bg-white rounded font-bold text-[#172B4D]"
                />
                <span className="text-[10px] text-[#66788A]">Mặc định: 90 – 100 điểm</span>
              </div>

              <div className="p-3 bg-[#F5F8FC] rounded-lg border border-[#D9E2EC] space-y-1">
                <label className="font-semibold text-[#3182CE] block">Ngưỡng Khá (&ge; điểm)</label>
                <input
                  type="number"
                  min={60}
                  max={89}
                  value={compSettings.thresholds.fair}
                  onChange={(e) =>
                    setCompSettings({
                      ...compSettings,
                      thresholds: { ...compSettings.thresholds, fair: Number(e.target.value) },
                    })
                  }
                  className="w-full p-2 border border-[#D9E2EC] bg-white rounded font-bold text-[#172B4D]"
                />
                <span className="text-[10px] text-[#66788A]">Mặc định: 80 – 89 điểm</span>
              </div>

              <div className="p-3 bg-[#F5F8FC] rounded-lg border border-[#D9E2EC] space-y-1">
                <label className="font-semibold text-[#16324F] block">Ngưỡng Đạt (&ge; điểm)</label>
                <input
                  type="number"
                  min={40}
                  max={79}
                  value={compSettings.thresholds.pass}
                  onChange={(e) =>
                    setCompSettings({
                      ...compSettings,
                      thresholds: { ...compSettings.thresholds, pass: Number(e.target.value) },
                    })
                  }
                  className="w-full p-2 border border-[#D9E2EC] bg-white rounded font-bold text-[#172B4D]"
                />
                <span className="text-[10px] text-[#66788A]">Dưới ngưỡng này là Chưa đạt (&lt;65)</span>
              </div>
            </div>
          </div>

          {/* 2. Phương pháp tính tháng */}
          <div className="space-y-1.5 text-xs">
            <span className="font-bold text-[#172B4D] block">
              2. Phương pháp tổng hợp điểm rèn luyện tháng:
            </span>
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 cursor-pointer text-[#172B4D]">
                <input
                  type="radio"
                  name="calcMethod"
                  checked={compSettings.monthlyCalcMethod === 'average'}
                  onChange={() => setCompSettings({ ...compSettings, monthlyCalcMethod: 'average' })}
                  className="accent-[#08A67A]"
                />
                <span>Trung bình cộng các tuần</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[#172B4D]">
                <input
                  type="radio"
                  name="calcMethod"
                  checked={compSettings.monthlyCalcMethod === 'weighted'}
                  onChange={() => setCompSettings({ ...compSettings, monthlyCalcMethod: 'weighted' })}
                  className="accent-[#08A67A]"
                />
                <span>Có trọng số (ưu tiên tuần sau)</span>
              </label>
            </div>
          </div>

          {/* 3. Chỉnh sửa danh mục & mức điểm cộng / trừ */}
          <div className="space-y-3 text-xs pt-2 border-t border-[#D9E2EC]/60">
            <span className="font-bold text-[#172B4D] block">
              3. Quản lý danh mục và mức điểm cộng / trừ mặc định:
            </span>

            {/* List of criteria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cột Cộng điểm */}
              <div className="space-y-2">
                <span className="font-semibold text-[#08A67A] block">Danh mục điểm cộng:</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto p-1 border border-[#D9E2EC] rounded-lg bg-[#F5F8FC]">
                  {compSettings.criteria
                    .filter((c) => c.type === 'bonus')
                    .map((crit) => (
                      <div
                        key={crit.id}
                        className="p-2 bg-white rounded border border-[#D9E2EC] flex items-center justify-between gap-2"
                      >
                        <span className="font-medium truncate flex-1">{crit.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#08A67A] font-bold">+</span>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={crit.defaultPoints}
                            onChange={(e) => handleUpdateCriteriaPoints(crit.id, Number(e.target.value))}
                            className="w-12 p-1 border border-[#D9E2EC] rounded text-center font-bold text-[#08A67A]"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteCriteria(crit.id)}
                            className="p-1 text-[#66788A] hover:text-[#E5484D] cursor-pointer"
                            title="Xóa tiêu chí"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Cột Trừ điểm */}
              <div className="space-y-2">
                <span className="font-semibold text-[#E5484D] block">Danh mục điểm trừ:</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto p-1 border border-[#D9E2EC] rounded-lg bg-[#F5F8FC]">
                  {compSettings.criteria
                    .filter((c) => c.type === 'penalty')
                    .map((crit) => (
                      <div
                        key={crit.id}
                        className="p-2 bg-white rounded border border-[#D9E2EC] flex items-center justify-between gap-2"
                      >
                        <span className="font-medium truncate flex-1">{crit.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#E5484D] font-bold">-</span>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={crit.defaultPoints}
                            onChange={(e) => handleUpdateCriteriaPoints(crit.id, Number(e.target.value))}
                            className="w-12 p-1 border border-[#D9E2EC] rounded text-center font-bold text-[#E5484D]"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteCriteria(crit.id)}
                            className="p-1 text-[#66788A] hover:text-[#E5484D] cursor-pointer"
                            title="Xóa tiêu chí"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Thêm tiêu chí mới */}
            <div className="p-3 bg-[#F5F8FC] rounded-lg border border-[#D9E2EC] flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Thêm tiêu chí mới..."
                value={newCriteriaName}
                onChange={(e) => setNewCriteriaName(e.target.value)}
                className="flex-1 min-w-[160px] p-1.5 border border-[#D9E2EC] bg-white rounded text-xs"
              />
              <select
                value={newCriteriaType}
                onChange={(e) => setNewCriteriaType(e.target.value as any)}
                className="p-1.5 border border-[#D9E2EC] bg-white rounded text-xs"
              >
                <option value="bonus">Cộng điểm (+)</option>
                <option value="penalty">Trừ điểm (-)</option>
              </select>
              <div className="flex items-center gap-1">
                <span className="text-[#66788A]">Điểm:</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newCriteriaPoints}
                  onChange={(e) => setNewCriteriaPoints(Number(e.target.value))}
                  className="w-12 p-1.5 border border-[#D9E2EC] bg-white rounded text-center font-bold text-xs"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCriteria}
                className="px-3 py-1.5 bg-[#16324F] text-white hover:bg-[#214766] rounded font-semibold text-xs transition-colors cursor-pointer"
              >
                + Thêm
              </button>
            </div>
          </div>
        </div>

        {/* Buttons Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#66788A] hover:text-[#172B4D] bg-white hover:bg-[#F5F8FC] rounded-lg border border-[#D9E2EC] transition-colors shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Khôi phục dữ liệu demo</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#08A67A] hover:bg-[#07966F] rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu thiết lập</span>
          </button>
        </div>
      </form>
    </div>
  );
};
