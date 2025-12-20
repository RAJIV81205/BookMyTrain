import React, { Suspense } from 'react'
import Trainsearch from '@/components/Dashboard/Train/Trainsearch'

const TrainSearchFallback = () => (
  <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8 px-4">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-white p-3 rounded-full shadow-sm">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Train Information</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
)

const page = () => {
  return (
    <Suspense fallback={<TrainSearchFallback />}>
      <Trainsearch />
    </Suspense>
  )
}

export default page