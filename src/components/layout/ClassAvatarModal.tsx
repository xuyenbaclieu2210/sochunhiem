import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Trash2,
  Camera,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ImageIcon
} from 'lucide-react';
import { ClassInfo } from '../../types';

interface ClassAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  classInfo: ClassInfo;
  onUpdateAvatar: (avatarUrl: string) => Promise<void>;
  onDeleteAvatar: () => Promise<void>;
}

export const ClassAvatarModal: React.FC<ClassAvatarModalProps> = ({
  isOpen,
  onClose,
  classInfo,
  onUpdateAvatar,
  onDeleteAvatar,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Định dạng file không hợp lệ. Vui lòng chọn ảnh JPG, JPEG, PNG hoặc WEBP.');
      return;
    }

    // Validate size (max 5 MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMsg('Ảnh vượt quá dung lượng cho phép. Vui lòng chọn ảnh tối đa 5 MB.');
      return;
    }

    setSelectedFile(file);

    // Create preview data URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!previewUrl || isSaving) return;

    setIsSaving(true);
    setErrorMsg(null);
    try {
      await onUpdateAvatar(previewUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (err: any) {
      console.error('Lỗi lưu ảnh đại diện lớp:', err);
      setErrorMsg('Không thể lưu ảnh đại diện lớp. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await onDeleteAvatar();
      setShowDeleteConfirm(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (err: any) {
      console.error('Lỗi xóa ảnh đại diện lớp:', err);
      setErrorMsg('Không thể xóa ảnh đại diện lớp. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelPreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16324F]/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="class-avatar-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-[#D9E2EC] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#D9E2EC] flex items-center justify-between bg-[#F5F8FC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#08A67A]/10 border border-[#08A67A]/20 flex items-center justify-center text-[#08A67A]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 id="class-avatar-modal-title" className="text-sm font-bold text-[#172B4D]">
                Ảnh đại diện lớp
              </h3>
              <p className="text-[11px] text-[#66788A]">Năm học 2026–2027</p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSaving || isDeleting}
            onClick={onClose}
            className="p-1.5 text-[#66788A] hover:text-[#172B4D] hover:bg-[#D9E2EC]/50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Avatar Preview Display */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl border-2 border-[#D9E2EC] bg-[#F5F8FC] overflow-hidden flex items-center justify-center shadow-xs">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Xem trước ảnh mới"
                    className="w-full h-full object-cover"
                  />
                ) : classInfo.avatarUrl ? (
                  <img
                    src={classInfo.avatarUrl}
                    alt="Ảnh đại diện lớp"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#08A67A]/10 text-[#08A67A] font-bold text-xl flex items-center justify-center">
                    {classInfo.className.replace(/^Lớp\s*/i, '').trim() || 'LỚP'}
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-[#D9E2EC] text-[#172B4D] shadow-xs">
                  {previewUrl
                    ? 'Ảnh xem trước'
                    : classInfo.avatarUrl
                    ? 'Ảnh hiện tại'
                    : 'Avatar mặc định'}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#66788A] text-center pt-1">
              {previewUrl
                ? 'Nhấn "Lưu ảnh đại diện" bên dưới để áp dụng thay đổi.'
                : classInfo.avatarUrl
                ? 'Lớp đang có ảnh đại diện tùy chỉnh.'
                : 'Chưa có ảnh đại diện. Hệ thống hiển thị huy hiệu mặc định.'}
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            className="hidden"
          />

          {/* Delete Confirmation Warning (if triggered) */}
          {showDeleteConfirm && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-800">
                    Bạn có chắc chắn muốn xóa ảnh đại diện lớp không?
                  </p>
                  <p className="text-[11px] text-red-600 mt-0.5">
                    Sau khi xóa, lớp sẽ quay về hiển thị huy hiệu mặc định.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-white border border-red-200 text-xs font-semibold text-[#172B4D] rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-3 py-1.5 bg-[#E5484D] hover:bg-[#D6393E] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60 inline-flex items-center gap-1.5"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang xóa...</span>
                    </>
                  ) : (
                    <span>Xác nhận xóa ảnh</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Guide Note */}
          <div className="text-[11px] text-[#66788A] bg-[#F5F8FC] border border-[#D9E2EC] p-3 rounded-xl space-y-1">
            <p className="font-semibold text-[#172B4D]">Quy định ảnh đại diện:</p>
            <p>• Định dạng: JPG, JPEG, PNG, WEBP (tối đa 5 MB).</p>
            <p>• Tỉ lệ đề xuất: Vuông (1:1) để hiển thị cân đối trên thanh tiêu đề.</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#F5F8FC] border-t border-[#D9E2EC] flex items-center justify-between gap-2">
          <div>
            {classInfo.avatarUrl && !previewUrl && !showDeleteConfirm && (
              <button
                type="button"
                disabled={isSaving || isDeleting}
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#E5484D] hover:bg-red-50 rounded-xl border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa ảnh</span>
              </button>
            )}
            {previewUrl && (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleCancelPreview}
                className="px-3 py-2 text-xs font-semibold text-[#66788A] hover:bg-[#D9E2EC]/50 rounded-xl transition-colors cursor-pointer"
              >
                Hủy xem trước
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!previewUrl ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-[#D9E2EC] bg-white text-[#172B4D] rounded-xl text-xs font-semibold hover:bg-[#F5F8FC] transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-[#08A67A] hover:bg-[#07966F] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải ảnh lên</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveAvatar}
                className="px-4 py-2 bg-[#08A67A] hover:bg-[#07966F] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Lưu ảnh đại diện</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
