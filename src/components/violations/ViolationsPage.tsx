import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  X,
  ShieldAlert
} from 'lucide-react';
import { ViolationRecord, Student } from '../../types';

interface ViolationsPageProps {
  violations: ViolationRecord[];
  students: Student[];
  onAddViolation: (newViolation: ViolationRecord) => void;
  onUpdateViolationStatus: (id: string, status: ViolationRecord['status']) => void;
}

export const ViolationsPage: React.FC<ViolationsPageProps> = ({
  violations,
  students,
  onAddViolation,
  onUpdateViolationStatus,
}) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'Nhắc nhở' | 'Khiển trách' | 'Cảnh cáo'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    studentId: students[0]?.id || '1',
    date: new Date().toISOString().split('T')[0],
    description: '',
    severity: 'Nhắc nhở' as ViolationRecord['severity'],
    resolution: '',
    status: 'Đang theo dõi' as ViolationRecord['status'],
  });

  const filtered = violations.filter((v) => {
    const matchSearch =
      v.studentName.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase()) ||
      v.resolution.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === 'all' || v.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) return;

    const student = students.find((s) => s.id === form.studentId);
    const newViolation: ViolationRecord = {
      id: `V${Date.now()}`,
      date: form.date,
      studentId: form.studentId,
      studentName: student?.fullName || 'Học sinh',
      description: form.description.trim(),
      severity: form.severity,
      resolution: form.resolution.trim() || 'Nhắc nhở tại lớp',
      status: form.status,
    };

    onAddViolation(newViolation);
    setShowAddModal(false);
    setForm({
      studentId: students[0]?.id || '1',
      date: new Date().toISOString().split('T')[0],
      description: '',
      severity: 'Nhắc nhở',
      resolution: '',
      status: 'Đang theo dõi',
    });
  };

  return (
    <div className="space-y-5">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
            Sổ ghi nhận vi phạm nề nếp
          </h2>
          <p className="text-xs sm:text-sm text-[#66788A] mt-1">
            Ghi nhận khách quan, giáo dục uốn nắn và phối hợp cùng cha mẹ học sinh
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#F59E0B] hover:bg-[#D97706] rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Ghi nhận vi phạm</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#9FB3C8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên học sinh, nội dung vi phạm..."
            className="w-full pl-9 pr-3 py-2 bg-[#F5F8FC] border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:outline-none focus:border-[#F59E0B] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#F5F8FC] p-1 rounded-lg border border-[#D9E2EC]/70">
          <span className="text-[#66788A] px-2 font-medium">Mức độ:</span>
          {(['all', 'Nhắc nhở', 'Khiển trách', 'Cảnh cáo'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                severityFilter === sev
                  ? 'bg-white text-[#172B4D] shadow-xs'
                  : 'text-[#66788A] hover:text-[#172B4D]'
              }`}
            >
              {sev === 'all' ? 'Tất cả' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Violations Table */}
      <div className="bg-white rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] border-b border-[#D9E2EC] font-semibold text-[#172B4D]">
              <tr>
                <th className="py-3 px-3 w-28">Ngày</th>
                <th className="py-3 px-4 min-w-[180px]">Học sinh</th>
                <th className="py-3 px-4 min-w-[220px]">Nội dung vi phạm</th>
                <th className="py-3 px-3">Mức độ</th>
                <th className="py-3 px-4 min-w-[220px]">Hướng xử lý của GVCN</th>
                <th className="py-3 px-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2EC]/60 text-[#172B4D]">
              {filtered.length > 0 ? (
                filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-[#F5F8FC] transition-colors">
                    {/* Ngày */}
                    <td className="py-3 px-3 font-mono font-medium text-[#66788A] whitespace-nowrap">
                      {v.date}
                    </td>

                    {/* Học sinh */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#172B4D]">{v.studentName}</div>
                      <span className="text-[10px] text-[#9FB3C8]">Mã: {v.studentId}</span>
                    </td>

                    {/* Nội dung */}
                    <td className="py-3 px-4 text-[#172B4D] font-medium">
                      {v.description}
                    </td>

                    {/* Mức độ */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-semibold text-[11px] ${
                          v.severity === 'Cảnh cáo'
                            ? 'text-[#E5484D] bg-[#E5484D]/10 border border-[#E5484D]/25'
                            : v.severity === 'Khiển trách'
                            ? 'text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/25'
                            : 'text-[#66788A] bg-[#F5F8FC] border border-[#D9E2EC]'
                        }`}
                      >
                        {v.severity}
                      </span>
                    </td>

                    {/* Hướng xử lý */}
                    <td className="py-3 px-4 text-[#66788A]">
                      {v.resolution}
                    </td>

                    {/* Trạng thái dropdown/tag */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <select
                        value={v.status}
                        onChange={(e) => onUpdateViolationStatus(v.id, e.target.value as ViolationRecord['status'])}
                        className={`text-xs p-1 rounded border font-medium cursor-pointer ${
                          v.status === 'Đã xử lý'
                            ? 'bg-[#08A67A]/10 text-[#08A67A] border-[#08A67A]/25'
                            : v.status === 'Chờ gặp PH'
                            ? 'bg-[#E5484D]/10 text-[#E5484D] border-[#E5484D]/25'
                            : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/25'
                        }`}
                      >
                        <option value="Đang theo dõi">Đang theo dõi</option>
                        <option value="Chờ gặp PH">Chờ gặp PH</option>
                        <option value="Đã xử lý">Đã xử lý</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#66788A]">
                    Không có vi phạm nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Violation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16324F]/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-[#D9E2EC] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#D9E2EC] flex items-center justify-between bg-[#F5F8FC]">
              <h3 className="font-bold text-[#172B4D] text-sm">
                Ghi nhận vi phạm nề nếp học sinh
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
                    className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] font-medium focus:border-[#F59E0B] focus:outline-none"
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.fullName} ({st.code} - Tổ {st.group})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#172B4D]">Ngày vi phạm</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:border-[#F59E0B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#172B4D]">Nội dung vi phạm cụ thể *</label>
                <textarea
                  required
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="VD: Không làm bài tập về nhà môn Hóa; Đi muộn 20 phút..."
                  className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:border-[#F59E0B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#172B4D]">Mức độ xử lý</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value as any })}
                    className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:border-[#F59E0B] focus:outline-none"
                  >
                    <option value="Nhắc nhở">Nhắc nhở</option>
                    <option value="Khiển trách">Khiển trách</option>
                    <option value="Cảnh cáo">Cảnh cáo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#172B4D]">Trạng thái giải quyết</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:border-[#F59E0B] focus:outline-none"
                  >
                    <option value="Đang theo dõi">Đang theo dõi</option>
                    <option value="Chờ gặp PH">Chờ gặp PH</option>
                    <option value="Đã xử lý">Đã xử lý</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#172B4D]">Hướng xử lý / Biện pháp giáo dục</label>
                <textarea
                  rows={2}
                  value={form.resolution}
                  onChange={(e) => setForm({ ...form, resolution: e.target.value })}
                  placeholder="VD: Viết bản tự kiểm điểm, liên hệ phụ huynh hỗ trợ giám sát..."
                  className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:border-[#F59E0B] focus:outline-none"
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
                  className="px-4 py-2 font-semibold text-white bg-[#F59E0B] hover:bg-[#D97706] rounded-lg cursor-pointer"
                >
                  Ghi nhận vi phạm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
