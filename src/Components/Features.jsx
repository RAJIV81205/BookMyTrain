import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    title: "3D Experience",
    description: "Immerse yourself in our interactive 3D world where every element comes to life.",
    icon: "🎮"
  },
  {
    title: "Creative Tools",
    description: "Access powerful tools and resources to bring your creative vision to reality.",
    icon: "🛠️"
  },
  {
    title: "Community Hub",
    description: "Connect with fellow creators and share your work with a global audience.",
    icon: "🌍"
  },
  {
    title: "Premium Content",
    description: "Get access to exclusive content and premium features for enhanced creativity.",
    icon: "⭐"
  }
]

const Features = () => {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const cards = section.querySelectorAll('.feature-card')

    cards.forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top bottom-=100",
          toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.2
      })
    })
  }, [])

  return (
    <section ref={sectionRef} className="py-20 bg-black/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center">
          Why Choose <span className="text-yellow-300">PenguVerse</span>
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="feature-card group relative p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-yellow-300/50 transition-all duration-500"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/0 to-yellow-300/0 group-hover:from-yellow-300/10 group-hover:to-yellow-300/5 rounded-2xl transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features 