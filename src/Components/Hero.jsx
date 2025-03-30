import React from 'react'
import Spline from '@splinetool/react-spline';

const Hero = ({ onLoad }) => {
  return (
    <div className='h-screen w-screen relative'>
        <video src="/bg.mp4" autoPlay muted loop className='w-full h-full object-cover' />
        <div className='absolute inset-0 bg-black/80' />
      <Spline 
        scene="https://prod.spline.design/0CjTKi3v6AEI-cUl/scene.splinecode"
        onLoad={onLoad}
        className='absolute inset-0 z-10'
      />
    </div>
  )
}

export default Hero