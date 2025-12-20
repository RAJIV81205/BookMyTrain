"use client"
import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Calendar, Search as SearchIcon, ArrowRight, ArrowUpDown, ArrowLeftRight } from 'lucide-react'
import stninfo from '@/lib/constants/stations.json'
import { searchTrainBetweenStations } from 'irctc-connect'
import TrainCard from './TrainCard'
import toast from 'react-hot-toast'
import { useBooking } from "@/context/BookingContext";
import { useRouter } from 'next/navigation'
import TrainStatsBoxes from './Stats'
import t from "@/lib/constants/trains.json"
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Search = () => {
  const router = useRouter()
  const [fromQuery, setFromQuery] = useState("")
  const [toQuery, setToQuery] = useState("")
  const [fromCode, setFromCode] = useState("")
  const [toCode, setToCode] = useState("")
  const [date, setDate] = useState("")
  const [results, setResults] = useState([])
  const [activeField, setActiveField] = useState<"from" | "to" | null>(null)
  const [loading, setLoading] = useState(false)
  const { setBookingData } = useBooking();

  // Reset mechanism state management
  const [resetTrigger, setResetTrigger] = useState(false)
  const [resetCount, setResetCount] = useState(0)

  const resultsRef = useRef<HTMLDivElement | null>(null)
  const searchFormRef = useRef<HTMLDivElement | null>(null)
  const statsRef = useRef<HTMLDivElement | null>(null)
  const trainCardsRef = useRef<HTMLDivElement[]>([])

  const stations = stninfo.station || []


  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    setDate(today)
  }, [])

  // Initial animations on component mount
  useEffect(() => {
    const tl = gsap.timeline()

    // Animate search form entrance
    if (searchFormRef.current) {
      gsap.set(searchFormRef.current, { opacity: 0, y: 50 })
      tl.to(searchFormRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      })
    }

    // Animate stats boxes if they exist
    if (statsRef.current) {
      gsap.set(statsRef.current, { opacity: 0, y: 30 })
      tl.to(statsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.4")
    }

    // Cleanup function for scroll triggers
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

 

  // Cleanup scroll triggers when component unmounts
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

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
        (s: any) =>
          s.stnCode !== excludeCode &&
          (
            s.stnCode.toLowerCase().includes(query.toLowerCase()) ||
            s.stnName.toLowerCase().includes(query.toLowerCase()) ||
            s.stnCity.toLowerCase().includes(query.toLowerCase())
          )
      )
      .slice(0, 3)
  }

  // Handler for tracking individual TrainCard reset completion
  const resetCompletionRef = useRef<{
    totalCards: number
    completedCount: number
    resolveReset?: () => void
  }>({ totalCards: 0, completedCount: 0 })

  const handleResetComplete = () => {
    resetCompletionRef.current.completedCount += 1

    // Check if all resets are complete
    if (resetCompletionRef.current.completedCount >= resetCompletionRef.current.totalCards &&
      resetCompletionRef.current.resolveReset) {
      resetCompletionRef.current.resolveReset()
    }
  }

  const searchTrain = async () => {
    if (!fromCode || !toCode) {
      toast.error("Please select both departure and arrival stations")
      return
    }

    // Trigger reset before performing search
    setResetCount(prev => prev + 1)
    setResetTrigger(true)

    // Wait for all resets to complete or timeout after 1000ms
    const totalCards = results.length
    if (totalCards > 0) {
      resetCompletionRef.current = { totalCards, completedCount: 0 }

      try {
        await Promise.race([
          // Promise that resolves when all resets complete
          new Promise<void>((resolve) => {
            resetCompletionRef.current.resolveReset = resolve
          }),
          // Timeout promise that resolves after 1000ms
          new Promise<void>((resolve) => {
            setTimeout(() => {
              console.warn(`Reset timeout: Only ${resetCompletionRef.current.completedCount}/${totalCards} cards completed reset within 1000ms`)
              resolve()
            }, 1000)
          })
        ])
      } catch (error) {
        console.error('Error during reset wait:', error)
      }
    }

    setLoading(true)
    try {
      const res = await searchTrainBetweenStations(fromCode, toCode)
      if (!res.success) {
        return toast.error(res.data || "Error Getting Results")
      }

      // API usually has Monday at index 0
      const jsDay = new Date(date).getDay() // Sunday=0
      const apiIndex = jsDay === 0 ? 6 : jsDay - 1 // shift so Monday=0

      const filteredData = res.data.filter(
        (train: any) => train.running_days && train.running_days[apiIndex] === '1'
      )

      setResults(filteredData)

      if (filteredData.length > 0 && resultsRef.current) {
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth" })

          // Animate results section entrance
          gsap.fromTo(resultsRef.current,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out"
            }
          )

          // Stagger animate train cards with better timing
          setTimeout(() => {
            trainCardsRef.current.forEach((card, index) => {
              if (card) {
                gsap.fromTo(card,
                  { opacity: 0, y: 20 },
                  {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: "power2.out",
                    delay: index * 0.08,
                    onComplete: () => {
                      // Refresh ScrollTrigger after all animations complete
                      if (index === trainCardsRef.current.length - 1) {
                        setTimeout(() => {
                          ScrollTrigger.refresh()
                        }, 100)
                      }
                    }
                  }
                )
              }
            })
          }, 200)
        }, 100)
      }

      if (filteredData.length === 0) {
        toast.error("No trains found for this route on the selected day")
      }
    } catch (error: any) {
      toast.error(error.message || "Error searching trains")
    } finally {
      setLoading(false)
      setBookingData({
        fromCode: fromCode,
        toCode: toCode,
        date: date,
        fromStnName: fromQuery,
        toStnName: toQuery
      });
      setResetTrigger(false)
    }
  }

  // Handler for booking a ticket
  const handleBookTicket = (trainNo: string, trainName: string, fromTime: string, toTime: string, classCode: string, fare: string) => {
    // Update booking context with selected train
    setBookingData({
      trainNo: trainNo,
      trainName: trainName,
      fromTime: fromTime,
      toTime: toTime,
      classCode: classCode,
      fare: fare,
      selectedSeats: [],
      passengers: []
    });

    router.push("/checkout")
  };


  return (
    <div className="min-h-[calc(100vh-4rem)]  p-4 pt-10 lg:pt-5">
      <div className="max-w-6xl mx-auto">
        {!results.length && <div ref={statsRef}><TrainStatsBoxes station={stations.length} train={t.length} /></div>}



        {/* Unified Search Form */}
        <div ref={searchFormRef} className="bg-white rounded-2xl border border-gray-500 p-6 mb-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Train Search</h1>
            <p className="text-gray-600">Find trains between stations</p>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-4 gap-4">
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
                  onFocus={(e) => {
                    setActiveField("from")
                    gsap.to(e.target, {
                      scale: 1.02,
                      duration: 0.2,
                      ease: "power2.out"
                    })
                  }}
                  onBlur={(e) => {
                    gsap.to(e.target, {
                      scale: 1,
                      duration: 0.2,
                      ease: "power2.out"
                    })
                  }}
                  placeholder="Enter departure station"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
                />
                {fromCode && (
                  <div className="text-xs text-gray-500 mt-1">
                    Station Code: {fromCode}
                  </div>
                )}
                {activeField === "from" && fromQuery && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filterStations(fromQuery, toCode).map((station, index) => (
                      <div
                        key={station.stnCode}
                        onClick={() => handleSelectFrom(station)}
                        onMouseEnter={(e) => {
                          gsap.to(e.target, {
                            x: 5,
                            duration: 0.2,
                            ease: "power2.out"
                          })
                        }}
                        onMouseLeave={(e) => {
                          gsap.to(e.target, {
                            x: 0,
                            duration: 0.2,
                            ease: "power2.out"
                          })
                        }}
                        className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0  border-gray-200 transition-colors duration-150"
                        style={{
                          animation: `slideInDown 0.3s ease-out ${index * 0.05}s both`
                        }}
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
            <div className="flex justify-center lg:mt-8">
              <button
                onClick={() => {
                  // Add rotation animation on click
                  const button = document.querySelector('.swap-button')
                  if (button) {
                    gsap.to(button, {
                      rotation: 180,
                      duration: 0.4,
                      ease: "power2.out"
                    })
                  }
                  swapStations()
                }}
                className="swap-button p-3 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors duration-200 shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
                title="Swap stations"
              >
                <ArrowUpDown className="w-5 h-5 lg:hidden text-blue-600" />
                <ArrowLeftRight className="w-5 h-5 hidden lg:block text-blue-600" />
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
                  onFocus={(e) => {
                    setActiveField("to")
                    gsap.to(e.target, {
                      scale: 1.02,
                      duration: 0.2,
                      ease: "power2.out"
                    })
                  }}
                  onBlur={(e) => {
                    gsap.to(e.target, {
                      scale: 1,
                      duration: 0.2,
                      ease: "power2.out"
                    })
                  }}
                  placeholder="Enter arrival station"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
                />
                {toCode && (
                  <div className="text-xs text-gray-500 mt-1">
                    Station Code: {toCode}
                  </div>
                )}
                {activeField === "to" && toQuery && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filterStations(toQuery, fromCode).map((station, index) => (
                      <div
                        key={station.stnCode}
                        onClick={() => handleSelectTo(station)}
                        onMouseEnter={(e) => {
                          gsap.to(e.target, {
                            x: 5,
                            duration: 0.2,
                            ease: "power2.out"
                          })
                        }}
                        onMouseLeave={(e) => {
                          gsap.to(e.target, {
                            x: 0,
                            duration: 0.2,
                            ease: "power2.out"
                          })
                        }}
                        className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors border-gray-200 duration-150"
                        style={{
                          animation: `slideInDown 0.3s ease-out ${index * 0.05}s both`
                        }}
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

            {/* Date */}
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onFocus={(e) => {
                  gsap.to(e.target, {
                    scale: 1.02,
                    duration: 0.2,
                    ease: "power2.out"
                  })
                }}
                onBlur={(e) => {
                  gsap.to(e.target, {
                    scale: 1,
                    duration: 0.2,
                    ease: "power2.out"
                  })
                }}
                min={new Date().toISOString().split("T")[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => {
                // Add pulse animation on click
                const button = document.querySelector('.search-button')
                if (button && !loading) {
                  gsap.to(button, {
                    scale: 0.95,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.out"
                  })
                }
                searchTrain()
              }}
              disabled={loading}
              className="search-button w-full lg:w-auto px-12 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center min-w-[200px] shadow-lg hover:shadow-xl disabled:shadow-md hover:scale-105 active:scale-95"
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

        <div ref={resultsRef}>
          {/* Results */}
          {results.length > 0 && (
            <div className='mt-15 lg:mt-10 lg:bg-white rounded-xl lg:border lg:border-gray-300 lg:p-5 lg:shadow-sm z-9' >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
                <h2 className="text-2xl font-bold text-center text-gray-800">
                  Available Trains ({results.length})
                </h2>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <span className="font-medium">{fromQuery}</span>
                  <ArrowRight className="inline w-4 h-4 mx-2" />
                  <span className="font-medium">{toQuery}</span>
                </div>
              </div>
              <div className="grid gap-4 ">
                {results.map((train: any, index: number) => (
                  
                    <TrainCard
                      data={train}
                      onBookTicket={handleBookTicket}
                      date={date}
                      resetAvailability={resetTrigger}
                      onResetComplete={handleResetComplete}
                    />
                
                ))}

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Search