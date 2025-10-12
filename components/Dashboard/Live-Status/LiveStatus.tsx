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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(trainSuggestions);

  // Generate date options (today, yesterday, day before yesterday)
  const dateOptions = React.useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const getLabel = (date: Date, index: number) => {
      const labels = ['Today', 'Yesterday', 'Day Before Yesterday'];
      return `${labels[index]} (${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
    };

    return [
      { value: formatDate(today), label: getLabel(today, 0) },
      { value: formatDate(yesterday), label: getLabel(yesterday, 1) },
      { value: formatDate(dayBeforeYesterday), label: getLabel(dayBeforeYesterday, 2) }
    ];
  }, []);

  // Set default date to today
  useEffect(() => {
    setSelectedDate(dateOptions[0].value);
  }, [dateOptions]);

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

    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    setError('');
    setLiveStatus(null);

    try {
      const response = await fetch(
        `/api/livestatus?trainNumber=${trainNumber}&date=${selectedDate}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch live status');
      }

      const data = await response.json();
      setLiveStatus(data);
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

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {dateOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedDate(option.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${selectedDate === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium text-sm">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
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
        {liveStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Train Info Header */}
            {liveStatus.trainNo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg border border-blue-500 p-6 text-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      <Train className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {liveStatus.trainNo} - {liveStatus.trainName}
                      </h2>
                      {liveStatus.availableDates && liveStatus.availableDates.length > 0 && (
                        <p className="text-blue-100 text-sm mt-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Available: {liveStatus.availableDates.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  {liveStatus.totalRuns > 0 && (
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="font-semibold text-sm">
                          {liveStatus.totalRuns} Active Run{liveStatus.totalRuns > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Display each run */}
            {liveStatus.runs && Object.keys(liveStatus.runs).map((runDate) => {
              const run = liveStatus.runs[runDate];
              return (
                <div key={runDate} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {/* Run Header */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-green-600" />
                          Journey Date: {runDate}
                        </h3>
                        {run.statusNote && (
                          <p className="text-sm text-gray-600 mt-1">{run.statusNote}</p>
                        )}
                      </div>
                      {run.lastUpdate && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Last Updated</p>
                          <p className="text-sm font-medium text-gray-700">{run.lastUpdate}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Station-wise Status Table */}
                  {run.stations && run.stations.length > 0 && (
                    <>
                      <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-600" />
                        Station-wise Live Status ({run.totalStations} stations)
                      </h4>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-gray-300 bg-gray-50">
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Station</th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-700">Platform</th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-700">Distance</th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-700">Arrival</th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-700">Departure</th>
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
                                    transition={{ duration: 0.4, delay: index * 0.02 }}
                                    className="bg-gradient-to-r from-green-50 to-blue-50 border-y-2 border-green-300"
                                  >
                                    <td colSpan={5} className="py-4 px-4">
                                      <div className="flex items-center justify-center gap-3">
                                        <div className="bg-green-500 p-2 rounded-full">
                                          <MapPin className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-center">
                                          <p className="font-bold text-green-800 text-lg">
                                            {station.stationName}
                                          </p>
                                          {station.stationCode && station.stationCode !== '-' && (
                                            <p className="text-sm text-green-700 mt-1">
                                              Station Code: {station.stationCode}
                                            </p>
                                          )}
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
                                  transition={{ duration: 0.3, delay: index * 0.02 }}
                                  className={`border-b border-gray-100 transition-colors ${isCurrentStation
                                      ? 'bg-yellow-50 hover:bg-yellow-100'
                                      : hasDeparted
                                        ? 'bg-green-50/30 hover:bg-green-50'
                                        : 'hover:bg-gray-50'
                                    }`}
                                >
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                      {isCurrentStation && (
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                      )}
                                      {hasDeparted && !isCurrentStation && (
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      )}
                                      <div>
                                        <p className="font-semibold text-gray-900">{station.stationName}</p>
                                        <p className="text-sm text-gray-600">{station.stationCode}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="text-center py-4 px-4">
                                    {station.platform ? (
                                      <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                        PF {station.platform}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                  <td className="text-center py-4 px-4">
                                    {station.distanceKm ? (
                                      <span className="text-gray-700 font-medium">{station.distanceKm} km</span>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                  <td className="text-center py-4 px-4">
                                    <div className="space-y-1">
                                      <div className="text-sm text-gray-500">
                                        Sch: {station.arrival?.scheduled || '-'}
                                      </div>
                                      {station.arrival?.actual && station.arrival.actual !== '-' ? (
                                        <div className="flex flex-col items-center gap-1">
                                          <span className="font-bold text-green-700 text-base">
                                            {station.arrival.actual}
                                          </span>
                                          {station.arrival.delay && (
                                            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                                              {station.arrival.delay}
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 text-sm">Not arrived</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="text-center py-4 px-4">
                                    <div className="space-y-1">
                                      <div className="text-sm text-gray-500">
                                        Sch: {station.departure?.scheduled || '-'}
                                      </div>
                                      {station.departure?.actual && station.departure.actual !== '-' ? (
                                        <div className="flex flex-col items-center gap-1">
                                          <span className="font-bold text-green-700 text-base">
                                            {station.departure.actual}
                                          </span>
                                          {station.departure.delay && (
                                            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                                              {station.departure.delay}
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 text-sm">Not departed</span>
                                      )}
                                    </div>
                                  </td>
                                </motion.tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

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
