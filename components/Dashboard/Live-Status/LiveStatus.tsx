"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Train, Calendar, ArrowRight, AlertCircle, MapPin, Clock } from 'lucide-react';
import trains from "@/lib/constants/trains.json"

const trainSuggestions = trains

const LiveStatus = () => {
  const [trainNumber, setTrainNumber] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [liveStatus, setLiveStatus] = useState<any>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(trainSuggestions);

  // Filter suggestions based on input
  useEffect(() => {
    if (trainNumber.length >= 2) {
      const filtered = trainSuggestions.filter(train =>
        train.trainNo.includes(trainNumber) ||
        train.trainName.toLowerCase().includes(trainNumber.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else if (trainNumber.length === 0) {
      setFilteredSuggestions(trainSuggestions.slice(0, 8));
      setShowSuggestions(false);
    } else {
      setShowSuggestions(false);
    }
  }, [trainNumber]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,5}$/.test(value)) {
      setTrainNumber(value);
      setError('');
    }
  };

  const handleSuggestionClick = (suggestion: typeof trainSuggestions[0]) => {
    setShowSuggestions(false);
    setTrainNumber(suggestion.trainNo);
  };

  const handleInputFocus = () => {
    if (trainNumber.length === 0) {
      setShowSuggestions(true);
    } else if (trainNumber.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 300);
  };

  const handleSubmit = async () => {
    if (trainNumber.length !== 5) {
      setError('Please enter exactly 5 digits');
      return;
    }

    setLoading(true);
    setError('');
    setLiveStatus(null);
    setAvailableDates([]);
    setSelectedDate('');

    try {
      const response = await fetch(
        `/api/livestatus?trainNumber=${trainNumber}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch live status');
      }

      const data = await response.json();

      console.log('Received data:', data);
      console.log('Available dates:', data.availableDates);

      if (data.availableDates && data.availableDates.length > 0) {
        setAvailableDates(data.availableDates);
        setLiveStatus(data);
        // Auto-select the first date
        setSelectedDate(data.availableDates[0]);
        console.log('Set selected date to:', data.availableDates[0]);
      } else {
        setError('No running trains found for this train number');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white p-3 rounded-full shadow-sm">
              <Train className="w-8 h-8 text-gray-700" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Live Train Status</h1>
          <p className="text-gray-600">Track your train in real-time</p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="space-y-4">
            {/* Train Number Input with Suggestions */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Train Number
              </label>
              <input
                type="number"
                value={trainNumber}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                placeholder="Enter 5-digit train number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                maxLength={5}
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 px-3 py-2 mb-1">
                      {trainNumber ? `${filteredSuggestions.length} trains found` : 'Popular trains'}
                    </div>
                    {filteredSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.trainNo}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSuggestionClick(suggestion);
                        }}
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

            {/* Submit Button */}
            <motion.button
              onClick={handleSubmit}
              disabled={loading || trainNumber.length !== 5}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${loading || trainNumber.length !== 5
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
                  Fetching Live Status...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Track Train
                </>
              )}
            </motion.button>
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

        {/* Live Status Results */}
        {liveStatus && availableDates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Train Info Header with Date Selector */}
            {liveStatus && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Train className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {liveStatus.trainNo} - {liveStatus.trainName}
                      </h2>
                      <span className="text-xs text-green-700">
                        {liveStatus.totalRuns} Active Run{liveStatus.totalRuns > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Date Selector Tabs - Inline */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {availableDates.map((date) => (
                      <button
                        key={date}
                        onClick={() => {
                          console.log('Clicked date:', date);
                          setSelectedDate(date);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedDate === date
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{date}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Display selected run */}
            {liveStatus.runs && liveStatus.runs[selectedDate] && (() => {
              const run = liveStatus.runs[selectedDate];
              return (
                <div key={selectedDate} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {/* Run Header */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Live Status</h3>
                      {run.lastUpdate && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Last Updated</p>
                          <p className="text-sm font-medium text-gray-700">{run.lastUpdate}</p>
                        </div>
                      )}
                    </div>
                    {run.statusNote && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">{run.statusNote}</p>
                      </div>
                    )}
                  </div>

                  {/* Station-wise Status Table */}
                  {run.stations && run.stations.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Station</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-600">Platform</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-600">Distance</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-600">Arrival</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-600">Departure</th>
                          </tr>
                        </thead>
                        <tbody>
                          {run.stations.map((station: any, index: number) => {
                            // Check if this is a status update row
                            const isStatusUpdate = station.stationName &&
                              (station.stationName.toLowerCase().includes('arrived at') ||
                                station.stationName.toLowerCase().includes('updated on'));

                            if (isStatusUpdate) {
                              return (
                                <motion.tr
                                  key={index}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3, delay: 0.3 + (index * 0.05) }}
                                  className="bg-blue-50 border-y border-blue-200"
                                >
                                  <td colSpan={5} className="py-4 px-4">
                                    <div className="flex items-center justify-center gap-3">
                                      <div className="bg-blue-100 p-2 rounded-lg">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                      </div>
                                      <div className="text-center">
                                        <p className="font-semibold text-blue-900">
                                          {station.stationName}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                </motion.tr>
                              );
                            }

                            // Regular station row
                            const hasArrived = station.arrival?.actual && station.arrival.actual !== '-';
                            const hasDeparted = station.departure?.actual && station.departure.actual !== '-';
                            const isCurrentStation = hasArrived && !hasDeparted;

                            return (
                              <motion.tr
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.3 + (index * 0.05) }}
                                className={`border-b border-gray-100 ${isCurrentStation
                                  ? 'bg-blue-50'
                                  : hasDeparted
                                    ? 'bg-gray-50'
                                    : 'hover:bg-gray-50'
                                  }`}
                              >
                                <td className="py-3 px-4">
                                  <div>
                                    <p className="font-medium text-gray-900">{station.stationName}</p>
                                    <p className="text-sm text-gray-500">{station.stationCode}</p>
                                  </div>
                                </td>
                                <td className="text-center py-3 px-4 text-gray-600">
                                  {station.platform || '-'}
                                </td>
                                <td className="text-center py-3 px-4 text-gray-600">
                                  {station.distanceKm ? `${station.distanceKm} km` : '-'}
                                </td>
                                <td className="text-center py-3 px-4">
                                  <div className="text-gray-900">{station.arrival?.scheduled || '-'}</div>
                                  {station.arrival?.actual && station.arrival.actual !== '-' && (
                                    <div className={`text-sm font-medium mt-1 ${station.arrival.delay && !station.arrival.delay.toLowerCase().includes('on time') ? 'text-red-600' : 'text-green-700'
                                      }`}>
                                      {station.arrival.actual}
                                      {station.arrival.delay && (
                                        <span className="text-xs ml-1">({station.arrival.delay})</span>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td className="text-center py-3 px-4">
                                  <div className="text-gray-900">{station.departure?.scheduled || '-'}</div>
                                  {station.departure?.actual && station.departure.actual !== '-' && (
                                    <div className={`text-sm font-medium mt-1 ${station.departure.delay && !station.departure.delay.toLowerCase().includes('on time') ? 'text-red-600' : 'text-green-700'
                                      }`}>
                                      {station.departure.actual}
                                      {station.departure.delay && (
                                        <span className="text-xs ml-1">({station.departure.delay})</span>
                                      )}
                                    </div>
                                  )}
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Show error if no data */}
            {liveStatus && !liveStatus.trainNo && (
              <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
                <div className="text-center">
                  <div className="bg-red-50 p-3 rounded-full inline-block mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Found</h3>
                  <p className="text-gray-600">Unable to fetch live status for this train. Please try again.</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LiveStatus;
