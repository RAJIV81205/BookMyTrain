"use client"

import React, { useState, useEffect } from 'react'
import { MapPin, Calendar, Search as SearchIcon } from 'lucide-react'
import stninfo from '@/lib/stations.json'
import { searchTrainBetweenStations } from 'irctc-connect'
import TrainCard from './TrainCard'
import toast from 'react-hot-toast'

const Search = () => {
  const [fromQuery, setFromQuery] = useState("")
  const [toQuery, setToQuery] = useState("")
  const [fromCode, setFromCode] = useState("")
  const [toCode, setToCode] = useState("")
  const [date, setDate] = useState("")
  const [results, setResults] = useState([])
  const [activeField, setActiveField] = useState<"from" | "to" | null>(null)

  const stations = stninfo.station || []

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    setDate(today)
  }, [])

  const handleSelectFrom = (station: any) => {
    setFromQuery(station.stnName)
    setFromCode(station.stnCode)
    setActiveField(null)
  }

  const handleSelectTo = (station: any) => {
    setToQuery(station.stnName)
    setToCode(station.stnCode)
    setActiveField(null)
  }

  const filterStations = (query: string, excludeCode?: string) => {
    return stations
      .filter(
        (s) =>
          s.stnCode !== excludeCode && // exclude selected station
          (s.stnName.toLowerCase().includes(query.toLowerCase()) ||
            s.stnCity.toLowerCase().includes(query.toLowerCase()) ||
            s.stnCode.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, 5)
  }

  const searchTrain = async () => {
    if (!fromCode || !toCode) return
    try {
      const results = await searchTrainBetweenStations(fromCode, toCode)
      if (!results.success) {
        return toast.error(results.data || "Error Getting Results")
      }
      console.log(results)
      setResults(results.data)
    } catch (error: any) {
      console.error("Error searching trains:", error)
      toast.error(error.message || "Error searching trains")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center font-poppins bg-gray-50 p-4">
      <div className="bg-white rounded-2xl border border-gray-300 shadow-lg p-6 w-full max-w-5xl hover:shadow-xl transition-shadow duration-300">
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
                onFocus={() => setActiveField("from")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  setFromQuery(e.target.value)
                  setFromCode("")
                  setActiveField("from")
                }}
                className="w-full bg-transparent outline-none text-gray-700"
              />
            </div>

            {/* From Field suggestions */}
            {activeField === "from" && fromQuery.length > 0 && !fromCode && (
              <div className="absolute top-[72px] left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200 ease-out">
                {filterStations(fromQuery, toCode).map((s) => (
                  <div
                    key={s.stnCode}
                    onClick={() => handleSelectFrom(s)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                  >
                    <MapPin className="text-blue-500 w-5 h-5 flex-shrink-0" />
                    <div className="truncate w-full flex flex-col">
                      <span className="font-medium text-gray-800 truncate">
                        {s.stnName} ({s.stnCode})
                      </span>
                      <span className="text-sm text-gray-500 truncate">
                        {s.stnCity}
                      </span>
                    </div>
                  </div>
                ))}
                {filterStations(fromQuery, toCode).length === 0 && (
                  <div className="px-4 py-3 text-gray-500 text-sm text-center">
                    No stations found
                  </div>
                )}
              </div>
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
                onFocus={() => setActiveField("to")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  setToQuery(e.target.value)
                  setToCode("")
                  setActiveField("to")
                }}
                className="w-full bg-transparent outline-none text-gray-700"
              />
            </div>

            {activeField === "to" && toQuery.length > 0 && !toCode && (
              <div className="absolute top-[72px] left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200 ease-out">
                {filterStations(toQuery, fromCode).map((s) => (
                  <div
                    key={s.stnCode}
                    onClick={() => handleSelectTo(s)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                  >
                    <MapPin className="text-blue-500 w-5 h-5 flex-shrink-0" />
                    <div className="truncate w-full flex flex-col">
                      <span className="font-medium text-gray-800 truncate">
                        {s.stnName} ({s.stnCode})
                      </span>
                      <span className="text-sm text-gray-500 truncate">
                        {s.stnCity}
                      </span>
                    </div>
                  </div>
                ))}
                {filterStations(toQuery, fromCode).length === 0 && (
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
                min={new Date().toISOString().split("T")[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
          onClick={() => searchTrain()}
        >
          <SearchIcon className="w-4 h-4" />
          Search Trains
        </button>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="mt-6 w-full lg:w-2/3">
          {results.map((trainInfo: any) => (
            <TrainCard key={trainInfo.train_no} trainInfo={trainInfo} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Search
