import React from 'react'
import Hero from './Hero'
import Header from './Header'
import About from './About'
import Features from './Features'
import Gallery from './Gallery'
import Contact from './Contact'

const Page = ({ onLoad }) => {
  return (
    <div className='flex flex-col'>
      <Header />
      <main>
        <Hero onLoad={onLoad} />
        <div className='relative bg-black/50 backdrop-blur-sm'>
          <About />
          <Features />
          <Gallery />
          <Contact />
        </div>
      </main>
    </div>
  )
}

export default Page