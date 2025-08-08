"use client"

import React, { useState } from 'react'
import { MapPin, Calendar, Search as SearchIcon } from 'lucide-react'
import stninfo from '@/lib/stations.json'
import { searchTrainBetweenStations } from 'irctc-connect'



const stations = stninfo.station || []

const Search = () => {
  const [fromQuery, setFromQuery] = useState("")
  const [toQuery, setToQuery] = useState("")
  const [fromCode, setFromCode] = useState("")
  const [toCode, setToCode] = useState("")
  const [date, setDate] = useState("")

  const handleSelectFrom = (station: any) => {
    setFromQuery(station.stnName)
    setFromCode(station.stnCode)
  }

  const handleSelectTo = (station: any) => {
    setToQuery(station.stnName)
    setToCode(station.stnCode)
  }

  // Common search filter for name, city, or code - limit to 5 results
  const filterStations = (query: string) => {
    return stations
      .filter(
        (s) =>
          s.stnName.toLowerCase().includes(query.toLowerCase()) ||
          s.stnCity.toLowerCase().includes(query.toLowerCase()) ||
          s.stnCode.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5) // Limit to 5 suggestions
  }

  const searchTrain = async () =>{
    if (!fromCode || !toCode ) return

    try {
      const results = await searchTrainBetweenStations(fromCode , toCode)
      console.log(results)
    } catch (error) {
      console.error("Error searching trains:", error)
    }
  }



  return (
    <div className="min-h-screen flex flex-col items-center font-poppins bg-gray-50 p-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 w-full max-w-5xl hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Search for Trains
        </h2>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* From Field */}
          <div className="flex flex-col relative">
            <label className="text-sm text-gray-600 mb-1">From</label>
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus-within:border-blue-500 focus-within:ring focus-within:ring-blue-100 transition">
              <MapPin className="text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Enter departure station"
                value={fromQuery}
                onChange={(e) => {
                  setFromQuery(e.target.value)
                  setFromCode("")
                }}
                className="w-full bg-transparent outline-none text-gray-700"
              />
            </div>
            {/* Animated Suggestions */}
            {fromQuery && !fromCode && (
              <div className="absolute top-[72px] left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200 ease-out">
                {filterStations(fromQuery).map((s) => (
                  <div
                    key={s.stnCode}
                    onClick={() => handleSelectFrom(s)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                  >
                    <div className="font-medium text-gray-800">
                      {s.stnName} ({s.stnCode})
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {s.stnCity}
                    </div>
                  </div>
                ))}
                {filterStations(fromQuery).length === 0 && (
                  <div className="px-4 py-3 text-gray-500 text-sm text-center">
                    No stations found
                  </div>
                )}
              </div>
            )}
            {fromCode && (
              <p className="text-sm text-blue-600 mt-1">Station Code: {fromCode}</p>
            )}
          </div>

          {/* To Field */}
          <div className="flex flex-col relative">
            <label className="text-sm text-gray-600 mb-1">To</label>
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus-within:border-blue-500 focus-within:ring focus-within:ring-blue-100 transition">
              <MapPin className="text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Enter destination station"
                value={toQuery}
                onChange={(e) => {
                  setToQuery(e.target.value)
                  setToCode("")
                }}
                className="w-full bg-transparent outline-none text-gray-700"
              />
            </div>
            {/* Animated Suggestions */}
            {toQuery && !toCode && (
              <div className="absolute top-[72px] left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200 ease-out">
                {filterStations(toQuery).map((s) => (
                  <div
                    key={s.stnCode}
                    onClick={() => handleSelectTo(s)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                  >
                    <div className="font-medium text-gray-800">
                      {s.stnName} ({s.stnCode})
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {s.stnCity}
                    </div>
                  </div>
                ))}
                {filterStations(toQuery).length === 0 && (
                  <div className="px-4 py-3 text-gray-500 text-sm text-center">
                    No stations found
                  </div>
                )}
              </div>
            )}
            {toCode && (
              <p className="text-sm text-blue-600 mt-1">Station Code: {toCode}</p>
            )}
          </div>

          {/* Date Field */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Date</label>
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus-within:border-blue-500 focus-within:ring focus-within:ring-blue-100 transition">
              <Calendar className="text-gray-500 w-4 h-4" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
        onClick={()=>searchTrain()}>
          <SearchIcon className="w-4 h-4" />
          Search Trains
        </button>
      </div>
    </div>
  )
}

export default Search
