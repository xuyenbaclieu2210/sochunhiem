import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  Edit,
  AlertCircle,
  PlusCircle,
  Save,
  X,
  FileSpreadsheet,
  CheckCircle2,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { Student, SubjectGrade } from '../../types';
import { SUBJECTS_LIST } from '../../data/mockData';

interface GradesPageProps {
  students: Student[];
  gradesMap: Record<string, SubjectGrade[]>;
  onUpdateStudentGrade: (studentId: string, gradeData: SubjectGrade) => void;
}

export const GradesPage: React.FC<GradesPageProps> = ({
  students,
  gradesMap,
  onUpdateStudentGrade,
}) => {
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [selectedSemester, setSelectedSemester] = useState<'HK1' | 'HK2'>('HK1');
  const [searchStudent, setSearchStudent] = useState('');

  // Editing state for modal
  const [editingGrade, setEditingGrade] = useState<{
    student: Student;
    grade: SubjectGrade;
  } | null>(null);

  const [editForm, setEditForm] = useState({
    tx1: 8.0,
    tx2: 8.5,
    tx3: 8.0,
    midterm: 8.0,
    finalScore: 8.5,
  });

  const currentSubjectObj = SUBJECTS_LIST.find((s) => s.id === selectedSubject) || SUBJECTS_LIST[0];

  // Prepare table rows for the selected subject
  const tableRows = useMemo(() => {
    return students
      .filter((s) => {
        return (
          s.fullName.toLowerCase().includes(searchStudent.toLowerCase()) ||
          s.code.toLowerCase().includes(searchStudent.toLowerCase())
        );
      })
      .map((student) => {
        const studentGrades = gradesMap[student.id] || [];
        const found = studentGrades.find((g) => g.subjectId === selectedSubject);

        // Fallback or generated default grade for mock demo if not explicitly filled
        const grade: SubjectGrade = found || {
          subjectId: selectedSubject,
          subjectName: currentSubjectObj.name,
          regularScores: [
            Number((student.gpa - 0.2 + (Number(student.id) % 3) * 0.3).toFixed(1)),
            Number((student.gpa + (Number(student.id) % 2) * 0.2).toFixed(1)),
            Number((student.gpa).toFixed(1)),
          ],
          midtermScore: Number((student.gpa).toFixed(1)),
          finalScore: Number((student.gpa + 0.1).toFixed(1)),
          averageScore: Number(student.gpa.toFixed(1)),
        };

        return {
          student,
          grade,
        };
      });
  }, [students, gradesMap, selectedSubject, searchStudent, currentSubjectObj]);

  // Statistics for this subject
  const scores = tableRows.map((r) => r.grade.averageScore);
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0';
  const below5Count = tableRows.filter((r) => r.grade.averageScore < 5.0 || r.grade.midtermScore < 5.0).length;
  const goodCount = tableRows.filter((r) => r.grade.averageScore >= 8.0).length;

  const handleOpenEdit = (student: Student, grade: SubjectGrade) => {
    setEditingGrade({ student, grade });
    setEditForm({
      tx1: grade.regularScores[0] ?? 7.0,
      tx2: grade.regularScores[1] ?? 7.0,
      tx3: grade.regularScores[2] ?? 7.0,
      midterm: grade.midtermScore,
      finalScore: grade.finalScore,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade) return;

    const regulars = [Number(editForm.tx1), Number(editForm.tx2), Number(editForm.tx3)];
    const totalWeight = regulars.length + 2 + 3;
    const computedAvg = Number(
      (
        (regulars.reduce((a, b) => a + b, 0) +
          Number(editForm.midterm) * 2 +
          Number(editForm.finalScore) * 3) /
        totalWeight
      ).toFixed(1)
    );

    const updatedGrade: SubjectGrade = {
      subjectId: editingGrade.grade.subjectId,
      subjectName: editingGrade.grade.subjectName,
      regularScores: regulars,
      midtermScore: Number(editForm.midterm),
      finalScore: Number(editForm.finalScore),
      averageScore: computedAvg,
    };

    onUpdateStudentGrade(editingGrade.student.id, updatedGrade);
    setEditingGrade(null);
  };

  return (
    <div className="space-y-5">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
            Sổ điểm học tập môn {currentSubjectObj.name}
          </h2>
          <p className="text-xs sm:text-sm text-[#66788A] mt-1">
            Đánh giá định kỳ và thường xuyên theo Thông tư 22/2021/TT-BGDĐT
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (tableRows.length > 0) {
                handleOpenEdit(tableRows[0].student, tableRows[0].grade);
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#08A67A] hover:bg-[#07966F] rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nhập / Chỉnh sửa điểm</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        {/* Subject Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[#172B4D]">Môn học:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] font-semibold bg-[#F5F8FC] focus:bg-white focus:outline-none focus:border-[#08A67A]"
          >
            {SUBJECTS_LIST.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          {/* Semester Selector */}
          <div className="flex items-center gap-1 bg-[#F5F8FC] p-1 rounded-lg border border-[#D9E2EC]/70 ml-2">
            <button
              onClick={() => setSelectedSemester('HK1')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedSemester === 'HK1'
                  ? 'bg-white text-[#172B4D] shadow-xs'
                  : 'text-[#66788A] hover:text-[#172B4D]'
              }`}
            >
              Học kỳ I
            </button>
            <button
              onClick={() => setSelectedSemester('HK2')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedSemester === 'HK2'
                  ? 'bg-white text-[#172B4D] shadow-xs'
                  : 'text-[#66788A] hover:text-[#172B4D]'
              }`}
            >
              Học kỳ II
            </button>
          </div>
        </div>

        {/* Search Student */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-[#9FB3C8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            placeholder="Tìm theo tên học sinh..."
            className="w-full pl-9 pr-3 py-2 bg-[#F5F8FC] border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:outline-none focus:border-[#08A67A] focus:bg-white"
          />
        </div>
      </div>

      {/* KPI Stats for this Subject */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)]">
          <div className="text-xs text-[#66788A] font-medium">Điểm TB môn {currentSubjectObj.name}</div>
          <div className="text-2xl font-bold text-[#172B4D] mt-1">{avgScore}</div>
          <div className="text-[11px] text-[#08A67A] font-medium">Toàn thể lớp 10A1</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)]">
          <div className="text-xs text-[#66788A] font-medium">Đạt điểm Tốt (≥ 8.0)</div>
          <div className="text-2xl font-bold text-[#08A67A] mt-1">{goodCount} HS</div>
          <div className="text-[11px] text-[#66788A]">
            {((goodCount / (tableRows.length || 1)) * 100).toFixed(0)}% sĩ số
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)]">
          <div className="text-xs text-[#66788A] font-medium">Cảnh báo điểm dưới 5.0</div>
          <div className="text-2xl font-bold text-[#E5484D] mt-1">{below5Count} HS</div>
          <div className="text-[11px] text-[#E5484D] font-medium">
            {below5Count > 0 ? 'Cần kế hoạch phụ đạo' : 'Không có'}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)]">
          <div className="text-xs text-[#66788A] font-medium">Quy chuẩn đánh giá</div>
          <div className="text-base font-bold text-[#3182CE] mt-1">Thông tư 22</div>
          <div className="text-[11px] text-[#66788A]">TX(1) · GK(2) · CK(3)</div>
        </div>
      </div>

      {/* Main Gradebook Table */}
      <div className="bg-white rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] border-b border-[#D9E2EC] font-semibold text-[#172B4D]">
              <tr>
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-4 min-w-[200px]">Học sinh</th>
                <th className="py-3 px-4 text-center">ĐĐG Thường xuyên (hs 1)</th>
                <th className="py-3 px-3 text-center">Giữa kỳ (hs 2)</th>
                <th className="py-3 px-3 text-center">Cuối kỳ (hs 3)</th>
                <th className="py-3 px-3 text-center">ĐTB Môn</th>
                <th className="py-3 px-3 text-center">Cảnh báo / Xếp loại</th>
                <th className="py-3 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2EC]/60 text-[#172B4D]">
              {tableRows.map((row, idx) => {
                const isLowGrade = row.grade.averageScore < 5.0 || row.grade.midtermScore < 5.0;
                return (
                  <tr
                    key={row.student.id}
                    className={`hover:bg-[#F5F8FC] transition-colors ${
                      isLowGrade ? 'bg-[#E5484D]/5' : ''
                    }`}
                  >
                    {/* STT */}
                    <td className="py-3 px-3 text-center text-[#66788A] font-medium">
                      {idx + 1}
                    </td>

                    {/* Student */}
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-[#172B4D] block">{row.student.fullName}</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#66788A]">
                          <span className="font-mono text-[#16324F]">{row.student.code}</span>
                          <span>·</span>
                          <span>Tổ {row.student.group}</span>
                        </div>
                      </div>
                    </td>

                    {/* ĐĐGtx */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {row.grade.regularScores.map((score, sIdx) => (
                          <span
                            key={sIdx}
                            className={`px-2 py-0.5 rounded font-mono font-semibold ${
                              score < 5.0
                                ? 'bg-[#E5484D]/10 text-[#E5484D] border border-[#E5484D]/25'
                                : 'bg-[#F5F8FC] text-[#172B4D] border border-[#D9E2EC]'
                            }`}
                          >
                            {score.toFixed(1)}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Midterm */}
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      <span
                        className={
                          row.grade.midtermScore < 5.0
                            ? 'text-[#E5484D] bg-[#E5484D]/10 px-2 py-0.5 rounded border border-[#E5484D]/25'
                            : 'text-[#172B4D]'
                        }
                      >
                        {row.grade.midtermScore.toFixed(1)}
                      </span>
                    </td>

                    {/* Final */}
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      <span
                        className={
                          row.grade.finalScore < 5.0
                            ? 'text-[#E5484D] bg-[#E5484D]/10 px-2 py-0.5 rounded border border-[#E5484D]/25'
                            : 'text-[#172B4D]'
                        }
                      >
                        {row.grade.finalScore.toFixed(1)}
                      </span>
                    </td>

                    {/* ĐTB Môn */}
                    <td className="py-3 px-3 text-center font-mono font-extrabold text-sm">
                      <span
                        className={
                          row.grade.averageScore < 5.0
                            ? 'text-[#E5484D]'
                            : row.grade.averageScore >= 8.0
                            ? 'text-[#08A67A]'
                            : 'text-[#172B4D]'
                        }
                      >
                        {row.grade.averageScore.toFixed(1)}
                      </span>
                    </td>

                    {/* Cảnh báo / Xếp loại */}
                    <td className="py-3 px-3 text-center">
                      {isLowGrade ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-[#E5484D] bg-[#E5484D]/10 border border-[#E5484D]/25">
                          <AlertCircle className="w-3 h-3" />
                          <span>Cảnh báo &lt; 5.0</span>
                        </span>
                      ) : row.grade.averageScore >= 8.0 ? (
                        <span className="text-[11px] font-semibold text-[#08A67A] bg-[#08A67A]/10 border border-[#08A67A]/25 px-2 py-0.5 rounded">
                          Tốt (Giỏi)
                        </span>
                      ) : row.grade.averageScore >= 6.5 ? (
                        <span className="text-[11px] font-semibold text-[#3182CE] bg-[#3182CE]/10 border border-[#3182CE]/25 px-2 py-0.5 rounded">
                          Khá
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-[#172B4D] bg-[#F5F8FC] border border-[#D9E2EC] px-2 py-0.5 rounded">
                          Đạt
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleOpenEdit(row.student, row.grade)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#172B4D] bg-white hover:bg-[#F5F8FC] rounded-md border border-[#D9E2EC] transition-colors shadow-xs cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#66788A]" />
                        <span>Sửa</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Grade Modal */}
      {editingGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16324F]/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-[#D9E2EC] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#D9E2EC] flex items-center justify-between bg-[#F5F8FC]">
              <div>
                <h3 className="font-bold text-[#172B4D] text-sm">
                  Cập nhật điểm môn {currentSubjectObj.name}
                </h3>
                <p className="text-xs text-[#66788A] mt-0.5">
                  Học sinh: {editingGrade.student.fullName} ({editingGrade.student.code})
                </p>
              </div>
              <button
                onClick={() => setEditingGrade(null)}
                className="p-1.5 text-[#66788A] hover:text-[#172B4D] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div className="space-y-3">
                <div className="font-semibold text-[#172B4D] pb-1 border-b border-[#D9E2EC]/60">
                  Điểm Đánh giá thường xuyên (ĐĐGtx)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-[#66788A] block mb-1">Cột 1</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={editForm.tx1}
                      onChange={(e) => setEditForm({ ...editForm, tx1: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-[#D9E2EC] rounded-lg text-center font-bold text-[#172B4D] focus:border-[#08A67A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#66788A] block mb-1">Cột 2</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={editForm.tx2}
                      onChange={(e) => setEditForm({ ...editForm, tx2: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-[#D9E2EC] rounded-lg text-center font-bold text-[#172B4D] focus:border-[#08A67A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#66788A] block mb-1">Cột 3</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={editForm.tx3}
                      onChange={(e) => setEditForm({ ...editForm, tx3: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-[#D9E2EC] rounded-lg text-center font-bold text-[#172B4D] focus:border-[#08A67A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="font-semibold text-[#172B4D] pt-2 pb-1 border-b border-[#D9E2EC]/60">
                  Điểm Đánh giá định kỳ
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#66788A] block mb-1">
                      Giữa kỳ (ĐĐGgk - hệ số 2)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={editForm.midterm}
                      onChange={(e) => setEditForm({ ...editForm, midterm: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-[#D9E2EC] rounded-lg text-center font-bold text-[#172B4D] focus:border-[#08A67A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#66788A] block mb-1">
                      Cuối kỳ (ĐĐGck - hệ số 3)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={editForm.finalScore}
                      onChange={(e) => setEditForm({ ...editForm, finalScore: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-[#D9E2EC] rounded-lg text-center font-bold text-[#172B4D] focus:border-[#08A67A] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#D9E2EC] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingGrade(null)}
                  className="px-4 py-2 font-semibold text-[#66788A] bg-[#F5F8FC] hover:bg-[#D9E2EC]/50 rounded-lg transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-[#08A67A] hover:bg-[#07966F] rounded-lg transition-colors cursor-pointer"
                >
                  Lưu điểm số
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
