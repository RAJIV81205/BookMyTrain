import React from 'react'
import Spline from '@splinetool/react-spline';

const Hero = ({ onLoad }) => {
  return (
    <div>
      <Spline 
        scene="https://prod.spline.design/0CjTKi3v6AEI-cUl/scene.splinecode"
        onLoad={onLoad}
      />
    </div>
  )
}

export default Hero