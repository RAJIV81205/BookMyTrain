import React, { useEffect, useState } from "react";
import { useBooking, Gender, BerthType } from "@/context/BookingContext";

interface PassengerDetailsFormProps {
  selectedSeats: number[];
  onComplete: () => void;
}

// Helper function to get seat type based on class code
const getSeatType = (seatNumber: number, classCode: string): BerthType => {
  if (classCode === "3A" || classCode === "SL") {
    const compartments = [
      { id: 1, lower: [1, 4], middle: [2, 5], upper: [3, 6], side: [7, 8] },
      { id: 2, lower: [9, 12], middle: [10, 13], upper: [11, 14], side: [15, 16] },
      { id: 3, lower: [17, 20], middle: [18, 21], upper: [19, 22], side: [23, 24] },
      { id: 4, lower: [25, 28], middle: [26, 29], upper: [27, 30], side: [31, 32] },
      { id: 5, lower: [33, 36], middle: [34, 37], upper: [35, 38], side: [39, 40] },
      { id: 6, lower: [41, 44], middle: [42, 45], upper: [43, 46], side: [47, 48] },
      { id: 7, lower: [49, 52], middle: [50, 53], upper: [51, 54], side: [55, 56] },
      { id: 8, lower: [57, 60], middle: [58, 61], upper: [59, 62], side: [63, 64] },
      { id: 9, lower: [65, 68], middle: [66, 69], upper: [67, 70], side: [71, 72] },
    ];

    for (const comp of compartments) {
      if (comp.lower.includes(seatNumber)) return "LB";
      if (comp.middle && comp.middle.includes(seatNumber)) return "MB";
      if (comp.upper.includes(seatNumber)) return "UB";
      if (comp.side.includes(seatNumber)) return seatNumber % 2 === 1 ? "SL" : "SU";
    }
  } else if (classCode === "2A" || classCode === "1A") {
    const compartments = [
      { id: 1, lower: [1, 3], upper: [2, 4] },
      { id: 2, lower: [5, 7], upper: [6, 8] },
      { id: 3, lower: [9, 11], upper: [10, 12] },
      { id: 4, lower: [13, 15], upper: [14, 16] },
      { id: 5, lower: [17, 19], upper: [18, 20] },
      { id: 6, lower: [21, 23], upper: [22, 24] },
      { id: 7, lower: [25, 27], upper: [26, 28] },
      { id: 8, lower: [29, 31], upper: [30, 32] },
    ];

    for (const comp of compartments) {
      if (comp.lower.includes(seatNumber)) return "LB";
      if (comp.upper.includes(seatNumber)) return "UB";
    }
  }

  return "LB"; // Default fallback
};

const PassengerDetailsForm: React.FC<PassengerDetailsFormProps> = ({ selectedSeats, onComplete }) => {
  const { addPassenger, bookingData } = useBooking();
  const [passengers, setPassengers] = useState(() =>
    selectedSeats.map((seatNumber) => ({
      id: `p-${seatNumber}`,
      name: "",
      age: "",
      gender: "Male" as Gender,
      seatNumber,
      seatType: getSeatType(seatNumber, bookingData.classCode),
    }))
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Sync if selectedSeats change
    setPassengers(
      selectedSeats.map((seatNumber) => ({
        id: `p-${seatNumber}`,
        name: "",
        age: "",
        gender: "Male" as Gender,
        seatNumber,
        seatType: getSeatType(seatNumber, bookingData.classCode),
      }))
    );
  }, [selectedSeats, bookingData.classCode]);

  const handleChange = (index: number, field: string, value: string) => {
    setPassengers((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const validate = () => passengers.every((p) => p.name.trim() && Number(p.age) > 0 && Number(p.age) < 150);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      alert("Please fill all passenger details correctly");
      return;
    }

    setSubmitting(true);
    try {
      // Add passengers to context with seat type
      passengers.forEach((p) => {
        addPassenger({
          ...p,
          age: Number(p.age),
          gender: p.gender as Gender,
          seatType: p.seatType,
        });
      });
      onComplete();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Passenger Details</h2>
          <p className="text-sm text-gray-600 mt-1">Fill in the details for all passengers</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {passengers.map((p, i) => (
              <div key={p.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-gray-900">Passenger {i + 1}</h3>
                  <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                    Seat {p.seatNumber}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => handleChange(i, "name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      value={p.age}
                      onChange={(e) => handleChange(i, "age", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Age"
                      min={1}
                      max={120}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={p.gender}
                      onChange={(e) => handleChange(i, "gender", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PassengerDetailsForm;
