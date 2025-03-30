import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

const Loader = () => {
  const textRef = useRef(null);

  useEffect(() => {
    gsap.to(textRef.current, {
      backgroundPosition: "200% 200%",
      duration: 20,
      ease: "none",
      repeat: -1
    });
  }, []);

  return (
    <div className="flex justify-center items-center h-screen w-full relative bg-black overflow-hidden">
        <div className="relative">
            <h1 ref={textRef} className="text-[180px] font-bold" style={{
                backgroundImage: "url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop)",
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
    </div>
  )
}

export default Loader