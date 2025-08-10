import { Menu, LogOut, UserCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
}

interface AdminHeaderProps {
  user: AdminUser | null;
  onMenuClick: () => void;
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 17) {
    return 'afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'evening';
  } else {
    return 'night';
  }
}

export default function AdminHeader({ user, onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const timeOfDay = getTimeOfDay();
  const userName = user?.name || 'Admin';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    toast.success("Logged out successfully");
    router.replace("/admin/auth/login");
  };

  return (
    <header className="bg-white shadow-sm border-b px-4 lg:px-6 py-4 flex items-center justify-between">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Welcome Message */}
      <div className="hidden lg:block">
        <h1 className="text-xl font-semibold text-gray-900">
          Good {timeOfDay}, {userName}!
        </h1>
        <p className="text-sm text-gray-600">Welcome back to your admin dashboard</p>
      </div>

      {/* Mobile Title */}
      <h1 className="lg:hidden text-lg font-semibold text-gray-900">
        Admin Dashboard
      </h1>

      {/* User Info & Logout */}
      <div className="flex items-center space-x-4">
        {/* User Avatar & Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {userInitials}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
