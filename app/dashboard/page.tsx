import React from 'react'
import Search from '@/components/Dashboard/Search/Search';
import StationMap from '@/components/Dashboard/StationMap/StationMap';

const page = () => {
  return (
    <div className="space-y-6">
      <Search />
      <div className="w-full h-[600px]">
        <StationMap />
      </div>
    </div>
  )
}

export default page