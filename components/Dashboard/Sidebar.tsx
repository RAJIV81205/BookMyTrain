'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Tickets, Info, X, Map, PanelLeftOpen, PanelRightOpen, Radio } from 'lucide-react';

const navItems = [
  { label: 'Home', path: '/dashboard', icon: Home, title: "Home" },

  { label: 'Train Info', path: '/dashboard/train', icon: Info, title: "Train Info" },
  { label: "Live Status", path: '/dashboard/live-status', icon: Radio, title: "Live Status" },
  { label: 'PNR Status', path: '/dashboard/pnr', icon: Tickets, title: "PNR Status" },
  { label: "Train Map", path: '/dashboard/livemap', icon: Map, title: "Train Map" }

];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [desktopOpen, setDesktopOpen] = useState(true);

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose(); // Close sidebar on mobile after navigation
  };

  // Auto-close desktop sidebar when visiting livemap
  useEffect(() => {
    if (pathname.includes("dashboard/livemap")) {
      setDesktopOpen(false);
    }
  }, [pathname]);

  // Trigger window resize event when sidebar state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300); // Match the transition duration

    return () => clearTimeout(timer);
  }, [desktopOpen]);

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300
        ${desktopOpen ? "lg:w-64" : "lg:w-16"}`}
      >
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Header with Logo + Toggle */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            {desktopOpen && (
              <h1 className="text-xl font-bold text-blue-600">BookMyTrain</h1>
            )}
            <button
              onClick={() => {
                setDesktopOpen(!desktopOpen);
              }}
              className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              {desktopOpen ? (
                <PanelRightOpen />
              ) : (
                <PanelLeftOpen />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-6 space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  title={item.title}
                  className={`w-full flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors cursor-pointer
                  ${isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-700/50'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon className="h-6 w-6" />
                  {desktopOpen && <span className="ml-3 truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar (UNCHANGED) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">BookMyTrain</h1>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-3">
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Personal Account
              </p>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors ${isActive
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon className="mr-3 h-6 w-6" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop Content Spacer */}
      <div className="hidden lg:block lg:flex-shrink-0" style={{ width: desktopOpen ? '16rem' : '4rem' }} />
    </>
  );
}
