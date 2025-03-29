import React, { useEffect } from "react";
import gsap from "gsap";

const Loader = () => {
    useEffect(() => {
        // Create a timeline for better animation control
        const tl = gsap.timeline();

        // Initial state - set all blocks to invisible and centered with rotation
        gsap.set(".block", {
            opacity: 0,
            x: "50%",
            y: "50%",
            scale: 0.3,
            rotation: 15,
            transformOrigin: "center center"
        });

        // Animate each block from center to its position
        tl.to(".block", {
            opacity: 1,
            x: "0%",
            y: "0%",
            scale: 1,
            rotation: 0,
            duration: 1.5,
            ease: "power4.out",
            stagger: 0.5,
            delay: 0.2
        })
        // Add floating animation after initial animation
        .to(".block", {
            y: "+=20",
            duration: 2,
            ease: "sine.inOut",
            stagger: 0.2,
            repeat: -1,
            yoyo: true
        });
    }, []);

    return (
        <div className="flex items-center justify-center h-screen w-full">
            <p className="text-[150px] font-medium text-gray-900 font-loader text-center">
                <span className="block">YOUR WEBSITE</span>
                <span className="block">IS</span>
                <span className="block">LOADING</span>
            </p>
        </div>
    );
};

export default Loader;
