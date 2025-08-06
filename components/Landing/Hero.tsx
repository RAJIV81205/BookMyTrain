import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const Hero = () => {
    return (
        <div className="min-h-screen w-full relative bg-white">
            {/* Teal Glow Top */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: "#ffffff",
                    backgroundImage: `
            radial-gradient(
              circle at top center,
              rgba(56, 193, 182, 0.5),
              transparent 70%
            )`,
                    filter: "blur(80px)",
                    backgroundRepeat: "no-repeat",
                }}
            />

            {/* Hero Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen px-6 pt-20 font-poppins">
                <div className="text-center max-w-2/3 mx-auto">
                    {/* Main Heading */}
                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-slate-900 mb-8 leading-tight upper tracking-wide">
                        Book<span className="text-teal-600">.</span>Travel<span className="text-teal-600">.</span>Enjoy
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Experience seamless railway journeys with our smart booking platform.
                        Your adventure begins with a single click.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/auth/login">
                            <button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 group cursor-pointer">
                                Start Your Journey
                                <ArrowUpRight className="w-5 h-5 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out" />
                            </button>
                        </Link>
                        <Link href="/explore">
                            <button className="border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 bg-white/50 backdrop-blur-sm flex items-center gap-2 group cursor-pointer">
                                Explore Routes
                                <ArrowUpRight className="w-5 h-5 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out" />
                            </button>
                        </Link>
                    </div>



                </div>
            </div>
        </div>
    );
};

export default Hero;