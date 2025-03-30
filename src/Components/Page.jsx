import React from 'react'
import Hero from './Hero'

const Page = ({ onLoad }) => {
  return (
    <div>
      <Hero onLoad={onLoad} />
    </div>
  )
}

export default Page