import React, { useState, useEffect, useRef } from 'react'
import { Clock, Calendar, Users, Train, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { gsap } from 'gsap'

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
  onCheckAvailability,
  onBookTicket,
  date,
  resetAvailability,
  onResetComplete
}) => {
  const [showAvailability, setShowAvailability] = useState(false)
  const [availabilityData, setAvailabilityData] = useState<any>(null)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [faresData, setFaresData] = useState<any>(null)
  const [loadingFares, setLoadingFares] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)
  const availabilityRef = useRef<HTMLDivElement>(null)

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
        availability: availability as string | number,
        waitingList: undefined
      }))
    }

    if (typeof data === 'object' && !Array.isArray(data)) {
      return Object.entries(data).map(([classCode, availability]) => ({
        className: getClassFullName(classCode),
        classCode,
        availability: availability as string | number,
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

  // Parse a distance string like "123 km" or "123 kms" or just "123" to a number (km)
  const parseDistance = (d: string | number | undefined): number => {
    if (d === undefined || d === null) return 0
    if (typeof d === 'number') return d
    const m = String(d).match(/([0-9]+(?:\.[0-9]+)?)/)
    return m ? Number(m[1]) : 0
  }

  // Get fare from fetched fares; if not available, fall back to per-km rate model
  const getFareForClass = (classCode: string): number | null => {
    // 1) try remote fares if present (same logic as before)
    if (faresData?.fare && faresData.fare[classCode]) {
      // some APIs return object like { GN: 123, RAC: ... } so keep GN as groundfare
      if (typeof faresData.fare[classCode] === 'object' && faresData.fare[classCode].GN != null) {
        const val = Number(faresData.fare[classCode].GN)
        if (!isNaN(val)) return Math.round(val * 100) / 100
      }
      if (typeof faresData.fare[classCode] === 'number') {
        return Math.round(Number(faresData.fare[classCode]) * 100) / 100
      }
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
    if (!isNaN(Number(availability))) {
      const numSeats = Number(availability)
      if (numSeats > 0) return 'border-gray-200 bg-white'
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

  const isBookingAvailable = (availability: string | number) => {
    if (!availability && availability !== 0) return false
    const availStr = String(availability).toLowerCase()
    if (!isNaN(Number(availability))) {
      return Number(availability) > 0
    }
    return availStr.includes('available') || availStr.includes('confirm') ||
      availStr.includes('waiting') || availStr.includes('wl') || availStr.includes('rac')
  }

  const handleBookNow = (classCode: string, fare: string) => {
    if (onBookTicket) {
      onBookTicket(data.train_no, data.train_name, data.from_time, data.to_time, classCode, fare)
    }
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

    if (onCheckAvailability) {
      onCheckAvailability(data.train_no)
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
            {(loadingAvailability || loadingFares) && (
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
              <p className="text-gray-600 animate-pulse-custom">Checking seat availability...</p>
            </div>
          ) : (
            <>
              {/* Desktop: Horizontal scrollable cards */}
              <div className="hidden lg:flex gap-4 overflow-x-auto pb-2">
                {convertAvailabilityToArray(availabilityData).map((seatClass, index) => {
                  const fare = getFareForClass(seatClass.classCode)
                  const canBook = isBookingAvailable(seatClass.availability)
                  return (
                    <div
                      key={index}
                      className={`availability-card shrink-0 w-48 p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getAvailabilityBoxColor(seatClass.availability)}`}
                    >
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-3">
                          <span className="text-sm font-bold text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm">
                            {seatClass.classCode}
                          </span>
                        </div>

                        <div className="mb-3">
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">{seatClass.className}</h4>
                          <div className="p-2 bg-blue-50 rounded-md border border-blue-200 mb-2">
                            <p className={`text-lg font-bold ${getAvailabilityBoxTextColor(seatClass.availability)}`}>
                              {!isNaN(Number(seatClass.availability))
                                ? Number(seatClass.availability) > 0
                                  ? `AVL - ${seatClass.availability}`
                                  : 'Not Available'
                                : String(seatClass.availability)}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-200">
                          {loadingFares ? (
                            <div className="flex items-center justify-center gap-1">
                              <Clock className="w-4 h-4 animate-spin text-gray-400" />
                              <span className="text-xs text-gray-500">Loading...</span>
                            </div>
                          ) : fare && canBook ? (
                            <button
                              onClick={(e) => {
                                gsap.to(e.target, {
                                  scale: 0.9,
                                  duration: 0.1,
                                  yoyo: true,
                                  repeat: 1,
                                  ease: "power2.out"
                                })
                                handleBookNow(seatClass.classCode, String(fare))
                              }}
                              className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                            >

                              ₹ {fare}
                            </button>
                          ) : fare ? (
                            <p className="text-sm text-center text-gray-600 font-medium">₹{fare}</p>
                          ) : (
                            <p className="text-sm text-gray-500 text-center">Fare N/A</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Mobile: Simple list view */}
              <div className="lg:hidden space-y-3">
                {convertAvailabilityToArray(availabilityData).map((seatClass, index) => {
                  const fare = getFareForClass(seatClass.classCode)
                  const canBook = isBookingAvailable(seatClass.availability)
                  return (
                    <div
                      key={index}
                      className="availability-card flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {seatClass.classCode}
                          </span>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">{seatClass.className}</h4>
                            <p className={`text-sm font-medium ${getAvailabilityBoxTextColor(seatClass.availability)}`}>
                              {!isNaN(Number(seatClass.availability))
                                ? Number(seatClass.availability) > 0
                                  ? `Available: ${seatClass.availability}`
                                  : 'Not Available'
                                : String(seatClass.availability)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {loadingFares ? (
                          <Clock className="w-4 h-4 animate-spin text-gray-400" />
                        ) : fare ? (
                          <div className="text-right">
                            {canBook && (
                              <button
                                onClick={(e) => {
                                  gsap.to(e.target, {
                                    scale: 0.9,
                                    duration: 0.1,
                                    yoyo: true,
                                    repeat: 1,
                                    ease: "power2.out"
                                  })
                                  handleBookNow(seatClass.classCode, String(fare))
                                }}
                                className="w-full px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-all duration-200"
                              >
                                ₹ {fare}
                              </button>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Fare N/A</p>
                        )}
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
