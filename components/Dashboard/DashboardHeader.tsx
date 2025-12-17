"use client";

import { User } from "@/types/auth";
import { Menu, User as UserIcon, Ticket, LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  user: User | null;
  onMenuClick: () => void;
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export default function DashboardHeader({
  user,
  onMenuClick,
}: DashboardHeaderProps) {
  const router = useRouter();
  const timeOfDay = getTimeOfDay();
  const userName = user?.name || "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
    

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    // TODO: clear token / session here
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 h-16">
      <div className="flex items-center justify-between h-full">
        {/* Left */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h1 className="text-lg lg:text-xl font-semibold text-gray-900">
            Good {timeOfDay}, {userName.split(" ")[0]}
          </h1>
        </div>

        {/* Right - Profile */}
        <div
          className="relative"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {/* Profile Trigger */}
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center space-x-3 lg:border lg:border-gray-200 lg:py-1 lg:px-3 lg:bg-gray-100 rounded-full hover:bg-gray-200 transition"
          >
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {userInitials}
              </span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {userName}
            </span>
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-fade-in">
              <ul className="py-2">
                <li
                  onClick={() => router.push("/dashboard/profile")}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <UserIcon className="w-4 h-4" />
                  Profile
                </li>

                <li
                  onClick={() => router.push("/profile/bookings")}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  Bookings
                </li>

                <div className="my-1 border-t border-gray-100" />

                <li
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
