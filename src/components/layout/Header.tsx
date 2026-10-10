import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Menu,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronDown,
  UserCheck,
  LogOut,
  Camera
} from 'lucide-react';
import { NotificationItem, ClassInfo } from '../../types';
import { useAuth } from '../../firebase/AuthContext';
import { ClassAvatarModal } from './ClassAvatarModal';

interface HeaderProps {
  classInfo: ClassInfo;
  notifications: NotificationItem[];
  onOpenMobileSidebar: () => void;
  onNotificationClick?: (notif: NotificationItem) => void;
  onOpenSettings?: () => void;
  onUpdateClassAvatar?: (avatarUrl: string) => Promise<void>;
  onDeleteClassAvatar?: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({
  classInfo,
  notifications,
  onOpenMobileSidebar,
  onNotificationClick,
  onOpenSettings,
  onUpdateClassAvatar,
  onDeleteClassAvatar,
}) => {
  const { currentUser, signOut } = useAuth();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="h-16 bg-white border-b border-[#D9E2EC] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_2px_0_rgba(23,43,77,0.03)]">
        {/* Left side: Hamburger on mobile + Class Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 text-[#66788A] hover:text-[#172B4D] hover:bg-[#F5F8FC] rounded-lg transition-colors"
            aria-label="Mở danh mục"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {/* Class Avatar Button */}
            <button
              type="button"
              onClick={() => setShowAvatarModal(true)}
              className="w-10 h-10 rounded-xl bg-[#08A67A]/10 border border-[#08A67A]/25 text-[#08A67A] flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 relative group cursor-pointer shadow-xs hover:border-[#08A67A] transition-all"
              title="Ảnh đại diện lớp (Bấm để thay đổi hoặc xóa)"
              aria-label="Ảnh đại diện lớp"
            >
              {classInfo.avatarUrl ? (
                <img
                  src={classInfo.avatarUrl}
                  alt={classInfo.className}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{classInfo.className.replace(/^Lớp\s*/i, '').trim() || 'LỚP'}</span>
              )}
              <div className="absolute inset-0 bg-[#16324F]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-4 h-4" />
              </div>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#172B4D] text-base leading-tight">
                  {classInfo.className}
                </span>
                <span className="text-[#D9E2EC] hidden sm:inline">|</span>
                <span className="text-xs sm:text-sm font-medium text-[#66788A]">
                  {classInfo.academicYear}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#66788A] mt-0.5">
                <span>Phòng: {classInfo.room}</span>
              </div>
            </div>
          </div>
        </div>

      {/* Right side: Notifications + Teacher Account */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Date display: Tuần 5 - Thứ Năm, 08/10/2026 */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-[#172B4D] bg-[#F5F8FC] px-3 py-1.5 rounded-lg border border-[#D9E2EC]">
          <Calendar className="w-3.5 h-3.5 text-[#08A67A]" />
          <span className="font-semibold text-[#08A67A]">Tuần 5</span>
          <span className="text-[#D9E2EC]">|</span>
          <span className="text-[#66788A]">Thứ Năm, 08/10/2026</span>
          <span className="text-[11px] text-[#66788A] bg-white px-1.5 py-0.5 rounded border border-[#D9E2EC] font-mono">
            05/10 – 10/10
          </span>
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 text-[#66788A] hover:text-[#172B4D] hover:bg-[#F5F8FC] rounded-lg relative transition-colors"
            aria-label="Thông báo"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#E5484D] rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-[#D9E2EC] py-2 z-50 text-[#172B4D] animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-[#D9E2EC] flex items-center justify-between">
                <span className="text-sm font-semibold text-[#172B4D]">Thông báo mới</span>
                <span className="text-xs text-[#08A67A] bg-[#08A67A]/10 px-2 py-0.5 rounded font-medium">
                  {unreadCount} chưa đọc
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[#D9E2EC]/50">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      onNotificationClick?.(notif);
                      setShowNotifMenu(false);
                    }}
                    className={`p-3 text-xs flex gap-3 hover:bg-[#F5F8FC] cursor-pointer transition-colors ${
                      !notif.read ? 'bg-[#08A67A]/5' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {notif.type === 'warning' && (
                        <AlertCircle className="w-4 h-4 text-[#F59E0B]" />
                      )}
                      {notif.type === 'success' && (
                        <CheckCircle2 className="w-4 h-4 text-[#08A67A]" />
                      )}
                      {notif.type === 'info' && (
                        <Info className="w-4 h-4 text-[#3182CE]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`leading-snug ${!notif.read ? 'font-semibold text-[#172B4D]' : 'text-[#66788A]'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[11px] text-[#66788A]/80 mt-1 block">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Teacher profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 sm:px-2.5 rounded-lg hover:bg-[#F5F8FC] transition-colors text-left"
          >
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'Avatar'}
                className="w-8 h-8 rounded-full object-cover border border-[#D9E2EC] shadow-xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#08A67A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser?.displayName
                  ? currentUser.displayName.slice(0, 2).toUpperCase()
                  : 'NX'}
              </div>
            )}
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-[#172B4D] leading-tight">
                {currentUser?.displayName || classInfo.homeroomTeacher}
              </div>
              <div className="text-[11px] text-[#66788A] flex items-center gap-1">
                <span>Giáo viên chủ nhiệm</span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#66788A] hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#D9E2EC] py-1.5 z-50 text-xs text-[#172B4D]">
              <div className="px-3 py-2 border-b border-[#D9E2EC]">
                <p className="font-semibold text-[#172B4D]">
                  {currentUser?.displayName || classInfo.homeroomTeacher}
                </p>
                <p className="text-[11px] text-[#08A67A] font-medium">Giáo viên chủ nhiệm</p>
                <p className="text-[#66788A] text-[11px] truncate">
                  {currentUser?.email || 'gv.xuyennguyen@thpt.edu.vn'}
                </p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    onOpenSettings?.();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#F5F8FC] flex items-center gap-2 text-[#172B4D] cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-[#66788A]" />
                  <span>Cài đặt hệ thống</span>
                </button>
                <button
                  onClick={async () => {
                    setShowProfileMenu(false);
                    await signOut();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 font-medium cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Class Avatar Modal */}
    {onUpdateClassAvatar && onDeleteClassAvatar && (
      <ClassAvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        classInfo={classInfo}
        onUpdateAvatar={onUpdateClassAvatar}
        onDeleteAvatar={onDeleteClassAvatar}
      />
    )}
  </>
);
};
