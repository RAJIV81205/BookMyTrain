import React, { useState, useEffect } from 'react'
import { Users, Banknote, Clock, Train } from 'lucide-react'

interface SeatClass {
  className: string
  classCode: string
  availability: string
  waitingList?: string
  fare?: string
}

interface SeatAvailabilityProps {
  trainNo: string
  date: string
  fromCode: string
  toCode: string
  classes: SeatClass[]
  isLoading?: boolean
}

const SeatAvailability: React.FC<SeatAvailabilityProps> = ({ 
  trainNo, 
  date, 
  fromCode, 
  toCode, 
  classes, 
  isLoading = false 
}) => {
  const [faresData, setFaresData] = useState<any>(null)
  const [loadingFares, setLoadingFares] = useState(false)

  useEffect(() => {
    const fetchFares = async () => {
      setLoadingFares(true)
      try {
        const response = await fetch(
          `https://www.trainman.in/services/fare?origin=${fromCode}&dest=${toCode}&tcode=${trainNo}&key=012562ae-60a9-4fcd-84d6-f1354ee1ea48`
        )
        const data = await response.json()
        setFaresData(data)
      } catch (error) {
        console.error('Error fetching fares:', error)
      } finally {
        setLoadingFares(false)
      }
    }

    if (trainNo && fromCode && toCode) {
      fetchFares()
    }
  }, [trainNo, fromCode, toCode])

  const getFareForClass = (classCode: string) => {
    if (!faresData?.fares) return null
    const fareItem = faresData.fares.find((f: any) => f.class === classCode)
    return fareItem?.fare || null
  }

  const getAvailabilityColor = (availability: string) => {
    if (!availability || availability === 'N/A') return 'border-gray-200 bg-gray-50'
    if (availability.toLowerCase().includes('available') || availability.toLowerCase().includes('confirm')) {
      return 'border-green-200 bg-green-50'
    }
    if (availability.toLowerCase().includes('waiting') || availability.toLowerCase().includes('wl')) {
      return 'border-orange-200 bg-orange-50'
    }
    if (availability.toLowerCase().includes('rac')) {
      return 'border-blue-200 bg-blue-50'
    }
    return 'border-red-200 bg-red-50'
  }

  const getAvailabilityTextColor = (availability: string) => {
    if (!availability || availability === 'N/A') return 'text-gray-600'
    if (availability.toLowerCase().includes('available') || availability.toLowerCase().includes('confirm')) {
      return 'text-green-700'
    }
    if (availability.toLowerCase().includes('waiting') || availability.toLowerCase().includes('wl')) {
      return 'text-orange-700'
    }
    if (availability.toLowerCase().includes('rac')) {
      return 'text-blue-700'
    }
    return 'text-red-700'
  }

  if (isLoading) {
    return (
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4 animate-spin" />
          <span className="text-sm">Checking seat availability...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          Seat Availability & Fares
        </h3>
        {loadingFares && (
          <Clock className="w-4 h-4 animate-spin text-gray-500" />
        )}
      </div>

      {/* Responsive grid for seat availability boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {classes.map((seatClass, index) => {
          const fare = getFareForClass(seatClass.classCode)
          
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getAvailabilityColor(seatClass.availability)}`}
            >
              {/* Class name and code */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                    {seatClass.className}
                  </h4>
                  <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
                    {seatClass.classCode}
                  </span>
                </div>
                <Train className="w-4 h-4 text-gray-400" />
              </div>

              {/* Availability status */}
              <div className="mb-3">
                <div className="flex items-center gap-1 mb-1">
                  <Users className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">Availability</span>
                </div>
                <p className={`text-sm font-medium ${getAvailabilityTextColor(seatClass.availability)}`}>
                  {seatClass.availability || 'Not Available'}
                </p>
                {seatClass.waitingList && (
                  <p className="text-xs text-orange-600 mt-1">
                    WL: {seatClass.waitingList}
                  </p>
                )}
              </div>

              {/* Fare information */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center gap-1 mb-1">
                  <Banknote className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">Fare</span>
                </div>
                {loadingFares ? (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-spin text-gray-400" />
                    <span className="text-xs text-gray-500">Loading...</span>
                  </div>
                ) : fare ? (
                  <p className="text-lg font-bold text-green-700">
                    ₹{fare}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Fare not available
                  </p>
                )}
              </div>

              {/* Book button for available seats */}
              {seatClass.availability && 
               seatClass.availability.toLowerCase().includes('available') && (
                <button className="w-full mt-3 py-2 px-3 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors duration-200">
                  Book Now
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 p-3 bg-white rounded border">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Legend:</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
            <span>Waiting List</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
            <span>RAC</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span>Not Available</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeatAvailability
