import React from 'react'

const About = () => {
  return (
        <div className='h-screen w-full bg-black'>
            <div className='flex h-full'>
                <div className='w-1/2 flex flex-col items-start justify-center px-16'>
                    <h1 className='text-white text-5xl font-bold mb-6'>About Us</h1>
                    <p className='text-gray-300 text-lg leading-relaxed mb-8'>
                        We are a passionate team of innovators dedicated to creating exceptional digital experiences. 
                        Our journey began with a simple idea: to make technology accessible, beautiful, and meaningful.
                    </p>
                    <div className='space-y-6'>
                        <div className='flex items-start space-x-4'>
                            <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center'>
                                <span className='text-white text-xl'>01</span>
                            </div>
                            <div>
                                <h3 className='text-white text-xl font-semibold mb-2'>Our Mission</h3>
                                <p className='text-gray-400'>To push the boundaries of digital innovation while maintaining the highest standards of quality and user experience.</p>
                            </div>
                        </div>
                        <div className='flex items-start space-x-4'>
                            <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center'>
                                <span className='text-white text-xl'>02</span>
                            </div>
                            <div>
                                <h3 className='text-white text-xl font-semibold mb-2'>Our Vision</h3>
                                <p className='text-gray-400'>To be the leading force in digital transformation, setting new standards for creativity and technical excellence.</p>
                            </div>
                        </div>
                        <div className='flex items-start space-x-4'>
                            <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center'>
                                <span className='text-white text-xl'>03</span>
                            </div>
                            <div>
                                <h3 className='text-white text-xl font-semibold mb-2'>Our Values</h3>
                                <p className='text-gray-400'>Innovation, integrity, and excellence guide everything we do, ensuring we deliver exceptional results.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='w-1/2 bg-gradient-to-br from-blue-900 to-black'></div>
            </div>
        </div>
  )
}

export default About