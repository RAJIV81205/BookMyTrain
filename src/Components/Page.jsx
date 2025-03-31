import React from 'react'
import Header from './Header'
import About from './About'
const Page = ({ onLoad }) => {
  return (
    <div className='flex flex-col h-screen'>
      <Header />
      <About />
    </div>
  )
}

export default Page