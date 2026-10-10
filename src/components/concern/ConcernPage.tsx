import React, { useState } from 'react';
import {
  HeartHandshake,
  AlertTriangle,
  CheckCircle,
  Eye,
  Phone,
  MessageSquare,
  FileEdit,
  Clock,
  TrendingDown,
  Info,
  X
} from 'lucide-react';
import { ConcernStudent, Student, ConcernLevel } from '../../types';

interface ConcernPageProps {
  concernList: ConcernStudent[];
  allStudents: Student[];
  onViewStudentProfile: (studentId: string) => void;
  onUpdateConcernStudent?: (updated: ConcernStudent) => void;
}

export const ConcernPage: React.FC<ConcernPageProps> = ({
  concernList,
  allStudents,
  onViewStudentProfile,
  onUpdateConcernStudent,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | ConcernLevel>('all');
  const [contactModalStudent, setContactModalStudent] = useState<{
    student: Student;
    concern: ConcernStudent;
  } | null>(null);

  // Group students
  const highConcern = concernList.filter((c) => c.level === 'high');
  const mediumConcern = concernList.filter((c) => c.level === 'medium');

  // Normal students are all other students in class not in high/medium
  const concernStudentIds = new Set(concernList.map((c) => c.studentId));
  const normalStudents = allStudents.filter((s) => !concernStudentIds.has(s.id));

  const filteredConcern = concernList.filter((c) => {
    if (activeFilter === 'all') return true;
    return c.level === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header & Principles Box */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight flex items-center gap-2">
              <HeartHandshake className="w-6 h-6 text-[#E5484D]" />
              <span>Học sinh cần quan tâm & Theo dõi sát</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#66788A] mt-1">
              Bảng điều khiển cảnh báo học đường dựa trên dữ liệu định lượng (Điểm số, Chuyên cần, Nề nếp)
            </p>
          </div>
        </div>

        {/* Data-Grounded Ethics Notice - Explicit requirement from user */}
        <div className="mt-4 p-3.5 bg-[#3182CE]/5 border border-[#3182CE]/20 rounded-xl text-xs text-[#172B4D] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#3182CE] mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <span className="font-bold text-[#172B4D]">Nguyên tắc đánh giá khách quan:</span>
            <p className="text-[#66788A]">
              Hệ thống tuyệt đối không dùng trí tuệ nhân tạo để phán xét phẩm chất hay đạo đức của học sinh. Các mức cảnh báo bên dưới hoàn toàn xuất phát từ số liệu thực tế về <strong>điểm kiểm tra dưới 5.0</strong>, <strong>số buổi vắng học</strong>, <strong>số lần đi muộn</strong> và <strong>nội quy nề nếp</strong> nhằm mục đích hỗ trợ học sinh tiến bộ.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Categories Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1: 🔴 Cần quan tâm */}
        <div
          onClick={() => setActiveFilter('high')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeFilter === 'high'
              ? 'ring-2 ring-[#E5484D] border-[#E5484D]/40 bg-[#E5484D]/5 shadow-xs'
              : 'border-[#E5484D]/25 bg-white hover:border-[#E5484D]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E5484D]" />
              <h3 className="font-bold text-[#172B4D] text-sm">🔴 Cần quan tâm</h3>
            </div>
            <span className="text-xs font-bold text-[#E5484D] bg-[#E5484D]/10 px-2 py-0.5 rounded border border-[#E5484D]/20">
              {highConcern.length} học sinh
            </span>
          </div>
          <p className="text-xs text-[#66788A] mt-2">
            Có &ge; 2 tiêu chí cần can thiệp: Vắng không phép, điểm tụt dưới trung bình, cần gặp phụ huynh.
          </p>
        </div>

        {/* Tier 2: 🟡 Cần theo dõi */}
        <div
          onClick={() => setActiveFilter('medium')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeFilter === 'medium'
              ? 'ring-2 ring-[#F59E0B] border-[#F59E0B]/40 bg-[#F59E0B]/5 shadow-xs'
              : 'border-[#F59E0B]/25 bg-white hover:border-[#F59E0B]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <h3 className="font-bold text-[#172B4D] text-sm">🟡 Cần theo dõi</h3>
            </div>
            <span className="text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/20">
              {mediumConcern.length} học sinh
            </span>
          </div>
          <p className="text-xs text-[#66788A] mt-2">
            Có 1 tiêu chí biến động: Điểm môn ngoại ngữ giảm, đi muộn 1-2 lần, cần nhắc nhở động viên.
          </p>
        </div>

        {/* Tier 3: 🟢 Bình thường */}
        <div
          onClick={() => setActiveFilter('normal')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeFilter === 'normal'
              ? 'ring-2 ring-[#08A67A] border-[#08A67A]/40 bg-[#08A67A]/5 shadow-xs'
              : 'border-[#08A67A]/25 bg-white hover:border-[#08A67A]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#08A67A]" />
              <h3 className="font-bold text-[#172B4D] text-sm">🟢 Bình thường</h3>
            </div>
            <span className="text-xs font-bold text-[#08A67A] bg-[#08A67A]/10 px-2 py-0.5 rounded border border-[#08A67A]/20">
              {normalStudents.length} học sinh
            </span>
          </div>
          <p className="text-xs text-[#66788A] mt-2">
            Học lực từ Đạt trở lên, chuyên cần tốt, thực hiện nghiêm túc nội quy trường lớp.
          </p>
        </div>
      </div>

      {/* Filter Segmented Control */}
      <div className="flex items-center gap-1 bg-[#F5F8FC] p-1 rounded-lg border border-[#D9E2EC] w-fit text-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-white text-[#172B4D] shadow-xs'
              : 'text-[#66788A] hover:text-[#172B4D]'
          }`}
        >
          Tất cả danh sách ({concernList.length + (activeFilter === 'normal' ? normalStudents.length : 0)})
        </button>
        <button
          onClick={() => setActiveFilter('high')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            activeFilter === 'high'
              ? 'bg-white text-[#E5484D] shadow-xs font-bold'
              : 'text-[#66788A] hover:text-[#172B4D]'
          }`}
        >
          🔴 Cần quan tâm ({highConcern.length})
        </button>
        <button
          onClick={() => setActiveFilter('medium')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            activeFilter === 'medium'
              ? 'bg-white text-[#F59E0B] shadow-xs font-bold'
              : 'text-[#66788A] hover:text-[#172B4D]'
          }`}
        >
          🟡 Cần theo dõi ({mediumConcern.length})
        </button>
        <button
          onClick={() => setActiveFilter('normal')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            activeFilter === 'normal'
              ? 'bg-white text-[#08A67A] shadow-xs font-bold'
              : 'text-[#66788A] hover:text-[#172B4D]'
          }`}
        >
          🟢 Bình thường ({normalStudents.length})
        </button>
      </div>

      {/* Normal Students Section if activeFilter === 'normal' */}
      {activeFilter === 'normal' ? (
        <div className="bg-white rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] p-5">
          <h3 className="font-bold text-[#172B4D] text-sm mb-3">
            Danh sách học sinh trong diện Bình thường ({normalStudents.length} học sinh)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {normalStudents.map((st) => (
              <div
                key={st.id}
                className="p-3 rounded-lg border border-[#D9E2EC] bg-[#F5F8FC] flex items-center justify-between text-xs hover:bg-white transition-colors"
              >
                <div>
                  <div className="font-bold text-[#172B4D]">{st.fullName}</div>
                  <div className="text-[#66788A] mt-0.5">
                    {st.code} · Tổ {st.group} · ĐTB: <strong className="text-[#08A67A]">{st.gpa.toFixed(1)}</strong>
                  </div>
                </div>
                <button
                  onClick={() => onViewStudentProfile(st.id)}
                  className="p-1.5 text-[#66788A] hover:text-[#08A67A] rounded-md hover:bg-white border border-transparent hover:border-[#D9E2EC] cursor-pointer"
                  title="Xem hồ sơ"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Concern Cards List (🔴 & 🟡) */
        <div className="space-y-4">
          {filteredConcern.map((item) => {
            const student = allStudents.find((s) => s.id === item.studentId);
            return (
              <div
                key={item.studentId}
                className={`bg-white rounded-xl border shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] overflow-hidden transition-all ${
                  item.level === 'high' ? 'border-[#E5484D]/30' : 'border-[#F59E0B]/30'
                }`}
              >
                {/* Header of Student Card */}
                <div
                  className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.level === 'high' ? 'bg-[#E5484D]/5 border-[#E5484D]/15' : 'bg-[#F59E0B]/5 border-[#F59E0B]/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#16324F]/10 border border-[#16324F]/15 overflow-hidden shrink-0 flex items-center justify-center font-bold text-[#16324F] text-xs shadow-xs">
                      {student?.avatarUrl ? (
                        <img src={student.avatarUrl} alt={item.studentName} className="w-full h-full object-cover" />
                      ) : (
                        item.studentName.slice(-2)
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#172B4D] text-base">
                          {item.studentName}
                        </span>
                        <span className="text-xs text-[#66788A] font-mono">
                          {item.code}
                        </span>
                        <span className="text-xs text-[#66788A]">
                          Tổ {student?.group}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#66788A] mt-0.5">
                        Cập nhật chỉ số mới nhất: {item.lastUpdated}
                      </div>
                    </div>
                  </div>

                  {/* Level Tag & Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`text-xs px-2.5 py-1 rounded font-bold ${
                        item.level === 'high'
                          ? 'text-[#E5484D] bg-[#E5484D]/10 border border-[#E5484D]/25'
                          : 'text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/25'
                      }`}
                    >
                      {item.level === 'high' ? '🔴 Mức độ Cần quan tâm' : '🟡 Mức độ Cần theo dõi'}
                    </span>

                    {student && (
                      <button
                        onClick={() => setContactModalStudent({ student, concern: item })}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-[#08A67A] bg-[#08A67A]/10 hover:bg-[#08A67A]/20 border border-[#08A67A]/25 rounded-lg transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#08A67A]" />
                        <span>Liên hệ phụ huynh</span>
                      </button>
                    )}

                    <button
                      onClick={() => onViewStudentProfile(item.studentId)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-[#172B4D] bg-white hover:bg-[#F5F8FC] border border-[#D9E2EC] rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#66788A]" />
                      <span>Xem hồ sơ</span>
                    </button>
                  </div>
                </div>

                {/* Body Metrics & Reasons */}
                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Left: Quantitative Metrics */}
                  <div className="bg-[#F5F8FC] p-3.5 rounded-lg border border-[#D9E2EC] space-y-2">
                    <span className="font-bold text-[#172B4D] uppercase tracking-wider text-[11px] block">
                      Số liệu cảnh báo cụ thể
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[#172B4D]">
                      <div className="bg-white p-2 rounded border border-[#D9E2EC]">
                        <span className="text-[10px] text-[#66788A] block">ĐTB học tập</span>
                        <strong className="text-sm font-bold text-[#172B4D]">{item.metrics.gpa}</strong>
                      </div>
                      <div className="bg-white p-2 rounded border border-[#D9E2EC]">
                        <span className="text-[10px] text-[#66788A] block">Nghỉ K.phép</span>
                        <strong className={`text-sm font-bold ${item.metrics.unexcusedAbsence > 0 ? 'text-[#E5484D]' : 'text-[#172B4D]'}`}>
                          {item.metrics.unexcusedAbsence} buổi
                        </strong>
                      </div>
                      <div className="bg-white p-2 rounded border border-[#D9E2EC]">
                        <span className="text-[10px] text-[#66788A] block">Số lần đi muộn</span>
                        <strong className={`text-sm font-bold ${item.metrics.lateCount > 1 ? 'text-[#F59E0B]' : 'text-[#172B4D]'}`}>
                          {item.metrics.lateCount} lần
                        </strong>
                      </div>
                      <div className="bg-white p-2 rounded border border-[#D9E2EC]">
                        <span className="text-[10px] text-[#66788A] block">Vi phạm nề nếp</span>
                        <strong className="text-sm font-bold text-[#172B4D]">
                          {item.metrics.violationCount} vụ việc
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Concrete reasons */}
                  <div className="space-y-2 md:col-span-2">
                    <span className="font-bold text-[#172B4D] uppercase tracking-wider text-[11px] block">
                      Các sự kiện cụ thể kích hoạt cảnh báo
                    </span>
                    <div className="space-y-1.5">
                      {item.reasons.map((r, rIdx) => (
                        <div
                          key={rIdx}
                          className="flex items-start gap-2 p-2 bg-[#F5F8FC] rounded-md border border-[#D9E2EC] text-[#172B4D]"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] mt-0.5 shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 p-2.5 bg-[#08A67A]/5 rounded-lg border border-[#08A67A]/25 text-[#172B4D]">
                      <strong className="text-[#08A67A]">Kế hoạch giáo dục của GVCN: </strong>
                      <span>{item.suggestedAction}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Contact Modal */}
      {contactModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16324F]/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-[#D9E2EC] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#D9E2EC] flex items-center justify-between bg-[#F5F8FC]">
              <h3 className="font-bold text-[#172B4D] text-sm">
                Liên hệ trao đổi với Cha mẹ học sinh
              </h3>
              <button
                onClick={() => setContactModalStudent(null)}
                className="p-1.5 text-[#66788A] hover:text-[#172B4D] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#D9E2EC]">
                <div className="font-bold text-[#172B4D] text-sm">
                  {contactModalStudent.student.fullName} ({contactModalStudent.student.code})
                </div>
                <div className="mt-1 text-[#66788A] space-y-0.5">
                  <p>Phụ huynh: <strong className="text-[#172B4D]">{contactModalStudent.student.parentName}</strong></p>
                  <p>Số điện thoại: <strong className="font-mono text-[#08A67A]">{contactModalStudent.student.parentPhone}</strong></p>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#172B4D] block mb-1">
                  Mẫu tin nhắn đề xuất (Gửi Zalo / Tin nhắn SMS):
                </label>
                <textarea
                  readOnly
                  rows={4}
                  className="w-full p-2.5 bg-[#F5F8FC] border border-[#D9E2EC] rounded-lg text-[#172B4D] font-mono text-[11px]"
                  value={`Kính gửi phụ huynh em ${contactModalStudent.student.fullName}, tôi là thầy Nguyễn Văn Xuyên (Giáo viên chủ nhiệm). Tôi xin phép liên hệ để trao đổi nhanh với gia đình về tình hình chuyên cần và học tập của em trong tuần qua: ${contactModalStudent.concern.reasons[0]}. Kính mong phụ huynh gọi lại hoặc sắp xếp lịch hẹn vào chiều thứ Sáu.`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setContactModalStudent(null)}
                  className="px-4 py-2 font-semibold text-[#66788A] bg-[#F5F8FC] hover:bg-[#D9E2EC]/50 rounded-lg cursor-pointer"
                >
                  Đóng
                </button>
                <a
                  href={`tel:${contactModalStudent.student.parentPhone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-[#08A67A] hover:bg-[#07966F] rounded-lg transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Gọi điện thoại</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
