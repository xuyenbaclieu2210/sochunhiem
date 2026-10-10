import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Eye,
  Filter,
  UserPlus,
  X,
  Phone,
  Calendar,
  Home,
  Check,
  Edit2,
  Trash2,
  Database,
  RefreshCw,
  Sparkles,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { Student, Gender, StudentStatus } from '../../types';
import { ExcelImportModal } from './ExcelImportModal';
import { useAuth } from '../../firebase/AuthContext';
import { exportStudentsToGoogleSheet } from '../../services/googleWorkspaceService';

interface StudentsPageProps {
  students: Student[];
  loading?: boolean;
  error?: string | null;
  onViewStudent: (studentId: string) => void;
  onAddStudent: (newStudent: Student) => Promise<void> | void;
  onUpdateStudent: (updatedStudent: Student) => Promise<void> | void;
  onDeleteStudent: (studentId: string) => Promise<void> | void;
  onSeedInitialData: () => Promise<void>;
  onBatchAddStudents?: (students: Student[]) => Promise<void>;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({
  students,
  loading = false,
  error = null,
  onViewStudent,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onSeedInitialData,
  onBatchAddStudents,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Nam' | 'Nữ'>('all');
  const [groupFilter, setGroupFilter] = useState<'all' | '1' | '2' | '3' | '4'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal Xóa học sinh
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Google Sheets Export
  const { accessToken, requestWorkspaceAccessToken } = useAuth();
  const [isExportingSheet, setIsExportingSheet] = useState(false);
  const [sheetExportUrl, setSheetExportUrl] = useState<string | null>(null);

  const handleExportToGoogleSheets = async () => {
    setIsExportingSheet(true);
    try {
      let token = accessToken;
      if (!token) {
        token = await requestWorkspaceAccessToken();
      }
      if (!token) {
        return;
      }
      const res = await exportStudentsToGoogleSheet(
        token,
        'Lớp 10A1',
        '2026-2027',
        'Thầy Nguyễn Văn Xuyên',
        students
      );
      setSheetExportUrl(res.spreadsheetUrl);
      setActionSuccess(`Đã tạo Google Sheet với ${students.length} học sinh thành công!`);
    } catch (err: any) {
      console.error('Error exporting to sheets:', err);
      setActionSuccess('Không thể xuất sang Google Sheets: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      setIsExportingSheet(false);
    }
  };

  const addMenuRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Xử lý nhập hàng loạt từ Excel
  const handleBatchImport = async (importedList: Student[]) => {
    if (onBatchAddStudents) {
      await onBatchAddStudents(importedList);
    } else {
      for (const st of importedList) {
        const existing = students.find((s) => s.code.toUpperCase() === st.code.toUpperCase());
        if (existing) {
          await onUpdateStudent(st);
        } else {
          await onAddStudent(st);
        }
      }
    }
    showNotification(`Đã nhập thành công ${importedList.length} học sinh từ file Excel vào danh sách lớp!`);
  };

  // New Student Form State
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Nam' as Gender,
    dob: '2011-05-15',
    group: 1,
    phone: '',
    parentName: '',
    parentPhone: '',
    address: '',
    role: 'Học sinh',
    notes: '',
  });

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => {
      setActionSuccess(null);
    }, 3500);
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.phone && s.phone.includes(searchQuery)) ||
        (s.parentName && s.parentName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchGender = genderFilter === 'all' || s.gender === genderFilter;
      const matchGroup = groupFilter === 'all' || s.group.toString() === groupFilter;

      return matchSearch && matchGender && matchGroup;
    });
  }, [students, searchQuery, genderFilter, groupFilter]);

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      gender: student.gender,
      dob: student.dob,
      group: student.group,
      phone: student.phone || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      address: student.address || '',
      role: student.role || 'Học sinh',
      notes: student.notes || '',
    });
  };

  const handleCreateOrUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingStudent) {
        const updated: Student = {
          ...editingStudent,
          fullName: formData.fullName.trim(),
          gender: formData.gender,
          dob: formData.dob,
          group: Number(formData.group),
          phone: formData.phone.trim(),
          parentName: formData.parentName.trim(),
          parentPhone: formData.parentPhone.trim(),
          address: formData.address.trim(),
          role: formData.role.trim() || 'Học sinh',
          notes: formData.notes.trim(),
        };
        await onUpdateStudent(updated);
        showNotification(`Đã cập nhật thông tin học sinh ${updated.fullName} vào Firestore thành công!`);
        setEditingStudent(null);
      } else {
        const newId = `s_${Date.now()}`;
        const newCode = `HS10${String(students.length + 1).padStart(2, '0')}`;
        const newStudent: Student = {
          id: newId,
          code: newCode,
          fullName: formData.fullName.trim(),
          gender: formData.gender,
          dob: formData.dob,
          group: Number(formData.group),
          phone: formData.phone.trim() || '0912 345 699',
          parentName: formData.parentName.trim() || 'Phụ huynh học sinh',
          parentPhone: formData.parentPhone.trim() || '0988 123 499',
          address: formData.address.trim() || 'Hà Nội',
          role: formData.role.trim() || 'Học sinh',
          status: 'Đang học',
          notes: formData.notes.trim() || 'Học sinh mới chuyển vào / cập nhật.',
          conduct: 'Tốt',
          gpa: 8.0,
        };
        await onAddStudent(newStudent);
        showNotification(`Đã thêm học sinh ${newStudent.fullName} vào Firestore thành công!`);
        setShowAddModal(false);
      }

      // Reset form
      setFormData({
        fullName: '',
        gender: 'Nam',
        dob: '2011-05-15',
        group: 1,
        phone: '',
        parentName: '',
        parentPhone: '',
        address: '',
        role: 'Học sinh',
        notes: '',
      });
    } catch (err: any) {
      alert(`Lỗi lưu học sinh: ${err.message || 'Không thể thao tác'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (student: Student) => {
    setStudentToDelete(student);
    setDeleteError(null);
  };

  const handleCancelDelete = () => {
    if (!isDeleting) {
      setStudentToDelete(null);
      setDeleteError(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete || isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);
    const target = studentToDelete;

    try {
      await onDeleteStudent(target.id);
      setStudentToDelete(null);
      showNotification(`Đã xóa học sinh ${target.fullName} thành công.`);
    } catch (err: any) {
      console.error('Lỗi kỹ thuật khi xóa học sinh khỏi Firestore:', err);
      setDeleteError('Không thể xóa học sinh. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await onSeedInitialData();
      showNotification('Đã khởi tạo thành công dữ liệu mẫu lớp học vào Cloud Firestore!');
    } catch (err: any) {
      console.error('Lỗi khởi tạo dữ liệu mẫu:', err);
      showNotification('Không thể khởi tạo dữ liệu mẫu. Vui lòng thử lại.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
            {sheetExportUrl && (
              <a
                href={sheetExportUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <span>Mở trong Google Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <button
            onClick={() => {
              setActionSuccess(null);
              setSheetExportUrl(null);
            }}
            className="text-emerald-700 hover:text-emerald-900 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
              Danh sách học sinh
            </h2>
            <span className="text-[11px] font-semibold text-[#08A67A] bg-[#08A67A]/10 px-2 py-0.5 rounded-full border border-[#08A67A]/20 flex items-center gap-1">
              <Database className="w-3 h-3" />
              <span>Cloud Firestore</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#66788A] mt-1">
            Tổng cộng: {students.length} học sinh (Hiển thị {filteredStudents.length} theo bộ lọc) · Dữ liệu lưu trữ thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {students.length === 0 && !loading && (
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-[#16324F] bg-[#F5F8FC] hover:bg-[#E1EAF2] border border-[#D9E2EC] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Tải 10 học sinh mẫu vào Firestore"
            >
              <Sparkles className="w-4 h-4 text-[#08A67A]" />
              <span>{isSeeding ? 'Đang tạo dữ liệu...' : 'Khởi tạo 10 HS mẫu'}</span>
            </button>
          )}

          {/* Quick Google Sheets Export Button */}
          <button
            type="button"
            onClick={handleExportToGoogleSheets}
            disabled={isExportingSheet || students.length === 0}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Xuất trực tiếp danh sách học sinh ra Google Spreadsheet trên Drive"
          >
            {isExportingSheet ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            )}
            <span>{isExportingSheet ? 'Đang xuất Sheets...' : 'Xuất Google Sheets'}</span>
          </button>

          {/* Add Student Dropdown Menu */}
          <div className="relative" ref={addMenuRef}>
            <button
              type="button"
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#08A67A] hover:bg-[#07966F] rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm học sinh</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAddMenu ? 'rotate-180' : ''}`} />
            </button>

            {showAddMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#D9E2EC] py-1.5 z-30 animate-in fade-in slide-in-from-top-1">
                {/* 1. Nhập thủ công */}
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMenu(false);
                    setEditingStudent(null);
                    setFormData({
                      fullName: '',
                      gender: 'Nam',
                      dob: '2011-05-15',
                      group: 1,
                      phone: '',
                      parentName: '',
                      parentPhone: '',
                      address: '',
                      role: 'Học sinh',
                      notes: '',
                    });
                    setShowAddModal(true);
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[#F5F8FC] flex items-center gap-3 group transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172B4D] group-hover:text-emerald-700">
                      1. Nhập thủ công
                    </div>
                    <div className="text-[11px] text-[#627D98]">
                      Thêm từng học sinh bằng biểu mẫu
                    </div>
                  </div>
                </button>

                <div className="h-px bg-[#E1EAF2] my-1" />

                {/* 2. Nhập từ Excel */}
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMenu(false);
                    setShowExcelModal(true);
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[#F5F8FC] flex items-center gap-3 group transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172B4D] group-hover:text-blue-700">
                      2. Nhập từ Excel
                    </div>
                    <div className="text-[11px] text-[#627D98]">
                      Tải lên file .xlsx, .xls theo mẫu
                    </div>
                  </div>
                </button>

                <div className="h-px bg-[#E1EAF2] my-1" />

                {/* 3. Xuất sang Google Sheets */}
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMenu(false);
                    handleExportToGoogleSheets();
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[#F5F8FC] flex items-center gap-3 group transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172B4D] group-hover:text-emerald-700">
                      3. Xuất Google Sheets
                    </div>
                    <div className="text-[11px] text-[#627D98]">
                      Tạo bảng tính trực tuyến trên Drive
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Không thể tải dữ liệu. Vui lòng thử lại.</p>
            <p className="mt-0.5 text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#9FB3C8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo họ tên, mã HS, số điện thoại, phụ huynh..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F5F8FC] border border-[#D9E2EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08A67A]/20 focus:border-[#08A67A] focus:bg-white transition-all text-[#172B4D]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9FB3C8] hover:text-[#172B4D]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Gender Filter */}
          <div className="flex items-center gap-1 bg-[#F5F8FC] p-1 rounded-lg border border-[#D9E2EC]/70 text-xs">
            <span className="text-[#66788A] px-2 font-medium">Giới tính:</span>
            <button
              onClick={() => setGenderFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                genderFilter === 'all'
                  ? 'bg-white text-[#172B4D] shadow-xs'
                  : 'text-[#66788A] hover:text-[#172B4D]'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setGenderFilter('Nam')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                genderFilter === 'Nam'
                  ? 'bg-white text-[#172B4D] shadow-xs'
                  : 'text-[#66788A] hover:text-[#172B4D]'
              }`}
            >
              Nam
            </button>
            <button
              onClick={() => setGenderFilter('Nữ')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                genderFilter === 'Nữ'
                  ? 'bg-white text-[#172B4D] shadow-xs'
                  : 'text-[#66788A] hover:text-[#172B4D]'
              }`}
            >
              Nữ
            </button>
          </div>

          {/* Group Filter */}
          <div className="flex items-center gap-1 bg-[#F5F8FC] p-1 rounded-lg border border-[#D9E2EC]/70 text-xs">
            <span className="text-[#66788A] px-2 font-medium">Tổ:</span>
            {(['all', '1', '2', '3', '4'] as const).map((grp) => (
              <button
                key={grp}
                onClick={() => setGroupFilter(grp)}
                className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  groupFilter === grp
                    ? 'bg-white text-[#172B4D] shadow-xs'
                    : 'text-[#66788A] hover:text-[#172B4D]'
                }`}
              >
                {grp === 'all' ? 'Tất cả' : `Tổ ${grp}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Students Table */}
      <div className="bg-white rounded-xl border border-[#D9E2EC] shadow-[0_1px_3px_0_rgba(23,43,77,0.03)] overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#66788A] space-y-3">
            <Loader2 className="w-7 h-7 text-[#08A67A] animate-spin" />
            <p className="text-sm font-medium text-[#172B4D]">Đang tải dữ liệu học sinh từ Firestore...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F8FC] border-b border-[#D9E2EC] font-semibold text-[#172B4D]">
                <tr>
                  <th className="py-3 px-3 text-center w-12">STT</th>
                  <th className="py-3 px-3 w-24">Mã HS</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-3">Giới tính</th>
                  <th className="py-3 px-3">Ngày sinh</th>
                  <th className="py-3 px-3 text-center">Tổ</th>
                  <th className="py-3 px-3">Số điện thoại</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E2EC]/60 text-[#172B4D]">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((st, idx) => (
                    <tr key={st.id} className="hover:bg-[#F5F8FC] transition-colors">
                      {/* STT */}
                      <td className="py-3 px-3 text-center text-[#66788A] font-medium">
                        {idx + 1}
                      </td>

                      {/* Mã HS */}
                      <td className="py-3 px-3 font-mono font-bold text-[#16324F]">
                        {st.code}
                      </td>

                      {/* Họ tên + Role */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#16324F]/10 border border-[#16324F]/15 overflow-hidden shrink-0 flex items-center justify-center font-bold text-[#16324F] text-[11px]">
                            {st.avatarUrl ? (
                              <img src={st.avatarUrl} alt={st.fullName} className="w-full h-full object-cover" />
                            ) : (
                              st.fullName.slice(-2)
                            )}
                          </div>
                          <div>
                            <div
                              className="font-bold text-[#172B4D] hover:text-[#08A67A] cursor-pointer transition-colors"
                              onClick={() => onViewStudent(st.id)}
                            >
                              {st.fullName}
                            </div>
                            {st.role && st.role !== 'Học sinh' && (
                              <span className="text-[10px] text-[#08A67A] bg-[#08A67A]/10 px-1.5 py-0.2 rounded font-medium">
                                {st.role}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Giới tính */}
                      <td className="py-3 px-3">
                        <span className={`font-medium ${st.gender === 'Nam' ? 'text-[#3182CE]' : 'text-[#08A67A]'}`}>
                          {st.gender}
                        </span>
                      </td>

                      {/* Ngày sinh */}
                      <td className="py-3 px-3 font-mono text-[#66788A]">
                        {st.dob}
                      </td>

                      {/* Tổ */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-semibold text-[#172B4D] bg-[#F5F8FC] px-2 py-0.5 rounded border border-[#D9E2EC]">
                          Tổ {st.group}
                        </span>
                      </td>

                      {/* SĐT */}
                      <td className="py-3 px-3 font-mono text-[#66788A]">
                        {st.phone || '—'}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 text-[#08A67A] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#08A67A]" />
                          {st.status || 'Đang học'}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onViewStudent(st.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#08A67A] bg-[#08A67A]/10 hover:bg-[#08A67A]/20 rounded-md border border-[#08A67A]/25 transition-colors cursor-pointer"
                            title="Xem chi tiết hồ sơ"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(st)}
                            className="p-1 text-[#66788A] hover:text-[#3182CE] hover:bg-[#3182CE]/10 rounded-md transition-colors cursor-pointer"
                            title="Chỉnh sửa thông tin học sinh"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(st)}
                            className="p-1 text-[#66788A] hover:text-[#E5484D] hover:bg-[#E5484D]/10 rounded-md transition-colors cursor-pointer"
                            title="Xóa học sinh"
                            aria-label={`Xóa học sinh ${st.fullName}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#66788A]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <p className="font-medium text-[#172B4D]">Chưa có học sinh nào phù hợp</p>
                        <p className="text-xs text-[#66788A]">
                          {students.length === 0
                            ? 'Lớp chưa có học sinh trong cơ sở dữ liệu. Nhấn "Khởi tạo 10 HS mẫu" hoặc "Thêm học sinh" để bắt đầu.'
                            : 'Không tìm thấy kết quả phù hợp với bộ lọc hiện tại.'}
                        </p>
                        {students.length === 0 && (
                          <button
                            onClick={handleSeed}
                            disabled={isSeeding}
                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#08A67A] text-white rounded-lg text-xs font-semibold hover:bg-[#07966F] transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Khởi tạo 10 học sinh mẫu</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {(showAddModal || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16324F]/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-[#D9E2EC] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#D9E2EC] flex items-center justify-between bg-[#F5F8FC]">
              <h3 className="font-bold text-[#172B4D] text-sm">
                {editingStudent ? `Chỉnh sửa học sinh: ${editingStudent.fullName}` : 'Thêm học sinh mới'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingStudent(null);
                }}
                className="p-1.5 text-[#66788A] hover:text-[#172B4D] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateStudent} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#172B4D]">Họ và tên học sinh *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="VD: Nguyễn Văn An"
                    className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:ring-2 focus:ring-[#08A67A]/20 focus:border-[#08A67A] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#172B4D]">Giới tính</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:outline-none focus:border-[#08A67A]"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#172B4D]">Ngày sinh</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:outline-none focus:border-[#08A67A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#172B4D]">Phân vào Tổ</label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: Number(e.target.value) })}
                    className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:outline-none focus:border-[#08A67A]"
                  >
                    <option value={1}>Tổ 1</option>
                    <option value={2}>Tổ 2</option>
                    <option value={3}>Tổ 3</option>
                    <option value={4}>Tổ 4</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#172B4D]">Số điện thoại HS</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="VD: 0912 345 678"
                    className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:outline-none focus:border-[#08A67A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#172B4D]">Chức vụ cán sự</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="VD: Học sinh, Lớp trưởng, Tổ phó..."
                    className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:outline-none focus:border-[#08A67A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#172B4D]">Họ tên Phụ huynh</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="VD: Nguyễn Văn Bình (Bố)"
                    className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:outline-none focus:border-[#08A67A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#172B4D]">Số điện thoại Phụ huynh</label>
                  <input
                    type="text"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="VD: 0988 765 432"
                    className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:outline-none focus:border-[#08A67A]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#172B4D]">Địa chỉ thường trú</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="VD: Số 123 Đường Cầu Giấy, Hà Nội"
                  className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:outline-none focus:border-[#08A67A]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#172B4D]">Ghi chú của GVCN</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ghi chú về sức khỏe, hoàn cảnh gia đình..."
                  className="w-full p-2 border border-[#D9E2EC] rounded-lg text-[#172B4D] focus:outline-none focus:border-[#08A67A]"
                />
              </div>

              <div className="pt-3 border-t border-[#D9E2EC] flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 font-semibold text-[#66788A] bg-[#F5F8FC] hover:bg-[#D9E2EC]/50 rounded-lg transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-semibold text-white bg-[#08A67A] hover:bg-[#07966F] rounded-lg transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>{editingStudent ? 'Cập nhật Firestore' : 'Lưu học sinh vào Firestore'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        existingStudents={students}
        onImportStudents={handleBatchImport}
      />

      {/* Hộp thoại xác nhận Xóa học sinh */}
      {studentToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16324F]/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-student-dialog-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-[#D9E2EC] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#D9E2EC] flex items-center justify-between bg-[#F5F8FC]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center text-[#E5484D] shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="delete-student-dialog-title" className="text-sm font-bold text-[#172B4D]">
                    Xóa học sinh?
                  </h3>
                  <p className="text-[11px] text-[#66788A]">Xác nhận thao tác xóa</p>
                </div>
              </div>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleCancelDelete}
                className="p-1.5 text-[#66788A] hover:text-[#172B4D] hover:bg-[#D9E2EC]/50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nội dung xác nhận */}
            <div className="p-5 space-y-4">
              <p className="text-xs sm:text-sm text-[#172B4D] leading-relaxed">
                Bạn có chắc chắn muốn xóa học sinh{' '}
                <span className="font-bold text-[#16324F]">{studentToDelete.fullName}</span> khỏi lớp không?
              </p>

              <div className="bg-[#F5F8FC] border border-[#D9E2EC] rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#66788A]">Mã HS:</span>
                  <span className="font-mono font-bold text-[#16324F] bg-white px-2 py-0.5 rounded border border-[#D9E2EC]">
                    {studentToDelete.code}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#66788A]">Tổ:</span>
                  <span className="font-semibold text-[#172B4D] bg-white px-2 py-0.5 rounded border border-[#D9E2EC]">
                    Tổ {studentToDelete.group}
                  </span>
                </div>
              </div>

              {deleteError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{deleteError}</p>
                    <p className="text-[11px] text-red-600 mt-0.5">Vui lòng kiểm tra lại kết nối mạng hoặc thử lại.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="px-5 py-3.5 bg-[#F5F8FC] border-t border-[#D9E2EC] flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleCancelDelete}
                className="px-4 py-2 border border-[#D9E2EC] bg-white text-[#172B4D] rounded-xl text-xs font-semibold hover:bg-[#F5F8FC] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-[#E5484D] hover:bg-[#D6393E] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <span>Xóa học sinh</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
