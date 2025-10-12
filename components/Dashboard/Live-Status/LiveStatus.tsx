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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <Train className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {liveStatus.trainNo} - {liveStatus.trainName}
                    </h2>
                    {liveStatus.availableDates && liveStatus.availableDates.length > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Available dates: {liveStatus.availableDates.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {liveStatus.totalRuns > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        Currently Running: {liveStatus.totalRuns} train{liveStatus.totalRuns > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
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
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-medium text-gray-600">Station</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-600">Platform</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-600">Distance</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-600">Scheduled Arrival</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-600">Actual Arrival</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-600">Scheduled Departure</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-600">Actual Departure</th>
                            </tr>
                          </thead>
                          <tbody>
                            {run.stations.map((station: any, index: number) => (
                              <motion.tr
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.02 }}
                                className="border-b border-gray-100 hover:bg-gray-50"
                              >
                                <td className="py-3 px-4">
                                  <p className="font-medium text-gray-900">{station.stationName}</p>
                                  <p className="text-sm text-gray-500">{station.stationCode}</p>
                                </td>
                                <td className="text-center py-3 px-4 text-gray-900">
                                  {station.platform || '-'}
                                </td>
                                <td className="text-center py-3 px-4 text-gray-600">
                                  {station.distanceKm ? `${station.distanceKm} km` : '-'}
                                </td>
                                <td className="text-center py-3 px-4">
                                  <div className="text-gray-900">{station.arrival?.scheduled || '-'}</div>
                                  {station.arrival?.delay && (
                                    <span className="text-xs text-red-600">{station.arrival.delay}</span>
                                  )}
                                </td>
                                <td className="text-center py-3 px-4">
                                  <div className={`font-medium ${station.arrival?.actual ? 'text-green-700' : 'text-gray-400'}`}>
                                    {station.arrival?.actual || '-'}
                                  </div>
                                </td>
                                <td className="text-center py-3 px-4">
                                  <div className="text-gray-900">{station.departure?.scheduled || '-'}</div>
                                  {station.departure?.delay && (
                                    <span className="text-xs text-red-600">{station.departure.delay}</span>
                                  )}
                                </td>
                                <td className="text-center py-3 px-4">
                                  <div className={`font-medium ${station.departure?.actual ? 'text-green-700' : 'text-gray-400'}`}>
                                    {station.departure?.actual || '-'}
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
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
