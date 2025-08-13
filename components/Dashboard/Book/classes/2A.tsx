import React, { useState } from "react";

interface SecondACProps {
  onSeatsSelected?: (seats: number[]) => void;
  onClose?: () => void;
}

const SecondAC: React.FC<SecondACProps> = ({ onSeatsSelected, onClose }) => {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const bookedSeats = [5, 12, 18, 25]; // Pre-booked seats

  const compartments = [
    { id: 1, lower: [1, 3], upper: [2, 4] },
    { id: 2, lower: [5, 7], upper: [6, 8] },
    { id: 3, lower: [9, 11], upper: [10, 12] },
    { id: 4, lower: [13, 15], upper: [14, 16] },
    { id: 5, lower: [17, 19], upper: [18, 20] },
    { id: 6, lower: [21, 23], upper: [22, 24] },
    { id: 7, lower: [25, 27], upper: [26, 28] },
    { id: 8, lower: [29, 31], upper: [30, 32] }
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">🚆 2 Tier AC Coach</h2>
          <p className="text-gray-600 text-sm md:text-base">Select your preferred berth (Maximum 6 seats)</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {compartments.map((comp) => (
              <div key={comp.id} className="space-y-3">
                <div className="text-xs font-semibold text-gray-600 text-center">
                  Bay {comp.id}
                </div>
                
                <div className="bg-blue-100 rounded-lg p-2 border-2 border-blue-200">
                  {/* Upper berths */}
                  <div className="flex justify-between mb-2">
                    {comp.upper.map((num) => (
                      <div key={num} className="text-center">
                        <div
                          className={`w-10 h-8 text-xs border-2 ${getSeatClass(num)} rounded flex items-center justify-center font-medium transition-all duration-200 hover:scale-105`}
                          onClick={() => handleSeatClick(num)}
                        >
                          {num}
                        </div>
                        <span className="text-xs text-gray-500 mt-1 block">UB</span>
                      </div>
                    ))}
                  </div>

                  {/* Lower berths */}
                  <div className="flex justify-between">
                    {comp.lower.map((num) => (
                      <div key={num} className="text-center">
                        <div
                          className={`w-10 h-8 text-xs border-2 ${getSeatClass(num)} rounded flex items-center justify-center font-medium transition-all duration-200 hover:scale-105`}
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
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div className="flex items-center">
              <span className="font-medium">LB</span> - Lower Berth
            </div>
            <div className="flex items-center">
              <span className="font-medium">UB</span> - Upper Berth
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

export default SecondAC