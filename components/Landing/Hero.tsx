'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MoveUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Hero = () => {
  const router = useRouter();
  return (
    <div className='h-[90vh] w-full bg-[url(/train-main.jpg)] bg-cover bg-center bg-no-repeat text-black '>
      <header className='w-full h-20 bg-transparent flex items-center justify-between px-10 mt-4 font-kode-mono'>
        <div className='flex items-center justify-center'>
          {/* <Image src="/logo.png" alt="BookMyTrain" width={100} height={100} className='cursor-pointer' onClick={() => router.push('/')} /> */}
          <h1 className='text-2xl font-kode-mono font-bold text-primary'>BookMyTrain</h1>
        </div>
        <nav className='flex items-center w-1/2'>
          <ul className='flex items-center w-full justify-evenly text-xl text-primary font-kode-mono'>
            <li className='group relative hover:text-purple-900 transition-all duration-300 hover:font-semibold'>
              <Link href="/">Home</Link>
              <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-purple-900 transition-all duration-300 group-hover:w-full'></span>
            </li>
            <li className='group relative hover:text-purple-900 transition-all duration-300 hover:font-semibold'>
              <Link href="#about">About</Link>
              <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-purple-900 transition-all duration-300 group-hover:w-full'></span>
            </li>
            <li className='group relative hover:text-purple-900 transition-all duration-300 hover:font-semibold'>
              <Link href="#features">Features</Link>
              <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-purple-900 transition-all duration-300 group-hover:w-full'></span>
            </li>
            <li className='group relative hover:text-purple-900 transition-all duration-300 hover:font-semibold '>
              <Link href="#contact">Contact</Link>
              <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-purple-900 transition-all duration-300 group-hover:w-full'></span>
            </li>
          </ul>
        </nav>
        <div className='flex items-center justify-center text-secondary'>
          <button className='group relative rounded-full bg-primary px-5 py-3 flex items-center gap-2 cursor-pointer transition-all duration-300 border-transparent overflow-hidden border hover:border-primary'>
            <span className='relative z-10 transition-all duration-300 group-hover:text-primary'>LOGIN</span>
            <MoveUpRight className='w-4 h-4 relative z-10 transition-all duration-300 group-hover:text-primary' />
            <div className='absolute inset-0 bg-secondary transform -translate-x-full transition-transform duration-300 group-hover:translate-x-0'></div>
          </button>
        </div>

      </header>

    </div>
  )
}

export default Hero