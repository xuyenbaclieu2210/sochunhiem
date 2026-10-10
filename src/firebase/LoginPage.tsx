import React from 'react';
import { BookOpen, ShieldCheck, Database, Users, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthContext';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, loginError, loading } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col justify-center items-center p-4">
      {/* Container card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#D9E2EC] shadow-[0_10px_25px_-5px_rgba(23,43,77,0.08)] overflow-hidden">
        {/* Brand header banner */}
        <div className="bg-[#16324F] p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#08A67A]/20 rounded-full blur-2xl" />
          <div className="w-16 h-16 rounded-2xl bg-[#08A67A] mx-auto flex items-center justify-center text-white shadow-lg mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">
            SỔ CHỦ NHIỆM
          </h1>
          <p className="text-sm text-[#B8C7D9] mt-1.5 font-medium">
            Hệ thống Quản lý Lớp học THPT
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs text-[#E1EAF2]">
            <span>Năm học 2026–2027</span>
            <span>•</span>
            <span>GVCN: Thầy Nguyễn Văn Xuyên</span>
          </div>
        </div>

        {/* Content body */}
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-[#172B4D]">
              Đăng nhập hệ thống
            </h2>
            <p className="text-xs text-[#66788A] mt-1">
              Dữ liệu học sinh và lớp học được bảo vệ an toàn trên Cloud Firestore. Vui lòng đăng nhập bằng tài khoản Google được cấp quyền để tiếp tục.
            </p>
          </div>

          {/* Error alert if any */}
          {loginError && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Đăng nhập không thành công</p>
                <p className="mt-0.5 text-red-600">{loginError}</p>
              </div>
            </div>
          )}

          {/* Sign in with Google Button */}
          <button
            onClick={() => signInWithGoogle()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white hover:bg-[#F5F8FC] text-[#172B4D] font-semibold text-sm rounded-xl border border-[#D9E2EC] shadow-xs hover:border-[#08A67A]/50 transition-all cursor-pointer group active:scale-[0.99] disabled:opacity-50"
          >
            {/* Google "G" standard SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span>Đăng nhập bằng tài khoản Google</span>
          </button>

          {/* Security Features */}
          <div className="mt-8 pt-6 border-t border-[#D9E2EC] space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-[#66788A]">
              <ShieldCheck className="w-4 h-4 text-[#08A67A] shrink-0" />
              <span>Bảo mật Firebase Authentication & Firestore Security Rules</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#66788A]">
              <Database className="w-4 h-4 text-[#16324F] shrink-0" />
              <span>Dữ liệu lưu trữ đồng bộ thời gian thực trên Cloud Firestore</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#66788A]">
              <Users className="w-4 h-4 text-[#E65100] shrink-0" />
              <span>Chỉ giáo viên chủ nhiệm được cấp quyền mới có thể truy cập</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="mt-6 text-center text-xs text-[#66788A]">
        © 2026 Sổ Chủ Nhiệm · Dành cho giáo viên chủ nhiệm THPT
      </div>
    </div>
  );
};
