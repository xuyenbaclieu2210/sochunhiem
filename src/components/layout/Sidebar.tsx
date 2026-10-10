import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  GraduationCap,
  AlertTriangle,
  Award,
  HeartHandshake,
  BarChart3,
  Settings,
  X,
  BookOpen,
  Medal,
  FileSpreadsheet
} from 'lucide-react';

export type NavItemKey =
  | 'overview'
  | 'students'
  | 'attendance'
  | 'competition'
  | 'violations'
  | 'awards'
  | 'concern'
  | 'reports'
  | 'workspace'
  | 'settings';

interface SidebarProps {
  activeTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  concernCount?: number;
  violationCount?: number;
}

interface MenuItem {
  id: NavItemKey;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  concernCount = 4,
  violationCount = 3,
}) => {
  const menuItems: MenuItem[] = [
    {
      id: 'overview',
      label: 'Tổng quan',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'students',
      label: 'Học sinh',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'attendance',
      label: 'Chuyên cần',
      icon: <CalendarCheck className="w-5 h-5" />,
    },
    {
      id: 'competition',
      label: 'Thi đua tuần',
      icon: <Medal className="w-5 h-5" />,
    },
    {
      id: 'violations',
      label: 'Vi phạm',
      icon: <AlertTriangle className="w-5 h-5" />,
      badge: violationCount > 0 ? violationCount : undefined,
      badgeColor: 'text-[#92400E] bg-[#FEF3C7]',
    },
    {
      id: 'awards',
      label: 'Khen thưởng',
      icon: <Award className="w-5 h-5" />,
    },
    {
      id: 'concern',
      label: 'Học sinh cần quan tâm',
      icon: <HeartHandshake className="w-5 h-5" />,
      badge: concernCount > 0 ? concernCount : undefined,
      badgeColor: 'text-[#991B1B] bg-[#FEE2E2]',
    },
    {
      id: 'reports',
      label: 'Báo cáo',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'workspace',
      label: 'Google Drive & Sheets',
      icon: <FileSpreadsheet className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleNavClick = (id: NavItemKey) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#16324F]/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container with Navy background #16324F */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#16324F] text-[#FFFFFF] flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static shadow-sm ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-5 border-b border-[#214766] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#08A67A] flex items-center justify-center text-white shadow-xs font-bold transition-transform hover:scale-105">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-[#FFFFFF] uppercase leading-none">
                SỔ CHỦ NHIỆM
              </h1>
              <p className="text-[11px] text-[#B8C7D9] mt-1 font-medium">Quản lý lớp học THPT</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-[#B8C7D9] hover:text-white rounded-md hover:bg-[#214766]"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-[#B8C7D9] uppercase">
            Quản trị lớp học
          </div>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-[#08A67A] hover:bg-[#07966F] text-[#FFFFFF] shadow-xs'
                    : 'text-[#FFFFFF] hover:bg-[#214766] hover:text-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={isActive ? 'text-white' : 'text-[#9FB3C8]'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md font-semibold transition-colors ${
                      isActive ? 'bg-white/25 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-[#214766] text-xs text-[#B8C7D9]">
          <div className="flex items-center justify-between font-medium text-[#FFFFFF]">
            <span>Phiên bản MVP</span>
            <span className="text-[10px] text-[#08A67A] bg-[#08A67A]/15 px-2 py-0.5 rounded border border-[#08A67A]/30 font-semibold">
              Dữ liệu nội bộ
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#B8C7D9]/80">GDPT 2018 · THPT Chu Văn An</p>
        </div>
      </aside>
    </>
  );
};
