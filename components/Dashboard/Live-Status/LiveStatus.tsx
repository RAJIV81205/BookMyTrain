"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Train,
  Calendar,
  ArrowRight,
  AlertCircle,
  MapPin,
} from "lucide-react";
import trains from "@/lib/constants/trains.json";
import CoachPosition from "./CoachPosition";

const trainSuggestions = trains;

const LiveStatus = () => {
  const [trainNumber, setTrainNumber] = useState("");
  const [selectedRunDate, setSelectedRunDate] = useState("");
  const [liveStatus, setLiveStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] =
    useState(trainSuggestions);
  const [coachPopupData, setCoachPopupData] = useState<any[] | null>(null);
  const [showCoachPopup, setShowCoachPopup] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const currentStatusRef = React.useRef<HTMLDivElement>(null);
  const [scrollTrigger, setScrollTrigger] = useState(0);

  // Filter suggestions based on input
  useEffect(() => {
    setSelectedSuggestionIndex(-1); // Reset selection when train number changes

    if (trainNumber.length >= 2) {
      const filtered = trainSuggestions.filter(
        (train) =>
          train.trainNo.includes(trainNumber) ||
          train.trainName.toLowerCase().includes(trainNumber.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(isInputFocused && filtered.length > 0);
    } else if (trainNumber.length === 0) {
      setFilteredSuggestions(trainSuggestions.slice(0, 8));
      setShowSuggestions(false);
    } else {
      setShowSuggestions(false);
    }
  }, [trainNumber, isInputFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,5}$/.test(value)) {
      setTrainNumber(value);
      setError("");
    }
  };

  const handleSuggestionClick = (suggestion: (typeof trainSuggestions)[0]) => {
    setShowSuggestions(false);
    setIsInputFocused(false);
    setTrainNumber(suggestion.trainNo);
    setSelectedSuggestionIndex(-1);
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    if (trainNumber.length >= 2 && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
      setIsInputFocused(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  };

  // Scroll to current status when data loads or date changes
  useEffect(() => {
    if (scrollTrigger > 0 && currentStatusRef.current) {
      // Delay to ensure DOM is rendered
      setTimeout(() => {
        currentStatusRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 400);
    }
  }, [scrollTrigger]);

  const handleSubmit = async () => {
    if (trainNumber.length !== 5) {
      setError("Please enter exactly 5 digits");
      return;
    }

    setLoading(true);
    setError("");
    setLiveStatus(null);
    setSelectedRunDate("");
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);

    try {
      const response = await fetch(
        `/api/livestatus?trainNumber=${trainNumber}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch live status");
      }

      const data = await response.json();
      setLiveStatus(data);

      // Auto-select the latest date (first date in the runs object)
      if (data.runs && Object.keys(data.runs).length > 0) {
        const dates = Object.keys(data.runs);
        setSelectedRunDate(dates[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch live status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (e.key === "Enter") {
        handleSubmit();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;

      case "Enter":
        e.preventDefault();
        if (
          selectedSuggestionIndex >= 0 &&
          selectedSuggestionIndex < filteredSuggestions.length
        ) {
          handleSuggestionClick(filteredSuggestions[selectedSuggestionIndex]);
        } else {
          handleSubmit();
        }
        break;

      case "Escape":
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Button click handler
  const handleCoachPopup = (data: any[] = []) => {
    setCoachPopupData(data);
    setShowCoachPopup(true);
  };
  const closeCoachPopup = () => setShowCoachPopup(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}

        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white p-3 rounded-full shadow-sm">
              <Train className="w-8 h-8 text-gray-700" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            {" "}
            Live Train Status
          </h1>
          <p className="text-gray-600">Track your train in real-time</p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={trainNumber}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  placeholder="Enter 5-digit train number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  maxLength={5}
                  autoComplete="off"
                />

                {/* Simple Suggestions Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 px-3 py-2 mb-1">
                        {trainNumber
                          ? `${filteredSuggestions.length} trains found`
                          : "Popular trains"}
                      </div>
                      {filteredSuggestions.map((suggestion, index) => (
                        <button
                          key={suggestion.trainNo}
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent blur from firing
                            handleSuggestionClick(suggestion);
                          }}
                          onMouseEnter={() => setSelectedSuggestionIndex(index)}
                          className={`w-full text-left p-3 rounded-md transition-colors ${
                            selectedSuggestionIndex === index
                              ? "bg-blue-50 border border-blue-200"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {suggestion.trainNo} - {suggestion.trainName}
                              </div>
                            </div>
                            <ArrowRight
                              className={`w-4 h-4 ${
                                selectedSuggestionIndex === index
                                  ? "text-blue-600"
                                  : "text-gray-400"
                              }`}
                            />
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
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md"
                }`}
                whileTap={{ scale: 0.98 }}
                whileHover={{
                  scale: loading || trainNumber.length !== 5 ? 1 : 1.02,
                }}
              >
                {loading ? (
                  <>
                    <motion.div
                      className="rounded-full h-4 w-4 border-2 border-white border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Track Train
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
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Train className="w-6 h-6 text-blue-600" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {liveStatus.trainNo} - {liveStatus.trainName}
                      </h2>
                      {liveStatus.totalRuns > 0 && (
                        <span className="text-sm text-blue-600 mt-1">
                          {liveStatus.totalRuns} Active Run
                          {liveStatus.totalRuns > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Date Tabs */}
            {liveStatus.runs && Object.keys(liveStatus.runs).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Journey Date
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(liveStatus.runs).map((runDate) => (
                    <button
                      key={runDate}
                      onClick={() => setSelectedRunDate(runDate)}
                      className={`px-4 py-2 rounded-md border transition-all text-sm font-medium ${
                        selectedRunDate === runDate
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-600"
                      }`}
                    >
                      {runDate}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Run Details for Selected Date */}
            {selectedRunDate &&
              liveStatus.runs &&
              liveStatus.runs[selectedRunDate] && (
                <motion.div
                  key={selectedRunDate}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="border border-gray-200 rounded-lg p-6"
                  onAnimationComplete={() => setScrollTrigger(prev => prev + 1)}
                >
                  {(() => {
                    const run = liveStatus.runs[selectedRunDate];
                    return (
                      <>
                        {/* Run Header */}
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Journey: {selectedRunDate}
                            </h3>
                            {run.lastUpdate && (
                              <div className="text-right">
                                <p className="text-xs text-gray-500">
                                  Last Updated
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {run.lastUpdate}
                                </p>
                              </div>
                            )}
                          </div>
                          {run.statusNote && (
                            <p className="text-sm text-gray-600">
                              {run.statusNote}
                            </p>
                          )}
                        </div>

                        {/* Station-wise Status with Track Visualization */}
                        {run.stations && run.stations.length > 0 && (
                          <div className="space-y-0">
                            {run.stations.map((station: any, index: number) => {
                              // Check if this is a status update row
                              const isStatusUpdate =
                                station.stationName &&
                                (station.stationName
                                  .toLowerCase()
                                  .includes("arrived at") ||
                                  station.stationName
                                    .toLowerCase()
                                    .includes("departed from") ||
                                  station.stationName
                                    .toLowerCase()
                                    .includes("updated on"));

                              if (isStatusUpdate) {
                                return (
                                  <motion.div
                                    key={index}
                                    ref={currentStatusRef}
                                    initial={{ opacity: 0, scale: 0.9 , y:50 }}
                                    whileInView={{ opacity: 1, scale: 1 , y:0}}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{
                                      duration: 0.4,
                                      ease: "easeOut",
                                    }}
                                    className="relative flex items-center justify-center py-6 my-6"
                                  >
                                    <div className="absolute inset-0 flex items-center">
                                      <div className="w-full border-t-2 border-blue-200"></div>
                                    </div>
                                    <div className="relative flex items-center gap-3 bg-white px-6 py-3 rounded-full border-2 border-blue-600 shadow-md">
                                      <MapPin className="w-5 h-5 text-blue-600" />
                                      <p className="font-semibold text-blue-900 text-sm">
                                        {station.stationName}
                                      </p>
                                    </div>
                                  </motion.div>
                                );
                              }

                              // Regular station row
                              const hasArrived =
                                station.arrival?.actual &&
                                station.arrival.actual !== "-";
                              const hasDeparted =
                                station.departure?.actual &&
                                station.departure.actual !== "-";
                              const isCurrentStation =
                                hasArrived && !hasDeparted;
                              const isLastStation =
                                index === run.stations.length - 1;

                              // Helper function to extract time from datetime string
                              const extractTime = (timeStr: string) => {
                                if (!timeStr || timeStr === "-") return timeStr;
                                // Remove date part if present (e.g., "06:01 14-Oct" -> "06:01")
                                return timeStr.split(" ")[0];
                              };

                              return (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0.5,scale:0.9, y: 30 }}
                                  whileInView={{ opacity: 1,scale:1, y: 0 }}
                                  viewport={{ once: true, margin: "-100px" }}
                                  transition={{
                                    duration: 0.5,
                                    ease: "easeOut",
                                  }}
                                  className="relative flex items-start gap-6"
                                >
                                  {/* Left Side - Arrival Timings */}
                                  <div className="w-20 text-right pt-1">
                                    {station.arrival?.scheduled &&
                                      station.arrival.scheduled !== "-" && (
                                        <div>
                                          <p className="text-gray-900 font-medium text-sm">
                                            {extractTime(
                                              station.arrival.scheduled
                                            )}
                                          </p>
                                          {station.arrival?.actual &&
                                            station.arrival.actual !== "-" && (
                                              <p
                                                className={`text-sm mt-0.5 font-medium ${
                                                  station.arrival.delay &&
                                                  !station.arrival.delay
                                                    .toLowerCase()
                                                    .includes("on time")
                                                    ? "text-red-600"
                                                    : "text-green-600"
                                                }`}
                                              >
                                                {extractTime(
                                                  station.arrival.actual
                                                )}
                                              </p>
                                            )}
                                          {station.arrival?.delay && (
                                            <p
                                              className={`text-xs mt-0.5 ${
                                                station.arrival.delay &&
                                                !station.arrival.delay
                                                  .toLowerCase()
                                                  .includes("on time")
                                                  ? "text-red-600"
                                                  : "text-green-600"
                                              }`}
                                            >
                                              {station.arrival.delay}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                  </div>

                                  {/* Center - Track Line */}
                                  <div className="flex flex-col items-center">
                                    {/* Station Point */}
                                    <div
                                      className={`w-4 h-4 rounded-full border-2 z-10 ${
                                        isCurrentStation
                                          ? "bg-blue-600 border-blue-600 shadow-lg"
                                          : hasDeparted
                                          ? "bg-blue-400 border-blue-400"
                                          : "bg-white border-gray-300"
                                      }`}
                                    />

                                    {/* Vertical Track */}
                                    {!isLastStation && (
                                      <div
                                        className={`w-0.5 flex-1 min-h-[80px] ${
                                          hasDeparted
                                            ? "bg-blue-400"
                                            : "bg-gray-200"
                                        }`}
                                      />
                                    )}
                                  </div>

                                  {/* Middle - Station Details */}
                                  <div className="flex-1 pb-8">
                                    <div className="flex items-baseline gap-2 mb-1">
                                      <h4
                                        className={`font-semibold ${
                                          isCurrentStation
                                            ? "text-gray-900 text-lg"
                                            : "text-gray-900"
                                        }`}
                                      >
                                        {station.stationName}
                                      </h4>
                                      <span className="text-sm text-gray-500">
                                        {station.stationCode}
                                      </span>
                                    </div>

                                    {isCurrentStation && (
                                      <span className="inline-block px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full mb-2">
                                        Current Location
                                      </span>
                                    )}

                                    <div className="flex flex-wrap gap-4 text-sm mt-2">
                                      {station.platform && (
                                        <div>
                                          <span className="text-gray-500">
                                            Platform:
                                          </span>
                                          <span className="ml-1 text-gray-900 font-medium">
                                            {station.platform}
                                          </span>
                                        </div>
                                      )}
                                      {station.distanceKm && (
                                        <div>
                                          <span className="text-gray-500">
                                            Distance:
                                          </span>
                                          <span className="ml-1 text-gray-900 font-medium">
                                            {station.distanceKm} km
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Coach Position Button (show only if coachPosition available) */}
                                  <div className="flex-1 flex justify-center items-center px-5 h-full">
                                    {Array.isArray(station.coachPosition) &&
                                    station.coachPosition.length > 0 ? (
                                      <button
                                        className="bg-blue-500 text-white rounded-md px-3 py-1 text-sm hover:bg-blue-600 transition"
                                        onClick={() =>
                                          handleCoachPopup(
                                            station.coachPosition
                                          )
                                        }
                                      >
                                        Coach Position
                                      </button>
                                    ) : (
                                      <button
                                        className="bg-gray-200 text-gray-500 rounded-md px-3 py-1 text-sm cursor-not-allowed"
                                        disabled
                                        title="No coach data for this station"
                                      >
                                        No Coach Data
                                      </button>
                                    )}
                                  </div>

                                  {/* Right Side - Departure Timings */}
                                  <div className="w-20 text-left pt-1">
                                    {station.departure?.scheduled &&
                                      station.departure.scheduled !== "-" && (
                                        <div>
                                          <p className="text-gray-900 font-medium text-sm">
                                            {extractTime(
                                              station.departure.scheduled
                                            )}
                                          </p>
                                          {station.departure?.actual &&
                                            station.departure.actual !==
                                              "-" && (
                                              <p
                                                className={`text-sm mt-0.5 font-medium ${
                                                  station.departure.delay &&
                                                  !station.departure.delay
                                                    .toLowerCase()
                                                    .includes("on time")
                                                    ? "text-red-600"
                                                    : "text-green-600"
                                                }`}
                                              >
                                                {extractTime(
                                                  station.departure.actual
                                                )}
                                              </p>
                                            )}
                                          {station.departure?.delay && (
                                            <p
                                              className={`text-xs mt-0.5 font-medium ${
                                                station.departure.delay &&
                                                !station.departure.delay
                                                  .toLowerCase()
                                                  .includes("on time")
                                                  ? "text-red-600"
                                                  : "text-green-600"
                                              }`}
                                            >
                                              {station.departure.delay}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </motion.div>
              )}

            {/* Show error if no data */}
            {liveStatus &&
              (!liveStatus.runs ||
                Object.keys(liveStatus.runs).length === 0) && (
                <div className="border border-gray-200 rounded-lg p-8">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Data Found
                    </h3>
                    <p className="text-gray-600">
                      Unable to fetch live status for this train. Please try
                      again.
                    </p>
                  </div>
                </div>
              )}
          </motion.div>
        )}
      </div>
      <CoachPosition
        open={showCoachPopup}
        onClose={closeCoachPopup}
        coachPosition={coachPopupData || []}
      />
    </div>
  );
};

export default LiveStatus;
