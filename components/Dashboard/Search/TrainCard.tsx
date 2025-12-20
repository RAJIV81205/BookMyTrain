import React, { useState, useEffect, useRef } from 'react'
import { Clock, Calendar, Users, Train, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { gsap } from 'gsap'

interface SeatClass {
  className: string
  classCode: string
  availability: string | number
  waitingList?: string
  canBook?: boolean
  fare?: number
  prediction?: string
  predictionPercentage?: number
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
  onBookTicket?: (trainNo: string, trainName: string, fromTime: string, toTime: string, classCode: string, fare: string) => void
  date?: string
  resetAvailability?: boolean
  onResetComplete?: () => void
}

// --- PER-KM RATES (testing/demo) ---
// Edit these rates to change pricing for each class.
const PER_KM_RATES: { [key: string]: number } = {
  SL: 1.2, // Sleeper
  '3A': 2.5,
  '2A': 3.5,
  '1A': 5.0,
  GEN: 0.8,
  CC: 1.8,
  '2S': 0.6,
  FC: 4.0,
  EC: 3.0
}

const TrainCard: React.FC<TrainCardProps> = ({
  data,
  onBookTicket,
  date,
  resetAvailability,
  onResetComplete
}) => {
  const [showAvailability, setShowAvailability] = useState(false)
  const [availabilityData, setAvailabilityData] = useState<any>(null)
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)
  const availabilityRef = useRef<HTMLDivElement>(null)

  const resetAvailabilityState = () => {
    setShowAvailability(false)
    setAvailabilityData(null)
    setLoadingAvailability(false)
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

    // Handle new API response structure
    if (typeof data === 'object' && !Array.isArray(data)) {
      return Object.entries(data).map(([classCode, classData]: [string, any]) => ({
        className: getClassFullName(classCode),
        classCode,
        availability: classData.availability || 'Not Available',
        waitingList: undefined,
        canBook: classData.canBook || false,
        fare: classData.fare,
        prediction: classData.prediction,
        predictionPercentage: classData.predictionPercentage
      }))
    }

    return []
  }


  // Parse a distance string like "123 km" or "123 kms" or just "123" to a number (km)
  const parseDistance = (d: string | number | undefined): number => {
    if (d === undefined || d === null) return 0
    if (typeof d === 'number') return d
    const m = String(d).match(/([0-9]+(?:\.[0-9]+)?)/)
    return m ? Number(m[1]) : 0
  }

  // Get fare from the new API response or fall back to per-km rate model
  const getFareForClass = (classCode: string, seatClass?: SeatClass): number | null => {
    // 1) First try to get fare from the seat class data (new API)
    if (seatClass?.fare && typeof seatClass.fare === 'number') {
      return Math.round(seatClass.fare * 100) / 100
    }

    // 2) fallback: per-km rate × distance (use data.distance if present, else compute from stops dist_km if available)
    const dist = parseDistance(data.distance)
    const rate = PER_KM_RATES[classCode] ?? null
    if (rate === null || rate === undefined) return null
    const fare = dist * rate
    // round to 2 decimal places, but for display round to nearest rupee optionally
    return Math.round(fare * 100) / 100
  }

  const getAvailabilityBoxColor = (availability: string | number) => {
    if (!availability && availability !== 0) return 'border-gray-200 bg-gray-50'
    const availStr = String(availability).toLowerCase()
    
    // Check for available/confirm status first
    if (availStr.includes('available') || availStr.includes('confirm') || availStr.includes('avl')) {
      return 'border-green-300 bg-green-50'
    }
    
    // Check for numeric availability
    if (!isNaN(Number(availability))) {
      const numSeats = Number(availability)
      if (numSeats > 0) return 'border-green-300 bg-green-50'
      return 'border-red-200 bg-red-50'
    }
    
    if (availStr.includes('WAITLIST') || availStr.includes('wl')) return 'border-orange-200 bg-orange-50'
    if (availStr.includes('rac')) return 'border-blue-200 bg-blue-50'
    return 'border-red-200 bg-red-50'
  }

  const getAvailabilityBoxTextColor = (availability: string | number) => {
    if (!availability && availability !== 0) return 'text-gray-600'
    const availStr = String(availability).toLowerCase()
    
    // Check for available/confirm status first
    if (availStr.includes('AVAILABLE') || availStr.includes('confirm') || availStr.includes('avl')) {
      return 'text-green-700'
    }
    
    // Check for numeric availability
    if (!isNaN(Number(availability))) {
      const numSeats = Number(availability)
      if (numSeats > 0) return 'text-green-700'
      return 'text-red-700'
    }
    
    if (availStr.includes('waiting') || availStr.includes('wl')) return 'text-orange-700'
    if (availStr.includes('rac')) return 'text-blue-700'
    return 'text-red-700'
  }





  const handleCheckAvailability = async () => {
    if (showAvailability && availabilityData) {
      // Animate out availability section
      if (availabilityRef.current) {
        gsap.to(availabilityRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: "power2.inOut",
          onComplete: () => setShowAvailability(false)
        })
      } else {
        setShowAvailability(false)
      }
      return
    }

    setLoadingAvailability(true)
    setShowAvailability(true)

    // Define all possible travel classes to check
    const travelClasses = ['SL', '3A', '2A', '1A', 'CC', '2S', 'FC', 'EC']
    const quota = 'GN' // General quota
    
    try {
      // Fetch availability for all classes in parallel
      const availabilityPromises = travelClasses.map(async (travelClass) => {
        try {
          const res = await fetch("/api/get-real-availability", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              trainNo: data.train_no,
              dateOfJourney: date ? (() => {
                const [year, month, day] = date.split('-')
                return `${day}-${month}-${year}`
              })() : '',
              travelClass: travelClass,
              quota: quota,
              source: data.from_stn_code,
              destination: data.to_stn_code,
            })
          })

          const responseData = await res.json()
          
          if (res.ok && responseData.success) {
            return {
              classCode: travelClass,
              success: true,
              data: responseData.data
            }
          } else {
            return {
              classCode: travelClass,
              success: false,
              error: responseData.error || "Failed to fetch"
            }
          }
        } catch (error) {
          return {
            classCode: travelClass,
            success: false,
            error: "Network error"
          }
        }
      })

      const results = await Promise.all(availabilityPromises)
      
      // Process results and create availability data
      const processedData: any = {}
      
      results.forEach(result => {
        if (result.success && result.data) {
          // Get the first available date's availability status
          const firstAvailability = result.data.availability?.[0]
          if (firstAvailability) {
            processedData[result.classCode] = {
              availability: firstAvailability.availabilityText || firstAvailability.status,
              rawStatus: firstAvailability.rawStatus,
              canBook: firstAvailability.canBook,
              fare: result.data.fare?.totalFare || null,
              prediction: firstAvailability.prediction,
              predictionPercentage: firstAvailability.predictionPercentage
            }
          }
        }
      })

      // Only show classes that have data
      const filteredData = Object.keys(processedData).length > 0 ? processedData : null
      setAvailabilityData(filteredData)

      // Animate in availability section
      setTimeout(() => {
        if (availabilityRef.current) {
          gsap.fromTo(availabilityRef.current,
            { height: 0, opacity: 0 },
            {
              height: "auto",
              opacity: 1,
              duration: 0.4,
              ease: "power2.out"
            }
          )

          // Animate availability cards with stagger
          const cards = availabilityRef.current.querySelectorAll('.availability-card')
          gsap.fromTo(cards,
            { opacity: 0, y: 15 },
            {
              opacity: 1,
              y: 0,
              duration: 0.3,
              stagger: 0.06,
              ease: "power2.out",
              delay: 0.15
            }
          )
        }
      }, 50)
    } catch (err: any) {
      console.error('Error checking availability:', err)
      setAvailabilityData(null)
    } finally {
      setLoadingAvailability(false)
    }
  }

  return (
    <div
      ref={cardRef}
      className="bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-300 mb-4"
    >
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
          <div className="lg:flex lg:flex-row lg:justify-between w-full flex-1">
            <div className="flex items-center gap-2 mb-2 lg:mb-0">
              <h3 className="text-xl font-bold text-gray-900">{data.train_no}</h3>
              <span className="text-lg text-gray-700 font-medium truncate">{data.train_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 right-0">
              <Calendar className="w-4 h-4" />
              <span>Runs on:</span>
              <span className="font-medium ">{formatRunningDays(data.running_days)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="text-center shrink-0">
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

          <div className="text-center shrink-0">
            <div className="text-xs text-gray-500 mb-1">{data.to_stn_code}</div>
            <div className="text-xl font-bold text-gray-900 mb-1">{formatTime(data.to_time)}</div>
            <div className="text-sm text-gray-600 max-w-20 sm:max-w-none truncate">{data.to_stn_name}</div>
          </div>
        </div>

        <div className="mt-6 flex flex-row items-center gap-3 justify-center">

          {/* Train Details Button (FIRST) */}
          <button
            onClick={(e) => {
              gsap.to(e.target, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: "power2.out"
              })
              window.open(`/dashboard/train?train=${data.train_no}`, "_blank")
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium hover:shadow-md active:scale-95"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">View Train Details</span>
            <span className="sm:hidden">Train Details</span>
          </button>

          {/* Seat Availability Button (Primary Action) */}
          <button
            onClick={(e) => {
              gsap.to(e.target, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: "power2.out"
              })
              handleCheckAvailability()
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium hover:shadow-md active:scale-95"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Check Seat Availability</span>
            <span className="sm:hidden">Check Availability</span>
            {showAvailability ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {showAvailability && (
        <div
          ref={availabilityRef}
          className="border-t border-gray-200 p-4 bg-gray-50 overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Seat Availability & Fares</h3>
            {loadingAvailability && (
              <Clock className="w-4 h-4 animate-spin text-gray-500" />
            )}
          </div>

          {loadingAvailability ? (
            <div className="text-center py-8">
              <div className="relative">
                <Clock className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                <div className="absolute inset-0 w-6 h-6 mx-auto animate-pulse-custom">
                  <div className="w-full h-full bg-blue-200 rounded-full opacity-75"></div>
                </div>
              </div>
              <p className="text-gray-600 animate-pulse-custom">Checking availability for all classes...</p>
            </div>
          ) : (
            <>
              {/* Desktop: Horizontal scrollable cards */}
              <div className="hidden lg:flex gap-4 overflow-x-auto pb-2">
                {convertAvailabilityToArray(availabilityData).map((seatClass, index) => {
                  const fare = getFareForClass(seatClass.classCode, seatClass)
                  return (
                    <div
                      key={index}
                      className={`availability-card shrink-0 w-48 p-4 rounded-lg border-2 transition-all duration-200 ${getAvailabilityBoxColor(seatClass.availability)}`}
                    >
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-3">
                          <span className="text-sm font-bold text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm">
                            {seatClass.classCode}
                          </span>
                        </div>

                        <div className="mb-3">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">{seatClass.className}</h4>
                          
                          {/* Seat Status */}
                          <div className="mb-3">
                            <p className={`text-lg font-bold ${getAvailabilityBoxTextColor(seatClass.availability)}`}>
                              {String(seatClass.availability)}
                            </p>
                            {seatClass.prediction && (
                              <p className="text-xs text-gray-600 mt-1">
                                Prediction: {seatClass.predictionPercentage}%
                              </p>
                            )}
                          </div>

                          {/* Fare */}
                          <div className="pt-2 border-t border-gray-200">
                            {fare ? (
                              <p className="text-lg font-bold text-gray-800">₹{fare}</p>
                            ) : (
                              <p className="text-sm text-gray-500">Fare N/A</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Mobile: Simple list view */}
              <div className="lg:hidden space-y-3">
                {convertAvailabilityToArray(availabilityData).map((seatClass, index) => {
                  const fare = getFareForClass(seatClass.classCode, seatClass)
                  return (
                    <div
                      key={index}
                      className={`availability-card p-4 rounded-lg border-2 transition-all duration-200 ${getAvailabilityBoxColor(seatClass.availability)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded">
                              {seatClass.classCode}
                            </span>
                            <h4 className="text-sm font-semibold text-gray-900">{seatClass.className}</h4>
                          </div>
                          
                          {/* Seat Status */}
                          <p className={`text-lg font-bold mb-1 ${getAvailabilityBoxTextColor(seatClass.availability)}`}>
                            {String(seatClass.availability)}
                          </p>
                          
                          {seatClass.prediction && (
                            <p className="text-xs text-gray-500">
                              Prediction: {seatClass.predictionPercentage}%
                            </p>
                          )}
                        </div>

                        {/* Fare */}
                        <div className="text-right">
                          {fare ? (
                            <p className="text-lg font-bold text-gray-800">₹{fare}</p>
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
                  <p className="text-gray-600">No seat availability data found for this train.</p>
                  <p className="text-sm text-gray-500 mt-2">This could be due to the train not running on the selected date or temporary API issues.</p>
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
