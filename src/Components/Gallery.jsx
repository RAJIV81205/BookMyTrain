import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const galleryItems = [
  {
    title: "3D World",
    image: "/gallery/3d-world.jpg",
    category: "3D"
  },
  {
    title: "Creative Space",
    image: "/gallery/creative-space.jpg",
    category: "Design"
  },
  {
    title: "Community Hub",
    image: "/gallery/community.jpg",
    category: "Social"
  },
  {
    title: "Premium Content",
    image: "/gallery/premium.jpg",
    category: "Premium"
  },
  {
    title: "Interactive Tools",
    image: "/gallery/tools.jpg",
    category: "Tools"
  },
  {
    title: "Virtual Events",
    image: "/gallery/events.jpg",
    category: "Events"
  }
]

const Gallery = () => {
  const sectionRef = useRef(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const categories = ["all", ...new Set(galleryItems.map(item => item.category))]

  useEffect(() => {
    const section = sectionRef.current
    const items = section.querySelectorAll('.gallery-item')

    items.forEach((item, index) => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: "top bottom-=100",
          toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.1
      })
    })
  }, [selectedCategory])

  const filteredItems = selectedCategory === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory)

  return (
    <section ref={sectionRef} className="py-20 bg-black/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center">
          Explore Our <span className="text-yellow-300">Gallery</span>
        </h2>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-yellow-300 text-black"
                  : "bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => (
            <div 
              key={index}
              className="gallery-item group relative overflow-hidden rounded-2xl aspect-[4/3]"
            >
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <span className="text-yellow-300 text-sm">{item.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Gallery 