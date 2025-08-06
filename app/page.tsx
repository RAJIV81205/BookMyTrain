import React from 'react'
import Header from '@/components/Landing/Header'
import Hero from '@/components/Landing/Hero'
import Footer from '@/components/Landing/Footer'

const page = () => {
  return (
    <main className="min-h-screen flex flex-col ">
      <Header />
      
      <Hero />
      <Footer />
      

    </main>
  )
}

export default page