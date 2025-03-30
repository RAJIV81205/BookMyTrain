import React from 'react'
import Header from './Header'

const Page = ({ onLoad }) => {
  return (
    <div className='flex flex-col h-screen'>
      <Header />
    </div>
  )
}

export default Page