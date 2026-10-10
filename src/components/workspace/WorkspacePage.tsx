import React, { useState, useEffect } from 'react';
import {
  Folder,
  FileSpreadsheet,
  FileText,
  File as FileIcon,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  RefreshCw,
  FolderPlus,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Table,
  Share2,
  Download,
  Eye,
  FileCode,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../firebase/AuthContext';
import {
  DriveFile,
  SpreadsheetMetadata,
  listDriveFiles,
  createDriveFolder,
  uploadFileToDrive,
  deleteDriveFile,
  listDriveSpreadsheets,
  getSpreadsheetMetadata,
  getSpreadsheetValues,
  createSpreadsheet,
  exportStudentsToGoogleSheet,
  exportAttendanceToGoogleSheet,
  exportCompetitionToGoogleSheet
} from '../../services/googleWorkspaceService';
import { Student, ClassInfo, DailyAttendance, CompetitionWeek, CompetitionRecord } from '../../types';

interface WorkspacePageProps {
  classInfo: ClassInfo;
  students: Student[];
  attendance?: DailyAttendance;
  competitionWeeks?: CompetitionWeek[];
  competitionRecords?: CompetitionRecord[];
  onImportStudents?: (imported: Student[]) => void;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  classInfo,
  students,
  attendance,
  competitionWeeks,
  competitionRecords,
  onImportStudents
}) => {
  const { currentUser, accessToken, requestWorkspaceAccessToken } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'drive' | 'sheets'>('drive');
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);
  const [folderBreadcrumb, setFolderBreadcrumb] = useState<{ id?: string; name: string }[]>([
    { name: 'Google Drive của tôi' }
  ]);

  // Sheets state
  const [spreadsheets, setSpreadsheets] = useState<DriveFile[]>([]);
  const [selectedSheetFile, setSelectedSheetFile] = useState<DriveFile | null>(null);
  const [sheetMetadata, setSheetMetadata] = useState<SpreadsheetMetadata | null>(null);
  const [activeSheetTabName, setActiveSheetTabName] = useState<string>('');
  const [previewValues, setPreviewValues] = useState<string[][]>([]);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);

  // Modal states
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  // Destructive delete confirmation modal (Required by Workspace Integration Skill)
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);

  // Quick export modal
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportType, setExportType] = useState<'students' | 'attendance' | 'competition'>('students');
  const [exportedResult, setExportedResult] = useState<{ title: string; url: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Ensure access token or request it
  const ensureToken = async (): Promise<string | null> => {
    if (accessToken) return accessToken;
    try {
      const token = await requestWorkspaceAccessToken();
      return token;
    } catch (err: any) {
      setError('Cần cấp quyền truy cập Google Workspace để tiếp tục.');
      return null;
    }
  };

  // Load Drive files
  const loadDriveFiles = async () => {
    setError(null);
    setLoading(true);
    try {
      const token = await ensureToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const filter = typeFilter === 'all' ? undefined : typeFilter;
      const res = await listDriveFiles(token, {
        query: searchQuery,
        mimeTypeFilter: filter,
        folderId: selectedFolderId
      });
      setDriveFiles(res.files);
    } catch (err: any) {
      console.error('Error listing drive files:', err);
      setError(err.message || 'Không thể tải tệp từ Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  // Load Spreadsheets
  const loadSpreadsheets = async () => {
    setError(null);
    setLoading(true);
    try {
      const token = await ensureToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const sheetsList = await listDriveSpreadsheets(token, searchQuery);
      setSpreadsheets(sheetsList);
    } catch (err: any) {
      console.error('Error listing spreadsheets:', err);
      setError(err.message || 'Không thể tải danh sách Google Sheets.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (accessToken) {
      if (activeSubTab === 'drive') {
        loadDriveFiles();
      } else {
        loadSpreadsheets();
      }
    }
  }, [accessToken, activeSubTab, typeFilter, selectedFolderId]);

  // Load preview when selected sheet changes
  const handleSelectSpreadsheet = async (sheetFile: DriveFile) => {
    setSelectedSheetFile(sheetFile);
    setLoadingPreview(true);
    setError(null);
    try {
      const token = await ensureToken();
      if (!token) return;

      const metadata = await getSpreadsheetMetadata(token, sheetFile.id);
      setSheetMetadata(metadata);

      if (metadata.sheets.length > 0) {
        const firstTab = metadata.sheets[0].title;
        setActiveSheetTabName(firstTab);
        const values = await getSpreadsheetValues(token, sheetFile.id, `'${firstTab}'!A1:Z50`);
        setPreviewValues(values);
      }
    } catch (err: any) {
      console.error('Error fetching sheet preview:', err);
      setError(err.message || 'Không thể đọc nội dung Google Spreadsheet.');
    } finally {
      setLoadingPreview(false);
    }
  };

  // Change tab inside spreadsheet preview
  const handleChangeSheetTab = async (tabName: string) => {
    if (!selectedSheetFile) return;
    setActiveSheetTabName(tabName);
    setLoadingPreview(true);
    try {
      const token = await ensureToken();
      if (!token) return;
      const values = await getSpreadsheetValues(token, selectedSheetFile.id, `'${tabName}'!A1:Z50`);
      setPreviewValues(values);
    } catch (err: any) {
      setError(err.message || 'Không thể đọc dữ liệu trang tính.');
    } finally {
      setLoadingPreview(false);
    }
  };

  // Create new folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setActionLoading(true);
    try {
      const token = await ensureToken();
      if (!token) return;
      await createDriveFolder(token, newFolderName.trim(), selectedFolderId);
      setShowNewFolderModal(false);
      setNewFolderName('');
      showToast('Đã tạo thư mục thành công!');
      loadDriveFiles();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tạo thư mục', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Upload file
  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) return;

    setActionLoading(true);
    try {
      const token = await ensureToken();
      if (!token) return;
      await uploadFileToDrive(token, fileToUpload, selectedFolderId);
      setShowUploadModal(false);
      setFileToUpload(null);
      showToast(`Đã tải lên tệp "${fileToUpload.name}" thành công!`);
      loadDriveFiles();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải lên Google Drive', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete file (confirmed via modal)
  const handleConfirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setActionLoading(true);
    try {
      const token = await ensureToken();
      if (!token) return;
      await deleteDriveFile(token, fileToDelete.id);
      showToast(`Đã xóa "${fileToDelete.name}" khỏi Google Drive.`);
      setFileToDelete(null);
      loadDriveFiles();
      if (activeSubTab === 'sheets') {
        loadSpreadsheets();
      }
    } catch (err: any) {
      showToast(err.message || 'Không thể xóa tệp', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Quick Export
  const handleExecuteExport = async () => {
    setActionLoading(true);
    setExportedResult(null);
    try {
      const token = await ensureToken();
      if (!token) return;

      if (exportType === 'students') {
        const res = await exportStudentsToGoogleSheet(
          token,
          classInfo.className,
          classInfo.academicYear,
          classInfo.homeroomTeacher,
          students
        );
        setExportedResult({
          title: `Danh sách học sinh ${classInfo.className}`,
          url: res.spreadsheetUrl
        });
        showToast('Đã xuất Danh sách học sinh sang Google Sheets!');
      } else if (exportType === 'attendance') {
        const todayStr = attendance?.date || new Date().toISOString().split('T')[0];
        const records = attendance?.records || [];
        const presentCount = records.filter((r) => r.status === 'present').length;
        const absentCount = records.filter((r) => r.status === 'excused' || r.status === 'unexcused').length;
        const lateCount = records.filter((r) => r.status === 'late').length;
        const res = await exportAttendanceToGoogleSheet(
          token,
          classInfo.className,
          todayStr,
          records,
          presentCount,
          absentCount,
          lateCount
        );
        setExportedResult({
          title: `Điểm danh chuyên cần (${todayStr})`,
          url: res.spreadsheetUrl
        });
        showToast('Đã xuất Báo cáo chuyên cần sang Google Sheets!');
      } else if (exportType === 'competition') {
        const currentWeek = competitionWeeks?.[0]?.weekNumber || 1;
        const res = await exportCompetitionToGoogleSheet(
          token,
          classInfo.className,
          currentWeek,
          competitionRecords || []
        );
        setExportedResult({
          title: `Xếp hạng thi đua Tuần ${currentWeek}`,
          url: res.spreadsheetUrl
        });
        showToast('Đã xuất Bảng thi đua tuần sang Google Sheets!');
      }
    } catch (err: any) {
      console.error('Export error:', err);
      showToast(err.message || 'Lỗi khi xuất sang Google Sheets', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper format file size
  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '-';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return '-';
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatFileDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) {
      return <Folder className="w-5 h-5 text-amber-500 fill-amber-100" />;
    }
    if (mimeType.includes('spreadsheet')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    }
    if (mimeType.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    if (mimeType.includes('pdf')) {
      return <FileIcon className="w-5 h-5 text-red-500" />;
    }
    return <FileIcon className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-sm font-medium transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#16324F] via-[#1E4369] to-[#0D233A] rounded-2xl p-6 text-white shadow-sm border border-slate-700/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-10 flex items-center justify-center pointer-events-none">
          <FileSpreadsheet className="w-72 h-72 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#08A67A] text-white">
                Google Workspace
              </span>
              <span className="text-xs text-slate-300">
                Đồng bộ trực tiếp Cloud Drive & Sheets
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Tài liệu Google Drive & Bảng tính Sheets
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Quản lý toàn bộ giáo án, sổ sách, kế hoạch tuần trên Google Drive; xuất và nhập danh sách học sinh, điểm danh, thi đua trực tiếp với Google Sheets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!accessToken ? (
              <button
                onClick={() => ensureToken()}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-[#172B4D] font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Cấp quyền Google Drive & Sheets</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center gap-2 px-3.5 py-2.5 bg-[#08A67A] hover:bg-[#07926B] text-white font-medium text-sm rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Xuất ra Google Sheets</span>
                </button>
                <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Đã kết nối</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation Sub-Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 pt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('drive')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeSubTab === 'drive'
                  ? 'border-[#08A67A] text-[#08A67A]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>Google Drive (Tệp & Thư mục)</span>
            </button>
            <button
              onClick={() => setActiveSubTab('sheets')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeSubTab === 'sheets'
                  ? 'border-[#08A67A] text-[#08A67A]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Google Sheets (Bảng tính trực tuyến)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={() => {
                if (activeSubTab === 'drive') loadDriveFiles();
                else loadSpreadsheets();
              }}
              disabled={loading}
              title="Làm mới danh sách"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab 1: GOOGLE DRIVE */}
        {activeSubTab === 'drive' && (
          <div className="p-6 space-y-4">
            {/* Action Bar & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadDriveFiles()}
                    placeholder="Tìm kiếm tệp trên Google Drive..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#08A67A]/30 focus:border-[#08A67A]"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#08A67A]/30"
                >
                  <option value="all">Tất cả loại tệp</option>
                  <option value="spreadsheet">Bảng tính Sheets</option>
                  <option value="document">Tài liệu Docs</option>
                  <option value="pdf">Tệp PDF</option>
                  <option value="folder">Thư mục</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNewFolderModal(true)}
                  className="flex items-center gap-2 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  <FolderPlus className="w-4 h-4 text-amber-500" />
                  <span>Tạo thư mục</span>
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-[#16324F] hover:bg-[#11273E] text-white font-medium text-sm rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>Tải tệp lên</span>
                </button>
              </div>
            </div>

            {/* Breadcrumb if inside folder */}
            {folderBreadcrumb.length > 1 && (
              <div className="flex items-center gap-2 text-xs text-slate-500 py-1 border-b border-slate-100">
                {folderBreadcrumb.map((item, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span>/</span>}
                    <button
                      onClick={() => {
                        setSelectedFolderId(item.id);
                        setFolderBreadcrumb(folderBreadcrumb.slice(0, idx + 1));
                      }}
                      className="hover:text-[#08A67A] font-medium transition-colors"
                    >
                      {item.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Files List / Table */}
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-500 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#08A67A]" />
                <p className="text-sm">Đang tải danh sách tệp từ Google Drive...</p>
              </div>
            ) : driveFiles.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
                  <Folder className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">
                  Chưa có tệp nào phù hợp
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Bạn có thể tải tệp giáo án, tài liệu lên Google Drive hoặc tạo thư mục quản lý lớp học.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-[#08A67A] text-white text-xs font-semibold rounded-xl hover:bg-[#07926B] transition-colors cursor-pointer"
                  >
                    Tải tệp lên ngay
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold text-xs border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Tên tệp / thư mục</th>
                      <th className="py-3 px-4">Loại</th>
                      <th className="py-3 px-4">Kích thước</th>
                      <th className="py-3 px-4">Cập nhật lần cuối</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {driveFiles.map((file) => {
                      const isFolder = file.mimeType.includes('folder');
                      return (
                        <tr
                          key={file.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {getFileIcon(file.mimeType)}
                              {isFolder ? (
                                <button
                                  onClick={() => {
                                    setSelectedFolderId(file.id);
                                    setFolderBreadcrumb([
                                      ...folderBreadcrumb,
                                      { id: file.id, name: file.name }
                                    ]);
                                  }}
                                  className="font-medium text-slate-900 hover:text-[#08A67A] transition-colors text-left"
                                >
                                  {file.name}
                                </button>
                              ) : (
                                <span className="font-medium text-slate-900 line-clamp-1">
                                  {file.name}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500">
                            {isFolder
                              ? 'Thư mục'
                              : file.mimeType.includes('spreadsheet')
                              ? 'Google Sheets'
                              : file.mimeType.includes('document')
                              ? 'Google Docs'
                              : file.mimeType.includes('pdf')
                              ? 'PDF'
                              : 'Tệp'}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500">
                            {isFolder ? '-' : formatFileSize(file.size)}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500">
                            {formatFileDate(file.modifiedTime)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Mở trên Google Drive"
                                  className="p-1.5 text-slate-400 hover:text-[#08A67A] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => setFileToDelete(file)}
                                title="Xóa tệp khỏi Google Drive"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: GOOGLE SHEETS */}
        {activeSubTab === 'sheets' && (
          <div className="p-6 space-y-6">
            {/* Quick Actions for Sheets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => {
                  setExportType('students');
                  setShowExportModal(true);
                }}
                className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm group-hover:text-emerald-700">
                      Xuất Danh sách Học sinh
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tạo bảng tính chứa {students.length} học sinh
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  setExportType('attendance');
                  setShowExportModal(true);
                }}
                className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Table className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm group-hover:text-blue-700">
                      Xuất Báo cáo Chuyên cần
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Điểm danh & tỷ lệ vắng có phép
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  setExportType('competition');
                  setShowExportModal(true);
                }}
                className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm group-hover:text-amber-700">
                      Xuất Bảng Thi đua tuần
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Điểm thi đua & xếp hạng học sinh
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* List and Preview Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: List of Spreadsheets */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 text-sm">
                    Bảng tính trên Google Drive
                  </h3>
                  <button
                    onClick={() => {
                      setExportType('students');
                      setShowExportModal(true);
                    }}
                    className="flex items-center gap-1.5 text-xs text-[#08A67A] font-semibold hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tạo bảng mới</span>
                  </button>
                </div>

                {loading ? (
                  <div className="py-12 flex justify-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : spreadsheets.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                    <p className="text-xs text-slate-500">
                      Chưa tìm thấy Google Spreadsheet nào. Bấm xuất dữ liệu bên trên để tạo bảng tính đầu tiên!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {spreadsheets.map((sheet) => {
                      const isSelected = selectedSheetFile?.id === sheet.id;
                      return (
                        <div
                          key={sheet.id}
                          onClick={() => handleSelectSpreadsheet(sheet)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-xs text-slate-900 truncate">
                                {sheet.name}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Sửa đổi: {formatFileDate(sheet.modifiedTime)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {sheet.webViewLink && (
                              <a
                                href={sheet.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                title="Mở trực tiếp trên Google Sheets"
                                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Live Spreadsheet Preview */}
              <div className="lg:col-span-7 bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                {selectedSheetFile ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                          <h4 className="font-bold text-slate-900 text-sm">
                            {selectedSheetFile.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Xem trước dữ liệu thời gian thực từ Google Sheets
                        </p>
                      </div>

                      {selectedSheetFile.webViewLink && (
                        <a
                          href={selectedSheetFile.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-all cursor-pointer shrink-0"
                        >
                          <span>Mở trong Google Sheets</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Sheet Tabs */}
                    {sheetMetadata && sheetMetadata.sheets.length > 0 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {sheetMetadata.sheets.map((tab) => (
                          <button
                            key={tab.sheetId}
                            onClick={() => handleChangeSheetTab(tab.title)}
                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                              activeSheetTabName === tab.title
                                ? 'bg-white text-emerald-700 font-semibold shadow-xs border border-emerald-200'
                                : 'text-slate-600 hover:bg-white/60'
                            }`}
                          >
                            {tab.title}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Preview Table */}
                    {loadingPreview ? (
                      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                        <span className="text-xs">Đang đọc ô từ Google Sheets...</span>
                      </div>
                    ) : previewValues.length === 0 ? (
                      <div className="py-16 text-center text-slate-400 text-xs">
                        Trang tính này hiện không có dữ liệu để hiển thị.
                      </div>
                    ) : (
                      <div className="overflow-x-auto max-h-[380px] bg-white rounded-lg border border-slate-200">
                        <table className="w-full text-xs text-left">
                          <tbody className="divide-y divide-slate-100">
                            {previewValues.map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className={rIdx === 0 ? 'bg-slate-100 font-semibold text-slate-800' : 'hover:bg-slate-50'}
                              >
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className="py-2 px-3 border-r border-slate-100 last:border-r-0 whitespace-nowrap text-slate-700"
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Eye className="w-8 h-8 text-slate-300" />
                    <p className="text-xs">
                      Chọn một bảng tính ở danh sách bên trái để xem trước nội dung trực tiếp
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: CREATE FOLDER */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Tạo thư mục mới trên Google Drive
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Thư mục sẽ được lưu trữ an toàn trong Google Drive của bạn.
            </p>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input
                type="text"
                required
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="VD: Giáo án & Kế hoạch chủ nhiệm"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#08A67A] focus:outline-none"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !newFolderName.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-[#08A67A] text-white rounded-xl hover:bg-[#07926B] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Tạo thư mục</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPLOAD FILE */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Tải tệp lên Google Drive
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Chọn tệp giáo án, bài giảng, hình ảnh hoặc bảng tính cần tải lên.
            </p>

            <form onSubmit={handleUploadFile} className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFileToUpload(e.target.files[0]);
                    }
                  }}
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  {fileToUpload ? (
                    <div className="text-sm font-semibold text-slate-900">
                      {fileToUpload.name}
                      <span className="block text-xs font-normal text-slate-500 mt-1">
                        ({(fileToUpload.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-sm font-medium text-[#08A67A]">
                        Bấm vào đây để chọn tệp
                      </span>
                      <span className="block text-xs text-slate-400 mt-1">
                        Hỗ trợ DOCX, XLSX, PDF, PNG, JPG, v.v.
                      </span>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setFileToUpload(null);
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !fileToUpload}
                  className="px-4 py-2 text-xs font-semibold bg-[#16324F] text-white rounded-xl hover:bg-[#11273E] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Tải lên ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EXPLICIT CONFIRMATION FOR DESTRUCTIVE DELETE OPERATION (SKILL MANDATORY) */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Xác nhận xóa tệp khỏi Google Drive?
            </h3>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Bạn đang thực hiện thao tác xóa tệp{' '}
              <strong className="text-slate-900">"{fileToDelete.name}"</strong> khỏi Google Drive. Hành động này sẽ loại bỏ tệp khỏi bộ nhớ đám mây của bạn.
            </p>

            <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Thao tác này làm thay đổi trực tiếp dữ liệu trên Google Drive của bạn.</span>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteFile}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: QUICK EXPORT TO GOOGLE SHEETS */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Xuất dữ liệu lớp ra Google Sheets
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setExportedResult(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {exportedResult ? (
              <div className="py-6 space-y-4 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Tạo Google Spreadsheet thành công!
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {exportedResult.title} đã được lưu trên Google Drive của bạn.
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href={exportedResult.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                  >
                    <span>Mở ngay trên Google Sheets</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-4">
                <p className="text-xs text-slate-600">
                  Chọn loại dữ liệu của lớp {classInfo.className} bạn muốn tạo bảng tính trên Google Drive:
                </p>

                <div className="space-y-2">
                  <label
                    onClick={() => setExportType('students')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      exportType === 'students'
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={exportType === 'students'}
                        onChange={() => setExportType('students')}
                        className="text-emerald-600"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Danh sách học sinh lớp ({students.length} học sinh)
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Bao gồm Họ tên, Mã HS, Ngày sinh, Giới tính, Tổ, SĐT phụ huynh
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => setExportType('attendance')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      exportType === 'attendance'
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={exportType === 'attendance'}
                        onChange={() => setExportType('attendance')}
                        className="text-emerald-600"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Bảng tổng hợp Điểm danh Chuyên cần
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Thống kê có mặt, vắng phép, không phép, đi trễ
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => setExportType('competition')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      exportType === 'competition'
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={exportType === 'competition'}
                        onChange={() => setExportType('competition')}
                        className="text-emerald-600"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Bảng điểm Thi đua tuần
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Tổng kết điểm cộng, điểm trừ và xếp hạng học sinh
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    disabled={actionLoading}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteExport}
                    disabled={actionLoading}
                    className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all cursor-pointer flex items-center gap-2"
                  >
                    {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Xuất sang Google Sheets</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
