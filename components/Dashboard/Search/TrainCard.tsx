import React from 'react'
import { Clock, MapPin, Calendar, Users, Banknote, Train } from 'lucide-react'

interface TrainCardProps {
  data: {
    train_no: string
    train_name: string
    from_stn_name: string
    from_stn_code: string
    to_stn_name: string
    to_stn_code: string
    departure_time: string
    arrival_time: string
    travel_time: string
    distance: string
    running_days: string
    halts: number
    classes: Array<{
      class_code: string
      class_name: string
      price: string
      availability: string
    }>
  }
}

const TrainCard: React.FC<TrainCardProps> = ({ data }) => {
  const formatRunningDays = (days: string) => {
    if (!days || days.length !== 7) return 'N/A';

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const runningDays = dayNames.filter((_, index) => {
      const dayChar = days[index];
      return dayChar === 'Y' || dayChar === '1';
    });

    return runningDays.length > 0 ? runningDays.join(', ') : 'Not running';
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

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Train className="w-5 h-5" />
              <span className="text-lg font-bold">#{data.train_no}</span>
            </div>
            <h3 className="text-xl font-semibold">{data.train_name}</h3>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Distance</div>
            <div className="text-lg font-semibold">{data.distance} km</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Route Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-lg font-semibold text-gray-800">{data.from_stn_name}</span>
            </div>
            <div className="text-sm text-gray-600">{data.from_stn_code}</div>
            <div className="text-lg font-bold text-blue-600 mt-1">
              {formatTime(data.departure_time)}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center px-4">
            <Clock className="w-5 h-5 text-gray-400 mb-1" />
            <div className="text-sm text-gray-600">Travel Time</div>
            <div className="text-lg font-semibold text-gray-800">{data.travel_time}</div>
            <div className="w-full h-px bg-gray-300 my-2 relative">
              <div className="absolute left-0 top-0 w-2 h-2 bg-green-500 rounded-full transform -translate-y-1/2"></div>
              <div className="absolute right-0 top-0 w-2 h-2 bg-red-500 rounded-full transform -translate-y-1/2"></div>
            </div>
          </div>

          <div className="flex-1 text-right">
            <div className="flex items-center justify-end gap-2 mb-2">
              <span className="text-lg font-semibold text-gray-800">{data.to_stn_name}</span>
              <MapPin className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-sm text-gray-600">{data.to_stn_code}</div>
            <div className="text-lg font-bold text-blue-600 mt-1">
              {formatTime(data.arrival_time)}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex flex-wrap gap-6 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">Running Days:</span>
            <span className="font-medium text-gray-800">{formatRunningDays(data.running_days)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Train className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">Stations:</span>
            <span className="font-medium text-gray-800">{data.halts} halts</span>
          </div>
        </div>

        {/* Classes */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Banknote className="w-5 h-5 text-green-600" />
            Available Classes
          </h4>
          {data.classes && data.classes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.classes.map((classInfo, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-gray-800">{classInfo.class_code}</div>
                      <div className="text-sm text-gray-600">{classInfo.class_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">₹{classInfo.price}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm font-medium ${getAvailabilityColor(classInfo.availability)}`}>
                      {classInfo.availability || 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <div>No seat data available</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrainCard
