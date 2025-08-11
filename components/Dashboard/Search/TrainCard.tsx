import React from 'react'
import { Clock, MapPin, Calendar, Users, Banknote, Train } from 'lucide-react'

interface TrainCardProps {
  data: {
    distance:string
    dstn_stn_code:string
    dstn_stn_name:string
    from_stn_code:string
    from_stn_name:string
    from_time:string
    halts:number
    running_days:string
    source_stn_code:string
    source_stn_name:string
    to_stn_code:string
    to_stn_name:string
    to_time:string
    train_name:string
    train_no:string
    travel_time:string
  }
  onCheckAvailability?: (trainNo: string) => void
}

const TrainCard: React.FC<TrainCardProps> = ({ data, onCheckAvailability }) => {
  const formatRunningDays = (days: string) => {
    if (!days || days.length !== 7) return 'N/A';

    const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const runningDays = dayNames.filter((_, index) => {
      const dayChar = days[index];
      return dayChar === 'Y' || dayChar === '1';
    });

    return runningDays.length > 0 ? runningDays.join(' ') : 'Not running';
  };

  const formatTime = (time: string) => {
    if (!time) return 'N/A'
    return time.length === 4 ? `${time.slice(0, 2)}:${time.slice(2)}` : time
  }

  const getAvailabilityColor = (availability: string) => {
    if (!availability || availability === 'N/A') return 'text-gray-500'
    if (availability.toLowerCase().includes('available')) return 'text-green-600'
    if (availability.toLowerCase().includes('waiting')) return 'text-orange-500'
    if (availability.toLowerCase().includes('rac')) return 'text-blue-600'
    return 'text-red-500'
  }

  const getBadgeStyle = (label: string) => {
    if (label === 'Fastest') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (label === 'Top Choice') return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-gray-100 text-gray-600 border-gray-200'
  }

  const handleCheckAvailability = () => {
    if (onCheckAvailability) {
      onCheckAvailability(data.train_no);
    }
  };

  return (
    <div className="bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow duration-200 overflow-hidden w-full max-w-4xl mx-auto">
      {/* Header with train info and running days - responsive */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-blue-600">{data.train_no}</span>
            <span className="text-sm sm:text-base text-gray-900 font-semibold">{data.train_name}</span>
          </div>
          <div className="text-right text-xs sm:text-sm text-gray-500">
            <span className="hidden sm:inline">Runs on: </span>
            <span className="font-medium">{formatRunningDays(data.running_days)}</span>
          </div>
        </div>
      </div>

      {/* Main content - responsive layout */}
      <div className="px-3 sm:px-6 py-4">
        {/* Journey details - flex-row on all screen sizes */}
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-0">
          {/* Departure */}
          <div className="text-left w-1/4">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">{data.from_stn_code}</div>
            <div className="text-lg sm:text-2xl font-bold text-gray-800 mb-1">{formatTime(data.from_time)}</div>
            <div className="text-xs text-gray-600 truncate">{data.from_stn_name}</div>
          </div>

          {/* Journey info - responsive */}
          <div className="flex-1 px-2 sm:px-8 w-1/2">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1" />
              <span className="text-xs sm:text-sm font-medium text-gray-600">{data.travel_time}</span>
            </div>

            {/* Journey line - responsive */}
            <div className="relative">
              <div className="w-full h-px bg-gray-300 relative">
                <div className="absolute left-0 top-0 w-2 h-2 sm:w-3 sm:h-3 bg-white border-2 border-gray-400 rounded-full transform -translate-y-1/2"></div>
                <div className="absolute right-0 top-0 w-2 h-2 sm:w-3 sm:h-3 bg-white border-2 border-gray-400 rounded-full transform -translate-y-1/2"></div>
              </div>
            </div>

            <div className="text-center text-xs sm:text-sm text-gray-500 mt-2">
              {data.halts} halts | {data.distance} kms
            </div>
          </div>

          {/* Arrival */}
          <div className="text-right w-1/4">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">{data.to_stn_code}</div>
            <div className="text-lg sm:text-2xl font-bold text-gray-800 mb-1">{formatTime(data.to_time)}</div>
            <div className="text-xs text-gray-600 truncate">{data.to_stn_name}</div>
          </div>
        </div>

        {/* Check Availability Button - responsive */}
        <div className="mt-4 sm:mt-6 text-center">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
            onClick={handleCheckAvailability}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            Check Seat Availability
          </button>
        </div>
      </div>
    </div>
  )
}

export default TrainCard