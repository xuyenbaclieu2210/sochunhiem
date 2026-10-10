import React, { useState, useMemo } from 'react';
import {
  Medal,
  Award,
  Plus,
  Minus,
  Search,
  Filter,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  History,
  TrendingUp,
  BarChart3,
  Sliders,
  X,
  Clock,
  Sparkles,
  ChevronDown,
  ArrowUpDown,
  FileSpreadsheet,
  Trash2,
  Eye,
  Info
} from 'lucide-react';
import {
  Student,
  CompetitionWeek,
  CompetitionRecord,
  CompetitionCriteria,
  CompetitionSettings,
  ConductRank
} from '../../types';
import {
  calculateStudentWeekScore
} from '../../data/mockData';

interface CompetitionPageProps {
  students: Student[];
  weeks: CompetitionWeek[];
  records: CompetitionRecord[];
  criteria: CompetitionCriteria[];
  settings: CompetitionSettings;
  onAddRecord: (record: CompetitionRecord) => void;
  onDeleteRecord: (recordId: string) => void;
  onViewStudentProfile: (studentId: string) => void;
}

export const CompetitionPage: React.FC<CompetitionPageProps> = ({
  students,
  weeks,
  records,
  criteria,
  settings,
  onAddRecord,
  onDeleteRecord,
  onViewStudentProfile,
}) => {
  // Tabs: 'scoring' (Chấm điểm tuần), 'ranking' (Xếp hạng), 'history' (Lịch sử)
  const [activeTab, setActiveTab] = useState<'scoring' | 'ranking' | 'history'>('scoring');

  // Selected week for scoring and ranking
  const [selectedWeekId, setSelectedWeekId] = useState<string>(() => {
    const current = weeks.find((w) => w.isCurrent);
    return current ? current.id : 'w5';
  });

  // Filter states for Tab 1 (Chấm điểm)
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<'all' | '1' | '2' | '3' | '4'>('all');
  const [rankFilter, setRankFilter] = useState<'all' | ConductRank>('all');

  // Ranking Tab sub-filter
  const [rankingGroupFilter, setRankingGroupFilter] = useState<'all' | '1' | '2' | '3' | '4'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('Tháng 10/2026');
  const [monthlyCalcMethod, setMonthlyCalcMethod] = useState<'average' | 'weighted'>('average');

  // History Tab filters
  const [historyWeekFilter, setHistoryWeekFilter] = useState<string>('all');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<'all' | 'bonus' | 'penalty'>('all');
  const [historySearch, setHistorySearch] = useState('');

  // Modal State for adding/recording points
  const [showAddModal, setShowAddModal] = useState(false);
  const [quickStudentId, setQuickStudentId] = useState<string>(students[0]?.id || '1');
  const [recordType, setRecordType] = useState<'bonus' | 'penalty'>('bonus');
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [recordPoints, setRecordPoints] = useState<number>(2);
  const [recordDate, setRecordDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [recordNote, setRecordNote] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const currentWeekObj = weeks.find((w) => w.id === selectedWeekId) || weeks[0];

  // Compute live scores for all students in selected week
  const weeklyScores = useMemo(() => {
    return students.map((student) => {
      const scoreData = calculateStudentWeekScore(
        student.id,
        selectedWeekId,
        records,
        settings.thresholds
      );
      return {
        student,
        ...scoreData,
      };
    });
  }, [students, selectedWeekId, records, settings.thresholds]);

  // Filtered rows for Tab 1
  const filteredRows = useMemo(() => {
    return weeklyScores.filter(({ student, rank }) => {
      const matchSearch =
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGroup = groupFilter === 'all' || student.group.toString() === groupFilter;
      const matchRank = rankFilter === 'all' || rank === rankFilter;
      return matchSearch && matchGroup && matchRank;
    });
  }, [weeklyScores, searchQuery, groupFilter, rankFilter]);

  // Overall Statistics for current week
  const weekStats = useMemo(() => {
    const scores = weeklyScores.map((s) => s.finalScore);
    const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '100';
    const goodCount = weeklyScores.filter((s) => s.rank === 'Tốt').length;
    const fairCount = weeklyScores.filter((s) => s.rank === 'Khá').length;
    const passCount = weeklyScores.filter((s) => s.rank === 'Đạt').length;
    const failCount = weeklyScores.filter((s) => s.rank === 'Chưa đạt').length;
    const weekRecords = records.filter((r) => r.weekId === selectedWeekId);
    const bonusEvents = weekRecords.filter((r) => r.type === 'bonus').length;
    const penaltyEvents = weekRecords.filter((r) => r.type === 'penalty').length;

    return {
      avgScore,
      goodCount,
      fairCount,
      passCount,
      failCount,
      bonusEvents,
      penaltyEvents,
    };
  }, [weeklyScores, records, selectedWeekId]);

  // Sorted list for Student Ranking (Tab 2)
  const rankedStudents = useMemo(() => {
    const list = [...weeklyScores].filter(({ student }) => {
      return rankingGroupFilter === 'all' || student.group.toString() === rankingGroupFilter;
    });
    // Sort descending by finalScore, then by totalBonus descending, then totalPenalty ascending
    return list.sort((a, b) => {
      if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
      if (b.totalBonus !== a.totalBonus) return b.totalBonus - a.totalBonus;
      return a.totalPenalty - b.totalPenalty;
    });
  }, [weeklyScores, rankingGroupFilter]);

  // Group Rankings for Tab 2 (Tổ 1, 2, 3, 4)
  const groupRankings = useMemo(() => {
    const groups = [1, 2, 3, 4];
    return groups.map((gNum) => {
      const gStudents = weeklyScores.filter((s) => s.student.group === gNum);
      const studentCount = gStudents.length;
      const totalPoints = gStudents.reduce((acc, s) => acc + s.finalScore, 0);
      const avg = studentCount > 0 ? Number((totalPoints / studentCount).toFixed(1)) : 0;
      let rank: ConductRank = 'Chưa đạt';
      if (avg >= settings.thresholds.good) rank = 'Tốt';
      else if (avg >= settings.thresholds.fair) rank = 'Khá';
      else if (avg >= settings.thresholds.pass) rank = 'Đạt';

      return {
        groupNumber: gNum,
        studentCount,
        averageScore: avg,
        rank,
      };
    }).sort((a, b) => b.averageScore - a.averageScore);
  }, [weeklyScores, settings.thresholds]);

  // Monthly Aggregation (Tab 2)
  const monthWeeks = useMemo(() => {
    return weeks.filter((w) => w.month === selectedMonth);
  }, [weeks, selectedMonth]);

  const monthlySummary = useMemo(() => {
    return students.map((student) => {
      const weekScores = monthWeeks.map((w) => {
        const sc = calculateStudentWeekScore(student.id, w.id, records, settings.thresholds);
        return {
          weekId: w.id,
          weekName: w.name,
          score: sc.finalScore,
        };
      });

      let monthAvg = 100;
      if (weekScores.length > 0) {
        if (monthlyCalcMethod === 'average') {
          monthAvg = Number((weekScores.reduce((acc, s) => acc + s.score, 0) / weekScores.length).toFixed(1));
        } else {
          // Weighted: first half x1, last weeks x1.2
          let totalWeight = 0;
          let weightedSum = 0;
          weekScores.forEach((ws, idx) => {
            const weight = idx >= 2 ? 1.2 : 1.0;
            totalWeight += weight;
            weightedSum += ws.score * weight;
          });
          monthAvg = totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(1)) : 100;
        }
      }

      let monthRank: ConductRank = 'Chưa đạt';
      if (monthAvg >= settings.thresholds.good) monthRank = 'Tốt';
      else if (monthAvg >= settings.thresholds.fair) monthRank = 'Khá';
      else if (monthAvg >= settings.thresholds.pass) monthRank = 'Đạt';

      return {
        student,
        weekScores,
        monthAvg,
        monthRank,
      };
    }).sort((a, b) => b.monthAvg - a.monthAvg);
  }, [students, monthWeeks, records, settings.thresholds, monthlyCalcMethod]);

  // Semester Summary (Tab 2)
  const semesterSummary = useMemo(() => {
    const allMonths = Array.from(new Set(weeks.map((w) => w.month)));
    return students.map((student) => {
      const monthScores = allMonths.map((m) => {
        const mWeeks = weeks.filter((w) => w.month === m);
        const scores = mWeeks.map((w) => calculateStudentWeekScore(student.id, w.id, records, settings.thresholds).finalScore);
        const avg = scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 100;
        return { month: m, avg };
      });

      const semAvg = Number((monthScores.reduce((acc, m) => acc + m.avg, 0) / (monthScores.length || 1)).toFixed(1));
      let semRank: ConductRank = 'Chưa đạt';
      if (semAvg >= settings.thresholds.good) semRank = 'Tốt';
      else if (semAvg >= settings.thresholds.fair) semRank = 'Khá';
      else if (semAvg >= settings.thresholds.pass) semRank = 'Đạt';

      return {
        student,
        monthScores,
        semAvg,
        semRank,
      };
    }).sort((a, b) => b.semAvg - a.semAvg);
  }, [students, weeks, records, settings.thresholds]);

  // History Records Filtered (Tab 3)
  const filteredHistory = useMemo(() => {
    return records.filter((rec) => {
      const matchWeek = historyWeekFilter === 'all' || rec.weekId === historyWeekFilter;
      const matchType = historyTypeFilter === 'all' || rec.type === historyTypeFilter;
      const sObj = students.find((s) => s.id === rec.studentId);
      const studentName = sObj ? sObj.fullName : rec.studentName || '';
      const matchSearch =
        studentName.toLowerCase().includes(historySearch.toLowerCase()) ||
        rec.reason.toLowerCase().includes(historySearch.toLowerCase()) ||
        (rec.note || '').toLowerCase().includes(historySearch.toLowerCase());
      return matchWeek && matchType && matchSearch;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [records, historyWeekFilter, historyTypeFilter, historySearch, students]);

  // Open modal with preselected options
  const handleOpenModal = (studentId?: string, type?: 'bonus' | 'penalty') => {
    if (studentId) setQuickStudentId(studentId);
    if (type) setRecordType(type);
    setSelectedCriteriaId('');
    setCustomReason('');
    setRecordPoints(type === 'penalty' ? 2 : 2);
    setRecordNote('');
    setShowAddModal(true);
  };

  // Handle criteria select
  const handleSelectCriteria = (critId: string) => {
    setSelectedCriteriaId(critId);
    const found = criteria.find((c) => c.id === critId);
    if (found) {
      setCustomReason(found.name);
      setRecordPoints(found.defaultPoints);
    }
  };

  // Save new record
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customReason.trim() || (recordType === 'bonus' ? 'Hành động tích cực' : 'Nhắc nhở nề nếp');
    const student = students.find((s) => s.id === quickStudentId);

    const newRecord: CompetitionRecord = {
      id: `cr-${Date.now()}`,
      studentId: quickStudentId,
      studentName: student?.fullName || 'Học sinh',
      weekId: selectedWeekId,
      date: recordDate,
      type: recordType,
      reason: finalReason,
      points: Number(recordPoints),
      note: recordNote.trim(),
      createdAt: `${recordDate} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
      createdBy: 'Thầy Nguyễn Văn Xuyên (GVCN)',
    };

    onAddRecord(newRecord);
    setShowAddModal(false);

    setSuccessToast(
      `Đã ${recordType === 'bonus' ? 'cộng' : 'trừ'} ${recordPoints} điểm thi đua cho học sinh ${student?.fullName || ''}.`
    );
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Available criteria filtered by current recordType
  const filteredCriteria = criteria.filter((c) => c.type === recordType);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#08A67A]/15 border border-[#08A67A]/25 flex items-center justify-center text-[#08A67A]">
              <Medal className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
              Phân hệ Thi đua tuần
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#66788A] mt-1">
            Chấm thi đua hằng tuần, tự động cộng/trừ điểm và xếp hạng rèn luyện nội bộ theo tiêu chí lớp
          </p>
        </div>

        {/* Global Action: Add points */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal(undefined, 'bonus')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#08A67A] hover:bg-[#07966F] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ghi nhận cộng/trừ điểm</span>
          </button>
        </div>
      </div>

      {/* Prominent Current Week Indicator Banner (TUẦN 5: 05/10/2026 → 10/10/2026) */}
      <div className="bg-white p-4 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#08A67A] text-white flex flex-col items-center justify-center font-bold shadow-xs shrink-0">
            <span className="text-[10px] tracking-wider uppercase font-semibold opacity-90">TUẦN</span>
            <span className="text-xl leading-none font-extrabold">{currentWeekObj.weekNumber || 5}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-extrabold text-[#172B4D]">
                {currentWeekObj.name.toUpperCase()}
              </span>
              <span className="text-sm font-bold text-[#08A67A] font-mono bg-[#08A67A]/10 px-2 py-0.5 rounded border border-[#08A67A]/20">
                {currentWeekObj.displayRange || `${currentWeekObj.startDate} → ${currentWeekObj.endDate}`}
              </span>
              {currentWeekObj.isCurrent && (
                <span className="px-2 py-0.5 rounded bg-[#16324F] text-white text-[11px] font-bold">
                  Tuần hiện tại
                </span>
              )}
            </div>
            <p className="text-xs text-[#66788A] mt-1">
              Thứ Hai, 05/10/2026 → Thứ Bảy, 10/10/2026 (6 ngày học) · Chủ nhật 11/10/2026 là ngày nghỉ (không tính thi đua)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <div className="text-xs text-[#66788A] bg-[#F5F8FC] px-3 py-1.5 rounded-lg border border-[#D9E2EC]">
            Thời điểm hiện tại: <strong className="text-[#172B4D]">Thứ Năm, 08/10/2026</strong>
          </div>
        </div>
      </div>

      {/* Internal Evaluation Notice */}
      <div className="p-3 bg-[#3182CE]/5 border border-[#3182CE]/20 rounded-xl text-xs text-[#172B4D] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#3182CE] mt-0.5 shrink-0" />
        <p className="text-[#66788A] leading-relaxed">
          <strong className="text-[#172B4D]">Lưu ý nghiệp vụ:</strong> Đây là hệ thống điểm thi đua và rèn luyện nội bộ của lớp nhằm khích lệ phong trào học tập. Hệ thống bắt đầu mỗi tuần với <strong>100 điểm</strong>, áp dụng công thức <code className="text-[#172B4D] font-mono font-semibold bg-white px-1.5 py-0.5 rounded border border-[#D9E2EC]">MAX(0, MIN(100, 100 + cộng - trừ))</code> và không tự động khẳng định là kết quả đánh giá chính thức của nhà trường.
        </p>
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div className="p-3 bg-[#08A67A]/10 border border-[#08A67A]/25 text-[#08A67A] text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#08A67A] shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* Navigation Tabs (3 Tabs) */}
      <div className="bg-white rounded-xl border border-[#D9E2EC] p-1.5 shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTab('scoring')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'scoring'
              ? 'bg-[#08A67A] text-white shadow-xs'
              : 'text-[#66788A] hover:text-[#172B4D] hover:bg-[#F5F8FC]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>1. Chấm điểm tuần</span>
        </button>

        <button
          onClick={() => setActiveTab('ranking')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'ranking'
              ? 'bg-[#08A67A] text-white shadow-xs'
              : 'text-[#66788A] hover:text-[#172B4D] hover:bg-[#F5F8FC]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>2. Xếp hạng & Tổng hợp</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#08A67A] text-white shadow-xs'
              : 'text-[#66788A] hover:text-[#172B4D] hover:bg-[#F5F8FC]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>3. Lịch sử ({records.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: CHẤM ĐIỂM TUẦN */}
      {/* ============================================================== */}
      {activeTab === 'scoring' && (
        <div className="space-y-5">
          {/* Week Selector + Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
            {/* Week Dropdown */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[#172B4D] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#08A67A]" />
                <span>Chọn tuần:</span>
              </span>
              <select
                value={selectedWeekId}
                onChange={(e) => setSelectedWeekId(e.target.value)}
                className="p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] font-bold bg-[#F5F8FC] focus:bg-white focus:outline-none focus:border-[#08A67A]"
              >
                {weeks.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.formattedRange || `${w.startDate} – ${w.endDate}`}) {w.isCurrent ? '· Tuần hiện tại' : ''}
                  </option>
                ))}
              </select>
              <span className="text-[#66788A] hidden sm:inline">
                {currentWeekObj.month}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xs min-w-[200px]">
              <Search className="w-4 h-4 text-[#9FB3C8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm học sinh, mã HS..."
                className="w-full pl-9 pr-3 py-2 bg-[#F5F8FC] border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:outline-none focus:border-[#08A67A] focus:bg-white"
              />
            </div>

            {/* Filter by Group & Rank */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-[#F5F8FC] p-1 rounded-lg border border-[#D9E2EC]">
                <span className="text-[#66788A] px-2 font-medium">Tổ:</span>
                {(['all', '1', '2', '3', '4'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGroupFilter(g)}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      groupFilter === g ? 'bg-white text-[#172B4D] shadow-xs' : 'text-[#66788A] hover:text-[#172B4D]'
                    }`}
                  >
                    {g === 'all' ? 'Tất cả' : `Tổ ${g}`}
                  </button>
                ))}
              </div>

              <select
                value={rankFilter}
                onChange={(e) => setRankFilter(e.target.value as any)}
                className="p-1.5 border border-[#D9E2EC] rounded-lg text-[#172B4D] bg-[#F5F8FC] text-xs"
              >
                <option value="all">Tất cả xếp loại</option>
                <option value="Tốt">Tốt (90–100)</option>
                <option value="Khá">Khá (80–89)</option>
                <option value="Đạt">Đạt (65–79)</option>
                <option value="Chưa đạt">Chưa đạt (&lt;65)</option>
              </select>
            </div>
          </div>

          {/* Quick Stats Summary for Selected Week */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)]">
              <div className="text-xs text-[#66788A] font-medium">Điểm TB tuần</div>
              <div className="text-2xl font-bold text-[#08A67A] mt-1">{weekStats.avgScore}</div>
              <div className="text-[11px] text-[#66788A]">Thang điểm 100</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)]">
              <div className="text-xs text-[#08A67A] font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#08A67A]" />
                <span>Xếp loại Tốt</span>
              </div>
              <div className="text-2xl font-bold text-[#172B4D] mt-1">{weekStats.goodCount} HS</div>
              <div className="text-[11px] text-[#08A67A] font-medium">90 – 100 điểm</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)]">
              <div className="text-xs text-[#3182CE] font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#3182CE]" />
                <span>Xếp loại Khá</span>
              </div>
              <div className="text-2xl font-bold text-[#172B4D] mt-1">{weekStats.fairCount} HS</div>
              <div className="text-[11px] text-[#3182CE]">80 – 89 điểm</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)]">
              <div className="text-xs text-[#16324F] font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#16324F]" />
                <span>Xếp loại Đạt</span>
              </div>
              <div className="text-2xl font-bold text-[#172B4D] mt-1">{weekStats.passCount} HS</div>
              <div className="text-[11px] text-[#66788A]">65 – 79 điểm</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)]">
              <div className="text-xs text-[#E5484D] font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#E5484D]" />
                <span>Chưa đạt</span>
              </div>
              <div className={`text-2xl font-bold mt-1 ${weekStats.failCount > 0 ? 'text-[#E5484D]' : 'text-[#172B4D]'}`}>
                {weekStats.failCount} HS
              </div>
              <div className="text-[11px] text-[#E5484D]">Dưới 65 điểm</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)]">
              <div className="text-xs text-[#66788A] font-medium">Sự kiện ghi nhận</div>
              <div className="text-sm font-bold text-[#172B4D] mt-1 flex items-center gap-2">
                <span className="text-[#08A67A]">+{weekStats.bonusEvents} cộng</span>
                <span className="text-[#E5484D]">-{weekStats.penaltyEvents} trừ</span>
              </div>
              <div className="text-[11px] text-[#66788A] mt-1">Trong {currentWeekObj.name}</div>
            </div>
          </div>

          {/* Main Scoring Table */}
          <div className="bg-white rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F8FC] border-b border-[#D9E2EC] font-semibold text-[#172B4D]">
                  <tr>
                    <th className="py-3 px-3 text-center w-12">STT</th>
                    <th className="py-3 px-3 w-20">Mã HS</th>
                    <th className="py-3 px-4 min-w-[180px]">Họ và tên</th>
                    <th className="py-3 px-3 text-center w-16">Tổ</th>
                    <th className="py-3 px-3 text-center">Đầu tuần</th>
                    <th className="py-3 px-3 text-center text-[#08A67A]">Điểm cộng</th>
                    <th className="py-3 px-3 text-center text-[#E5484D]">Điểm trừ</th>
                    <th className="py-3 px-4 text-center font-bold">Điểm tuần</th>
                    <th className="py-3 px-3 text-center">Xếp loại</th>
                    <th className="py-3 px-4 text-center min-w-[160px]">Thao tác chấm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2EC]/60 text-[#172B4D]">
                  {filteredRows.length > 0 ? (
                    filteredRows.map(({ student, initialPoints, totalBonus, totalPenalty, finalScore, rank, records: sRecords }, idx) => {
                      return (
                        <tr key={student.id} className="hover:bg-[#F5F8FC] transition-colors">
                          <td className="py-3 px-3 text-center text-[#66788A] font-medium">{idx + 1}</td>
                          <td className="py-3 px-3 font-mono font-bold text-[#16324F]">{student.code}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[#16324F]/10 border border-[#16324F]/15 flex items-center justify-center font-bold text-[#16324F] text-[11px] shrink-0">
                                {student.fullName.slice(-2)}
                              </div>
                              <div>
                                <div
                                  className="font-bold text-[#172B4D] hover:text-[#08A67A] cursor-pointer transition-colors"
                                  onClick={() => onViewStudentProfile(student.id)}
                                >
                                  {student.fullName}
                                </div>
                                <div className="text-[10px] text-[#66788A]">{student.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-semibold text-[#172B4D] bg-[#F5F8FC] px-1.5 py-0.5 rounded border border-[#D9E2EC]">
                              Tổ {student.group}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-[#66788A]">{initialPoints}</td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-[#08A67A]">
                            {totalBonus > 0 ? `+${totalBonus}` : '0'}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-[#E5484D]">
                            {totalPenalty > 0 ? `-${totalPenalty}` : '0'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <span
                                className={`font-mono text-sm font-bold ${
                                  finalScore >= 90
                                    ? 'text-[#08A67A]'
                                    : finalScore >= 80
                                    ? 'text-[#3182CE]'
                                    : finalScore >= 65
                                    ? 'text-[#16324F]'
                                    : 'text-[#E5484D]'
                                }`}
                              >
                                {finalScore}
                              </span>
                              <span className="text-[10px] text-[#66788A]">/100</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                                rank === 'Tốt'
                                  ? 'bg-[#08A67A]/10 text-[#08A67A] border border-[#08A67A]/25'
                                  : rank === 'Khá'
                                  ? 'bg-[#3182CE]/10 text-[#3182CE] border border-[#3182CE]/25'
                                  : rank === 'Đạt'
                                  ? 'bg-[#16324F]/10 text-[#16324F] border border-[#16324F]/25'
                                  : 'bg-[#E5484D]/10 text-[#E5484D] border border-[#E5484D]/25'
                              }`}
                            >
                              {rank}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Quick bonus button */}
                              <button
                                onClick={() => handleOpenModal(student.id, 'bonus')}
                                className="p-1.5 rounded-md bg-[#08A67A]/10 text-[#08A67A] hover:bg-[#08A67A] hover:text-white transition-colors cursor-pointer"
                                title="Ghi nhận điểm cộng"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>

                              {/* Quick penalty button */}
                              <button
                                onClick={() => handleOpenModal(student.id, 'penalty')}
                                className="p-1.5 rounded-md bg-[#E5484D]/10 text-[#E5484D] hover:bg-[#E5484D] hover:text-white transition-colors cursor-pointer"
                                title="Ghi nhận điểm trừ"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              {/* View profile button */}
                              <button
                                onClick={() => onViewStudentProfile(student.id)}
                                className="p-1.5 rounded-md text-[#66788A] hover:text-[#172B4D] hover:bg-[#F5F8FC] transition-colors cursor-pointer"
                                title="Xem hồ sơ rèn luyện học sinh"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-[#66788A]">
                        Không có học sinh nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: XẾP HẠNG & TỔNG HỢP */}
      {/* ============================================================== */}
      {activeTab === 'ranking' && (
        <div className="space-y-6">
          {/* Sub-section 1: XẾP HẠNG HỌC SINH (Top 3 Podium & List) */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D9E2EC]">
              <div>
                <h3 className="text-base font-bold text-[#172B4D] flex items-center gap-2">
                  <Medal className="w-5 h-5 text-[#08A67A]" />
                  <span>Bảng vinh danh & Xếp hạng thi đua cá nhân ({currentWeekObj.name})</span>
                </h3>
                <p className="text-xs text-[#66788A] mt-0.5">
                  Xếp hạng theo điểm rèn luyện tuần từ cao xuống thấp
                </p>
              </div>

              {/* Group Filter for Rankings */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#66788A] font-medium">Lọc theo:</span>
                <div className="flex items-center gap-1 bg-[#F5F8FC] p-1 rounded-lg border border-[#D9E2EC]">
                  {(['all', '1', '2', '3', '4'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setRankingGroupFilter(g)}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                        rankingGroupFilter === g ? 'bg-white text-[#172B4D] shadow-xs' : 'text-[#66788A] hover:text-[#172B4D]'
                      }`}
                    >
                      {g === 'all' ? 'Toàn lớp' : `Tổ ${g}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Rank 2 (Silver) */}
              {rankedStudents[1] && (
                <div className="order-2 md:order-1 bg-gradient-to-b from-[#F5F8FC] to-white p-4 rounded-xl border border-[#D9E2EC] flex flex-col items-center text-center relative shadow-xs">
                  <div className="w-9 h-9 rounded-full bg-[#9FB3C8]/25 text-[#172B4D] font-bold text-sm flex items-center justify-center mb-2 border border-[#9FB3C8]/40">
                    🥈
                  </div>
                  <span className="text-xs font-semibold text-[#66788A] uppercase tracking-wider">Hạng Nhì</span>
                  <div
                    className="font-bold text-[#172B4D] text-sm mt-1 hover:text-[#08A67A] cursor-pointer"
                    onClick={() => onViewStudentProfile(rankedStudents[1].student.id)}
                  >
                    {rankedStudents[1].student.fullName}
                  </div>
                  <span className="text-xs text-[#66788A]">Tổ {rankedStudents[1].student.group} · {rankedStudents[1].student.code}</span>
                  <div className="text-2xl font-bold text-[#3182CE] mt-2 font-mono">
                    {rankedStudents[1].finalScore} <span className="text-xs font-normal text-[#66788A]">điểm</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#08A67A] bg-[#08A67A]/10 px-2 py-0.5 rounded mt-1">
                    Xếp loại {rankedStudents[1].rank}
                  </span>
                </div>
              )}

              {/* Rank 1 (Gold - Elevated) */}
              {rankedStudents[0] && (
                <div className="order-1 md:order-2 bg-gradient-to-b from-[#FEF3C7]/40 to-white p-5 rounded-xl border-2 border-[#F59E0B]/40 flex flex-col items-center text-center relative shadow-sm md:-translate-y-2">
                  <div className="w-11 h-11 rounded-full bg-[#F59E0B]/20 text-[#D97706] font-bold text-lg flex items-center justify-center mb-2 border border-[#F59E0B]/40">
                    🥇
                  </div>
                  <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider">Quán quân tuần</span>
                  <div
                    className="font-bold text-[#172B4D] text-base mt-1 hover:text-[#08A67A] cursor-pointer"
                    onClick={() => onViewStudentProfile(rankedStudents[0].student.id)}
                  >
                    {rankedStudents[0].student.fullName}
                  </div>
                  <span className="text-xs text-[#66788A]">Tổ {rankedStudents[0].student.group} · {rankedStudents[0].student.code}</span>
                  <div className="text-3xl font-extrabold text-[#08A67A] mt-2 font-mono">
                    {rankedStudents[0].finalScore} <span className="text-xs font-normal text-[#66788A]">điểm</span>
                  </div>
                  <span className="text-xs font-bold text-[#08A67A] bg-[#08A67A]/15 px-2.5 py-0.5 rounded-full mt-1 border border-[#08A67A]/20">
                    Xếp loại {rankedStudents[0].rank}
                  </span>
                </div>
              )}

              {/* Rank 3 (Bronze) */}
              {rankedStudents[2] && (
                <div className="order-3 bg-gradient-to-b from-[#F5F8FC] to-white p-4 rounded-xl border border-[#D9E2EC] flex flex-col items-center text-center relative shadow-xs">
                  <div className="w-9 h-9 rounded-full bg-[#B45309]/15 text-[#B45309] font-bold text-sm flex items-center justify-center mb-2 border border-[#B45309]/30">
                    🥉
                  </div>
                  <span className="text-xs font-semibold text-[#66788A] uppercase tracking-wider">Hạng Ba</span>
                  <div
                    className="font-bold text-[#172B4D] text-sm mt-1 hover:text-[#08A67A] cursor-pointer"
                    onClick={() => onViewStudentProfile(rankedStudents[2].student.id)}
                  >
                    {rankedStudents[2].student.fullName}
                  </div>
                  <span className="text-xs text-[#66788A]">Tổ {rankedStudents[2].student.group} · {rankedStudents[2].student.code}</span>
                  <div className="text-2xl font-bold text-[#3182CE] mt-2 font-mono">
                    {rankedStudents[2].finalScore} <span className="text-xs font-normal text-[#66788A]">điểm</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#08A67A] bg-[#08A67A]/10 px-2 py-0.5 rounded mt-1">
                    Xếp loại {rankedStudents[2].rank}
                  </span>
                </div>
              )}
            </div>

            {/* Remaining students in list */}
            <div className="border border-[#D9E2EC] rounded-xl overflow-hidden mt-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F8FC] border-b border-[#D9E2EC] font-semibold text-[#172B4D]">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-14">Hạng</th>
                    <th className="py-2.5 px-3 w-20">Mã HS</th>
                    <th className="py-2.5 px-4">Họ và tên</th>
                    <th className="py-2.5 px-3 text-center">Tổ</th>
                    <th className="py-2.5 px-3 text-center text-[#08A67A]">+ Điểm cộng</th>
                    <th className="py-2.5 px-3 text-center text-[#E5484D]">- Điểm trừ</th>
                    <th className="py-2.5 px-3 text-center font-bold">Tổng điểm tuần</th>
                    <th className="py-2.5 px-3 text-center">Xếp loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2EC]/60 text-[#172B4D]">
                  {rankedStudents.map((item, index) => (
                    <tr key={item.student.id} className="hover:bg-[#F5F8FC] transition-colors">
                      <td className="py-2.5 px-3 text-center font-bold">
                        {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `${index + 1}`}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#16324F] font-semibold">{item.student.code}</td>
                      <td className="py-2.5 px-4 font-semibold text-[#172B4D]">
                        <span
                          className="hover:text-[#08A67A] cursor-pointer"
                          onClick={() => onViewStudentProfile(item.student.id)}
                        >
                          {item.student.fullName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">Tổ {item.student.group}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#08A67A]">
                        {item.totalBonus > 0 ? `+${item.totalBonus}` : '0'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#E5484D]">
                        {item.totalPenalty > 0 ? `-${item.totalPenalty}` : '0'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-sm text-[#172B4D]">
                        {item.finalScore}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            item.rank === 'Tốt'
                              ? 'bg-[#08A67A]/10 text-[#08A67A]'
                              : item.rank === 'Khá'
                              ? 'bg-[#3182CE]/10 text-[#3182CE]'
                              : item.rank === 'Đạt'
                              ? 'bg-[#16324F]/10 text-[#16324F]'
                              : 'bg-[#E5484D]/10 text-[#E5484D]'
                          }`}
                        >
                          {item.rank}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sub-section 2: XẾP HẠNG TỔ (Tổ 1, 2, 3, 4) */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]">
              <div>
                <h3 className="text-base font-bold text-[#172B4D] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#3182CE]" />
                  <span>Xếp hạng thi đua các Tổ ({currentWeekObj.name})</span>
                </h3>
                <p className="text-xs text-[#66788A] mt-0.5">
                  Tự động tính từ điểm trung bình rèn luyện của các thành viên trong tổ
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {groupRankings.map((g, idx) => (
                <div
                  key={g.groupNumber}
                  className={`p-4 rounded-xl border transition-all ${
                    idx === 0
                      ? 'border-[#08A67A]/40 bg-[#08A67A]/5'
                      : 'border-[#D9E2EC] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#66788A] uppercase">
                      {idx === 0 ? '🏆 Hạng 1' : `Hạng ${idx + 1}`}
                    </span>
                    <span className="text-xs font-semibold text-[#172B4D] bg-white px-2 py-0.5 rounded border border-[#D9E2EC]">
                      {g.studentCount} học sinh
                    </span>
                  </div>
                  <div className="mt-2 text-base font-bold text-[#172B4D]">
                    Tổ {g.groupNumber}
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-[#172B4D] font-mono">
                      {g.averageScore}
                    </span>
                    <span className="text-xs text-[#66788A]">điểm TB</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-[#D9E2EC]/70 flex items-center justify-between text-xs">
                    <span className="text-[#66788A]">Đánh giá:</span>
                    <span
                      className={`font-semibold ${
                        g.rank === 'Tốt'
                          ? 'text-[#08A67A]'
                          : g.rank === 'Khá'
                          ? 'text-[#3182CE]'
                          : 'text-[#F59E0B]'
                      }`}
                    >
                      {g.rank}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-section 3: TỔNG HỢP THEO THÁNG */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D9E2EC]">
              <div>
                <h3 className="text-base font-bold text-[#172B4D] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#16324F]" />
                  <span>Tổng hợp rèn luyện theo Tháng</span>
                </h3>
                <p className="text-xs text-[#66788A] mt-0.5">
                  Tự động tổng hợp điểm các tuần thành điểm rèn luyện tháng
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Month Select */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="p-1.5 border border-[#D9E2EC] rounded-lg text-[#172B4D] font-semibold bg-[#F5F8FC]"
                >
                  <option value="Tháng 9/2026">Tháng 9/2026 (Tuần 1 - 4)</option>
                  <option value="Tháng 10/2026">Tháng 10/2026 (Tuần 5 - 6)</option>
                </select>

                {/* Calculation method */}
                <div className="flex items-center gap-1 bg-[#F5F8FC] p-1 rounded-lg border border-[#D9E2EC]">
                  <span className="text-[#66788A] px-1 font-medium">Cách tính:</span>
                  <button
                    onClick={() => setMonthlyCalcMethod('average')}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      monthlyCalcMethod === 'average' ? 'bg-white text-[#172B4D] shadow-xs' : 'text-[#66788A]'
                    }`}
                  >
                    TB cộng
                  </button>
                  <button
                    onClick={() => setMonthlyCalcMethod('weighted')}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      monthlyCalcMethod === 'weighted' ? 'bg-white text-[#172B4D] shadow-xs' : 'text-[#66788A]'
                    }`}
                  >
                    Có trọng số
                  </button>
                </div>
              </div>
            </div>

            {/* Monthly table */}
            <div className="border border-[#D9E2EC] rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F8FC] border-b border-[#D9E2EC] font-semibold text-[#172B4D]">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-12">STT</th>
                    <th className="py-2.5 px-3">Mã HS</th>
                    <th className="py-2.5 px-4 min-w-[170px]">Họ và tên</th>
                    <th className="py-2.5 px-3 text-center">Tổ</th>
                    {monthWeeks.map((mw) => (
                      <th key={mw.id} className="py-2.5 px-3 text-center">{mw.name}</th>
                    ))}
                    <th className="py-2.5 px-3 text-center font-bold bg-[#08A67A]/5">Điểm tháng</th>
                    <th className="py-2.5 px-3 text-center bg-[#08A67A]/5">Xếp loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2EC]/60 text-[#172B4D]">
                  {monthlySummary.map((item, idx) => (
                    <tr key={item.student.id} className="hover:bg-[#F5F8FC] transition-colors">
                      <td className="py-2.5 px-3 text-center text-[#66788A]">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-[#16324F] font-bold">{item.student.code}</td>
                      <td className="py-2.5 px-4 font-semibold text-[#172B4D]">
                        <span
                          className="hover:text-[#08A67A] cursor-pointer"
                          onClick={() => onViewStudentProfile(item.student.id)}
                        >
                          {item.student.fullName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">Tổ {item.student.group}</td>
                      {item.weekScores.map((ws) => (
                        <td key={ws.weekId} className="py-2.5 px-3 text-center font-mono">
                          {ws.score}
                        </td>
                      ))}
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-sm text-[#08A67A] bg-[#08A67A]/5">
                        {item.monthAvg}
                      </td>
                      <td className="py-2.5 px-3 text-center bg-[#08A67A]/5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            item.monthRank === 'Tốt'
                              ? 'bg-[#08A67A]/15 text-[#08A67A]'
                              : item.monthRank === 'Khá'
                              ? 'bg-[#3182CE]/15 text-[#3182CE]'
                              : item.monthRank === 'Đạt'
                              ? 'bg-[#16324F]/15 text-[#16324F]'
                              : 'bg-[#E5484D]/15 text-[#E5484D]'
                          }`}
                        >
                          {item.monthRank}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sub-section 4: TỔNG HỢP HỌC KỲ ("Rèn luyện học kỳ") */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] space-y-4">
            <div className="pb-3 border-b border-[#D9E2EC]">
              <h3 className="text-base font-bold text-[#172B4D] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#08A67A]" />
                <span>Rèn luyện học kỳ I (Năm học 2026–2027)</span>
              </h3>
              <p className="text-xs text-[#66788A] mt-0.5">
                Tổng hợp kết quả rèn luyện từng tháng để làm căn cứ nhận xét học bạ cuối kỳ
              </p>
            </div>

            <div className="border border-[#D9E2EC] rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F8FC] border-b border-[#D9E2EC] font-semibold text-[#172B4D]">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-12">STT</th>
                    <th className="py-2.5 px-3">Mã HS</th>
                    <th className="py-2.5 px-4 min-w-[170px]">Họ và tên</th>
                    <th className="py-2.5 px-3 text-center">Tổ</th>
                    <th className="py-2.5 px-3 text-center">Tháng 9</th>
                    <th className="py-2.5 px-3 text-center">Tháng 10 (Hiện tại)</th>
                    <th className="py-2.5 px-3 text-center font-bold bg-[#3182CE]/5 text-[#3182CE]">ĐTB Học kỳ</th>
                    <th className="py-2.5 px-3 text-center bg-[#3182CE]/5">Xếp loại HK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2EC]/60 text-[#172B4D]">
                  {semesterSummary.map((item, idx) => (
                    <tr key={item.student.id} className="hover:bg-[#F5F8FC] transition-colors">
                      <td className="py-2.5 px-3 text-center text-[#66788A]">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-[#16324F] font-bold">{item.student.code}</td>
                      <td className="py-2.5 px-4 font-semibold text-[#172B4D]">
                        <span
                          className="hover:text-[#08A67A] cursor-pointer"
                          onClick={() => onViewStudentProfile(item.student.id)}
                        >
                          {item.student.fullName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">Tổ {item.student.group}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{item.monthScores[0]?.avg ?? 100}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{item.monthScores[1]?.avg ?? 100}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-sm text-[#3182CE] bg-[#3182CE]/5">
                        {item.semAvg}
                      </td>
                      <td className="py-2.5 px-3 text-center bg-[#3182CE]/5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            item.semRank === 'Tốt'
                              ? 'bg-[#08A67A]/15 text-[#08A67A]'
                              : item.semRank === 'Khá'
                              ? 'bg-[#3182CE]/15 text-[#3182CE]'
                              : item.semRank === 'Đạt'
                              ? 'bg-[#16324F]/15 text-[#16324F]'
                              : 'bg-[#E5484D]/15 text-[#E5484D]'
                          }`}
                        >
                          {item.semRank}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: LỊCH SỬ CỘNG / TRỪ ĐIỂM */}
      {/* ============================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* History filter bar */}
          <div className="bg-white p-4 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[#172B4D]">Lọc theo tuần:</span>
              <select
                value={historyWeekFilter}
                onChange={(e) => setHistoryWeekFilter(e.target.value)}
                className="p-1.5 border border-[#D9E2EC] rounded-lg text-[#172B4D] bg-[#F5F8FC]"
              >
                <option value="all">Tất cả các tuần</option>
                {weeks.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>

              <div className="flex items-center gap-1 bg-[#F5F8FC] p-1 rounded-lg border border-[#D9E2EC] ml-2">
                <span className="text-[#66788A] px-1 font-medium">Loại:</span>
                <button
                  onClick={() => setHistoryTypeFilter('all')}
                  className={`px-2 py-0.5 rounded text-xs font-medium ${historyTypeFilter === 'all' ? 'bg-white text-[#172B4D] shadow-xs' : 'text-[#66788A]'}`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setHistoryTypeFilter('bonus')}
                  className={`px-2 py-0.5 rounded text-xs font-medium ${historyTypeFilter === 'bonus' ? 'bg-white text-[#08A67A] shadow-xs' : 'text-[#66788A]'}`}
                >
                  Cộng điểm
                </button>
                <button
                  onClick={() => setHistoryTypeFilter('penalty')}
                  className={`px-2 py-0.5 rounded text-xs font-medium ${historyTypeFilter === 'penalty' ? 'bg-white text-[#E5484D] shadow-xs' : 'text-[#66788A]'}`}
                >
                  Trừ điểm
                </button>
              </div>
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-[#9FB3C8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Tìm nội dung, tên học sinh..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#F5F8FC] border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:outline-none focus:border-[#08A67A]"
              />
            </div>
          </div>

          {/* History list */}
          <div className="bg-white rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F8FC] border-b border-[#D9E2EC] font-semibold text-[#172B4D]">
                  <tr>
                    <th className="py-3 px-3 text-center w-12">STT</th>
                    <th className="py-3 px-3">Tuần</th>
                    <th className="py-3 px-3">Ngày</th>
                    <th className="py-3 px-4 min-w-[160px]">Học sinh</th>
                    <th className="py-3 px-3 text-center">Phân loại</th>
                    <th className="py-3 px-4 min-w-[200px]">Nội dung & Lý do</th>
                    <th className="py-3 px-3 text-center">Điểm</th>
                    <th className="py-3 px-4 min-w-[180px]">Người ghi nhận</th>
                    <th className="py-3 px-3 text-center w-14">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2EC]/60 text-[#172B4D]">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((rec, index) => {
                      const student = students.find((s) => s.id === rec.studentId);
                      const week = weeks.find((w) => w.id === rec.weekId);
                      return (
                        <tr key={rec.id} className="hover:bg-[#F5F8FC] transition-colors">
                          <td className="py-3 px-3 text-center text-[#66788A]">{index + 1}</td>
                          <td className="py-3 px-3 font-semibold text-[#16324F]">{week?.name || rec.weekId}</td>
                          <td className="py-3 px-3 font-mono text-[#66788A]">{rec.date}</td>
                          <td className="py-3 px-4">
                            <span
                              className="font-bold text-[#172B4D] hover:text-[#08A67A] cursor-pointer"
                              onClick={() => onViewStudentProfile(rec.studentId)}
                            >
                              {student?.fullName || rec.studentName}
                            </span>
                            <span className="text-[10px] text-[#66788A] block">Tổ {student?.group}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                rec.type === 'bonus'
                                  ? 'bg-[#08A67A]/10 text-[#08A67A] border border-[#08A67A]/25'
                                  : 'bg-[#E5484D]/10 text-[#E5484D] border border-[#E5484D]/25'
                              }`}
                            >
                              {rec.type === 'bonus' ? 'Cộng điểm' : 'Trừ điểm'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#172B4D]">{rec.reason}</div>
                            {rec.note && <div className="text-[11px] text-[#66788A] mt-0.5">{rec.note}</div>}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-sm">
                            <span className={rec.type === 'bonus' ? 'text-[#08A67A]' : 'text-[#E5484D]'}>
                              {rec.type === 'bonus' ? `+${rec.points}` : `-${rec.points}`}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[#66788A]">
                            <div className="text-[#172B4D] font-medium">{rec.createdBy}</div>
                            <div className="text-[10px] text-[#66788A]">{rec.createdAt}</div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => {
                                if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi điểm này?')) {
                                  onDeleteRecord(rec.id);
                                }
                              }}
                              className="p-1 text-[#66788A] hover:text-[#E5484D] rounded cursor-pointer transition-colors"
                              title="Xóa bản ghi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-[#66788A]">
                        Chưa có sự kiện cộng/trừ điểm nào trong danh sách.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL GHI NHẬN CỘNG / TRỪ ĐIỂM */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16324F]/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#D9E2EC] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#D9E2EC] flex items-center justify-between bg-[#F5F8FC]">
              <div className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-[#08A67A]" />
                <h3 className="font-bold text-[#172B4D] text-sm">
                  Ghi nhận điểm thi đua rèn luyện ({currentWeekObj.name})
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-[#66788A] hover:text-[#172B4D] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="p-5 space-y-4 text-xs">
              {/* Type Switcher: Cộng vs Trừ */}
              <div className="flex rounded-lg border border-[#D9E2EC] p-1 bg-[#F5F8FC]">
                <button
                  type="button"
                  onClick={() => {
                    setRecordType('bonus');
                    setSelectedCriteriaId('');
                    setRecordPoints(2);
                  }}
                  className={`flex-1 py-2 rounded-md font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    recordType === 'bonus'
                      ? 'bg-[#08A67A] text-white shadow-xs'
                      : 'text-[#66788A] hover:text-[#172B4D]'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Cộng điểm (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRecordType('penalty');
                    setSelectedCriteriaId('');
                    setRecordPoints(2);
                  }}
                  className={`flex-1 py-2 rounded-md font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    recordType === 'penalty'
                      ? 'bg-[#E5484D] text-white shadow-xs'
                      : 'text-[#66788A] hover:text-[#172B4D]'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                  <span>Trừ điểm (-)</span>
                </button>
              </div>

              {/* Student Select */}
              <div className="space-y-1">
                <label className="font-semibold text-[#172B4D]">Học sinh được ghi nhận *</label>
                <select
                  value={quickStudentId}
                  onChange={(e) => setQuickStudentId(e.target.value)}
                  className="w-full p-2.5 border border-[#D9E2EC] bg-[#F5F8FC] focus:bg-white rounded-lg text-[#172B4D] font-medium"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.code} - {st.fullName} (Tổ {st.group})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Week */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#172B4D]">Ngày ghi nhận *</label>
                  <input
                    type="date"
                    required
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full p-2 border border-[#D9E2EC] bg-[#F5F8FC] focus:bg-white rounded-lg text-[#172B4D]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#172B4D]">Tuần thi đua *</label>
                  <select
                    value={selectedWeekId}
                    onChange={(e) => setSelectedWeekId(e.target.value)}
                    className="w-full p-2 border border-[#D9E2EC] bg-[#F5F8FC] focus:bg-white rounded-lg text-[#172B4D]"
                  >
                    {weeks.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.month})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Preset Criteria */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#172B4D]">
                  Chọn danh mục {recordType === 'bonus' ? 'khen thưởng/cộng điểm' : 'vi phạm/trừ điểm'} mẫu:
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-[#F5F8FC] rounded-lg border border-[#D9E2EC]">
                  {filteredCriteria.map((crit) => (
                    <button
                      key={crit.id}
                      type="button"
                      onClick={() => handleSelectCriteria(crit.id)}
                      className={`p-2 rounded-md text-left transition-colors flex items-center justify-between cursor-pointer ${
                        selectedCriteriaId === crit.id
                          ? recordType === 'bonus'
                            ? 'bg-[#08A67A] text-white'
                            : 'bg-[#E5484D] text-white'
                          : 'bg-white hover:bg-[#D9E2EC]/50 text-[#172B4D] border border-[#D9E2EC]/60'
                      }`}
                    >
                      <span className="truncate text-[11px] font-medium">{crit.name}</span>
                      <span className="font-mono font-bold text-[11px] shrink-0 ml-1">
                        {recordType === 'bonus' ? `+${crit.defaultPoints}` : `-${crit.defaultPoints}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Reason & Points */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-[#172B4D]">Nội dung / Lý do cụ thể *</label>
                  <input
                    type="text"
                    required
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="VD: Tiến bộ môn Toán, Đi muộn..."
                    className="w-full p-2 border border-[#D9E2EC] bg-[#F5F8FC] focus:bg-white rounded-lg text-[#172B4D]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#172B4D]">Số điểm *</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      max={20}
                      value={recordPoints}
                      onChange={(e) => setRecordPoints(Math.max(1, Number(e.target.value)))}
                      className="w-full p-2 border border-[#D9E2EC] bg-[#F5F8FC] focus:bg-white rounded-lg font-bold text-[#172B4D]"
                    />
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="space-y-1">
                <label className="font-semibold text-[#172B4D]">Ghi chú chi tiết (nếu có)</label>
                <textarea
                  rows={2}
                  value={recordNote}
                  onChange={(e) => setRecordNote(e.target.value)}
                  placeholder="Ghi rõ tình huống hoặc biện pháp phối hợp..."
                  className="w-full p-2 border border-[#D9E2EC] bg-[#F5F8FC] focus:bg-white rounded-lg text-[#172B4D]"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 border-t border-[#D9E2EC] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#D9E2EC] rounded-lg text-[#66788A] hover:bg-[#F5F8FC] font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-lg text-white font-semibold shadow-xs cursor-pointer ${
                    recordType === 'bonus' ? 'bg-[#08A67A] hover:bg-[#07966F]' : 'bg-[#E5484D] hover:bg-[#C93B3F]'
                  }`}
                >
                  Lưu bản ghi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
