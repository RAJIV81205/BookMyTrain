import React, { useState } from "react";

interface ThirdACProps {
  onSeatsSelected?: (seats: number[]) => void;
  onClose?: () => void;
}

const ThirdAC: React.FC<ThirdACProps> = ({ onSeatsSelected, onClose }) => {
    const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
    const bookedSeats = [8, 15, 24, 31, 42, 55]; // Pre-booked seats

    
    const compartments = [
        { id: 1, lower: [1, 4], middle: [2, 5], upper: [3, 6], side: [7, 8] },
        { id: 2, lower: [9, 12], middle: [10, 13], upper: [11, 14], side: [15, 16] },
        { id: 3, lower: [17, 20], middle: [18, 21], upper: [19, 22], side: [23, 24] },
        { id: 4, lower: [25, 28], middle: [26, 29], upper: [27, 30], side: [31, 32] },
        { id: 5, lower: [33, 36], middle: [34, 37], upper: [35, 38], side: [39, 40] },
        { id: 6, lower: [41, 44], middle: [42, 45], upper: [43, 46], side: [47, 48] },
        { id: 7, lower: [49, 52], middle: [50, 53], upper: [51, 54], side: [55, 56] },
        { id: 8, lower: [57, 60], middle: [58, 61], upper: [59, 62], side: [63, 64] }
    ];

    const getSeatType = (num: number): string => {
        for (const comp of compartments) {
            if (comp.lower.includes(num)) return "LB";
            if (comp.middle.includes(num)) return "MB";
            if (comp.upper.includes(num)) return "UB";
            if (comp.side.includes(num)) return num % 2 === 1 ? "SL" : "SU";
        }
        return "";
    };

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
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 md:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">🚆 3 Tier AC Coach</h2>
                    <p className="text-gray-600 text-sm md:text-base">Select your preferred berth (Maximum 6 seats)</p>
                </div>

                {/* Desktop Layout - Landscape */}
                <div className="hidden md:block">
                    <div className="bg-white rounded-xl shadow-lg p-6 overflow-hidden">
                        <div className="flex justify-between items-start">



                            {/* Main coach area */}
                            <div className="flex-1 mx-4">

                                {/* Compartments in landscape */}
                                <div className="grid grid-cols-8 gap-3">
                                    {compartments.map((comp) => (
                                        <div key={comp.id} className="space-y-3">
                                            <div className="text-xs font-semibold text-gray-600 text-center">
                                                Bay {comp.id}
                                            </div>



                                            {/* Side berths */}
                                            <div className="bg-orange-100 rounded-lg p-2 border-2 border-orange-200 flex flex-row justify-between">
                                                {comp.side.map((num, idx) => (
                                                    <div key={num} className="text-center mb-1">
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
                                                                className={`w-8 h-6 text-xs border-2 ${getSeatClass(num)} rounded flex items-center justify-center font-medium transition-all duration-200 hover:scale-105`}
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
                                                                className={`w-8 h-6 text-xs border-2 ${getSeatClass(num)} rounded flex items-center justify-center font-medium transition-all duration-200 hover:scale-105`}
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
                                                                className={`w-8 h-6 text-xs border-2 ${getSeatClass(num)} rounded flex items-center justify-center font-medium transition-all duration-200 hover:scale-105`}
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


                        </div>
                    </div>
                </div>

                {/* Mobile Layout - Portrait */}
                <div className="md:hidden">
                    <div className="bg-white rounded-lg shadow-lg p-4">
                        <div className="space-y-4">


                            {compartments.map((comp) => (
                                <div key={comp.id} className="border-2 border-gray-300 rounded-lg p-3 bg-gray-50">
                                    <div className="text-center text-sm font-semibold mb-3 text-gray-700">
                                        Bay {comp.id}
                                    </div>

                                    <div className="flex justify-between items-start gap-3">
                                        {/* Main berths section */}
                                        <div className="bg-blue-100 rounded-lg p-2 border-2 border-blue-200 flex-1">
                                            {/* First row: berths 1, 2, 3 (or equivalent) */}
                                            <div className="flex justify-between mb-2">
                                                <div className="text-center">
                                                    <div
                                                        className={`w-10 h-7 text-xs border-2 ${getSeatClass(comp.lower[0])} rounded flex items-center justify-center font-medium transition-all duration-200`}
                                                        onClick={() => handleSeatClick(comp.lower[0])}
                                                    >
                                                        {comp.lower[0]}
                                                    </div>
                                                    <span className="text-xs text-gray-500 mt-1 block">LB</span>
                                                </div>
                                                <div className="text-center">
                                                    <div
                                                        className={`w-10 h-7 text-xs border-2 ${getSeatClass(comp.middle[0])} rounded flex items-center justify-center font-medium transition-all duration-200`}
                                                        onClick={() => handleSeatClick(comp.middle[0])}
                                                    >
                                                        {comp.middle[0]}
                                                    </div>
                                                    <span className="text-xs text-gray-500 mt-1 block">MB</span>
                                                </div>
                                                <div className="text-center">
                                                    <div
                                                        className={`w-10 h-7 text-xs border-2 ${getSeatClass(comp.upper[0])} rounded flex items-center justify-center font-medium transition-all duration-200`}
                                                        onClick={() => handleSeatClick(comp.upper[0])}
                                                    >
                                                        {comp.upper[0]}
                                                    </div>
                                                    <span className="text-xs text-gray-500 mt-1 block">UB</span>
                                                </div>
                                            </div>

                                            {/* Second row: berths 4, 5, 6 (or equivalent) */}
                                            <div className="flex justify-between">
                                                <div className="text-center">
                                                    <div
                                                        className={`w-10 h-7 text-xs border-2 ${getSeatClass(comp.lower[1])} rounded flex items-center justify-center font-medium transition-all duration-200`}
                                                        onClick={() => handleSeatClick(comp.lower[1])}
                                                    >
                                                        {comp.lower[1]}
                                                    </div>
                                                    <span className="text-xs text-gray-500 mt-1 block">LB</span>
                                                </div>
                                                <div className="text-center">
                                                    <div
                                                        className={`w-10 h-7 text-xs border-2 ${getSeatClass(comp.middle[1])} rounded flex items-center justify-center font-medium transition-all duration-200`}
                                                        onClick={() => handleSeatClick(comp.middle[1])}
                                                    >
                                                        {comp.middle[1]}
                                                    </div>
                                                    <span className="text-xs text-gray-500 mt-1 block">MB</span>
                                                </div>
                                                <div className="text-center">
                                                    <div
                                                        className={`w-10 h-7 text-xs border-2 ${getSeatClass(comp.upper[1])} rounded flex items-center justify-center font-medium transition-all duration-200`}
                                                        onClick={() => handleSeatClick(comp.upper[1])}
                                                    >
                                                        {comp.upper[1]}
                                                    </div>
                                                    <span className="text-xs text-gray-500 mt-1 block">UB</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Side berths */}
                                        <div className="bg-orange-100 rounded-lg p-2 border-2 border-orange-200">
                                            <div className="flex flex-col space-y-2">
                                                {comp.side.map((num, idx) => (
                                                    <div key={num} className="text-center">
                                                        <div
                                                            className={`w-10 h-7 text-xs border-2 ${getSeatClass(num)} rounded flex items-center justify-center font-medium transition-all duration-200`}
                                                            onClick={() => handleSeatClick(num)}
                                                        >
                                                            {num}
                                                        </div>
                                                        <span className="text-xs text-gray-500 mt-1 block">
                                                            {idx === 0 ? 'SL' : 'SU'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}


                        </div>
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
                                        Berth {num} ({getSeatType(num)})
                                    </span>
                                ))}
                        </div>
                        <div className="mt-3">
                            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                                onClick={() => startBooking()}>
                                Proceed to Book
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThirdAC;