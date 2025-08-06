import React from 'react'

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
                               )
                                                `,
                    filter: "blur(80px)",
                    backgroundRepeat: "no-repeat",
                }}
            />
            {/* Your Content/Components */}
        </div>
    )
}

export default Hero