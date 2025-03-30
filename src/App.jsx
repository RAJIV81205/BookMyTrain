import React, { useState, useEffect, useCallback } from 'react'
import Page from './Components/Page'
import Loader from './Components/Loader'
import Spline from '@splinetool/react-spline';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSplineLoaded, setIsSplineLoaded] = useState(false);

  const onSplineLoad = useCallback((splineApp) => {
    // Store the spline app instance if needed
    window.splineApp = splineApp;
    setIsSplineLoaded(true);
  }, []);

  useEffect(() => {
    // Only set loading to false when both initial load and Spline are ready
    if (isSplineLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isSplineLoaded]);

  return (
    <div className='relative'>
      <Loader loading={isLoading} />
      
      {/* Spline Container - Sticky position with full viewport height */}
      <div className='sticky top-0 w-full h-screen'>
        <Spline 
          scene="https://prod.spline.design/0CjTKi3v6AEI-cUl/scene.splinecode" 
          className='w-full h-full' 
          onLoad={onSplineLoad}
        />
      </div>

      {/* Content Container */}
      <div className='relative'>
        <Page onLoad={() => setIsLoading(false)} />
      </div>
    </div>
  )
}

export default App