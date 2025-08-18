import React, { useState } from "react";

interface SLProps {
  onSeatsSelected?: (seats: number[]) => void;
  onClose?: () => void;
}

const SL: React.FC<SLProps> = ({ onSeatsSelected, onClose }) => {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const bookedSeats = [12, 25, 38, 51, 64]; // Pre-booked seats

  const compartments = [
    { id: 1, lower: [1, 4, 7], middle: [2, 5, 8], upper: [3, 6, 9], side: [10, 11] },
    { id: 2, lower: [12, 15, 18], middle: [13, 16, 19], upper: [14, 17, 20], side: [21, 22] },
    { id: 3, lower: [23, 26, 29], middle: [24, 27, 30], upper: [25, 28, 31], side: [32, 33] },
    { id: 4, lower: [34, 37, 40], middle: [35, 38, 41], upper: [36, 39, 42], side: [43, 44] },
    { id: 5, lower: [45, 48, 51], middle: [46, 49, 52], upper: [47, 50, 53], side: [54, 55] },
    { id: 6, lower: [56, 59, 62], middle: [57, 60, 63], upper: [58, 61, 64], side: [65, 66] },
    { id: 7, lower: [67, 70, 73], middle: [68, 71, 74], upper: [69, 72, 75], side: [76, 77] },
    { id: 8, lower: [78, 81, 84], middle: [79, 82, 85], upper: [80, 83, 86], side: [87, 88] }
  ];

  const getSeatClass = (num: number): string => {
    if (bookedSeats.includes(num)) return "bg-red-400 text-white cursor-not-allowed border-red-500";
    if (selectedSeats.includes(num)) return "bg-green-500 text-white border-green-600 shadow-md";
    return "bg-blue-50 hover:bg-blue-100 cursor-pointer border-blue-300 text-blue-900";
  };

  const handleSeatClick = (num: number): void => {
    if (bookedSeats.includes(num)) return;
    setSelectedSeats((prev) =>
      prev.includes(num)
        ? prev.filter((s) => s !== num)
        : prev.length < 6
          ? [...prev, num]
          : prev
    );
  };

  const startBooking = () => {
    if (selectedSeats.length > 0 && onSeatsSelected) {
      onSeatsSelected(selectedSeats);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">🚆 Sleeper Class Coach</h2>
          <p className="text-gray-600 text-sm md:text-base">Select your preferred berth (Maximum 6 seats)</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {compartments.map((comp) => (
              <div key={comp.id} className="space-y-3">
                <div className="text-xs font-semibold text-gray-600 text-center">
                  Bay {comp.id}
                </div>

                {/* Side berths */}
                <div className="bg-orange-100 rounded-lg p-2 border-2 border-orange-200 flex flex-col space-y-1">
                  {comp.side.map((num, idx) => (
                    <div key={num} className="text-center">
                      <div
                        className={`w-8 h-6 text-xs border-2 ${getSeatClass(num)} rounded flex items-center justify-center font-medium transition-all duration-200 hover:scale-105`}
                        onClick={() => handleSeatClick(num)}
                      >
                        {num}
                      </div>
                      <span className="text-xs text-gray-500 block">
                        {idx === 0 ? 'SL' : 'SU'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Main berths section */}
                <div className="bg-blue-100 rounded-lg p-2 border-2 border-blue-200">
                  {/* Upper berths */}
                  <div className="flex justify-between mb-1">
                    {comp.upper.map((num) => (
                      <div key={num} className="text-center">
                        <div
                          className={`w-6 h-5 text-xs border-2 ${getSeatClass(num)} rounded flex items-center justify-center font-medium transition-all duration-200 hover:scale-105`}
                          onClick={() => handleSeatClick(num)}
                        >
                          {num}
                        </div>
                        <span className="text-xs text-gray-500 mt-1 block">UB</span>
                      </div>
                    ))}
                  </div>

                  {/* Middle berths */}
                  <div className="flex justify-between mb-1">
                    {comp.middle.map((num) => (
                      <div key={num} className="text-center">
                        <div
                          className={`w-6 h-5 text-xs border-2 ${getSeatClass(num)} rounded flex items-center justify-center font-medium transition-all duration-200 hover:scale-105`}
                          onClick={() => handleSeatClick(num)}
                        >
                          {num}
                        </div>
                        <span className="text-xs text-gray-500 mt-1 block">MB</span>
                      </div>
                    ))}
                  </div>

                  {/* Lower berths */}
                  <div className="flex justify-between">
                    {comp.lower.map((num) => (
                      <div key={num} className="text-center">
                        <div
                          className={`w-6 h-5 text-xs border-2 ${getSeatClass(num)} rounded flex items-center justify-center font-medium transition-all duration-200 hover:scale-105`}
                          onClick={() => handleSeatClick(num)}
                        >
                          {num}
                        </div>
                        <span className="text-xs text-gray-500 mt-1 block">LB</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white border rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-3 text-gray-800">Berth Types & Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mb-4">
            <div className="flex items-center">
              <span className="font-medium">LB</span> - Lower Berth
            </div>
            <div className="flex items-center">
              <span className="font-medium">MB</span> - Middle Berth
            </div>
            <div className="flex items-center">
              <span className="font-medium">UB</span> - Upper Berth
            </div>
            <div className="flex items-center">
              <span className="font-medium">SL</span> - Side Lower
            </div>
            <div className="flex items-center">
              <span className="font-medium">SU</span> - Side Upper
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 bg-blue-50 border-blue-300 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 bg-red-400 border-red-500 rounded"></div>
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 bg-green-500 border-green-600 rounded"></div>
              <span>Selected</span>
            </div>
          </div>
        </div>

        {/* Selected Seats */}
        {selectedSeats.length > 0 && (
          <div className="mt-4 bg-green-50 border-2 border-green-300 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">
              Selected Berths ({selectedSeats.length}/6)
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedSeats
                .sort((a, b) => a - b)
                .map((num) => (
                  <span
                    key={num}
                    className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium border border-green-300"
                  >
                    Berth {num}
                  </span>
                ))}
            </div>
            <div className="mt-3">
              <button 
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                onClick={startBooking}
              >
                Proceed to Book
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SL