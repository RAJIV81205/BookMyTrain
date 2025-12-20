"use client"

import React, { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import gsap from "gsap";
import { useGSAP } from '@gsap/react';


const Hero = () => {
    const heroRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const button1Ref = useRef<HTMLButtonElement>(null);
    const button2Ref = useRef<HTMLButtonElement>(null);

    gsap.registerPlugin(useGSAP);

    useGSAP(() => {
        // Create staggered animation timeline
        const tl = gsap.timeline({ delay: 0.5 });

        tl.to(headingRef.current, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out"
        })
            .to(subtitleRef.current, {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out"
            }, "-=0.8") // Start 0.8s before previous animation ends
            .to([button1Ref.current, button2Ref.current], {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.2,
                ease: "power3.out"
            }, "-=0.6"); // Start 0.6s before previous animation ends

    }, { scope: heroRef });

    return (
        <div ref={heroRef} className="min-h-screen w-full relative bg-white">
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
                <div className="text-center  w-full sm:max-w-2/3 mx-auto">
                    {/* Main Heading */}
                    <h1 ref={headingRef} className="text-6xl md:text-7xl lg:text-8xl font-bold text-slate-900 mb-8 leading-tight upper tracking-wide opacity-0 translate-y-16">
                        Book<span className="text-teal-600 break-all ">.</span>Travel<span className="text-teal-600 break-all">.</span>Enjoy
                    </h1>

                    {/* Subtitle */}
                    <p ref={subtitleRef} className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed text-pretty opacity-0 translate-y-16">
                        Experience seamless railway journeys with our smart booking platform.Your adventure begins with a single click.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
                        <Link href="/dashboard">
                            <button ref={button1Ref} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 group cursor-pointer opacity-0 translate-y-16">
                                Start Your Journey
                                <ArrowUpRight className="w-5 h-5 lg:opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out" />
                            </button>
                        </Link>
                        <Link href="/explore">
                            <button ref={button2Ref} className="border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 bg-white/50 backdrop-blur-sm hover:scale-105 flex items-center gap-2 group cursor-pointer opacity-0 translate-y-16">
                                Explore Routes
                                <ArrowUpRight className="w-5 h-5 lg:opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out" />
                            </button>
                        </Link>
                    </div>



                </div>
            </div>
        </div>
    );
};

export default Hero;