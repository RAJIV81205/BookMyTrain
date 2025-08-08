import { User } from '@/types/auth';
import { Menu } from 'lucide-react';

interface DashboardHeaderProps {
  user: User | null;
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

export default function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  const timeOfDay = getTimeOfDay();
  const userName = user?.name || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile Menu Button + Greeting */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Greeting */}
          <div>
            <h1 className="text-lg lg:text-xl font-semibold text-gray-900">
              Good {timeOfDay}, {userName.split(' ')[0]}
            </h1>
          </div>
        </div>

        {/* Right side - Profile */}
        <div className="flex items-center space-x-3">
          {/* Profile Avatar */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-xs lg:text-sm font-medium text-white">
                {userInitials}
              </span>
            </div>
            <span className="hidden sm:block text-sm lg:text-base font-medium text-gray-700">
              {userName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
