"use client"

import React, { useState } from 'react'
import Analytics from '@/components/admin/dashboard/Analytics'
import Train from '@/components/admin/dashboard/Train'
import Bookings from '@/components/admin/dashboard/Bookings'

const page = () => {
  const [selectedComponent, setSelectedComponent] = useState('analytics')

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'analytics':
        return <Analytics />
      case 'train':
        return <Train />
      case 'bookings':
        return <Bookings />
      default:
        return <Analytics />
    }
  }

  return (
    <div className="p-6">
      {/* Selection Controls */}
      <div className="mb-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        
        {/* Radio Button Selection */}
        <div className="flex gap-6">
          <label className="flex items-center">
            <input
              type="radio"
              name="component"
              value="analytics"
              checked={selectedComponent === 'analytics'}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="mr-2"
            />
            Analytics
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="component"
              value="train"
              checked={selectedComponent === 'train'}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="mr-2"
            />
            Train
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="component"
              value="bookings"
              checked={selectedComponent === 'bookings'}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="mr-2"
            />
            Bookings
          </label>
        </div>

        {/* Dropdown Selection (Alternative) */}
        <div className="max-w-xs">
          <label htmlFor="component-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Component:
          </label>
          <select
            id="component-select"
            value={selectedComponent}
            onChange={(e) => setSelectedComponent(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="analytics">Analytics</option>
            <option value="train">Train</option>
            <option value="bookings">Bookings</option>
          </select>
        </div>

        {/* Button Selection (Alternative) */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedComponent('analytics')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              selectedComponent === 'analytics'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setSelectedComponent('train')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              selectedComponent === 'train'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Train
          </button>
          <button
            onClick={() => setSelectedComponent('bookings')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              selectedComponent === 'bookings'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bookings
          </button>
        </div>
      </div>

      {/* Selected Component */}
      <div className="border-t pt-6">
        {renderComponent()}
      </div>
    </div>
  )
}

export default page