import { User } from '@/types/dashboard';

interface DashboardHeaderProps {
  user: User | null;
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

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const timeOfDay = getTimeOfDay();
  const userName = user?.name || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="flex items-center justify-between w-full border-b border-gray-200 px-6 py-4 mb-6 font-poppins">
      {/* Left side - Greeting */}
      <div className="font-poppins">
        <h1 className="text-2xl font-semibold text-gray-900">
          Good {timeOfDay}, {userName.split(' ')[0]}
        </h1>
      </div>

      {/* Right side - Profile */}
      <div className="flex items-center">
        {/* Profile Avatar */}
        <div className="flex items-center space-x-2 bg-gray-200 text-white rounded-full px-3 py-2">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-200">
              {userInitials}
            </span>
          </div>
          <span className="text-sm  font-medium text-gray-800">
            {userName}
          </span>
        </div>
      </div>
    </div>
  );
}