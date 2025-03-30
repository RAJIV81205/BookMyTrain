import React, { useState } from 'react'
import Page from './Components/Page'
import Loader from './Components/Loader'

const App = () => {
  const [loading, setLoading] = useState(true);

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <>
      <Loader loading={loading} />
      <Page onLoad={handleLoad} />
    </>
  )
}

export default App