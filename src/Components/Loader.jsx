import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

const Loader = ({ loading }) => {
  const textRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!loading) {
      // Fade out animation when loading is complete
      gsap.to('.loader-container', {
        opacity: 0,
        duration: 1,
        onComplete: () => {
          const loader = document.querySelector('.loader-container');
          if (loader) {
            loader.style.display = 'none';
          }
        }
      });
      return;
    }

    // Text background animation
    gsap.to(textRef.current, {
      backgroundPosition: "200% 200%",
      duration: 20,
      ease: "none",
      repeat: -1
    });

    // Text floating animation
    gsap.to(textRef.current, {
      y: "-=20",
      duration: 2,
      ease: "power1.inOut",
      repeat: -1,
      yoyo: true
    });

    // Create and animate particles
    const createParticles = () => {
      const container = document.querySelector('.particles-container');
      for (let i = 0; i < 100; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        container.appendChild(particle);
        particlesRef.current.push(particle);
      }
    };

    createParticles();

    // Animate particles
    particlesRef.current.forEach((particle, index) => {
      gsap.set(particle, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 0.5 + 0.3,
        opacity: Math.random() * 0.5 + 0.3,
        rotation: Math.random() * 360
      });

      gsap.to(particle, {
        x: "+=200",
        y: "+=200",
        rotation: "+=360",
        duration: Math.random() * 8 + 8,
        repeat: -1,
        yoyo: true,
        ease: "none",
        delay: index * 0.05
      });
    });
  }, [loading]);

  return (
    <div className="loader-container fixed inset-0 z-50">
      <div className="flex justify-center items-center h-screen w-full relative bg-black overflow-hidden">
        <div className="particles-container absolute inset-0 w-full h-full" />
        <div className="relative">
          <h1 ref={textRef} className="text-[180px] font-bold pointer-events-none" style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1614853035986-b230d7d5679c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
            backgroundSize: "200% 200%",
            backgroundPosition: "center",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textStroke: "2px white",
            WebkitTextStroke: "2px white"
          }}>
            LOADING...
          </h1>
        </div>

        <style>{`
          .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            pointer-events: none;
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.5),
                       0 0 60px rgba(255, 255, 255, 0.3);
            filter: blur(1px);
          }
        `}</style>
      </div>
    </div>
  )
}

export default Loader