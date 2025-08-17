"use client"

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const Header = () => {
  const headerRef = useRef<HTMLElement>(null);


  gsap.registerPlugin(useGSAP);

  useGSAP(() => {
    // Animate header on mount - slide in from top
    gsap.fromTo(headerRef.current,
      {
        y: 100,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out"
      }
    )
  })

   
    



  return (
    <div className='absolute top-0 p-6 w-full z-10 bg-transparent'>
      <header ref={headerRef} className='max-w-6xl mx-auto flex items-center justify-between font-poppins'>
        {/* Logo Section */}
        <div  className='flex items-center space-x-3 cursor-pointer hover:scale-105 transition-transform duration-200'>
          <div className='w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center hover:bg-blue-700 transition-colors duration-200'>
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
          <span className='text-lg font-semibold text-slate-800'>BookMyTrain</span>
        </div>

        {/* Get Started Button */}
        <button
          className='bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg'
        >
          Get Started
        </button>
      </header>
    </div>
  );
};

export default Header;