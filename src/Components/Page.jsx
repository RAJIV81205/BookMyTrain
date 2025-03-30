import React from 'react'
import Hero from './Hero'
import Header from './Header'
const Page = ({ onLoad }) => {
  return (
    <div className='flex flex-col relative'>
      <Header />
      <Hero onLoad={onLoad} />
    </div>
  )
}

export default Page