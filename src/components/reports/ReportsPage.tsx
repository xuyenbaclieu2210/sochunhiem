import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  FileText,
  Users,
  CalendarCheck,
  GraduationCap,
  AlertTriangle,
  Award,
  HeartHandshake,
  Download,
  Eye,
  CheckCircle2
} from 'lucide-react';
import {
  Student,
  DailyAttendance,
  ViolationRecord,
  AwardRecord,
  ConcernStudent,
  ClassInfo,
  SubjectGrade,
  CompetitionWeek,
  CompetitionRecord
} from '../../types';

interface ReportsPageProps {
  classInfo: ClassInfo;
  students: Student[];
  attendance: DailyAttendance;
  violations: ViolationRecord[];
  awards: AwardRecord[];
  concerns: ConcernStudent[];
  gradesMap?: Record<string, SubjectGrade[]>;
  competitionWeeks?: CompetitionWeek[];
  competitionRecords?: CompetitionRecord[];
}

type ReportType =
  | 'students'
  | 'attendance'
  | 'violations'
  | 'awards'
  | 'concerns';

export const ReportsPage: React.FC<ReportsPageProps> = ({
  classInfo,
  students,
  attendance,
  violations,
  awards,
  concerns,
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('students');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const reportTypes = [
    {
      id: 'students' as ReportType,
      title: 'Danh sách học sinh',
      description: 'Sơ yếu lý lịch, tổ, thông tin liên lạc phụ huynh',
      icon: <Users className="w-5 h-5 text-[#3182CE]" />,
      count: `${students.length} HS`,
    },
    {
      id: 'attendance' as ReportType,
      title: 'Báo cáo chuyên cần',
      description: 'Tình hình vắng phép, không phép, đi muộn Tuần 5 (05/10 – 10/10)',
      icon: <CalendarCheck className="w-5 h-5 text-[#08A67A]" />,
      count: '96.4%',
    },
    {
      id: 'violations' as ReportType,
      title: 'Báo cáo vi phạm',
      description: 'Tổng hợp các trường hợp vi phạm nề nếp và xử lý',
      icon: <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />,
      count: `${violations.length} vụ`,
    },
    {
      id: 'awards' as ReportType,
      title: 'Báo cáo khen thưởng',
      description: 'Danh sách thành tích học tập và thi đua phong trào',
      icon: <Award className="w-5 h-5 text-[#08A67A]" />,
      count: `${awards.length} lượt`,
    },
    {
      id: 'concerns' as ReportType,
      title: 'Danh sách học sinh cần quan tâm',
      description: 'Thống kê các học sinh trong diện theo dõi hỗ trợ',
      icon: <HeartHandshake className="w-5 h-5 text-[#E5484D]" />,
      count: `${concerns.length} HS`,
    },
  ];

  // Real CSV / Excel export generator
  const handleExportExcel = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    let fileName = `Bao_Cao_${selectedReport}_${classInfo.className}_2026.csv`;

    if (selectedReport === 'students') {
      csvContent += 'STT,Mã HS,Họ và tên,Giới tính,Ngày sinh,Tổ,SĐT,Phụ huynh,SĐT Phụ huynh,Chức vụ,Địa chỉ\n';
      students.forEach((st, idx) => {
        csvContent += `"${idx + 1}","${st.code}","${st.fullName}","${st.gender}","${st.dob}","Tổ ${st.group}","${st.phone}","${st.parentName}","${st.parentPhone}","${st.role}","${st.address}"\n`;
      });
    } else if (selectedReport === 'attendance') {
      csvContent += 'STT,Mã HS,Họ và tên,Tổ,Trạng thái ngày 08/10/2026 (Tuần 5),Ghi chú\n';
      attendance.records.forEach((r, idx) => {
        csvContent += `"${idx + 1}","HS100${idx + 1}","${r.studentName}","Tổ ${r.group}","${r.status}","${r.note || ''}"\n`;
      });
    } else if (selectedReport === 'violations') {
      csvContent += 'Ngày,Học sinh,Nội dung,Mức độ,Hướng xử lý,Trạng thái\n';
      violations.forEach((v) => {
        csvContent += `"${v.date}","${v.studentName}","${v.description}","${v.severity}","${v.resolution}","${v.status}"\n`;
      });
    } else if (selectedReport === 'awards') {
      csvContent += 'Ngày,Học sinh,Nội dung khen thưởng,Hình thức,Ghi chú\n';
      awards.forEach((a) => {
        csvContent += `"${a.date}","${a.studentName}","${a.title}","${a.form}","${a.note}"\n`;
      });
    } else if (selectedReport === 'concerns') {
      csvContent += 'Mã HS,Họ tên,Mức độ,ĐTB,Nghỉ KP,Đi muộn,Vi phạm,Lý do chính\n';
      concerns.forEach((c) => {
        csvContent += `"${c.code}","${c.studentName}","${c.level}","${c.metrics.gpa}","${c.metrics.unexcusedAbsence}","${c.metrics.lateCount}","${c.metrics.violationCount}","${c.reasons[0]}"\n`;
      });
    } else {
      csvContent += 'STT,Mã HS,Họ tên,ĐTB Tổng kết,Học lực\n';
      students.forEach((st, idx) => {
        csvContent += `"${idx + 1}","${st.code}","${st.fullName}","${st.gpa}","${st.gpa >= 8.0 ? 'Tốt' : st.gpa >= 6.5 ? 'Khá' : 'Đạt'}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(`Đã tạo và tải xuống tập tin Excel/CSV cho: ${reportTypes.find(r => r.id === selectedReport)?.title}`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentReportObj = reportTypes.find((r) => r.id === selectedReport)!;

  return (
    <div className="space-y-6">
      {/* Header and Print / Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
            Báo cáo tổng kết Lớp {classInfo.className}
          </h2>
          <p className="text-xs sm:text-sm text-[#66788A] mt-1">
            Tổng hợp dữ liệu báo cáo Ban Giám hiệu, Đoàn trường và Họp Phụ huynh học sinh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#172B4D] bg-white hover:bg-[#F5F8FC] rounded-lg border border-[#D9E2EC] shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#66788A]" />
            <span>In báo cáo</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#08A67A] hover:bg-[#07966F] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-[#08A67A]/10 border border-[#08A67A]/25 text-[#08A67A] text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#08A67A] shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 6 Report Types Cards Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {reportTypes.map((item) => {
          const isSelected = selectedReport === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedReport(item.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#08A67A]/5 border-[#08A67A] ring-2 ring-[#08A67A]/25 shadow-xs'
                  : 'bg-white border-[#D9E2EC] hover:border-[#B8C7D9]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-lg bg-[#F5F8FC] border border-[#D9E2EC] flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-[#172B4D] bg-[#F5F8FC] px-2 py-0.5 rounded border border-[#D9E2EC]">
                  {item.count}
                </span>
              </div>
              <h3 className="font-bold text-[#172B4D] text-sm mt-3">{item.title}</h3>
              <p className="text-xs text-[#66788A] mt-1">{item.description}</p>
              <div className="mt-3 pt-2 border-t border-[#D9E2EC]/50 flex items-center justify-between text-xs">
                <span className={isSelected ? 'text-[#08A67A] font-bold' : 'text-[#66788A]'}>
                  {isSelected ? 'Đang xem báo cáo' : 'Nhấn để xem'}
                </span>
                <Eye className={`w-3.5 h-3.5 ${isSelected ? 'text-[#08A67A]' : 'text-[#66788A]'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Preview Container */}
      <div className="bg-white rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] overflow-hidden">
        {/* Document Header in Preview */}
        <div className="p-6 border-b border-[#D9E2EC] bg-[#F5F8FC]">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[#66788A] font-semibold">
                TRƯỜNG THPT CHU VĂN AN · NĂM HỌC 2026–2027
              </div>
              <h3 className="text-lg font-bold text-[#172B4D] mt-1">
                BẢNG BÁO CÁO: {currentReportObj.title.toUpperCase()}
              </h3>
              <p className="text-xs text-[#66788A] mt-0.5">
                Lớp: <strong className="text-[#172B4D]">{classInfo.className}</strong> · Giáo viên chủ nhiệm: <strong className="text-[#172B4D]">{classInfo.homeroomTeacher}</strong>
              </p>
            </div>
            <div className="text-right text-xs text-[#66788A] self-start sm:self-auto">
              <div>Thời gian kết xuất: 08/10/2026</div>
              <div>Trạng thái: <strong className="text-[#08A67A]">Dữ liệu chính thức</strong></div>
            </div>
          </div>
        </div>

        {/* Dynamic Table Preview */}
        <div className="overflow-x-auto p-2">
          {selectedReport === 'students' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F8FC] border-b border-[#D9E2EC] text-[#172B4D] font-semibold">
                <tr>
                  <th className="py-2.5 px-3 text-center">STT</th>
                  <th className="py-2.5 px-3">Mã HS</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Giới tính</th>
                  <th className="py-2.5 px-3">Ngày sinh</th>
                  <th className="py-2.5 px-3">Tổ</th>
                  <th className="py-2.5 px-3">Phụ huynh</th>
                  <th className="py-2.5 px-3">SĐT Phụ huynh</th>
                  <th className="py-2.5 px-3">Địa chỉ thường trú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E2EC]/60 text-[#172B4D]">
                {students.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-[#F5F8FC]">
                    <td className="py-2 px-3 text-center font-medium text-[#66788A]">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono font-bold text-[#16324F]">{st.code}</td>
                    <td className="py-2 px-3 font-bold text-[#172B4D]">{st.fullName}</td>
                    <td className="py-2 px-3">{st.gender}</td>
                    <td className="py-2 px-3 font-mono text-[#66788A]">{st.dob}</td>
                    <td className="py-2 px-3">Tổ {st.group}</td>
                    <td className="py-2 px-3">{st.parentName}</td>
                    <td className="py-2 px-3 font-mono text-[#66788A]">{st.parentPhone}</td>
                    <td className="py-2 px-3 truncate max-w-[200px] text-[#66788A]">{st.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'attendance' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F8FC] border-b border-[#D9E2EC] text-[#172B4D] font-semibold">
                <tr>
                  <th className="py-2.5 px-3 text-center">STT</th>
                  <th className="py-2.5 px-3">Học sinh</th>
                  <th className="py-2.5 px-3 text-center">Tổ</th>
                  <th className="py-2.5 px-3 text-center">Điểm danh ngày 08/10</th>
                  <th className="py-2.5 px-3">Lý do & Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E2EC]/60 text-[#172B4D]">
                {attendance.records.map((r, idx) => (
                  <tr key={r.studentId} className="hover:bg-[#F5F8FC]">
                    <td className="py-2 px-3 text-center font-medium text-[#66788A]">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-[#172B4D]">{r.studentName}</td>
                    <td className="py-2 px-3 text-center">Tổ {r.group}</td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                          r.status === 'present'
                            ? 'text-[#08A67A] bg-[#08A67A]/10 border border-[#08A67A]/25'
                            : r.status === 'excused'
                            ? 'text-[#3182CE] bg-[#3182CE]/10 border border-[#3182CE]/25'
                            : r.status === 'late'
                            ? 'text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/25'
                            : 'text-[#E5484D] bg-[#E5484D]/10 border border-[#E5484D]/25'
                        }`}
                      >
                        {r.status === 'present'
                          ? 'Có mặt'
                          : r.status === 'excused'
                          ? 'Nghỉ phép'
                          : r.status === 'late'
                          ? 'Đi muộn'
                          : 'Nghỉ K.phép'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-[#66788A]">{r.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'violations' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F8FC] border-b border-[#D9E2EC] text-[#172B4D] font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Ngày</th>
                  <th className="py-2.5 px-3">Học sinh</th>
                  <th className="py-2.5 px-3">Nội dung vi phạm</th>
                  <th className="py-2.5 px-3">Mức độ</th>
                  <th className="py-2.5 px-3">Hướng xử lý</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E2EC]/60 text-[#172B4D]">
                {violations.map((v) => (
                  <tr key={v.id} className="hover:bg-[#F5F8FC]">
                    <td className="py-2 px-3 font-mono text-[#66788A]">{v.date}</td>
                    <td className="py-2 px-3 font-bold text-[#172B4D]">{v.studentName}</td>
                    <td className="py-2 px-3">{v.description}</td>
                    <td className="py-2 px-3">
                      <span className="font-semibold text-[#E5484D]">{v.severity}</span>
                    </td>
                    <td className="py-2 px-3 text-[#66788A]">{v.resolution}</td>
                    <td className="py-2 px-3 font-medium text-[#172B4D]">{v.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'awards' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F8FC] border-b border-[#D9E2EC] text-[#172B4D] font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Ngày</th>
                  <th className="py-2.5 px-3">Học sinh</th>
                  <th className="py-2.5 px-3">Nội dung khen thưởng</th>
                  <th className="py-2.5 px-3">Hình thức</th>
                  <th className="py-2.5 px-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E2EC]/60 text-[#172B4D]">
                {awards.map((a) => (
                  <tr key={a.id} className="hover:bg-[#F5F8FC]">
                    <td className="py-2 px-3 font-mono text-[#66788A]">{a.date}</td>
                    <td className="py-2 px-3 font-bold text-[#172B4D]">{a.studentName}</td>
                    <td className="py-2 px-3 font-semibold text-[#172B4D]">{a.title}</td>
                    <td className="py-2 px-3 font-medium text-[#08A67A]">{a.form}</td>
                    <td className="py-2 px-3 text-[#66788A]">{a.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'concerns' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F8FC] border-b border-[#D9E2EC] text-[#172B4D] font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Mã HS</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Phân loại</th>
                  <th className="py-2.5 px-3 text-center">ĐTB</th>
                  <th className="py-2.5 px-3 text-center">Vắng KP</th>
                  <th className="py-2.5 px-3 text-center">Đi muộn</th>
                  <th className="py-2.5 px-3">Lý do chính</th>
                  <th className="py-2.5 px-3">Biện pháp hỗ trợ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E2EC]/60 text-[#172B4D]">
                {concerns.map((c) => (
                  <tr key={c.studentId} className="hover:bg-[#F5F8FC]">
                    <td className="py-2 px-3 font-mono font-bold text-[#16324F]">{c.code}</td>
                    <td className="py-2 px-3 font-bold text-[#172B4D]">{c.studentName}</td>
                    <td className="py-2 px-3">
                      <span className={`font-semibold ${c.level === 'high' ? 'text-[#E5484D]' : 'text-[#F59E0B]'}`}>
                        {c.level === 'high' ? '🔴 Quan tâm' : '🟡 Theo dõi'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-[#172B4D]">{c.metrics.gpa}</td>
                    <td className="py-2 px-3 text-center font-bold text-[#E5484D]">{c.metrics.unexcusedAbsence}</td>
                    <td className="py-2 px-3 text-center text-[#172B4D]">{c.metrics.lateCount}</td>
                    <td className="py-2 px-3 text-[#66788A]">{c.reasons[0]}</td>
                    <td className="py-2 px-3 text-[#08A67A]">{c.suggestedAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Signature Box */}
        <div className="p-6 border-t border-[#D9E2EC] bg-[#F5F8FC]/50 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-[#66788A]">
          <div>
            <p>Nơi nhận:</p>
            <p>- Ban Giám hiệu nhà trường (để báo cáo)</p>
            <p>- Lưu hồ sơ chủ nhiệm lớp</p>
          </div>
          <div className="text-center sm:text-right">
            <p>Hà Nội, ngày 08 tháng 10 năm 2026</p>
            <p className="font-bold text-[#172B4D] mt-1">GIÁO VIÊN CHỦ NHIỆM</p>
            <div className="h-14 flex items-center justify-center sm:justify-end text-[#08A67A] font-serif italic text-sm">
              (Đã ký)
            </div>
            <p className="font-semibold text-[#172B4D]">{classInfo.homeroomTeacher}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
