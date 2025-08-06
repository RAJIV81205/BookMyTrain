import React from 'react';

const Header = () => {
  return (
    <div className='absolute top-0 p-6 w-full z-10 bg-transparent'>
      <header className='max-w-6xl mx-auto flex items-center justify-between font-poppins'>
        {/* Logo Section */}
        <div className='flex items-center space-x-3'>
          <div className='w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center'>
            <svg 
              className='w-5 h-5 text-white' 
              fill='none' 
              stroke='currentColor' 
              viewBox='0 0 24 24'
            >
              <path 
                strokeLinecap='round' 
                strokeLinejoin='round' 
                strokeWidth={2} 
                d='M13 10V3L4 14h7v7l9-11h-7z' 
              />
            </svg>
          </div>
          <span className='text-lg font-semibold text-slate-800'>RailConnect</span>
        </div>

        {/* Get Started Button */}
        <button className='bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-200'>
          Get Started
        </button>
      </header>
    </div>
  );
};

export default Header;