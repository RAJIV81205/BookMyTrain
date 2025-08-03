import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MoveUpRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className='h-[90vh] w-full bg-[url(/train-main.jpg)] bg-cover bg-center bg-no-repeat text-black '>
      <header className='w-full h-20 bg-transparent flex items-center justify-between px-10 mt-4 font-kode-mono'>
      <div className='flex items-center justify-center'>
        <Image src="/logo.png" alt="logo" width={100} height={100} />
      </div>
      <nav className='flex items-center w-1/2'>
        <ul className='flex items-center w-full justify-evenly text-xl text-primary font-kode-mono'>
          <li><Link href="/">Home</Link></li>
          <li><Link href="#about">About</Link></li>
          <li><Link href="#features">Features</Link></li>
          <li><Link href="#contact">Contact</Link></li>
        </ul>
      </nav>
      <div className='flex items-center justify-center text-secondary'>
        <button className='rounded-full bg-primary  px-4 py-2 flex items-center gap-2'>LOGIN <MoveUpRight className='w-4 h-4' /></button>
      </div>

      </header>
       
    </div>
  )
}

export default Hero