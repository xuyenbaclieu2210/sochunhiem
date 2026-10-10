import React, { useState } from 'react';
import {
  Award,
  Plus,
  Search,
  CheckCircle2,
  Sparkles,
  Medal,
  X
} from 'lucide-react';
import { AwardRecord, Student } from '../../types';

interface AwardsPageProps {
  awards: AwardRecord[];
  students: Student[];
  onAddAward: (newAward: AwardRecord) => void;
}

export const AwardsPage: React.FC<AwardsPageProps> = ({
  awards,
  students,
  onAddAward,
}) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    studentId: students[0]?.id || '1',
    date: new Date().toISOString().split('T')[0],
    title: '',
    form: 'Tuyên dương trước lớp' as AwardRecord['form'],
    note: '',
  });

  const filtered = awards.filter((a) => {
    return (
      a.studentName.toLowerCase().includes(search.toLowerCase()) ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.form.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const student = students.find((s) => s.id === form.studentId);
    const newAward: AwardRecord = {
      id: `A${Date.now()}`,
      date: form.date,
      studentId: form.studentId,
      studentName: student?.fullName || 'Học sinh',
      title: form.title.trim(),
      form: form.form,
      note: form.note.trim() || 'Ghi nhận vào học bạ thi đua',
    };

    onAddAward(newAward);
    setShowAddModal(false);
    setForm({
      studentId: students[0]?.id || '1',
      date: new Date().toISOString().split('T')[0],
      title: '',
      form: 'Tuyên dương trước lớp',
      note: '',
    });
  };

  return (
    <div className="space-y-5">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
            Sổ khen thưởng & Thành tích học sinh
          </h2>
          <p className="text-xs sm:text-sm text-[#66788A] mt-1">
            Tuyên dương các cá nhân có thành tích xuất sắc trong học tập và phong trào
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#08A67A] hover:bg-[#07966F] rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm khen thưởng</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#9FB3C8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên học sinh, thành tích..."
            className="w-full pl-9 pr-3 py-2 bg-[#F5F8FC] border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:outline-none focus:border-[#08A67A] focus:bg-white"
          />
        </div>

        <div className="text-[#66788A]">
          Tổng số khen thưởng: <strong className="text-[#172B4D]">{awards.length}</strong> lượt
        </div>
      </div>

      {/* Awards Table */}
      <div className="bg-white rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] border-b border-[#D9E2EC] font-semibold text-[#172B4D]">
              <tr>
                <th className="py-3 px-3 w-28">Ngày</th>
                <th className="py-3 px-4 min-w-[180px]">Học sinh</th>
                <th className="py-3 px-4 min-w-[240px]">Nội dung khen thưởng</th>
                <th className="py-3 px-3 min-w-[160px]">Hình thức</th>
                <th className="py-3 px-4 min-w-[200px]">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2EC]/60 text-[#172B4D]">
              {filtered.length > 0 ? (
                filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-[#F5F8FC] transition-colors">
                    {/* Ngày */}
                    <td className="py-3 px-3 font-mono font-medium text-[#66788A] whitespace-nowrap">
                      {a.date}
                    </td>

                    {/* Học sinh */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#172B4D]">{a.studentName}</div>
                      <span className="text-[10px] text-[#9FB3C8]">Mã: {a.studentId}</span>
                    </td>

                    {/* Nội dung */}
                    <td className="py-3 px-4 font-semibold text-[#172B4D]">
                      <div className="flex items-start gap-1.5">
                        <Medal className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                        <span>{a.title}</span>
                      </div>
                    </td>

                    {/* Hình thức */}
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded font-semibold text-[11px] text-[#08A67A] bg-[#08A67A]/10 border border-[#08A67A]/25">
                        {a.form}
                      </span>
                    </td>

                    {/* Ghi chú */}
                    <td className="py-3 px-4 text-[#66788A]">
                      {a.note}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#66788A]">
                    Chưa có khen thưởng nào phù hợp với tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Award Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16324F]/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-[#D9E2EC] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#D9E2EC] flex items-center justify-between bg-[#F5F8FC]">
              <h3 className="font-bold text-[#172B4D] text-sm">
                Thêm quyết định khen thưởng học sinh
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-[#66788A] hover:text-[#172B4D] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#172B4D]">Chọn học sinh *</label>
                  <select
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                    className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] font-medium focus:border-[#08A67A] focus:outline-none"
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.fullName} ({st.code} - Tổ {st.group})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#172B4D]">Ngày khen thưởng</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:border-[#08A67A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#172B4D]">Nội dung khen thưởng *</label>
                <textarea
                  required
                  rows={2}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="VD: Đạt giải Nhất cuộc thi Hùng biện Tiếng Anh cấp trường..."
                  className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:border-[#08A67A] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#172B4D]">Hình thức khen thưởng</label>
                <select
                  value={form.form}
                  onChange={(e) => setForm({ ...form, form: e.target.value as any })}
                  className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:border-[#08A67A] focus:outline-none"
                >
                  <option value="Tuyên dương trước lớp">Tuyên dương trước lớp</option>
                  <option value="Giấy khen cấp trường">Giấy khen cấp trường</option>
                  <option value="Điểm cộng rèn luyện">Điểm cộng rèn luyện</option>
                  <option value="Khen thưởng phong trào">Khen thưởng phong trào</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#172B4D]">Ghi chú khen thưởng</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Ghi chú chi tiết hoặc điểm thi đua..."
                  className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:border-[#08A67A] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#D9E2EC] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-[#66788A] bg-[#F5F8FC] hover:bg-[#D9E2EC]/50 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-[#08A67A] hover:bg-[#07966F] rounded-lg cursor-pointer"
                >
                  Lưu khen thưởng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
