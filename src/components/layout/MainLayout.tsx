import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { toast } from 'sonner';
import { 
  LayoutDashboard, Users, GraduationCap, BookOpen,
  CalendarDays, CalendarCheck, CheckSquare,
  LogOut, Menu, UserCircle2, FileText
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
}

const MENU_ITEMS: MenuItem[] = [
  { key: '/dashboard', label: 'Tổng quan', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['ADMIN', 'TEACHER'] },
  { key: '/students', label: 'Sinh viên', icon: <Users className="w-5 h-5" />, roles: ['ADMIN', 'TEACHER'] },
  { key: '/classes', label: 'Lớp học', icon: <GraduationCap className="w-5 h-5" />, roles: ['ADMIN'] },
  { key: '/subjects', label: 'Môn học', icon: <BookOpen className="w-5 h-5" />, roles: ['ADMIN'] },
  { key: '/academic-years', label: 'Năm học', icon: <CalendarDays className="w-5 h-5" />, roles: ['ADMIN'] },
  { key: '/semesters', label: 'Học kỳ', icon: <CalendarDays className="w-5 h-5" />, roles: ['ADMIN'] },
  { key: '/schedules', label: 'Lịch học', icon: <CalendarDays className="w-5 h-5" />, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { key: '/exams', label: 'Lịch thi', icon: <CalendarCheck className="w-5 h-5" />, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { key: '/scores', label: 'Điểm số', icon: <CheckSquare className="w-5 h-5" />, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { key: '/attendances', label: 'Điểm danh', icon: <CheckSquare className="w-5 h-5" />, roles: ['ADMIN', 'TEACHER'] },
  { key: '/reports', label: 'Báo cáo', icon: <FileText className="w-5 h-5" />, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { key: '/profile', label: 'Hồ sơ', icon: <UserCircle2 className="w-5 h-5" />, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
];

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user) return null;

  const filteredMenu = MENU_ITEMS.filter(item => item.roles.includes(user.role));

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Bạn đã đăng xuất thành công!');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-slate-900 text-slate-300 flex flex-col transition-all duration-300",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="h-16 flex items-center justify-center border-b border-slate-800">
          <span className="text-white font-semibold text-lg tracking-wider truncate px-4">
            {isSidebarOpen ? 'STUDENT MGMT' : 'SM'}
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {filteredMenu.map(item => {
              const isActive = location.pathname.startsWith(item.key);
              return (
                <li key={item.key}>
                  <button
                    onClick={() => navigate(item.key)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors",
                      isActive 
                        ? "bg-blue-600 text-white" 
                        : "hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {isSidebarOpen && <span className="truncate">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-slate-100 text-slate-600"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-slate-500">Xin chào,</span>{' '}
              <span className="font-medium text-slate-900">{user.username} ({user.role})</span>
            </div>
            <Button variant="destructive" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};