// Updated Sidebar Component
'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, User, Activity } from 'lucide-react';

const navItems = [
  { label: 'Home', path: '/dashboard', icon: Home },
  { label: 'Account', path: '/dashboard/account', icon: User },
  { label: 'Activity', path: '/dashboard/activity', icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-0 h-screen w-68 bg-white border-r border-gray-300 flex flex-col py-6 px-4 font-poppins z-40">
      
      <div className="mb-12 mt-2">
        <p className="text-2xl font-semibold">BookMyTrain</p>
        <div className="text-xs text-gray-500 ml-1 mt-1 tracking-wide">Personal Account</div>
      </div>

      <nav className="flex flex-col gap-1 overflow-y-auto flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <button
              key={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold
                ${isActive
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-700 hover:bg-blue-50'
                }
              `}
              onClick={() => router.push(item.path)}
            >
              <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
              <span className="tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>
     
    </aside>
  );
}