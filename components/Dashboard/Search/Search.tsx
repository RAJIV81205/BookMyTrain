"use client"
import React, { useState, useEffect } from 'react'
import { MapPin, Calendar, Search as SearchIcon, ArrowRight, ArrowUpDown } from 'lucide-react'
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
  const [loading, setLoading] = useState(false)
  
  const stations = stninfo.station || []

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    setDate(today)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeField && !(event.target as Element).closest('.dropdown-container')) {
        setActiveField(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeField])

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

  const swapStations = () => {
    setFromQuery(toQuery)
    setToQuery(fromQuery)
    setFromCode(toCode)
    setToCode(fromCode)
  }

  const filterStations = (query: string, excludeCode?: string) => {
    return stations
      .filter(
        (s) =>
          s.stnCode !== excludeCode &&
          (
            s.stnCode.toLowerCase().includes(query.toLowerCase()) ||
            s.stnName.toLowerCase().includes(query.toLowerCase()) ||
            s.stnCity.toLowerCase().includes(query.toLowerCase())
          )
      )
      .slice(0, 5)
  }

  const searchTrain = async () => {
    if (!fromCode || !toCode) {
      toast.error("Please select both departure and arrival stations")
      return
    }
    
    setLoading(true)
    try {
      const results = await searchTrainBetweenStations(fromCode, toCode)
      if (!results.success) {
        return toast.error(results.data || "Error Getting Results")
      }
      setResults(results.data)
      if (results.data.length === 0) {
        toast.error("No trains found for this route")
      }
    } catch (error: any) {
      console.error("Error searching trains:", error)
      toast.error(error.message || "Error searching trains")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Train Search</h1>
          <p className="text-gray-600">Find trains between stations</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          {/* Station Inputs Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-start mb-6">
            {/* From Station */}
            <div className="flex-1 dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                From
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fromQuery}
                  onChange={(e) => {
                    setFromQuery(e.target.value)
                    setActiveField("from")
                  }}
                  onFocus={() => setActiveField("from")}
                  placeholder="Enter departure station"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {fromCode && (
                  <div className="text-xs text-gray-500 mt-1">
                    Station Code: {fromCode}
                  </div>
                )}
                
                {/* From Dropdown */}
                {activeField === "from" && fromQuery && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filterStations(fromQuery, toCode).map((station) => (
                      <div
                        key={station.stnCode}
                        onClick={() => handleSelectFrom(station)}
                        className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors duration-150"
                      >
                        <div className="font-medium text-gray-800">{station.stnName}</div>
                        <div className="text-sm text-gray-600">
                          {station.stnCode} • {station.stnCity}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex lg:block justify-center lg:mt-8">
              <button
                onClick={swapStations}
                className="p-3 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors duration-200 shadow-sm hover:shadow-md"
                title="Swap stations"
              >
                <ArrowUpDown className="w-5 h-5 text-blue-600" />
              </button>
            </div>

            {/* To Station */}
            <div className="flex-1 dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                To
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={toQuery}
                  onChange={(e) => {
                    setToQuery(e.target.value)
                    setActiveField("to")
                  }}
                  onFocus={() => setActiveField("to")}
                  placeholder="Enter arrival station"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {toCode && (
                  <div className="text-xs text-gray-500 mt-1">
                    Station Code: {toCode}
                  </div>
                )}
                
                {/* To Dropdown */}
                {activeField === "to" && toQuery && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filterStations(toQuery, fromCode).map((station) => (
                      <div
                        key={station.stnCode}
                        onClick={() => handleSelectTo(station)}
                        className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors duration-150"
                      >
                        <div className="font-medium text-gray-800">{station.stnName}</div>
                        <div className="text-sm text-gray-600">
                          {station.stnCode} • {station.stnCity}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date and Search Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            {/* Date */}
            <div className="flex-1 sm:max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Search Button */}
            <div className="flex-1 sm:flex-initial">
              <button
                onClick={searchTrain}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center min-w-[140px] shadow-lg hover:shadow-xl disabled:shadow-md"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <SearchIcon className="w-5 h-5 mr-2" />
                    Search Trains
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
              <h2 className="text-2xl font-bold text-gray-800">
                Available Trains ({results.length})
              </h2>
              <div className="text-sm text-gray-600 flex items-center">
                <span className="font-medium">{fromQuery}</span>
                <ArrowRight className="inline w-4 h-4 mx-2" />
                <span className="font-medium">{toQuery}</span>
              </div>
            </div>
            <div className="grid gap-4">
              {results.map((train: any, index: number) => (
                <TrainCard key={index} data={train} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search