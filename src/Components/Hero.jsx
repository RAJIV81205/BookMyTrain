import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

const Hero = ({ onLoad }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    // Trigger onLoad when component mounts
    if (onLoad) {
      onLoad();
    }

    // Animate content on mount
    gsap.from(contentRef.current.children, {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out"
    });
  }, [onLoad]);

  const handleMouseMove = (e) => {
    if (!window.splineApp) return;
    
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Calculate normalized coordinates (-1 to 1)
    const x = (clientX / innerWidth) * 2 - 1;
    const y = -(clientY / innerHeight) * 2 + 1;
    
    // You can use these coordinates to interact with your Spline scene
    // For example, you might want to rotate or move objects based on mouse position
    window.splineApp.setVariable('mouseX', x);
    window.splineApp.setVariable('mouseY', y);
  };

  return (
    <div 
      className='h-screen w-full relative'
      onMouseMove={handleMouseMove}
    >
      <video 
        src="/bg.mp4" 
        autoPlay 
        muted 
        loop 
        className='w-full h-full object-cover opacity-50' 
      />
      <div className='absolute inset-0 bg-black/50' />
      <div 
        ref={contentRef}
        className='absolute inset-0 z-10 w-full h-full flex flex-col items-center justify-center text-white px-4'
      >
        <h1 className='text-6xl md:text-8xl font-bold mb-6 text-center'>
          Welcome to <span className='text-yellow-300'>PenguVerse</span>
        </h1>
        <p className='text-xl md:text-2xl text-center max-w-2xl mb-8 text-white/80'>
          Discover a world of endless possibilities where creativity meets technology
        </p>
        <button 
          className='px-8 py-3 bg-yellow-300 text-black rounded-full font-medium text-lg hover:bg-yellow-400 transition-colors duration-300 transform hover:scale-105 active:scale-95'
          onClick={() => {
            // Add any click interaction with Spline scene here
            if (window.splineApp) {
              window.splineApp.setVariable('buttonClicked', true);
            }
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  )
}

export default Hero