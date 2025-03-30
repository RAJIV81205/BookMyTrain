import React, { useState, useEffect } from "react";
import gsap from "gsap";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      // Pause Spline animations when mobile menu is open
      if (window.splineApp) {
        window.splineApp.setVariable('pauseAnimations', true);
      }
    } else {
      document.body.style.overflow = 'unset';
      // Resume Spline animations when mobile menu is closed
      if (window.splineApp) {
        window.splineApp.setVariable('pauseAnimations', false);
      }
    }
  }, [isMobileMenuOpen]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled ? "py-2" : "py-6"
      }`}
    >
      <div 
        className={`relative mx-auto w-[95vw] max-w-[1400px] transition-all duration-700 ${
          isScrolled 
            ? "bg-black/40 backdrop-blur-md rounded-full border border-white/10" 
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-8">
          {/* Logo Section */}
          <div 
            className="relative group cursor-pointer"
            onMouseEnter={() => {
              setIsHovered(true);
              if (window.splineApp) {
                window.splineApp.setVariable('logoHovered', true);
              }
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              if (window.splineApp) {
                window.splineApp.setVariable('logoHovered', false);
              }
            }}
          >
            <div className="relative z-10 flex items-center gap-3">
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="logo" 
                  className={`w-12 h-12 transition-transform duration-500 ${
                    isHovered ? "scale-110" : "scale-100"
                  }`}
                />
                <div className={`absolute inset-0 bg-white/20 rounded-full blur-xl transition-opacity duration-500 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`} />
              </div>
              <span className="text-black font-circular-web text-2xl tracking-tight">
                Pengu<span className="text-yellow-300">Verse</span>
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-12">
            {["Home", "About", "Gallery", "Contact"].map((item, index) => (
              <a
                key={item}
                href="#"
                className="relative group"
                onMouseEnter={() => {
                  setIsHovered(true);
                  if (window.splineApp) {
                    window.splineApp.setVariable(`navHovered_${index}`, true);
                  }
                }}
                onMouseLeave={() => {
                  setIsHovered(false);
                  if (window.splineApp) {
                    window.splineApp.setVariable(`navHovered_${index}`, false);
                  }
                }}
              >
                <span className="text-gray-900/70 group-hover:text-gray-900 transition-colors duration-300 text-sm uppercase tracking-wider font-iansui">
                  {item}
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-300 group-hover:w-full transition-all duration-500" />
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <button 
            className="hidden lg:block px-6 py-2.5 bg-yellow-300 text-black rounded-full font-medium text-sm hover:bg-yellow-400 transition-colors duration-300 transform hover:scale-105 active:scale-95"
            onClick={() => {
              if (window.splineApp) {
                window.splineApp.setVariable('exploreClicked', true);
              }
            }}
          >
            Explore
          </button>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden relative w-10 h-10 flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? "rotate-45 translate-y-2" : "mb-1.5"
            }`} />
            <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? "opacity-0" : "mb-1.5"
            }`} />
            <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`} />
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden fixed inset-0 bg-black/95 backdrop-blur-lg transition-all duration-500 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}>
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {["Home", "About", "Gallery", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-white text-2xl font-medium hover:text-yellow-300 transition-colors duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <button 
              className="px-6 py-2.5 bg-yellow-300 text-black rounded-full font-medium text-sm hover:bg-yellow-400 transition-colors duration-300 mt-4 transform hover:scale-105 active:scale-95"
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (window.splineApp) {
                  window.splineApp.setVariable('exploreClicked', true);
                }
              }}
            >
              Explore
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
