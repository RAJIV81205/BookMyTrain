import React from 'react'

const About = () => {
  return (
    <div className='min-h-screen w-full bg-black py-20'>
      <div className='max-w-7xl mx-auto px-4'>
        <h2 className='text-4xl md:text-5xl font-bold text-white mb-12 text-center'>
          About <span className='text-yellow-300'>PenguVerse</span>
        </h2>
        
        <div className='grid md:grid-cols-2 gap-12 items-center'>
          <div className='space-y-6'>
            <p className='text-white/80 text-lg leading-relaxed'>
              PenguVerse is a revolutionary platform that brings together artists, creators, and innovators in a unique digital ecosystem. Our mission is to empower creative minds and foster collaboration across different mediums.
            </p>
            <p className='text-white/80 text-lg leading-relaxed'>
              With cutting-edge technology and a passionate community, we're building the future of digital creativity. Join us in this exciting journey where imagination knows no bounds.
            </p>
            <div className='flex gap-4 mt-8'>
              <button className='px-6 py-2 bg-yellow-300 text-black rounded-full font-medium hover:bg-yellow-400 transition-colors duration-300'>
                Learn More
              </button>
              <button className='px-6 py-2 border border-yellow-300 text-yellow-300 rounded-full font-medium hover:bg-yellow-300/10 transition-colors duration-300'>
                Join Community
              </button>
            </div>
          </div>
          
          <div className='relative'>
            <div className='aspect-square rounded-2xl overflow-hidden'>
              <img 
                src="/about-image.jpg" 
                alt="About PenguVerse" 
                className='w-full h-full object-cover'
              />
            </div>
            <div className='absolute -inset-4 bg-yellow-300/20 blur-2xl -z-10 rounded-full' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default About