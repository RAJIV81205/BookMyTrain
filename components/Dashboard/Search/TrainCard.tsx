import React, { useState, useEffect } from 'react'
import { Clock, MapPin, Calendar, Users, Banknote, Train, ChevronDown, ChevronUp } from 'lucide-react'

interface SeatClass {
  className: string
  classCode: string
  availability: string | number
  waitingList?: string
}

interface TrainCardProps {
  data: {
    distance: string
    dstn_stn_code: string
    dstn_stn_name: string
    from_stn_code: string
    from_stn_name: string
    from_time: string
    halts: number
    running_days: string
    source_stn_code: string
    source_stn_name: string
    to_stn_code: string
    to_stn_name: string
    to_time: string
    train_name: string
    train_no: string
    travel_time: string
  }
  onCheckAvailability?: (trainNo: string) => void
  date?: string
  resetAvailability?: boolean
  onResetComplete?: () => void
}

const TrainCard: React.FC<TrainCardProps> = ({ data, onCheckAvailability, date, resetAvailability, onResetComplete }) => {
  const [showAvailability, setShowAvailability] = useState(false)
  const [availabilityData, setAvailabilityData] = useState<any>(null)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [faresData, setFaresData] = useState<any>(null)
  const [loadingFares, setLoadingFares] = useState(false)

  const resetAvailabilityState = () => {
    setShowAvailability(false)
    setAvailabilityData(null)
    setLoadingAvailability(false)
    setFaresData(null)
    setLoadingFares(false)
  }

  useEffect(() => {
    if (resetAvailability) {
      resetAvailabilityState()
      if (onResetComplete) {
        onResetComplete()
      }
    }
  }, [resetAvailability, onResetComplete])

  const formatRunningDays = (days: string) => {
    if (!days || days.length !== 7) return 'N/A'
    const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    const runningDays = dayNames.filter((_, index) => {
      const dayChar = days[index]
      return dayChar === 'Y' || dayChar === '1'
    })
    return runningDays.length > 0 ? runningDays.join(' ') : 'Not running'
  }

  const formatTime = (time: string) => {
    if (!time) return 'N/A'
    return time.length === 4 ? `${time.slice(0, 2)}:${time.slice(2)}` : time
  }

  const getClassFullName = (classCode: string) => {
    const classNames: { [key: string]: string } = {
      '1A': 'First AC',
      '2A': 'Second AC',
      '3A': 'Third AC',
      'SL': 'Sleeper',
      'CC': 'Chair Car',
      '2S': 'Second Sitting',
      'FC': 'First Class',
      'EC': 'Executive Chair Car'
    }
    return classNames[classCode] || classCode
  }

  const convertAvailabilityToArray = (data: any): SeatClass[] => {
    if (!data) return []

    if (data.classes && typeof data.classes === 'object') {
      return Object.entries(data.classes).map(([classCode, availability]) => ({
        className: getClassFullName(classCode),
        classCode,
        availability: availability as string | number, // ✅ force type
        waitingList: undefined
      }))
    }

    if (typeof data === 'object' && !Array.isArray(data)) {
      return Object.entries(data).map(([classCode, availability]) => ({
        className: getClassFullName(classCode),
        classCode,
        availability: availability as string | number, // ✅ force type
        waitingList: undefined
      }))
    }

    return []
  }


  const fetchFares = async () => {
    setLoadingFares(true)
    try {
      const res = await fetch(`https://www.trainman.in/services/fare?origin=${data.from_stn_code}&dest=${data.to_stn_code}&tcode=${data.train_no}&key=012562ae-60a9-4fcd-84d6-f1354ee1ea48`)
      const fareData = await res.json()
      setFaresData(fareData)
    } catch (error) {
      console.error('Error fetching fares:', error)
    } finally {
      setLoadingFares(false)
    }
  }

  const getFareForClass = (classCode: string) => {
    if (!faresData?.fare) return null
    return faresData.fare[classCode]?.GN || null
  }

  const getAvailabilityBoxColor = (availability: string | number) => {
    if (!availability && availability !== 0) return 'border-gray-200 bg-gray-50'
    const availStr = String(availability).toLowerCase()
    if (!isNaN(Number(availability))) {
      const numSeats = Number(availability)
      if (numSeats > 0) return 'border-green-200 bg-green-50'
      return 'border-red-200 bg-red-50'
    }
    if (availStr.includes('available') || availStr.includes('confirm')) return 'border-green-200 bg-green-50'
    if (availStr.includes('waiting') || availStr.includes('wl')) return 'border-orange-200 bg-orange-50'
    if (availStr.includes('rac')) return 'border-blue-200 bg-blue-50'
    return 'border-red-200 bg-red-50'
  }

  const getAvailabilityBoxTextColor = (availability: string | number) => {
    if (!availability && availability !== 0) return 'text-gray-600'
    const availStr = String(availability).toLowerCase()
    if (!isNaN(Number(availability))) {
      const numSeats = Number(availability)
      if (numSeats > 0) return 'text-green-700'
      return 'text-red-700'
    }
    if (availStr.includes('available') || availStr.includes('confirm')) return 'text-green-700'
    if (availStr.includes('waiting') || availStr.includes('wl')) return 'text-orange-700'
    if (availStr.includes('rac')) return 'text-blue-700'
    return 'text-red-700'
  }

  const handleCheckAvailability = async () => {
    if (showAvailability && availabilityData) {
      setShowAvailability(false)
      return
    }

    setLoadingAvailability(true)
    setShowAvailability(true)

    try {
      const res = await fetch("/api/getseat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          trainNo: data.train_no,
          date,
        })
      })

      const responseData = await res.json()
      if (!res.ok) throw new Error(responseData.error || "Failed to check availability")

      setAvailabilityData(responseData)
      await fetchFares()
    } catch (err: any) {
      console.error('Error checking availability:', err)
      setAvailabilityData(null)
    } finally {
      setLoadingAvailability(false)
    }

    if (onCheckAvailability) {
      onCheckAvailability(data.train_no)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 mb-4">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{data.train_no}</h3>
              <span className="text-lg text-gray-700 font-medium">{data.train_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Runs on:</span>
              <span className="font-medium">{formatRunningDays(data.running_days)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="text-center flex-shrink-0">
            <div className="text-xs text-gray-500 mb-1">{data.from_stn_code}</div>
            <div className="text-xl font-bold text-gray-900 mb-1">{formatTime(data.from_time)}</div>
            <div className="text-sm text-gray-600 max-w-20 sm:max-w-none truncate">{data.from_stn_name}</div>
          </div>

          <div className="flex-1 text-center px-2 sm:px-4">
            <div className="text-sm font-medium text-gray-900 mb-1">{data.travel_time}</div>
            <div className="flex items-center justify-center mb-2">
              <div className="flex-1 h-px bg-gray-300"></div>
              <Train className="mx-2 w-4 h-4 text-blue-600" />
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
            <div className="text-xs text-gray-500">{data.halts} halts | {data.distance} kms</div>
          </div>

          <div className="text-center flex-shrink-0">
            <div className="text-xs text-gray-500 mb-1">{data.to_stn_code}</div>
            <div className="text-xl font-bold text-gray-900 mb-1">{formatTime(data.to_time)}</div>
            <div className="text-sm text-gray-600 max-w-20 sm:max-w-none truncate">{data.to_stn_name}</div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleCheckAvailability}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Check Seat Availability</span>
            <span className="sm:hidden">Check Availability</span>
            {showAvailability ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showAvailability && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Seat Availability & Fares</h3>
            {(loadingAvailability || loadingFares) && (
              <Clock className="w-4 h-4 animate-spin text-gray-500" />
            )}
          </div>

          {loadingAvailability ? (
            <div className="text-center py-8">
              <Clock className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">Checking seat availability...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {convertAvailabilityToArray(availabilityData).map((seatClass, index) => {
                  const fare = getFareForClass(seatClass.classCode)
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getAvailabilityBoxColor(seatClass.availability)}`}
                    >
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-3">
                          <span className="text-sm font-bold text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm">
                            {seatClass.classCode}
                          </span>
                        </div>

                        <div className="mb-3">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">{seatClass.className}</h4>
                          <p className={`text-sm font-medium ${getAvailabilityBoxTextColor(seatClass.availability)}`}>
                            {!isNaN(Number(seatClass.availability))
                              ? Number(seatClass.availability) > 0
                                ? `${seatClass.availability} seats`
                                : 'Not Available'
                              : String(seatClass.availability)}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-gray-200">
                          {loadingFares ? (
                            <div className="flex items-center justify-center gap-1">
                              <Clock className="w-4 h-4 animate-spin text-gray-400" />
                              <span className="text-xs text-gray-500">Loading...</span>
                            </div>
                          ) : fare ? (
                            <p className="text-lg font-bold text-gray-900">₹{fare}</p>
                          ) : (
                            <p className="text-sm text-gray-500">Fare N/A</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {(!availabilityData || Object.keys(availabilityData).length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No seat availability data found.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default TrainCard
