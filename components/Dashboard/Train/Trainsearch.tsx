"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrainInfo } from 'irctc-connect';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Info, 
  Route, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Search,
  Train,
  MapPin,
  AlertCircle
} from 'lucide-react';
import trains from "@/lib/constants/trains.json"

interface TrainInfo {
  success: boolean;
  data: {
    trainInfo: {
      train_no: string;
      train_name: string;
      from_stn_name: string;
      from_stn_code: string;
      to_stn_name: string;
      to_stn_code: string;
      from_time: string;
      to_time: string;
      travel_time: string;
      running_days: string;
      type: string;
      train_id: string;
    };
    route: Array<{
      stnName: string;
      stnCode: string;
      arrival: string;
      departure: string;
      halt: string;
      distance: string;
      day: string;
      platform: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      } | null;
    }>;
  };
}

// Train suggestions data from your image
const trainSuggestions = trains

const Trainsearch = () => {
  const [trainNumber, setTrainNumber] = useState('');
  const [trainInfo, setTrainInfo] = useState<TrainInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(trainSuggestions);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle URL parameters on component mount
  useEffect(() => {
    const trainNumberFromUrl = searchParams.get('train');
    
    if (trainNumberFromUrl && /^\d{5}$/.test(trainNumberFromUrl)) {
      setTrainNumber(trainNumberFromUrl);
      // Auto-fetch train data if valid train number is in URL
      if (isInitialLoad) {
        setIsInitialLoad(false);
        handleSubmitWithNumber(trainNumberFromUrl);
      }
    } else {
      setIsInitialLoad(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (trainNumber.length > 0) {
      const filtered = trainSuggestions.filter(train =>
        train.trainNo.includes(trainNumber) ||
        train.trainName.toLowerCase().includes(trainNumber.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && trainNumber.length < 5);
    } else {
      setFilteredSuggestions(trainSuggestions.slice(0, 8)); // Show first 8 suggestions
      setShowSuggestions(false);
    }
  }, [trainNumber]);

  const handleInputChange = (e: any) => {
    const value = e.target.value;
    if (/^\d{0,5}$/.test(value)) {
      setTrainNumber(value);
      setError('');
    }
  };

  const handleSuggestionClick = (suggestion: typeof trainSuggestions[0]) => {
    setTrainNumber(suggestion.trainNo);
    setShowSuggestions(false);
    
    // Update URL with selected train number
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('train', suggestion.trainNo);
    router.push(newUrl.pathname + newUrl.search, { scroll: false });
    
    // Auto-fetch train data for selected suggestion
    handleSubmitWithNumber(suggestion.trainNo);
  };

  const handleInputFocus = () => {
    if (trainNumber.length === 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSubmitWithNumber = async (number: string) => {
    setLoading(true);
    setError('');
    setTrainInfo(null);
    setShowSuggestions(false);

    try {
      const result = await getTrainInfo(number);
      setTrainInfo(result);
    } catch (err) {
      setError('Failed to fetch train information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (trainNumber.length !== 5) {
      setError('Please enter exactly 5 digits');
      return;
    }

    // Update URL with train number
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('train', trainNumber);
    router.push(newUrl.pathname + newUrl.search, { scroll: false });

    // Fetch train data
    await handleSubmitWithNumber(trainNumber);
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const getDayNames = (runningDays: string) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ,'Sun'];
    return runningDays
      .split('')
      .map((day, index) => day === '1' ? days[index] : null)
      .filter(Boolean)
      .join(', ');
  };

  const openLocationInMap = (latitude: number, longitude: number, stationName: string) => {
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      console.warn('Invalid coordinates detected:', { latitude, longitude });
      return;
    }

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodeURIComponent(stationName)}`;
    
    if (/Android/i.test(navigator.userAgent)) {
      const androidMapsUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(stationName)})`;
      window.open(androidMapsUrl, '_blank');
    } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      const appleMapsUrl = `maps://maps.google.com/maps?daddr=${latitude},${longitude}&amp;ll=`;
      window.open(appleMapsUrl, '_blank');
    } else {
      window.open(googleMapsUrl, '_blank');
    }
  };

  const StationName = ({ station }: { station: any }) => {
    const hasValidCoordinates = station.coordinates && 
      station.coordinates.latitude >= -90 && 
      station.coordinates.latitude <= 90 && 
      station.coordinates.longitude >= -180 && 
      station.coordinates.longitude <= 180;

    if (hasValidCoordinates) {
      return (
        <button
          onClick={() => openLocationInMap(
            station.coordinates.latitude,
            station.coordinates.longitude,
            station.stnName
          )}
          className="text-left hover:text-blue-600 transition-colors group cursor-pointer"
          title={`Open ${station.stnName} in maps`}
        >
          <p className="font-medium text-gray-900 group-hover:text-blue-600">{station.stnName}</p>
          <p className="text-sm text-gray-500 group-hover:text-blue-500">{station.stnCode}</p>
        </button>
      );
    }

    return (
      <div>
        <p className="font-medium text-gray-900">{station.stnName}</p>
        <p className="text-sm text-gray-500">{station.stnCode}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white p-3 rounded-full shadow-sm">
              <Train className="w-8 h-8 text-gray-700" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Train Information</h1>
          <p className="text-gray-600">Enter train number to get detailed information</p>
        </div>

        {/* Search Card with Suggestions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={trainNumber}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Enter 5-digit train number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  maxLength={5}
                />
                
                {/* Simple Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 px-3 py-2 mb-1">
                        {trainNumber ? `${filteredSuggestions.length} trains found` : 'Popular trains'}
                      </div>
                      {filteredSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.trainNo}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left p-3 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {suggestion.trainNo} - {suggestion.trainName}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <motion.button
                onClick={handleSubmit}
                disabled={loading || trainNumber.length !== 5}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  loading || trainNumber.length !== 5
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                }`}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: loading || trainNumber.length !== 5 ? 1 : 1.02 }}
              >
                {loading ? (
                  <>
                    <motion.div 
                      className="rounded-full h-4 w-4 border-2 border-white border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search
                  </>
                )}
              </motion.button>
            </div>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </div>

        {/* Results */}
        {trainInfo && trainInfo.success && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Train Info Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center mb-6">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {trainInfo.data.trainInfo.train_no} - {trainInfo.data.trainInfo.train_name}
                  </h2>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded mt-1">
                    {trainInfo.data.trainInfo.type}
                  </span>
                </div>
              </div>

              {/* Route and Schedule Information */}
              <div className="space-y-6">
                {/* Route Info with Travel Time - Full Width */}
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">From</p>
                    <p className="font-semibold text-lg text-gray-900">
                      {trainInfo.data.trainInfo.from_stn_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {trainInfo.data.trainInfo.from_stn_code}
                    </p>
                  </div>
                  
                  <div className="text-center flex-1 mx-8">
                    <div className="bg-white p-3 rounded-full inline-block mb-2">
                      <ArrowRight className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-sm font-medium text-gray-700">
                        {trainInfo.data.trainInfo.travel_time}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">To</p>
                    <p className="font-semibold text-lg text-gray-900">
                      {trainInfo.data.trainInfo.to_stn_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {trainInfo.data.trainInfo.to_stn_code}
                    </p>
                  </div>
                </div>

                {/* Schedule Details Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <p className="text-sm text-gray-600">Departure</p>
                    </div>
                    <p className="font-semibold text-xl text-gray-900">
                      {trainInfo.data.trainInfo.from_time}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <p className="text-sm text-gray-600">Arrival</p>
                    </div>
                    <p className="font-semibold text-xl text-gray-900">
                      {trainInfo.data.trainInfo.to_time}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg text-center col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <p className="text-sm text-gray-600">Running Days</p>
                    </div>
                    <p className="font-semibold text-sm text-gray-900">
                      {getDayNames(trainInfo.data.trainInfo.running_days)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Route Details */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="bg-green-50 p-2 rounded-lg mr-3">
                  <Route className="w-5 h-5 text-green-600" />
                </div>
                Route Details
                <span className="ml-2 text-sm text-gray-500 font-normal">
                  (Click station names to view on map)
                </span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Station</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Arrival</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Departure</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Halt</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Distance</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Platform</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainInfo.data.route.map((station, index) => (
                      <motion.tr 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + (index * 0.05) }}
                        className={`border-b border-gray-100 ${
                          index === 0 || index === trainInfo.data.route.length - 1 
                            ? 'bg-blue-50' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <StationName station={station} />
                        </td>
                        <td className="text-center py-3 px-4 text-gray-900">
                          {station.arrival}
                        </td>
                        <td className="text-center py-3 px-4 text-gray-900">
                          {station.departure}
                        </td>
                        <td className="text-center py-3 px-4 text-gray-600">
                          {station.halt}
                        </td>
                        <td className="text-center py-3 px-4 text-gray-600">
                          {station.distance} km
                        </td>
                        <td className="text-center py-3 px-4 text-gray-600">
                          {station.platform || '-'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}

        {trainInfo && !trainInfo.success && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-red-200 p-6"
          >
            <div className="text-center">
              <div className="bg-red-50 p-3 rounded-full inline-block mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Train Found</h3>
              <p className="text-gray-600">Please check the train number and try again.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Trainsearch;
